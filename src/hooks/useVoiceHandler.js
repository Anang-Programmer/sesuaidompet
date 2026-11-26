import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Check browser support for Speech Recognition (STT)
 */
export function isSpeechRecognitionSupported() {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

/**
 * Check browser support for Speech Synthesis (TTS)
 */
export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Clean markdown & symbols for natural Indonesian TTS playback,
 * trimming cleanly at a sentence boundary to avoid browser speech stalls.
 */
function sanitizeTextForSpeech(text, maxLength = 420) {
  if (!text) return '';

  let clean = String(text)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Markdown link -> keep label
    .replace(/https?:\/\/\S+/g, '') // Strip raw URLs
    .replace(/[*_#`~[\]]/g, '') // Strip markdown markers
    .replace(/[•]\s+/g, ', ') // Bullet to pause
    .replace(/(?:^|\n)\s*-\s+/g, ', ') // Dash list to pause
    .replace(/\n+/g, '. ') // Newlines to sentence pause
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .trim();

  if (clean.length > maxLength) {
    const sliced = clean.slice(0, maxLength);
    const lastBoundary = Math.max(
      sliced.lastIndexOf('. '),
      sliced.lastIndexOf('! '),
      sliced.lastIndexOf('? ')
    );
    if (lastBoundary > 120) {
      clean = sliced.slice(0, lastBoundary + 1).trim();
    } else {
      const lastSpace = sliced.lastIndexOf(' ');
      clean = `${sliced.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}.`;
    }
  }

  return clean;
}

/**
 * Select the clearest, most natural Indonesian voice available in the browser.
 * Strictly prioritizes Neural/Online & Google voices over slow/robotic local SAPI voices.
 */
function pickBestIndonesianVoice(voices = []) {
  if (!Array.isArray(voices) || voices.length === 0) return null;

  const isIndonesian = (v) => {
    const l = (v.lang || '').toLowerCase();
    return l.startsWith('id') || l.startsWith('in');
  };

  const idVoices = voices.filter(isIndonesian);
  if (idVoices.length === 0) return null;

  return (
    // 1. Online Neural voices (e.g., Microsoft Gadis/Ardi Online Natural di Edge)
    idVoices.find((v) => /natural|online/i.test(v.name)) ||
    // 2. Google Bahasa Indonesia (jauh lebih jernih dibanding Windows SAPI lokal)
    idVoices.find((v) => /google/i.test(v.name)) ||
    // 3. Enhanced named Indonesian voices (Gadis, Ardi, Damayanti)
    idVoices.find((v) => /gadis|ardi|damayanti/i.test(v.name)) ||
    // 4. Fallback terakhir: voice Indonesia apa saja yang tersedia
    idVoices[0]
  );
}

/**
 * Custom hook for Speech-to-Text (STT) and Text-to-Speech (TTS),
 * with strict mutual-exclusion, generation guards, and Chrome stability fixes.
 */
export function useVoiceHandler({
  onTranscript,
  onFinalTranscript,
  onListeningChange,
  onSpeakingChange,
  onError,
  onSilence,
  onUnexpectedEnd,
  silenceTimeoutMs = 1800,
  defaultRate = 1.22,
  lang = 'id-ID',
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0); // 0.0 - 1.0
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [, setLoadedVoices] = useState([]);

  // Critical synchronization refs (instant checks to eliminate race conditions)
  const isSpeakingRef = useRef(false);
  const isListeningRef = useRef(false);
  const isStartingRef = useRef(false);
  const manualStopRef = useRef(false);
  const speakingMessageIdRef = useRef(null);
  const speechGenRef = useRef(0);
  const utteranceRef = useRef(null);
  const defaultRateRef = useRef(defaultRate);

  useEffect(() => {
    defaultRateRef.current = defaultRate;
  }, [defaultRate]);

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const postSpeechTimerRef = useRef(null);
  const ttsKeepAliveRef = useRef(null);
  const ttsWatchdogRef = useRef(null);
  const isComponentMounted = useRef(true);

  // Keep latest callbacks in refs to avoid recreating event listeners
  const callbacksRef = useRef({
    onTranscript,
    onFinalTranscript,
    onListeningChange,
    onSpeakingChange,
    onError,
    onSilence,
    onUnexpectedEnd,
  });

  useEffect(() => {
    callbacksRef.current = {
      onTranscript,
      onFinalTranscript,
      onListeningChange,
      onSpeakingChange,
      onError,
      onSilence,
      onUnexpectedEnd,
    };
  }, [
    onTranscript,
    onFinalTranscript,
    onListeningChange,
    onSpeakingChange,
    onError,
    onSilence,
    onUnexpectedEnd,
  ]);

  /* ----------------------------------------------------
     Preload Speech Synthesis Voices
  ---------------------------------------------------- */
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0 && isComponentMounted.current) {
        setLoadedVoices(v);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  /* ----------------------------------------------------
     Internal Timer Helpers
  ---------------------------------------------------- */
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const clearSpeechTimers = useCallback(() => {
    if (postSpeechTimerRef.current) {
      clearTimeout(postSpeechTimerRef.current);
      postSpeechTimerRef.current = null;
    }
    if (ttsKeepAliveRef.current) {
      clearInterval(ttsKeepAliveRef.current);
      ttsKeepAliveRef.current = null;
    }
    if (ttsWatchdogRef.current) {
      clearTimeout(ttsWatchdogRef.current);
      ttsWatchdogRef.current = null;
    }
  }, []);

  /* ----------------------------------------------------
     Audio Level Visualizer (Web Audio API AnalyserNode)
  ---------------------------------------------------- */
  const stopAudioMeter = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {
        /* ignore */
      }
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      } catch {
        /* ignore */
      }
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    if (isComponentMounted.current) {
      setAudioLevel(0);
    }
  }, []);

  const startAudioMeter = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return;
    }

    // Ensure no previous stream/context is leaked before starting a new one
    stopAudioMeter();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Guard against async resolution after listening stopped, speaking began, or unmount
      if (
        !isComponentMounted.current ||
        isSpeakingRef.current ||
        !isListeningRef.current
      ) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      if (
        !isComponentMounted.current ||
        isSpeakingRef.current ||
        !isListeningRef.current
      ) {
        stopAudioMeter();
        return;
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.65;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (
          !analyserRef.current ||
          !isComponentMounted.current ||
          isSpeakingRef.current ||
          !isListeningRef.current
        ) {
          return;
        }

        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(1, Math.max(0, average / 110));
        setAudioLevel(normalized);

        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch {
      /* ignore audio meter initialization error */
    }
  }, [stopAudioMeter]);

  /* ----------------------------------------------------
     Speech Recognition (STT) Abort & Stop
  ---------------------------------------------------- */
  const abortListening = useCallback(() => {
    manualStopRef.current = true;
    clearSilenceTimer();
    isStartingRef.current = false;
    isListeningRef.current = false;

    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      try {
        rec.onstart = null;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.abort();
      } catch {
        /* ignore */
      }
    }

    if (isComponentMounted.current) {
      setLiveTranscript('');
      setIsListening(false);
    }
    callbacksRef.current.onListeningChange?.(false);
    stopAudioMeter();
  }, [clearSilenceTimer, stopAudioMeter]);

  const stopListening = useCallback(() => {
    manualStopRef.current = true;
    clearSilenceTimer();
    isStartingRef.current = false;
    isListeningRef.current = false;

    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      try {
        rec.onstart = null;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.stop();
      } catch {
        /* ignore */
      }
    }

    if (isComponentMounted.current) {
      setLiveTranscript('');
      setIsListening(false);
    }
    callbacksRef.current.onListeningChange?.(false);
    stopAudioMeter();
  }, [clearSilenceTimer, stopAudioMeter]);

  /* ----------------------------------------------------
     Text-To-Speech (Speech Synthesis) Helper
     Uses monotonic generation guard to prevent canceled
     utterances from triggering stale onEnd callbacks.
  ---------------------------------------------------- */
  const stopSpeaking = useCallback(() => {
    speechGenRef.current += 1;
    clearSpeechTimers();
    isSpeakingRef.current = false;
    speakingMessageIdRef.current = null;
    utteranceRef.current = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }

    if (isComponentMounted.current) {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
    callbacksRef.current.onSpeakingChange?.(false);
  }, [clearSpeechTimers]);

  const speakText = useCallback(
    (text, messageIdOrOptions = null) => {
      const options =
        typeof messageIdOrOptions === 'object' && messageIdOrOptions !== null
          ? messageIdOrOptions
          : { messageId: messageIdOrOptions };

      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        options.onEnd?.();
        return;
      }

      // CRITICAL: Shut down microphone completely before speaking
      abortListening();

      const targetMessageId = options.messageId ?? null;

      // If already speaking the same message, toggle stop
      if (
        isSpeakingRef.current &&
        speakingMessageIdRef.current === targetMessageId &&
        targetMessageId !== null
      ) {
        stopSpeaking();
        return;
      }

      // Invalidate any previous speech generation and timers
      speechGenRef.current += 1;
      const myGen = speechGenRef.current;
      clearSpeechTimers();

      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }

      const clean = sanitizeTextForSpeech(text, options.maxLength || 420);

      if (!clean) {
        isSpeakingRef.current = false;
        speakingMessageIdRef.current = null;
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        callbacksRef.current.onSpeakingChange?.(false);
        options.onEnd?.();
        return;
      }

      isSpeakingRef.current = true;
      speakingMessageIdRef.current = targetMessageId;
      setIsSpeaking(true);
      setSpeakingMessageId(targetMessageId);
      callbacksRef.current.onSpeakingChange?.(true);

      const utterance = new SpeechSynthesisUtterance(clean);
      utteranceRef.current = utterance; // Prevent Chrome GC bug
      utterance.rate = options.rate ?? defaultRateRef.current ?? 1.22;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.lang = options.lang || lang;

      const voices = window.speechSynthesis.getVoices();
      const preferred = pickBestIndonesianVoice(voices);

      if (preferred) {
        utterance.voice = preferred;
      }

      const finishSpeech = (dampeningMs) => {
        if (myGen !== speechGenRef.current || !isComponentMounted.current) {
          return;
        }
        clearSpeechTimers();
        utteranceRef.current = null;
        speakingMessageIdRef.current = null;
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        callbacksRef.current.onSpeakingChange?.(false);

        // Acoustic dampening delay so speaker reverb fades before mic re-opens
        postSpeechTimerRef.current = setTimeout(() => {
          postSpeechTimerRef.current = null;
          if (myGen !== speechGenRef.current || !isComponentMounted.current) {
            return;
          }
          isSpeakingRef.current = false;
          options.onEnd?.();
        }, dampeningMs);
      };

      utterance.onstart = () => {
        if (myGen !== speechGenRef.current || !isComponentMounted.current) return;
        isSpeakingRef.current = true;
        setIsSpeaking(true);
        setSpeakingMessageId(targetMessageId);
        callbacksRef.current.onSpeakingChange?.(true);
        options.onStart?.();
      };

      utterance.onend = () => {
        finishSpeech(350);
      };

      utterance.onerror = (err) => {
        // Ignore intentional cancel/interrupt errors completely
        if (
          myGen !== speechGenRef.current ||
          err?.error === 'canceled' ||
          err?.error === 'interrupted'
        ) {
          return;
        }
        console.warn('SpeechSynthesis error:', err);
        finishSpeech(200);
      };

      // Chrome bug workaround: keep long utterances alive & prevent silent freeze
      ttsKeepAliveRef.current = setInterval(() => {
        if (myGen !== speechGenRef.current) {
          clearSpeechTimers();
          return;
        }
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          try {
            window.speechSynthesis.resume();
          } catch {
            /* ignore */
          }
        }
      }, 10000);

      // Watchdog fallback in case browser never fires onend/onerror
      const estimatedMs = Math.max(8000, Math.min(45000, clean.length * 110 + 5000));
      ttsWatchdogRef.current = setTimeout(() => {
        if (myGen === speechGenRef.current && isSpeakingRef.current) {
          try {
            window.speechSynthesis.cancel();
          } catch {
            /* ignore */
          }
          finishSpeech(200);
        }
      }, estimatedMs);

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis speak threw:', err);
        finishSpeech(150);
      }
    },
    [lang, stopSpeaking, abortListening, clearSpeechTimers]
  );

  /* ----------------------------------------------------
     Start Listening
     Strictly refuses to start if currently speaking
  ---------------------------------------------------- */
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return false;

    // Reject starting if currently speaking to prevent microphone capturing speaker output
    if (isSpeakingRef.current) {
      return false;
    }

    if (isListeningRef.current || isStartingRef.current) {
      return true;
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      callbacksRef.current.onError?.(
        'Browser belum mendukung Speech Recognition. Gunakan Google Chrome atau Microsoft Edge.'
      );
      return false;
    }

    isStartingRef.current = true;
    manualStopRef.current = false;

    try {
      if (recognitionRef.current) {
        const oldRec = recognitionRef.current;
        recognitionRef.current = null;
        try {
          oldRec.onstart = null;
          oldRec.onresult = null;
          oldRec.onerror = null;
          oldRec.onend = null;
          oldRec.abort();
        } catch {
          /* ignore */
        }
      }

      clearSilenceTimer();

      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = lang;
      rec.maxAlternatives = 1;

      setLiveTranscript('');

      rec.onstart = () => {
        if (recognitionRef.current !== rec || !isComponentMounted.current) return;
        isStartingRef.current = false;
        isListeningRef.current = true;
        setIsListening(true);
        callbacksRef.current.onListeningChange?.(true);
        startAudioMeter();
      };

      rec.onresult = (event) => {
        // Discard any sound picked up while AI is speaking or from stale instance
        if (isSpeakingRef.current || recognitionRef.current !== rec) {
          return;
        }

        // Accumulate FULL transcript from index 0 so pauses never drop earlier words
        let fullFinal = '';
        let fullInterim = '';
        let latestFinalChunk = '';

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          const textPart = result[0]?.transcript || '';
          if (result.isFinal) {
            fullFinal += `${textPart} `;
            if (i >= event.resultIndex) {
              latestFinalChunk += `${textPart} `;
            }
          } else {
            fullInterim += `${textPart} `;
          }
        }

        const spoken = `${fullFinal}${fullInterim}`.replace(/\s+/g, ' ').trim();
        if (spoken) {
          setLiveTranscript(spoken);
          callbacksRef.current.onTranscript?.(spoken);

          // Voice Activity Detection (silence detection)
          if (callbacksRef.current.onSilence && spoken.length > 1) {
            clearSilenceTimer();
            silenceTimerRef.current = setTimeout(() => {
              if (
                !isSpeakingRef.current &&
                isListeningRef.current &&
                recognitionRef.current === rec
              ) {
                callbacksRef.current.onSilence?.(spoken);
              }
            }, silenceTimeoutMs);
          }
        }

        const cleanFullFinal = fullFinal.replace(/\s+/g, ' ').trim();
        if (latestFinalChunk.trim() && cleanFullFinal) {
          callbacksRef.current.onFinalTranscript?.(cleanFullFinal);
        }
      };

      rec.onerror = (event) => {
        if (recognitionRef.current !== rec) return;

        const errCode = event?.error;
        if (errCode !== 'no-speech' && errCode !== 'aborted') {
          console.warn('Speech recognition error:', errCode);
        }

        isStartingRef.current = false;
        isListeningRef.current = false;
        if (isComponentMounted.current) {
          setIsListening(false);
        }
        callbacksRef.current.onListeningChange?.(false);
        stopAudioMeter();
        clearSilenceTimer();

        if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
          manualStopRef.current = true;
          callbacksRef.current.onError?.(
            'Izin mikrofon ditolak. Mohon izinkan akses mikrofon pada browser kamu.'
          );
        } else if (errCode === 'audio-capture') {
          manualStopRef.current = true;
          callbacksRef.current.onError?.(
            'Mikrofon tidak terdeteksi. Pastikan perangkat mikrofon sudah terhubung.'
          );
        } else if (errCode === 'network') {
          manualStopRef.current = true;
          callbacksRef.current.onError?.(
            'Koneksi ke layanan pengenalan suara terganggu. Periksa koneksi internetmu.'
          );
        }
      };

      rec.onend = () => {
        if (recognitionRef.current !== rec) return;
        recognitionRef.current = null;

        isStartingRef.current = false;
        isListeningRef.current = false;
        if (isComponentMounted.current) {
          setIsListening(false);
        }
        callbacksRef.current.onListeningChange?.(false);
        stopAudioMeter();
        clearSilenceTimer();

        // Notify consumer if browser auto-stopped recognition (e.g. Chrome no-speech timeout)
        if (!manualStopRef.current && !isSpeakingRef.current && isComponentMounted.current) {
          callbacksRef.current.onUnexpectedEnd?.();
        }
      };

      recognitionRef.current = rec;
      rec.start();
      return true;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      recognitionRef.current = null;
      isStartingRef.current = false;
      isListeningRef.current = false;
      setIsListening(false);
      callbacksRef.current.onListeningChange?.(false);
      stopAudioMeter();
      clearSilenceTimer();
      return false;
    }
  }, [lang, silenceTimeoutMs, startAudioMeter, stopAudioMeter, clearSilenceTimer]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  /* ----------------------------------------------------
     Cleanup on unmount
  ---------------------------------------------------- */
  useEffect(() => {
    isComponentMounted.current = true;

    return () => {
      isComponentMounted.current = false;
      speechGenRef.current += 1;
      manualStopRef.current = true;
      isSpeakingRef.current = false;
      isListeningRef.current = false;
      utteranceRef.current = null;
      clearSilenceTimer();
      clearSpeechTimers();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
        recognitionRef.current = null;
      }
      stopAudioMeter();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* ignore */
        }
      }
    };
  }, [clearSilenceTimer, clearSpeechTimers, stopAudioMeter]);

  return {
    isListening,
    isSpeaking,
    speakingMessageId,
    liveTranscript,
    audioLevel,
    isSupported: isSpeechRecognitionSupported(),
    isTtsSupported: isSpeechSynthesisSupported(),
    startListening,
    stopListening,
    abortListening,
    toggleListening,
    speakText,
    stopSpeaking,
  };
}
