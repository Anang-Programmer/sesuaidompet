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
 * Custom hook for Speech-to-Text (STT) and Text-to-Speech (TTS),
 * with strict mutual-exclusion to prevent microphone & speaker audio collision.
 */
export function useVoiceHandler({
  onTranscript,
  onFinalTranscript,
  onListeningChange,
  onSpeakingChange,
  onError,
  onSilence,
  silenceTimeoutMs = 1800,
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

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isComponentMounted = useRef(true);

  // Keep latest callbacks in refs to avoid recreating event listeners
  const callbacksRef = useRef({
    onTranscript,
    onFinalTranscript,
    onListeningChange,
    onSpeakingChange,
    onError,
    onSilence,
  });

  useEffect(() => {
    callbacksRef.current = {
      onTranscript,
      onFinalTranscript,
      onListeningChange,
      onSpeakingChange,
      onError,
      onSilence,
    };
  }, [
    onTranscript,
    onFinalTranscript,
    onListeningChange,
    onSpeakingChange,
    onError,
    onSilence,
  ]);

  /* ----------------------------------------------------
     Preload Speech Synthesis Voices
  ---------------------------------------------------- */
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
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
     Audio Level Visualizer (Web Audio API AnalyserNode)
  ---------------------------------------------------- */
  const startAudioMeter = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (!isComponentMounted.current || isSpeakingRef.current) {
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

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.65;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyserRef.current || !isComponentMounted.current || isSpeakingRef.current) return;

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
  }, []);

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
    setAudioLevel(0);
  }, []);

  /* ----------------------------------------------------
     Silence Detection (Voice Activity Detection)
  ---------------------------------------------------- */
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  /* ----------------------------------------------------
     Speech Recognition (STT) Abort & Stop
  ---------------------------------------------------- */
  const abortListening = useCallback(() => {
    clearSilenceTimer();
    isStartingRef.current = false;
    isListeningRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }

    setLiveTranscript('');
    setIsListening(false);
    callbacksRef.current.onListeningChange?.(false);
    stopAudioMeter();
  }, [clearSilenceTimer, stopAudioMeter]);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    isStartingRef.current = false;
    isListeningRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
    }

    setIsListening(false);
    callbacksRef.current.onListeningChange?.(false);
    stopAudioMeter();
  }, [clearSilenceTimer, stopAudioMeter]);

  /* ----------------------------------------------------
     Text-To-Speech (Speech Synthesis) Helper
     Hard-stops microphone before speaking to prevent echo collision.
  ---------------------------------------------------- */
  const stopSpeaking = useCallback(() => {
    isSpeakingRef.current = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    callbacksRef.current.onSpeakingChange?.(false);
  }, []);

  const speakText = useCallback(
    (text, messageIdOrOptions = null) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      // CRITICAL: Shut down microphone completely before speaking
      abortListening();

      const options =
        typeof messageIdOrOptions === 'object' && messageIdOrOptions !== null
          ? messageIdOrOptions
          : { messageId: messageIdOrOptions };

      const targetMessageId = options.messageId ?? null;

      // If already speaking the same message, toggle stop
      if (isSpeaking && speakingMessageId === targetMessageId && targetMessageId !== null) {
        stopSpeaking();
        return;
      }

      // Cancel previous utterance
      window.speechSynthesis.cancel();

      // Clean markdown, symbols, links, bullets
      let clean = text
        .replace(/[*_#`~[\]]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/[•-]\s+/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Limit length to avoid browser speech synthesis freeze
      if (clean.length > 250) {
        clean = `${clean.slice(0, 240)}...`;
      }

      if (!clean) {
        options.onEnd?.();
        return;
      }

      isSpeakingRef.current = true;
      setIsSpeaking(true);
      setSpeakingMessageId(targetMessageId);
      callbacksRef.current.onSpeakingChange?.(true);

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.pitch = 1.02;
      utterance.lang = options.lang || lang;

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(
          (v) =>
            (v.lang.toLowerCase().startsWith('id') ||
              v.lang.toLowerCase().startsWith('in')) &&
            (v.name.includes('Indonesian') ||
              v.name.includes('Indonesia') ||
              v.name.includes('Google') ||
              v.name.includes('Natural') ||
              v.name.includes('Gadis') ||
              v.name.includes('Damayanti') ||
              v.name.includes('Ardi'))
        ) ||
        voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith('id') ||
            v.lang.toLowerCase().startsWith('in')
        );

      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setIsSpeaking(true);
        setSpeakingMessageId(targetMessageId);
        callbacksRef.current.onSpeakingChange?.(true);
        options.onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        callbacksRef.current.onSpeakingChange?.(false);

        // Acoustic dampening delay (350ms) to ensure speakers have stopped vibrating
        setTimeout(() => {
          isSpeakingRef.current = false;
          options.onEnd?.();
        }, 350);
      };

      utterance.onerror = (err) => {
        console.warn('SpeechSynthesis error:', err);
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        callbacksRef.current.onSpeakingChange?.(false);

        setTimeout(() => {
          isSpeakingRef.current = false;
          options.onEnd?.();
        }, 200);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSpeaking, speakingMessageId, lang, stopSpeaking, abortListening]
  );

  /* ----------------------------------------------------
     Start Listening
     Strictly refuses to start if currently speaking
  ---------------------------------------------------- */
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Reject starting if currently speaking to prevent microphone capturing speaker output
    if (isSpeakingRef.current) {
      return;
    }

    if (isListeningRef.current || isStartingRef.current) {
      return;
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      callbacksRef.current.onError?.(
        'Browser belum mendukung Speech Recognition. Gunakan Google Chrome atau Microsoft Edge.'
      );
      return;
    }

    isStartingRef.current = true;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
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
        isStartingRef.current = false;
        isListeningRef.current = true;
        setIsListening(true);
        callbacksRef.current.onListeningChange?.(true);
        startAudioMeter();
      };

      rec.onresult = (event) => {
        // Discard any sound picked up while AI is speaking
        if (isSpeakingRef.current) {
          return;
        }

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        const spoken = (final || interim).trim();
        if (spoken) {
          setLiveTranscript(spoken);
          callbacksRef.current.onTranscript?.(spoken);

          // Voice Activity Detection (silence detection)
          if (callbacksRef.current.onSilence && spoken.length > 2) {
            clearSilenceTimer();
            silenceTimerRef.current = setTimeout(() => {
              if (!isSpeakingRef.current && isListeningRef.current) {
                callbacksRef.current.onSilence?.(spoken);
              }
            }, silenceTimeoutMs);
          }
        }

        if (final.trim()) {
          callbacksRef.current.onFinalTranscript?.(final.trim());
        }
      };

      rec.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        isStartingRef.current = false;
        isListeningRef.current = false;
        setIsListening(false);
        callbacksRef.current.onListeningChange?.(false);
        stopAudioMeter();
        clearSilenceTimer();

        if (event.error === 'not-allowed') {
          callbacksRef.current.onError?.(
            'Izin mikrofon ditolak. Mohon izinkan akses mikrofon di browser.'
          );
        }
      };

      rec.onend = () => {
        isStartingRef.current = false;
        isListeningRef.current = false;
        setIsListening(false);
        callbacksRef.current.onListeningChange?.(false);
        stopAudioMeter();
        clearSilenceTimer();
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      isStartingRef.current = false;
      isListeningRef.current = false;
      setIsListening(false);
      callbacksRef.current.onListeningChange?.(false);
      stopAudioMeter();
      clearSilenceTimer();
    }
  }, [lang, silenceTimeoutMs, startAudioMeter, stopAudioMeter, clearSilenceTimer]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  /* ----------------------------------------------------
     Cleanup on unmount
  ---------------------------------------------------- */
  useEffect(() => {
    isComponentMounted.current = true;

    return () => {
      isComponentMounted.current = false;
      isSpeakingRef.current = false;
      isListeningRef.current = false;
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
      }
      stopAudioMeter();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [clearSilenceTimer, stopAudioMeter]);

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
