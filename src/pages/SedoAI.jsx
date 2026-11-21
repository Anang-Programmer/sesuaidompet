
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowRight,
  BatteryCharging,
  Bot,
  Calculator,
  Camera,
  Clock3,
  Cpu,
  Database,
  HardDrive,
  History,
  Menu,
  MessageSquare,
  Mic,
  MicOff,
  Plus,
  Radio,
  RefreshCw,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  Trophy,
  UserRound,
  Volume2,
  VolumeX,
  Wallet,
  X,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { useSawSession } from '../hooks/useSawSession';
import { useVoiceHandler } from '../hooks/useVoiceHandler';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { VoiceVisualizer, TTSWaveIndicator } from '../components/VoiceVisualizer';
import { GeminiLiveVoice } from '../components/GeminiLiveVoice';
import {
  fetchCriteria,
  fetchSmartphones,
} from '../services/spkService';
import {
  explainSawRecommendation,
  extractAndLookupPhones,
  saveNewlyCreatedPhones,
} from '../services/sedoAiService';
import { calculateSAW } from '../utils/sawCalculator';
import {
  formatDecimal,
  formatRupiah,
} from '../utils/formatters';
import {
  detectConversationalResponse,
  formatFriendlyFallback,
} from '../utils/conversationalAi';

/* =========================================
   KONFIGURASI
========================================= */

const PROMPT_SUGGESTIONS = [
  'Bandingkan Redmi Note 13 vs Poco M6 Pro',
  'Poco X6 Pro vs Infinix GT 20 Pro mana yang lebih worth it?',
  'Bantu pilihkan HP terbaik sesuai budget saya',
];

const SPEC_FIELDS = [
  {
    field: 'price',
    label: 'Harga',
    criterion: 'C1',
    unit: 'Rupiah',
    icon: Wallet,
    step: 1000,
  },
  {
    field: 'camera_mp',
    label: 'Kamera utama',
    criterion: 'C2',
    unit: 'MP',
    icon: Camera,
    step: 1,
  },
  {
    field: 'ram_gb',
    label: 'RAM',
    criterion: 'C3',
    unit: 'GB',
    icon: Cpu,
    step: 1,
  },
  {
    field: 'battery_mah',
    label: 'Baterai',
    criterion: 'C4',
    unit: 'mAh',
    icon: BatteryCharging,
    step: 1,
  },
  {
    field: 'storage_gb',
    label: 'Penyimpanan',
    criterion: 'C5',
    unit: 'GB',
    icon: HardDrive,
    step: 1,
  },
  {
    field: 'antutu',
    label: 'AnTuTu',
    criterion: 'C6',
    unit: 'Skor',
    icon: Smartphone,
    step: 1,
  },
];

const DEFAULT_WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'sedo',
  text: 'Halo! Saya SEDO AI, asisten cerdas pemilihan smartphone SesuaiDompet. Sedang bingung memilih HP? Ceritakan pilihan HP yang ada di pikiranmu, misalnya **Oppo A77s, Realme C55, atau Samsung Galaxy A54**. Saya akan membantu menyiapkan spesifikasinya dan menghitung rekomendasi terbaik dengan metode SAW.',
  type: 'text',
};

const getStorageKey = (uid) =>
  `sesuaidompet_sedo_sessions_${uid || 'guest'}`;

const getActiveKey = (uid) =>
  `sesuaidompet_sedo_active_${uid || 'guest'}`;

/* =========================================
   FORMAT WAKTU SESI
========================================= */

function formatSessionDate(isoString) {
  if (!isoString) return '';

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeString = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return `Hari ini, ${timeString}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Kemarin, ${timeString}`;
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* =========================================
   KOMPONEN INPUT SPESIFIKASI
========================================= */

function PhoneSpecInput({
  phone,
  messageId,
  spec,
  onUpdate,
}) {
  const Icon = spec.icon;

  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-[#65786a]">
          <Icon size={12} className="shrink-0 text-[#578363]" />
          <span className="truncate">
            {spec.criterion} · {spec.label}
          </span>
        </span>

        <span className="shrink-0 text-sm font-semibold text-[#9aa59c]">
          {spec.unit}
        </span>
      </span>

      <input
        type="number"
        min="0"
        step={spec.step}
        value={phone[spec.field] ?? ''}
        onChange={(event) =>
          onUpdate(
            messageId,
            phone.tempId,
            spec.field,
            Number(event.target.value)
          )
        }
        className="min-h-[39px] w-full rounded-xl border border-[#dfe9e0] bg-white px-3 py-2 font-mono text-sm font-semibold text-[#36543d] outline-none transition focus:border-[#80b78b] focus:ring-4 focus:ring-[#e7f3e9]"
      />
    </label>
  );
}

/* =========================================
   KOMPONEN BADGE SUMBER HP
========================================= */

function PhoneSourceBadge({ phone }) {
  return phone.isFromDb ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#dce9ed] bg-[#f0f8fa] px-2 py-1 text-sm font-extrabold text-[#467b8c]">
      <Database size={10} />
      Database
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#dceade] bg-[#eef7ef] px-2 py-1 text-sm font-extrabold text-[#397b4b]">
      <Sparkles size={10} />
      AI Spec
    </span>
  );
}

/* =========================================
   KOMPONEN RIWAYAT CHAT
========================================= */

function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
}) {
  return (
    <article
      className={`rounded-2xl border p-3 transition ${
        isActive
          ? 'border-[#bcd9c2] bg-[#f0f8f1] shadow-[0_4px_12px_rgba(40,100,55,0.045)]'
          : 'border-[#e7eee7] bg-white hover:border-[#cbdccd] hover:bg-[#fbfdfb]'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 text-left"
        >
          <span className="flex items-center gap-1.5">
            <MessageSquare
              size={12}
              className={`shrink-0 ${
                isActive ? 'text-[#347c49]' : 'text-[#91a095]'
              }`}
            />

            <span
              className={`truncate text-xs font-extrabold ${
                isActive ? 'text-[#315b3b]' : 'text-[#526b57]'
              }`}
              title={session.title}
            >
              {session.title || 'Percakapan tanpa judul'}
            </span>
          </span>

          <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#87958a]">
            <span className="inline-flex items-center gap-1">
              <Clock3 size={10} />
              {formatSessionDate(session.updatedAt)}
            </span>

            <span>•</span>

            <span>{session.messages?.length || 0} pesan</span>
          </span>

          {session.winnerName && (
            <span className="mt-2 inline-flex max-w-full items-center gap-1 rounded-lg bg-[#e7f3e9] px-2 py-1 text-sm font-bold text-[#397b4b]">
              <Trophy size={10} className="shrink-0" />
              <span className="truncate">
                Juara: {session.winnerName}
              </span>
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onDelete}
          aria-label="Hapus sesi percakapan"
          title="Hapus percakapan"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9aa59c] transition hover:bg-[#fff1ef] hover:text-[#bd6259]"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </article>
  );
}

/* =========================================
   HALAMAN SEDO AI
========================================= */

export default function SedoAI() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const setSidebarOpen = outletContext?.setSidebarOpen;

  const {
    setCompareIds,
    deselectIds,
    setMaxBudget,
    setChatSmartphones,
  } = useSawSession();

  const [criteria, setCriteria] = useState([]);
  const [smartphones, setSmartphones] = useState([]);

  /* -----------------------------------------
     State sesi percakapan
  ----------------------------------------- */

  const [sessions, setSessions] = useState(() => {
    try {
      const raw = localStorage.getItem(
        getStorageKey(user?.id)
      );

      if (raw) {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Gagal membaca riwayat sesi:', error);
    }

    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    try {
      const savedActive = localStorage.getItem(
        getActiveKey(user?.id)
      );

      if (savedActive) {
        return savedActive;
      }
    } catch {
      // Abaikan jika localStorage tidak dapat dibaca.
    }

    return `session-${Date.now()}`;
  });

  const [messages, setMessages] = useState(() => {
    try {
      const activeKey = getActiveKey(user?.id);
      const savedActive = localStorage.getItem(activeKey);
      const raw = localStorage.getItem(getStorageKey(user?.id));

      if (raw && savedActive) {
        const parsed = JSON.parse(raw);
        const match = parsed.find(
          (session) => session.id === savedActive
        );

        if (
          match &&
          Array.isArray(match.messages) &&
          match.messages.length > 0
        ) {
          return match.messages;
        }
      }

      if (raw) {
        const parsed = JSON.parse(raw);

        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed[0].messages
        ) {
          return parsed[0].messages;
        }
      }

      const legacyKey = `sesuaidompet_sedo_chat_${user?.id || 'guest'}`;
      const legacyRaw = localStorage.getItem(legacyKey);

      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);

        if (
          Array.isArray(legacyParsed) &&
          legacyParsed.length > 0
        ) {
          return legacyParsed;
        }
      }
    } catch (error) {
      console.warn('Gagal membaca pesan tersimpan:', error);
    }

    return [DEFAULT_WELCOME_MESSAGE];
  });

  /* -----------------------------------------
     State antarmuka & Gemini Live Mode
  ----------------------------------------- */

  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLiveModeOpen, setIsLiveModeOpen] = useState(false);
  const [liveStatus, setLiveStatus] = useState('listening');
  const [liveAiText, setLiveAiText] = useState('');
  const [isLiveMicMuted, setIsLiveMicMuted] = useState(false);
  const isLiveModeRef = useRef(false);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    isLiveModeRef.current = isLiveModeOpen;
  }, [isLiveModeOpen]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* =========================================
     MEMUAT KRITERIA DAN DATA SMARTPHONE
  ========================================= */

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [criteriaData, phoneData] = await Promise.all([
          fetchCriteria(),
          fetchSmartphones(),
        ]);

        if (!active) return;

        setCriteria(criteriaData);
        setSmartphones(phoneData);
      } catch (error) {
        console.error(
          'Gagal memuat data referensi SEDO AI:',
          error
        );
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  /* =========================================
     AUTO SCROLL CHAT
  ========================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, isProcessing]);

  /* =========================================
     SINKRONISASI SAAT AKUN BERGANTI
  ========================================= */

  useEffect(() => {
    try {
      const key = getStorageKey(user?.id);
      const activeKey = getActiveKey(user?.id);

      const raw = localStorage.getItem(key);
      const savedActive = localStorage.getItem(activeKey);

      if (raw) {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);

          if (savedActive) {
            const match = parsed.find(
              (session) => session.id === savedActive
            );

            if (
              match &&
              Array.isArray(match.messages)
            ) {
              setCurrentSessionId(match.id);
              setMessages(match.messages);
              return;
            }
          }

          setCurrentSessionId(parsed[0].id);
          setMessages(
            parsed[0].messages || [DEFAULT_WELCOME_MESSAGE]
          );

          return;
        }
      }

      setSessions([]);

      const newId = `session-${Date.now()}`;

      setCurrentSessionId(newId);
      setMessages([DEFAULT_WELCOME_MESSAGE]);
    } catch (error) {
      console.warn(
        'Gagal memuat ulang sesi pengguna:',
        error
      );
    }
  }, [user?.id]);

  /* =========================================
     AUTO SAVE PERCAKAPAN
  ========================================= */

  useEffect(() => {
    if (!currentSessionId) return;

    const hasUserInteraction = messages.some(
      (message) =>
        message.sender === 'user' ||
        message.type === 'saw_result'
    );

    if (!hasUserInteraction) return;

    const firstUserMessage = messages.find(
      (message) => message.sender === 'user'
    );

    let title = firstUserMessage
      ? firstUserMessage.text
      : 'Percakapan SEDO AI';

    if (title.length > 45) {
      title = `${title.substring(0, 42)}...`;
    }

    const sawResultMessage = messages.find(
      (message) =>
        message.type === 'saw_result' &&
        message.sawResult
    );

    const winnerName =
      sawResultMessage?.sawResult?.rekomendasiTerbaik
        ?.smartphone?.name;

    setSessions((previousSessions) => {
      const existingIndex = previousSessions.findIndex(
        (session) => session.id === currentSessionId
      );

      const now = new Date().toISOString();

      const updatedSession = {
        id: currentSessionId,
        title,
        winnerName,
        updatedAt: now,
        messages,
      };

      let nextSessions;

      if (existingIndex >= 0) {
        nextSessions = [...previousSessions];

        nextSessions[existingIndex] = {
          ...nextSessions[existingIndex],
          ...updatedSession,
        };
      } else {
        nextSessions = [
          updatedSession,
          ...previousSessions,
        ];
      }

      nextSessions.sort(
        (a, b) =>
          new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      try {
        localStorage.setItem(
          getStorageKey(user?.id),
          JSON.stringify(nextSessions)
        );
      } catch (error) {
        console.warn(
          'Gagal menyimpan sesi ke localStorage:',
          error
        );
      }

      return nextSessions;
    });

    try {
      localStorage.setItem(
        getActiveKey(user?.id),
        currentSessionId
      );
    } catch (error) {
      console.warn(
        'Gagal menyimpan active session ID:',
        error
      );
    }
  }, [messages, currentSessionId, user?.id]);

  /* =========================================
     MULAI OBROLAN BARU
  ========================================= */

  function handleStartNewChat() {
    const newId = `session-${Date.now()}`;

    setCurrentSessionId(newId);
    setMessages([DEFAULT_WELCOME_MESSAGE]);

    try {
      localStorage.setItem(
        getActiveKey(user?.id),
        newId
      );
    } catch {
      // Abaikan jika localStorage tidak tersedia.
    }

    if (window.innerWidth < 768) {
      setIsHistoryOpen(false);
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
  }

  /* =========================================
     MEMBUKA SESI DARI RIWAYAT
  ========================================= */

  function handleSelectSession(session) {
    if (!session) return;

    setCurrentSessionId(session.id);
    setMessages(
      session.messages || [DEFAULT_WELCOME_MESSAGE]
    );

    try {
      localStorage.setItem(
        getActiveKey(user?.id),
        session.id
      );
    } catch {
      // Abaikan jika localStorage tidak tersedia.
    }

    if (window.innerWidth < 768) {
      setIsHistoryOpen(false);
    }
  }

  /* =========================================
     HAPUS SATU SESI
  ========================================= */

  function handleDeleteSession(sessionId) {
    const confirmed = window.confirm(
      'Hapus riwayat percakapan ini?'
    );

    if (!confirmed) return;

    const nextSessions = sessions.filter(
      (session) => session.id !== sessionId
    );

    setSessions(nextSessions);

    try {
      localStorage.setItem(
        getStorageKey(user?.id),
        JSON.stringify(nextSessions)
      );
    } catch {
      // Abaikan jika penyimpanan gagal.
    }

    if (currentSessionId === sessionId) {
      if (nextSessions.length > 0) {
        handleSelectSession(nextSessions[0]);
      } else {
        handleStartNewChat();
      }
    }
  }

  /* =========================================
     HAPUS SEMUA RIWAYAT
  ========================================= */

  function handleClearAllHistory() {
    const confirmed = window.confirm(
      'Apakah kamu yakin ingin menghapus seluruh riwayat percakapan SEDO AI?'
    );

    if (!confirmed) return;

    try {
      localStorage.removeItem(getStorageKey(user?.id));
      localStorage.removeItem(getActiveKey(user?.id));
    } catch {
      // Abaikan jika localStorage tidak tersedia.
    }

    setSessions([]);
    handleStartNewChat();
  }

  /* =========================================
     SPEECH TO TEXT & VOICE (STT Template)
  ========================================= */

  const {
    isListening,
    isSpeaking,
    speakingMessageId,
    liveTranscript,
    audioLevel,
    startListening,
    stopListening,
    abortListening,
    toggleListening,
    speakText,
    stopSpeaking,
  } = useVoiceHandler({
    lang: 'id-ID',
    silenceTimeoutMs: 1800,
    onTranscript: (spokenText) => {
      // Menampilkan teks yang sedang diucapkan secara real-time ke input form
      setInputMessage(spokenText);
    },
    onFinalTranscript: (finalText) => {
      // Kalimat final selesai diucapkan
      setInputMessage(finalText);
    },
    onSilence: (spokenText) => {
      // Pada Gemini Live Mode: kirim otomatis jika pengguna selesai bicara (jeda hening)
      if (isLiveModeRef.current && !isProcessingRef.current && spokenText?.trim()) {
        stopListening();
        setLiveStatus('processing');
        handleSendMessage(spokenText.trim(), { fromLive: true });
      }
    },
    onError: (errorMessage) => {
      window.alert(errorMessage);
    },
  });

  const handleVoiceSubmit = useCallback(
    (textToSend) => {
      stopListening();
      const content = (textToSend || liveTranscript || inputMessage).trim();
      if (content) {
        handleSendMessage(content);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stopListening, liveTranscript, inputMessage]
  );

  const handleVoiceCancel = useCallback(() => {
    abortListening();
    setInputMessage('');
  }, [abortListening]);

  /* =========================================
     GEMINI LIVE TWO-WAY VOICE MODE
  ========================================= */

  const handleOpenLiveMode = useCallback(() => {
    setIsLiveModeOpen(true);
    setLiveStatus('listening');
    setIsLiveMicMuted(false);
    setLiveAiText('');
    stopSpeaking();
    setTimeout(() => {
      startListening();
    }, 150);
  }, [startListening, stopSpeaking]);

  const handleCloseLiveMode = useCallback(() => {
    setIsLiveModeOpen(false);
    stopListening();
    stopSpeaking();
    setLiveStatus('idle');
    setLiveAiText('');
  }, [stopListening, stopSpeaking]);

  const handleToggleLiveMic = useCallback(() => {
    if (isListening) {
      stopListening();
      setIsLiveMicMuted(true);
      setLiveStatus('idle');
    } else {
      setIsLiveMicMuted(false);
      setLiveStatus('listening');
      startListening();
    }
  }, [isListening, stopListening, startListening]);

  const handleLiveInterrupt = useCallback(() => {
    stopSpeaking();
    if (isLiveModeRef.current) {
      setTimeout(() => {
        if (isLiveModeRef.current) {
          setLiveStatus('listening');
          startListening();
        }
      }, 250);
    }
  }, [stopSpeaking, startListening]);

  /* =========================================
     KIRIM PESAN KE AI
  ========================================= */

  async function handleSendMessage(customText, options = {}) {
    if (isListening) {
      stopListening();
    }
    if (isSpeaking) {
      stopSpeaking();
    }

    const textToSend = (
      customText || inputMessage
    ).trim();

    if (!textToSend || isProcessing || isProcessingRef.current) return;
    isProcessingRef.current = true;

    setInputMessage('');

    const userMessageId = `user-${Date.now()}`;

    const newMessages = [
      ...messages,
      {
        id: userMessageId,
        sender: 'user',
        text: textToSend,
        type: 'text',
      },
    ];

    setMessages(newMessages);
    setIsProcessing(true);

    // 1. Cek respon percakapan kasual (terima kasih, salam, pujian, identitas) secara instan & alami
    const conversationalReply = detectConversationalResponse(textToSend);
    if (conversationalReply) {
      setMessages((previous) => [
        ...previous,
        {
          id: `sedo-${Date.now()}`,
          sender: 'sedo',
          text: conversationalReply,
          type: 'text',
        },
      ]);

      if (isLiveModeRef.current) {
        setLiveAiText(conversationalReply);
        setLiveStatus('speaking');
        speakText(conversationalReply, {
          onEnd: () => {
            if (isLiveModeRef.current) {
              setTimeout(() => {
                if (isLiveModeRef.current) {
                  setLiveStatus('listening');
                  startListening();
                }
              }, 400);
            }
          },
        });
      }

      setIsProcessing(false);
      isProcessingRef.current = false;
      return;
    }

    const isFromLive = options.fromLive || isLiveModeRef.current;
    if (isFromLive) {
      setLiveStatus('processing');
    }

    try {
      const result = await extractAndLookupPhones(
        textToSend,
        smartphones
      );

      let spokenAiResponse = '';

      if (
        !result.smartphones ||
        result.smartphones.length === 0
      ) {
        const textMsg = formatFriendlyFallback(result.greeting, textToSend);
        spokenAiResponse = textMsg;

        setMessages((previous) => [
          ...previous,
          {
            id: `sedo-${Date.now()}`,
            sender: 'sedo',
            text: textMsg,
            type: 'text',
          },
        ]);
      } else {
        const phonesWithTempId = result.smartphones.map(
          (phone, index) => ({
            ...phone,
            tempId: `temp-${Date.now()}-${index}`,
            isFromDb: smartphones.some(
              (existingPhone) =>
                String(existingPhone.name).toLowerCase() ===
                String(phone.name).toLowerCase()
            ),
          })
        );

        const textMsg =
          result.greeting ||
          `Saya menemukan ${phonesWithTempId.length} smartphone yang kamu sebutkan. Berikut spesifikasi enam kriterianya. Kamu bisa mengecek atau mengubah angkanya sebelum dihitung!`;
        spokenAiResponse = textMsg;

        setMessages((previous) => [
          ...previous,
          {
            id: `sedo-${Date.now()}`,
            sender: 'sedo',
            text: textMsg,
            type: 'spec_card',
            phones: phonesWithTempId,
          },
        ]);
      }

      const isSpecCard = Boolean(result.smartphones && result.smartphones.length > 0);

      // Gemini Live Voice Turn-Taking Loop:
      if (isLiveModeRef.current && spokenAiResponse) {
        setLiveAiText(spokenAiResponse);
        setLiveStatus('speaking');
        speakText(spokenAiResponse, {
          onEnd: () => {
            if (isLiveModeRef.current) {
              if (isSpecCard) {
                // Sesuai permintaan user:
                // Pas form perbandingan spesifikasi muncul, mic otomatis di-disable / mute.
                // Pengguna bisa memeriksa atau mengubah angka dengan tenang.
                // Mic baru akan dibuka lagi saat tombol Hitung SAW ditekan & dijawab.
                stopListening();
                setLiveStatus('idle');
              } else {
                // Percakapan biasa tanpa form: buka mic lagi untuk giliran user
                setTimeout(() => {
                  if (isLiveModeRef.current) {
                    setLiveStatus('listening');
                    startListening();
                  }
                }, 400);
              }
            }
          },
        });
      }
    } catch (error) {
      const errorMsg = `Maaf, terjadi kendala saat memproses: ${error.message}. Pastikan koneksi dan API Key Edge Function sudah aktif.`;

      setMessages((previous) => [
        ...previous,
        {
          id: `sedo-err-${Date.now()}`,
          sender: 'sedo',
          text: errorMsg,
          type: 'text',
          isError: true,
        },
      ]);

      if (isLiveModeRef.current) {
        setLiveAiText(errorMsg);
        setLiveStatus('speaking');
        speakText(errorMsg, {
          onEnd: () => {
            if (isLiveModeRef.current) {
              setTimeout(() => {
                if (isLiveModeRef.current) {
                  setLiveStatus('listening');
                  startListening();
                }
              }, 400);
            }
          },
        });
      }
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  }

  /* =========================================
     EDIT SPESIFIKASI SMARTPHONE
  ========================================= */

  function handleUpdatePhoneSpec(
    messageId,
    phoneTempId,
    field,
    value
  ) {
    setMessages((previous) =>
      previous.map((message) => {
        if (
          message.id !== messageId ||
          !message.phones
        ) {
          return message;
        }

        const updatedPhones = message.phones.map(
          (phone) => {
            if (phone.tempId !== phoneTempId) {
              return phone;
            }

            return {
              ...phone,
              [field]: value,
            };
          }
        );

        return {
          ...message,
          phones: updatedPhones,
        };
      })
    );
  }

  /* =========================================
     TAMBAH SMARTPHONE MANUAL
  ========================================= */

  function handleAddManualPhoneToCard(messageId) {
    setMessages((previous) =>
      previous.map((message) => {
        if (
          message.id !== messageId ||
          !message.phones
        ) {
          return message;
        }

        const newPhone = {
          name: 'Smartphone Baru',
          price: 3000000,
          camera_mp: 50,
          ram_gb: 8,
          battery_mah: 5000,
          storage_gb: 128,
          antutu: 400000,
          tempId: `temp-manual-${Date.now()}`,
          isManual: true,
        };

        return {
          ...message,
          phones: [...message.phones, newPhone],
        };
      })
    );
  }

  /* =========================================
     HAPUS SMARTPHONE DARI KARTU
  ========================================= */

  function handleRemovePhoneFromCard(
    messageId,
    phoneTempId
  ) {
    setMessages((previous) =>
      previous.map((message) => {
        if (
          message.id !== messageId ||
          !message.phones
        ) {
          return message;
        }

        return {
          ...message,
          phones: message.phones.filter(
            (phone) => phone.tempId !== phoneTempId
          ),
        };
      })
    );
  }

  /* =========================================
     JALANKAN PERHITUNGAN SAW
  ========================================= */

  async function handleExecuteSaw(phones) {
    if (isProcessingRef.current) return;

    if (!phones || phones.length < 2) {
      window.alert(
        'Pilih minimal dua smartphone untuk menghitung perbandingan SAW.'
      );

      return;
    }

    isProcessingRef.current = true;
    setIsProcessing(true);
    if (isLiveModeRef.current) {
      setLiveStatus('processing');
    }

    try {
      // 1. Perhitungan SAW dilakukan di browser.
      const sawResult = calculateSAW(
        criteria,
        phones
      );

      if (
        !sawResult.isReady ||
        !sawResult.rekomendasiTerbaik
      ) {
        throw new Error(
          'Gagal menghitung preferensi SAW. Periksa kembali spesifikasi smartphone.'
        );
      }

      // 2. Simpan smartphone baru ke database akun pengguna.
      let savedPhones = [];

      if (user?.id) {
        savedPhones = await saveNewlyCreatedPhones(
          phones,
          user.id
        );

        const refreshedSmartphones =
          await fetchSmartphones();

        setSmartphones(refreshedSmartphones);
      }

      // Gabungkan: gunakan data savedPhones yang punya ID DB,
      // fallback ke data phones asli agar tidak ada HP yang hilang.
      const activePhones = phones.map((originalPhone) => {
        // Cari padanan di savedPhones berdasarkan nama (case-insensitive)
        const saved = savedPhones.find(
          (sp) =>
            String(sp.name).toLowerCase().trim() ===
            String(originalPhone.name).toLowerCase().trim()
        );
        // Prioritaskan versi yang punya ID database
        return saved || originalPhone;
      });

      // 3. Minta AI membuat penjelasan rekomendasi.
      let aiExplanation = '';

      try {
        aiExplanation = await explainSawRecommendation(
          sawResult.hasilAkhir,
          criteria
        );
      } catch (aiError) {
        console.warn(
          'Gagal memuat ulasan AI:',
          aiError
        );

        aiExplanation =
          `Berdasarkan metode Simple Additive Weighting (SAW), **${sawResult.rekomendasiTerbaik.smartphone.name}** berhasil menempati peringkat pertama dengan nilai preferensi tertinggi (${formatDecimal(sawResult.rekomendasiTerbaik.totalScore, 4)}).`;
      }

      // 4. Simpan hasil sebagai pesan percakapan.
      setMessages((previous) => [
        ...previous,
        {
          id: `saw-result-${Date.now()}`,
          sender: 'sedo',
          type: 'saw_result',
          sawResult,
          aiExplanation,
          phones: activePhones,
          savedCount: savedPhones.length,
        },
      ]);

      // Jika dalam Gemini Live Mode, bacakan juara rekomendasi
      if (isLiveModeRef.current && sawResult.rekomendasiTerbaik?.smartphone?.name) {
        const winnerSummary = `Perhitungan SAW selesai! Juara rekomendasi terbaik adalah ${sawResult.rekomendasiTerbaik.smartphone.name} dengan nilai preferensi ${formatDecimal(sawResult.rekomendasiTerbaik.totalScore, 4)}.`;
        setLiveAiText(winnerSummary);
        setLiveStatus('speaking');
        speakText(winnerSummary, {
          onEnd: () => {
            if (isLiveModeRef.current) {
              setTimeout(() => {
                if (isLiveModeRef.current) {
                  setLiveStatus('listening');
                  startListening();
                }
              }, 400);
            }
          },
        });
      }
    } catch (error) {
      window.alert(
        error.message ||
          'Terjadi kesalahan saat menghitung rekomendasi.'
      );
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  }

  /* =========================================
     BUKA DETAIL PERHITUNGAN SAW
  ========================================= */

  async function handleOpenComparison(phones) {
    // 1. Ambil seluruh HP yang ada di percakapan (prioritaskan phones yang di-pass, fallback ke kartu spesifikasi/hasil aktif)
    let phonesToCompare = Array.isArray(phones) && phones.length > 0 ? phones : [];

    if (phonesToCompare.length === 0) {
      const cardMsg = [...messages].reverse().find(
        (m) =>
          (m.type === 'saw_result' || m.type === 'spec_card') &&
          Array.isArray(m.phones) &&
          m.phones.length > 0
      );
      if (cardMsg) {
        phonesToCompare = cardMsg.phones;
      }
    }

    if (phonesToCompare.length === 0) {
      console.warn('Tidak ada data smartphone dalam percakapan untuk ditarik.');
      navigate('/perhitungan');
      return;
    }

    // 2. Fetch data smartphone terbaru dari database
    let allPhones = [];
    try {
      allPhones = await fetchSmartphones();
      setSmartphones(allPhones);
    } catch (err) {
      console.warn('Gagal fetch smartphones terbaru:', err);
      allPhones = smartphones;
    }

    // 3. Simpan HP baru ke database jika pengguna sedang login
    let resolvedPhones = [...phonesToCompare];
    if (user?.id) {
      try {
        const saved = await saveNewlyCreatedPhones(resolvedPhones, user.id);
        if (saved && saved.length > 0) {
          resolvedPhones = phonesToCompare.map((orig) => {
            const match = saved.find(
              (s) =>
                String(s.name).toLowerCase().trim() ===
                String(orig.name).toLowerCase().trim()
            );
            return match || orig;
          });
          allPhones = await fetchSmartphones().catch(() => allPhones);
          setSmartphones(allPhones);
        }
      } catch (saveErr) {
        console.warn('Gagal auto-save HP saat buka perbandingan:', saveErr);
      }
    }

    // 4. Siapkan format smartphone lengkap dengan ID yang valid untuk halaman /perhitungan
    const chatSmartphonesForSession = resolvedPhones.map((phone, index) => {
      const dbMatch = allPhones.find(
        (dbP) =>
          (phone.id &&
            !String(phone.id).startsWith('temp-') &&
            String(dbP.id) === String(phone.id)) ||
          String(dbP.name).toLowerCase().trim() ===
            String(phone.name).toLowerCase().trim()
      );

      const assignedId =
        dbMatch?.id ??
        (phone.id && !String(phone.id).startsWith('temp-')
          ? phone.id
          : `chat-${Date.now()}-${index + 1}`);

      return {
        ...phone,
        id: assignedId,
        user_id: phone.user_id ?? dbMatch?.user_id ?? user?.id ?? null,
      };
    });

    const targetIds = chatSmartphonesForSession.map((p) => p.id);
    const targetSet = new Set(targetIds.map(String));

    // Deselect HP database lain yang bukan bagian dari percakapan ini
    const otherIds = allPhones
      .map((phone) => phone.id)
      .filter((id) => !targetSet.has(String(id)));

    // Simpan ke SawSessionContext:
    // Seluruh data smartphone yang ada di percakapan (HP A, HP B, dst.) dijamin 100% ikut ditarik dan terpilih!
    setChatSmartphones(chatSmartphonesForSession);
    deselectIds(otherIds);
    setMaxBudget('');
    setCompareIds(targetIds);

    navigate('/perhitungan');
  }

  /* =========================================
     TAMPILAN HALAMAN
  ========================================= */

  const latestCardMessage = [...messages].reverse().find(
    (m) => m.type === 'spec_card' || m.type === 'saw_result'
  );

  return (
    <section className="flex h-full w-full flex-1 flex-col overflow-hidden bg-white">
      {/* =====================================
          HEADER SEDO AI
      ===================================== */}
      <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-[#e4ece5] bg-white/95 px-3.5 py-3 backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          {setSidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu navigasi"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e2ebe3] bg-white text-[#1c5637] transition hover:bg-[#f2f8f3] md:hidden"
            >
              <Menu size={18} />
            </button>
          )}

          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2e8b4b] to-[#175d35] text-white shadow-[0_5px_14px_rgba(35,112,59,0.2)]">
            <Bot size={21} />

            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-[#62c879]" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="text-sm font-extrabold tracking-tight text-[#244832] sm:text-base">
                SEDO AI
              </h1>

              <span className="rounded-full border border-[#dceade] bg-[#eef7ef] px-2 py-0.5 text-sm font-extrabold text-[#397b4b]">
                SPK ASSISTANT
              </span>
            </div>

            <p className="mt-0.5 truncate text-xs text-[#87958a] sm:text-sm">
              Asisten cerdas pemilihan smartphone dengan metode SAW
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden rounded-xl border border-[#e2ebe3] bg-[#f8fbf8] px-3 py-2 text-right sm:block">
            <p className="text-sm font-bold text-[#8b988e]">
              Kriteria aktif
            </p>

            <p className="mt-0.5 text-xs font-extrabold text-[#46744f]">
              {criteria.length} kriteria
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsHistoryOpen((previous) => !previous)}
            aria-pressed={isHistoryOpen}
            className={`inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
              isHistoryOpen
                ? 'border-[#bcd9c2] bg-[#edf7ef] text-[#347c49]'
                : 'border-[#e1e9e2] bg-white text-[#66796a] hover:border-[#bfd9c4] hover:bg-[#f5faf5]'
            }`}
            title="Riwayat percakapan"
          >
            <History size={14} />

            <span className="hidden sm:inline">
              Riwayat
            </span>

            {sessions.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e4f1e6] px-1 text-sm font-extrabold text-[#397b4b]">
                {sessions.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleStartNewChat}
            className="sd-button-dark inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition"
            title="Mulai obrolan baru"
          >
            <Plus size={14} />

            <span className="hidden sm:inline">
              Obrolan Baru
            </span>
          </button>

          <button
            type="button"
            onClick={handleOpenLiveMode}
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-[#216d3a] to-[#2d884c] px-3.5 py-2 text-xs font-black text-white shadow-[0_4px_14px_rgba(33,109,58,0.25)] transition hover:from-[#1a572e] hover:to-[#236e3c]"
            title="Buka Mode Percakapan Suara Live (seperti Gemini Live)"
          >
            <Radio size={14} className="animate-pulse" />
            <span className="hidden sm:inline">Live Suara</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          </button>
        </div>
      </header>

      {/* =====================================
          AREA CHAT DAN RIWAYAT
      ===================================== */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* KOLOM PERCAKAPAN */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* AREA PESAN */}
          <div className="flex-1 space-y-5 overflow-y-auto bg-[#f7faf7] px-3 py-4 sm:px-5 sm:py-5">
            {/* Penanda awal */}
            <div className="mx-auto flex max-w-3xl items-center justify-center gap-2">
              <span className="h-px flex-1 bg-[#e5eee6]" />

              <span className="rounded-full border border-[#e2ebe3] bg-white px-3 py-1 text-sm font-extrabold uppercase tracking-[0.12em] text-[#89978d]">
                Percakapan SEDO AI
              </span>

              <span className="h-px flex-1 bg-[#e5eee6]" />
            </div>

            {messages.map((message) => {
              const isUser = message.sender === 'user';

              return (
                <div
                  key={message.id}
                  className={`flex w-full items-end gap-2.5 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* AVATAR AI */}
                  {!isUser && (
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border bg-white shadow-[0_3px_9px_rgba(25,68,39,0.05)] sm:h-9 sm:w-9 transition-all ${
                        isSpeaking && speakingMessageId === message.id
                          ? 'border-[#3ba258] text-[#22723c] ring-4 ring-[#b3e5c0]/60 animate-pulse'
                          : 'border-[#d9e9dc] text-[#347c49]'
                      }`}
                    >
                      <Bot size={17} />
                    </div>
                  )}

                  {/* ISI PESAN */}
                  <div
                    className={`min-w-0 ${
                      isUser
                        ? 'max-w-[88%] sm:max-w-[75%]'
                        : 'w-[calc(100%-2.75rem)] max-w-[900px]'
                    }`}
                  >
                    <div
                      className={`min-w-0 rounded-[20px] ${
                        isUser
                          ? 'rounded-br-md bg-gradient-to-br from-[#287b44] to-[#1e6439] px-4 py-3 text-white shadow-[0_5px_16px_rgba(31,104,54,0.13)]'
                          : message.isError
                            ? 'rounded-bl-md border border-[#f0d9d6] bg-[#fff7f6] p-4 text-[#a54a42] shadow-[0_4px_14px_rgba(100,40,35,0.035)]'
                            : 'rounded-bl-md border border-[#e3ebe4] bg-white p-3.5 text-[#405a46] shadow-[0_4px_14px_rgba(25,68,39,0.035)] sm:p-4'
                      }`}
                    >
                      {/* LABEL PENGIRIM & SUARA */}
                      {!isUser && (
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#397b4b]">
                              SEDO AI
                            </span>

                            <span className="h-1 w-1 rounded-full bg-[#a9b8aa]" />

                            <span className="text-sm font-medium text-[#9aa69c]">
                              Asisten SesuaiDompet
                            </span>
                          </div>

                          {/* Tombol Dengarkan Suara (TTS) */}
                          {message.text && !message.isError && (
                            <button
                              type="button"
                              onClick={() => speakText(message.text, message.id)}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-bold transition ${
                                isSpeaking && speakingMessageId === message.id
                                  ? 'bg-[#e7f5ea] text-[#1e6a37] ring-1 ring-[#a3d9af]'
                                  : 'text-[#7e9083] hover:bg-[#edf6f0] hover:text-[#287b44]'
                              }`}
                              title={
                                isSpeaking && speakingMessageId === message.id
                                  ? 'Hentikan suara'
                                  : 'Dengarkan pesan ini'
                              }
                            >
                              {isSpeaking && speakingMessageId === message.id ? (
                                <>
                                  <TTSWaveIndicator />
                                  <VolumeX size={13} className="text-[#bf4b40]" />
                                  <span className="text-sm font-extrabold text-[#1f6837]">
                                    Berhenti
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Volume2 size={13} />
                                  <span className="text-sm font-semibold">
                                    Dengarkan
                                  </span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {/* PESAN TEKS */}
                      {message.text && (
                        isUser ? (
                          <p className="whitespace-pre-line text-sm leading-6 text-white sm:text-xs">
                            {message.text}
                          </p>
                        ) : (
                          <div
                            className={`text-sm leading-6 sm:text-xs ${
                              message.isError
                                ? 'text-[#a54a42]'
                                : 'text-[#536b58]'
                            }`}
                          >
                            <MarkdownRenderer
                              content={message.text}
                              className="text-sm sm:text-xs"
                            />
                          </div>
                        )
                      )}

                      {/* =================================
                          KARTU SPESIFIKASI SMARTPHONE
                      ================================= */}
                      {message.type === 'spec_card' &&
                        message.phones && (
                          <div className="mt-4 space-y-3">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h3 className="text-xs font-extrabold text-[#31583b]">
                                  Periksa spesifikasi smartphone
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-[#819084]">
                                  Pastikan semua nilai sesuai dengan varian
                                  smartphone yang ingin dibandingkan.
                                </p>
                              </div>

                              <span className="self-start rounded-full border border-[#dceade] bg-[#eef7ef] px-2.5 py-1 text-xs font-extrabold text-[#397b4b]">
                                {message.phones.length} alternatif
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                              {message.phones.map((phone, phoneIndex) => (
                                <article
                                  key={phone.tempId || phoneIndex}
                                  className="min-w-0 overflow-hidden rounded-[18px] border border-[#dfe9e0] bg-[#fbfdfb]"
                                >
                                  {/* HEADER KARTU HP */}
                                  <div className="flex items-start justify-between gap-2 border-b border-[#e5eee6] bg-white px-3.5 py-3">
                                    <div className="flex min-w-0 flex-1 items-start gap-2">
                                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#edf6ef] text-[#397b4b]">
                                        <Smartphone size={15} />
                                      </span>

                                      <div className="min-w-0 flex-1">
                                        <label className="mb-1 block text-sm font-bold text-[#89968b]">
                                          NAMA SMARTPHONE
                                        </label>

                                        <input
                                          type="text"
                                          value={phone.name || ''}
                                          onChange={(event) =>
                                            handleUpdatePhoneSpec(
                                              message.id,
                                              phone.tempId,
                                              'name',
                                              event.target.value
                                            )
                                          }
                                          className="min-h-[34px] w-full rounded-lg border border-[#dfe9e0] bg-[#fbfdfb] px-2.5 py-1.5 text-xs font-extrabold text-[#36543d] outline-none transition focus:border-[#80b78b] focus:ring-2 focus:ring-[#e7f3e9]"
                                          placeholder="Nama smartphone"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1">
                                      <PhoneSourceBadge phone={phone} />

                                      {message.phones.length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemovePhoneFromCard(
                                              message.id,
                                              phone.tempId
                                            )
                                          }
                                          aria-label={`Hapus ${phone.name}`}
                                          title="Hapus smartphone"
                                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a0aaa1] transition hover:bg-[#fff1ef] hover:text-[#bd6259]"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* ENAM INPUT KRITERIA */}
                                  <div className="grid grid-cols-2 gap-x-3 gap-y-3 p-3.5 sm:p-4">
                                    {SPEC_FIELDS.map((spec) => (
                                      <PhoneSpecInput
                                        key={spec.field}
                                        phone={phone}
                                        messageId={message.id}
                                        spec={spec}
                                        onUpdate={handleUpdatePhoneSpec}
                                      />
                                    ))}
                                  </div>
                                </article>
                              ))}
                            </div>

                            {/* AKSI KARTU */}
                            <div className="flex flex-col gap-2 border-t border-[#e5eee6] pt-3 sm:flex-row sm:items-center sm:justify-between">
                              <button
                                type="button"
                                onClick={() =>
                                  handleAddManualPhoneToCard(message.id)
                                }
                                className="sd-button-light inline-flex min-h-[39px] items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold"
                              >
                                <Plus size={14} />
                                Tambah HP Lain
                              </button>

                              <button
                                type="button"
                                disabled={
                                  isProcessing ||
                                  message.phones.length < 2
                                }
                                onClick={() =>
                                  handleExecuteSaw(message.phones)
                                }
                                className="sd-button-dark inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Calculator size={15} />
                                Hitung Rekomendasi SAW
                                <ArrowRight size={14} />
                              </button>
                            </div>

                            {message.phones.length < 2 && (
                              <p className="rounded-xl border border-[#f0e5cf] bg-[#fffaf0] px-3 py-2 text-xs leading-5 text-[#92784d]">
                                Tambahkan minimal satu smartphone lagi untuk
                                menjalankan perbandingan SAW.
                              </p>
                            )}
                          </div>
                        )}

                      {/* =================================
                          HASIL REKOMENDASI SAW
                      ================================= */}
                      {message.type === 'saw_result' &&
                        message.sawResult && (
                          <div className="mt-4 space-y-4">
                            {/* PEMENANG */}
                            <div className="relative overflow-hidden rounded-[20px] border border-[#cfe4d3] bg-gradient-to-br from-[#edf8ef] via-white to-[#f4faf4] p-4">
                              <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border-[18px] border-[#dceede]/50" />

                              <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#287b44] text-white shadow-[0_5px_15px_rgba(40,123,68,0.18)]">
                                    <Trophy size={20} />
                                  </span>

                                  <div className="min-w-0">
                                    <p className="text-sm font-extrabold uppercase tracking-[0.13em] text-[#54835e]">
                                      Rekomendasi terbaik · Peringkat 1
                                    </p>

                                    <h3 className="mt-1 break-words text-sm font-extrabold leading-snug text-[#294d34] sm:text-base">
                                      {message.sawResult.rekomendasiTerbaik?.smartphone?.name ||
                                        'Smartphone terbaik'}
                                    </h3>

                                    <p className="mt-1 text-xs text-[#7d8c80]">
                                      {formatRupiah(
                                        message.sawResult.rekomendasiTerbaik?.smartphone?.price
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="rounded-xl border border-[#e0ece1] bg-white/90 px-4 py-3 sm:min-w-[135px] sm:text-right">
                                  <p className="text-sm font-bold text-[#819084]">
                                    Skor preferensi SAW
                                  </p>

                                  <p className="mt-1 font-mono text-xl font-extrabold text-[#287b44]">
                                    {formatDecimal(
                                      message.sawResult.rekomendasiTerbaik?.totalScore,
                                      4
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* ANALISIS AI */}
                            <div className="rounded-[18px] border border-[#e2ebe3] bg-white p-3.5 sm:p-4">
                              <div className="mb-3 flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#edf6ef] text-[#397b4b]">
                                  <Sparkles size={15} />
                                </span>

                                <div>
                                  <h4 className="text-xs font-extrabold text-[#36543d]">
                                    Analisis dan alasan rekomendasi
                                  </h4>

                                  <p className="mt-0.5 text-sm text-[#8b988e]">
                                    Penjelasan berdasarkan hasil perhitungan SAW
                                  </p>
                                </div>
                              </div>

                              <div className="text-xs leading-6 text-[#607565] sm:text-sm">
                                <MarkdownRenderer
                                  content={message.aiExplanation || ''}
                                />
                              </div>
                            </div>

                            {/* RANKING */}
                            <div>
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <div>
                                  <h4 className="text-xs font-extrabold text-[#36543d]">
                                    Urutan hasil perbandingan
                                  </h4>

                                  <p className="mt-0.5 text-sm text-[#87958a]">
                                    Nilai preferensi tertinggi berada di peringkat pertama.
                                  </p>
                                </div>

                                <span className="rounded-full bg-[#eef7ef] px-2.5 py-1 text-sm font-extrabold text-[#397b4b]">
                                  {message.sawResult.hasilAkhir.length} HP
                                </span>
                              </div>

                              <div className="space-y-2">
                                {message.sawResult.hasilAkhir.map((row) => (
                                  <article
                                    key={row.rank}
                                    className={`rounded-[16px] border p-3 ${
                                      row.rank === 1
                                        ? 'border-[#cfe4d3] bg-[#f0f8f1]'
                                        : 'border-[#e6eee7] bg-white'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <span
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                                          row.rank === 1
                                            ? 'bg-[#287b44] text-white'
                                            : 'bg-[#edf2ed] text-[#6b7b6e]'
                                        }`}
                                      >
                                        #{row.rank}
                                      </span>

                                      <div className="min-w-0 flex-1">
                                        <p className="break-words text-xs font-extrabold text-[#36543d]">
                                          {row.smartphone.name}
                                        </p>

                                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#87958a]">
                                          <span>
                                            {formatRupiah(row.smartphone.price)}
                                          </span>

                                          <span>
                                            RAM {row.smartphone.ram_gb} GB
                                          </span>

                                          <span>
                                            ROM {row.smartphone.storage_gb} GB
                                          </span>
                                        </div>
                                      </div>

                                      <div className="shrink-0 text-right">
                                        <p className="text-sm font-semibold text-[#87958a]">
                                          Nilai V
                                        </p>

                                        <p className="mt-1 font-mono text-xs font-extrabold text-[#287b44]">
                                          {formatDecimal(row.totalScore, 4)}
                                        </p>
                                      </div>
                                    </div>
                                  </article>
                                ))}
                              </div>
                            </div>

                            {/* AKSI HASIL */}
                            <div className="flex flex-col gap-3 border-t border-[#e5eee6] pt-3 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-xs leading-5 text-[#829086]">
                                {message.savedCount > 0
                                  ? `${message.savedCount} smartphone berhasil diproses untuk penyimpanan ke akunmu.`
                                  : 'Hasil perhitungan ini tersimpan dalam percakapan SEDO AI.'}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenComparison(message.phones)
                                }
                                className="sd-button-dark inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold sm:text-sm"
                              >
                                <Calculator size={14} />
                                Buka Detail Langkah SAW
                                <ArrowRight size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* AVATAR PENGGUNA */}
                    {isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e6eee7] text-[#52715a] sm:h-9 sm:w-9">
                        <UserRound size={16} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* INDIKATOR PROSES AI */}
            {isProcessing && (
              <div className="flex items-end gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#d9e9dc] bg-white text-[#347c49] sm:h-9 sm:w-9">
                  <Bot size={17} className="animate-pulse" />
                </div>

                <div className="flex min-w-0 items-center gap-2 rounded-2xl rounded-bl-md border border-[#e3ebe4] bg-white px-4 py-3 shadow-[0_4px_14px_rgba(25,68,39,0.035)]">
                  <RefreshCw
                    size={14}
                    className="shrink-0 animate-spin text-[#438653]"
                  />

                  <span className="text-xs font-semibold text-[#718477] sm:text-sm">
                    SEDO AI sedang menganalisis spesifikasi smartphone...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* =================================
              INPUT PESAN
          ================================= */}
          <div className="shrink-0 border-t border-[#e2ebe3] bg-white px-3 py-3 sm:px-5 sm:py-4">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#4b8c5b]" />

                <span className="text-xs font-extrabold text-[#64796a]">
                  Coba tanyakan
                </span>
              </div>

              <span className="hidden text-sm text-[#9aa59c] sm:inline">
                Pilih contoh untuk mengirim pesan langsung
              </span>
            </div>

            <div className="mb-3 flex snap-x gap-2 overflow-x-auto pb-1">
              {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleSendMessage(suggestion)}
                  className="min-h-[34px] max-w-[245px] shrink-0 snap-start rounded-xl border border-[#e1ebe2] bg-[#f8fbf8] px-3 py-2 text-left text-xs font-semibold leading-4 text-[#637a68] transition hover:border-[#bfd9c4] hover:bg-[#eff7f0] hover:text-[#347c49] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* VOICE VISUALIZER BANNER SAAT SEDANG BICARA */}
            <VoiceVisualizer
              isListening={isListening}
              liveTranscript={liveTranscript || inputMessage}
              audioLevel={audioLevel}
              onStop={stopListening}
              onCancel={handleVoiceCancel}
              onSubmit={handleVoiceSubmit}
            />

            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (isListening) {
                  stopListening();
                }
                handleSendMessage();
              }}
              className="flex items-center gap-2 rounded-[17px] border border-[#dfe9e0] bg-[#fbfdfb] p-1.5 transition focus-within:border-[#94c39c] focus-within:ring-4 focus-within:ring-[#eaf5ec]"
            >
              <div className="relative">
                {isListening && (
                  <span className="pointer-events-none absolute -inset-1 rounded-2xl bg-emerald-500/25 animate-voice-ring" />
                )}
                <button
                  type="button"
                  onClick={toggleListening}
                  title={
                    isListening
                      ? 'Hentikan merekam suara'
                      : 'Bicara lewat suara'
                  }
                  aria-label={
                    isListening
                      ? 'Hentikan rekaman suara'
                      : 'Gunakan input suara'
                  }
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
                    isListening
                      ? 'border-[#2d8149] bg-gradient-to-br from-[#287d46] to-[#1c6435] text-white shadow-[0_4px_14px_rgba(35,112,59,0.3)] animate-voice-ring'
                      : 'border-[#e1e9e2] bg-white text-[#6e8272] hover:border-[#c6ddca] hover:bg-[#f0f8f1] hover:text-[#347c49]'
                  }`}
                >
                  {isListening ? (
                    <MicOff size={16} />
                  ) : (
                    <Mic size={16} />
                  )}
                </button>
              </div>

              {/* Tombol Cepat Gemini Live */}
              <button
                type="button"
                onClick={handleOpenLiveMode}
                title="Buka Mode Suara Live Interaktif (seperti Gemini Live)"
                className="flex h-9 items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-[#edf7f0] px-2.5 text-xs font-black text-[#236e3b] transition hover:bg-[#def0e2] shrink-0"
              >
                <Radio size={13} className="animate-pulse text-[#288447]" />
                <span className="hidden sm:inline">Live</span>
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(event) =>
                  setInputMessage(event.target.value)
                }
                disabled={isProcessing}
                placeholder={
                  isListening
                    ? 'Mendengarkan suara kamu... (Bicara sekarang)'
                    : 'Tulis nama smartphone yang ingin dibandingkan...'
                }
                aria-label="Tulis pesan untuk SEDO AI"
                className="min-h-[39px] min-w-0 flex-1 bg-transparent px-2 text-xs font-medium text-[#36543d] outline-none placeholder:text-[#a0aba2] sm:text-sm"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isProcessing}
                className="sd-button-dark inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3.5 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send size={14} />

                <span className="hidden sm:inline">
                  Kirim
                </span>
              </button>
            </form>

            <p className="mt-2 text-center text-sm leading-4 text-[#9aa59c]">
              Periksa kembali spesifikasi yang diberikan AI sebelum menjalankan perhitungan.
            </p>
          </div>
        </div>

        {/* =================================
            BACKDROP RIWAYAT MOBILE
        ================================= */}
        {isHistoryOpen && (
          <button
            type="button"
            aria-label="Tutup panel riwayat"
            onClick={() => setIsHistoryOpen(false)}
            className="absolute inset-0 z-30 bg-[#14271b]/30 backdrop-blur-[2px] md:hidden"
          />
        )}

        {/* =================================
            PANEL RIWAYAT PERCAKAPAN
        ================================= */}
        {isHistoryOpen && (
          <aside
            aria-label="Riwayat percakapan SEDO AI"
            className="absolute inset-y-0 right-0 z-40 flex w-[min(88%,360px)] flex-col border-l border-[#e1ebe2] bg-[#fbfdfb] shadow-[-12px_0_35px_rgba(25,68,39,0.10)] md:relative md:inset-auto md:z-10 md:w-[290px] md:shrink-0 md:shadow-none lg:w-[320px]"
          >
            {/* HEADER RIWAYAT */}
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#e4ece5] bg-white px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf6ef] text-[#397b4b]">
                  <History size={16} />
                </span>

                <div className="min-w-0">
                  <h2 className="text-xs font-extrabold text-[#31513a]">
                    Riwayat Percakapan
                  </h2>

                  <p className="mt-0.5 text-sm text-[#8b988e]">
                    {sessions.length} sesi tersimpan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                aria-label="Tutup riwayat"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#849188] transition hover:bg-[#f0f7f1] hover:text-[#347c49]"
              >
                <X size={16} />
              </button>
            </div>

            {/* TOMBOL OBROLAN BARU */}
            <div className="shrink-0 border-b border-[#e6eee7] bg-white p-3">
              <button
                type="button"
                onClick={handleStartNewChat}
                className="sd-button-dark inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold"
              >
                <Plus size={14} />
                Mulai Obrolan Baru
              </button>
            </div>

            {/* DAFTAR SESI */}
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {sessions.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf6ef] text-[#6f9678]">
                    <MessageSquare size={21} />
                  </span>

                  <p className="mt-3 text-xs font-extrabold text-[#526b57]">
                    Belum ada riwayat
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#89968c]">
                    Percakapan dan hasil perhitungan SAW akan otomatis tersimpan di sini.
                  </p>
                </div>
              ) : (
                sessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === currentSessionId}
                    onSelect={() =>
                      handleSelectSession(session)
                    }
                    onDelete={() =>
                      handleDeleteSession(session.id)
                    }
                  />
                ))
              )}
            </div>

            {/* FOOTER RIWAYAT */}
            {sessions.length > 0 && (
              <div className="shrink-0 border-t border-[#e4ece5] bg-white p-3">
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-xl border border-[#f0deda] bg-white px-3 py-2 text-xs font-extrabold text-[#b65b52] transition hover:bg-[#fff5f3]"
                >
                  <Trash2 size={13} />
                  Hapus Semua Riwayat
                </button>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* =====================================
          GEMINI LIVE TWO-WAY VOICE OVERLAY
      ===================================== */}
      <GeminiLiveVoice
        isOpen={isLiveModeOpen}
        onClose={handleCloseLiveMode}
        liveStatus={liveStatus}
        liveTranscript={liveTranscript}
        aiResponseText={liveAiText}
        audioLevel={audioLevel}
        onToggleMic={handleToggleLiveMic}
        isMicMuted={isLiveMicMuted}
        onInterrupt={handleLiveInterrupt}
        activeCard={latestCardMessage}
        specFields={SPEC_FIELDS}
        onUpdatePhoneSpec={handleUpdatePhoneSpec}
        onAddManualPhone={handleAddManualPhoneToCard}
        onRemovePhone={handleRemovePhoneFromCard}
        onExecuteSaw={handleExecuteSaw}
        onOpenComparison={handleOpenComparison}
        isProcessing={isProcessing}
      />
    </section>
  );
}
