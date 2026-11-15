import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Database,
  HelpCircle,
  History,
  MessageSquare,
  Mic,
  MicOff,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Trophy,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSawSession } from '../hooks/useSawSession';
import { PageHeader } from '../components/PageHeader';
import { SawStepTables } from '../components/SawStepTables';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { fetchCriteria, fetchSmartphones } from '../services/spkService';
import {
  explainSawRecommendation,
  extractAndLookupPhones,
  saveNewlyCreatedPhones,
} from '../services/sedoAiService';
import { calculateSAW } from '../utils/sawCalculator';
import {
  formatCriterionValue,
  formatDecimal,
  formatRupiah,
} from '../utils/formatters';

const PROMPT_SUGGESTIONS = [
  'Bantu pilihkan Oppo A77s, Realme C55, atau Samsung Galaxy A54',
  'Bandingkan Redmi Note 13 vs Poco M6 Pro',
  'Poco X6 Pro vs Infinix GT 20 Pro mana yang lebih worth it?',
];

const DEFAULT_WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'sedo',
  text: 'Halo! Saya SEDO AI, asisten cerdas pemilihan smartphone SesuaiDompet. Sedang bingung memilih HP? Ceritakan pilihan HP yang ada di pikiranmu (contoh: "Oppo A77s, Realme C55, atau Samsung A54"). Saya akan bantu melengkapi spesifikasinya dan menghitung rekomendasi terbaik dengan metode SAW!',
  type: 'text',
};

const getStorageKey = (uid) => `sesuaidompet_sedo_sessions_${uid || 'guest'}`;
const getActiveKey = (uid) => `sesuaidompet_sedo_active_${uid || 'guest'}`;

function formatSessionDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const timeStr = d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return `Hari ini, ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Kemarin, ${timeStr}`;
  }

  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SedoAI() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setCompareIds, deselectIds, setMaxBudget } = useSawSession();

  const [criteria, setCriteria] = useState([]);
  const [smartphones, setSmartphones] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  // Riwayat Sesi Obrolan
  const [sessions, setSessions] = useState(() => {
    try {
      const key = getStorageKey(user?.id);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Gagal membaca riwayat sesi:', e);
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    try {
      const activeKey = getActiveKey(user?.id);
      const savedActive = localStorage.getItem(activeKey);
      if (savedActive) return savedActive;
    } catch (e) {
      // ignore
    }
    return `session-${Date.now()}`;
  });

  // Chat messages
  const [messages, setMessages] = useState(() => {
    try {
      const activeKey = getActiveKey(user?.id);
      const savedActive = localStorage.getItem(activeKey);
      const key = getStorageKey(user?.id);
      const raw = localStorage.getItem(key);
      if (raw && savedActive) {
        const parsed = JSON.parse(raw);
        const match = parsed.find((s) => s.id === savedActive);
        if (match && Array.isArray(match.messages) && match.messages.length > 0) {
          return match.messages;
        }
      }
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].messages) {
          return parsed[0].messages;
        }
      }
      const legacyKey = `sesuaidompet_sedo_chat_${user?.id || 'guest'}`;
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
          return legacyParsed;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca pesan tersimpan:', e);
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load criteria & existing smartphones
  useEffect(() => {
    async function loadData() {
      try {
        const [critData, phoneData] = await Promise.all([
          fetchCriteria(),
          fetchSmartphones(),
        ]);
        setCriteria(critData);
        setSmartphones(phoneData);
      } catch (err) {
        console.error('Gagal memuat data referensi:', err);
      } finally {
        setLoadingInit(false);
      }
    }
    loadData();
  }, []);

  // Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Sinkronisasi saat user berganti login / logout
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
            const match = parsed.find((s) => s.id === savedActive);
            if (match && Array.isArray(match.messages)) {
              setCurrentSessionId(match.id);
              setMessages(match.messages);
              return;
            }
          }
          setCurrentSessionId(parsed[0].id);
          setMessages(parsed[0].messages || [DEFAULT_WELCOME_MESSAGE]);
          return;
        }
      }
      setSessions([]);
      const newId = `session-${Date.now()}`;
      setCurrentSessionId(newId);
      setMessages([DEFAULT_WELCOME_MESSAGE]);
    } catch (e) {
      console.warn('Gagal memuat ulang sesi pengguna:', e);
    }
  }, [user?.id]);

  // Auto-save percakapan aktif ke daftar sesi & localStorage
  useEffect(() => {
    if (!currentSessionId) return;

    // Cek apakah ada pesan dari pengguna atau hasil kalkulasi
    const hasUserInteraction = messages.some(
      (m) => m.sender === 'user' || m.type === 'saw_result'
    );
    if (!hasUserInteraction) return;

    // Ambil judul dari pesan pertama user
    const firstUserMsg = messages.find((m) => m.sender === 'user');
    let title = firstUserMsg ? firstUserMsg.text : 'Percakapan SEDO AI';
    if (title.length > 45) {
      title = title.substring(0, 42) + '...';
    }

    // Ambil nama pemenang SAW jika ada
    const sawResultMsg = messages.find(
      (m) => m.type === 'saw_result' && m.sawResult
    );
    const winnerName =
      sawResultMsg?.sawResult?.rekomendasiTerbaik?.smartphone?.name;

    setSessions((prevSessions) => {
      const existingIdx = prevSessions.findIndex(
        (s) => s.id === currentSessionId
      );
      const now = new Date().toISOString();
      const updatedSession = {
        id: currentSessionId,
        title,
        winnerName,
        updatedAt: now,
        messages,
      };

      let newSessions;
      if (existingIdx >= 0) {
        newSessions = [...prevSessions];
        newSessions[existingIdx] = {
          ...newSessions[existingIdx],
          ...updatedSession,
        };
      } else {
        newSessions = [updatedSession, ...prevSessions];
      }

      newSessions.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      try {
        localStorage.setItem(
          getStorageKey(user?.id),
          JSON.stringify(newSessions)
        );
      } catch (err) {
        console.warn('Gagal menyimpan sesi ke localStorage:', err);
      }

      return newSessions;
    });

    try {
      localStorage.setItem(getActiveKey(user?.id), currentSessionId);
    } catch (err) {
      console.warn('Gagal menyimpan active session ID:', err);
    }
  }, [messages, currentSessionId, user?.id]);

  // Mulai obrolan baru
  function handleStartNewChat() {
    const newId = `session-${Date.now()}`;
    setCurrentSessionId(newId);
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    try {
      localStorage.setItem(getActiveKey(user?.id), newId);
    } catch (e) {
      // ignore
    }
    if (window.innerWidth < 768) {
      setIsHistoryOpen(false);
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
  }

  // Pilih percakapan dari riwayat
  function handleSelectSession(session) {
    if (!session) return;
    setCurrentSessionId(session.id);
    setMessages(session.messages || [DEFAULT_WELCOME_MESSAGE]);
    try {
      localStorage.setItem(getActiveKey(user?.id), session.id);
    } catch (e) {
      // ignore
    }
    if (window.innerWidth < 768) {
      setIsHistoryOpen(false);
    }
  }

  // Hapus satu riwayat percakapan
  function handleDeleteSession(sessionId, e) {
    e.stopPropagation();
    if (!window.confirm('Hapus riwayat percakapan ini?')) return;

    const nextSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(nextSessions);
    try {
      localStorage.setItem(getStorageKey(user?.id), JSON.stringify(nextSessions));
    } catch (err) {
      // ignore
    }

    if (currentSessionId === sessionId) {
      if (nextSessions.length > 0) {
        handleSelectSession(nextSessions[0]);
      } else {
        handleStartNewChat();
      }
    }
  }

  // Hapus seluruh riwayat percakapan
  function handleClearAllHistory() {
    if (
      !window.confirm(
        'Apakah kamu yakin ingin menghapus seluruh riwayat percakapan SEDO AI?'
      )
    ) {
      return;
    }
    try {
      localStorage.removeItem(getStorageKey(user?.id));
      localStorage.removeItem(getActiveKey(user?.id));
    } catch (err) {
      // ignore
    }
    setSessions([]);
    handleStartNewChat();
  }

  // Speech-to-Text sederhana via Web Speech API bawaan browser
  function toggleSpeechRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Browser kamu belum mendukung Speech-to-Text bawaan. Kamu bisa mengetikkan pesan secara manual.'
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    }
  }

  // Kirim pesan teks pengguna ke SEDO AI
  async function handleSendMessage(customText) {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isProcessing) return;

    setInputMessage('');
    const userMsgId = `user-${Date.now()}`;
    const newMessages = [
      ...messages,
      { id: userMsgId, sender: 'user', text: textToSend, type: 'text' },
    ];
    setMessages(newMessages);
    setIsProcessing(true);

    try {
      // 1. Ekstraksi entitas & lookup spesifikasi dari Edge Function
      const result = await extractAndLookupPhones(textToSend, smartphones);

      if (!result.smartphones || result.smartphones.length === 0) {
        // AI tidak mendeteksi nama HP spesifik
        setMessages((prev) => [
          ...prev,
          {
            id: `sedo-${Date.now()}`,
            sender: 'sedo',
            text:
              result.greeting ||
              'Saya belum menemukan nama smartphone spesifik di pesanmu. Coba sebutkan minimal 2 nama smartphone, misalnya: "Bantu pilihkan Poco X6 Pro atau Infinix Note 40".',
            type: 'text',
          },
        ]);
      } else {
        // AI mendeteksi smartphone -> tampilkan kartu pengisian spesifikasi yang bisa diedit
        const phonesWithTempId = result.smartphones.map((phone, idx) => ({
          ...phone,
          tempId: `temp-${Date.now()}-${idx}`,
          isFromDb: smartphones.some(
            (p) => p.name.toLowerCase() === phone.name.toLowerCase()
          ),
        }));

        setMessages((prev) => [
          ...prev,
          {
            id: `sedo-${Date.now()}`,
            sender: 'sedo',
            text:
              result.greeting ||
              `Saya menemukan ${phonesWithTempId.length} smartphone yang kamu sebutkan. Berikut spesifikasi 6 kriterianya. Kamu bisa mengecek atau mengubah angkanya sebelum dihitung!`,
            type: 'spec_card',
            phones: phonesWithTempId,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `sedo-err-${Date.now()}`,
          sender: 'sedo',
          text: `Maaf, terjadi kendala saat memproses: ${err.message}. Pastikan koneksi dan API Key Edge Function sudah aktif.`,
          type: 'text',
          isError: true,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }

  // Edit field spesifikasi pada kartu interaktif
  function handleUpdatePhoneSpec(msgId, phoneTempId, field, value) {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId || !msg.phones) return msg;
        const updatedPhones = msg.phones.map((p) => {
          if (p.tempId !== phoneTempId) return p;
          return { ...p, [field]: value };
        });
        return { ...msg, phones: updatedPhones };
      })
    );
  }

  // Tambah baris smartphone baru secara manual di kartu
  function handleAddManualPhoneToCard(msgId) {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId || !msg.phones) return msg;
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
        return { ...msg, phones: [...msg.phones, newPhone] };
      })
    );
  }

  // Hapus satu smartphone dari kartu
  function handleRemovePhoneFromCard(msgId, phoneTempId) {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId || !msg.phones) return msg;
        return {
          ...msg,
          phones: msg.phones.filter((p) => p.tempId !== phoneTempId),
        };
      })
    );
  }

  // Eksekusi perhitungan SAW & minta narasi analisis AI
  async function handleExecuteSaw(msgId, phones) {
    if (!phones || phones.length < 2) {
      alert('Pilih minimal 2 smartphone untuk menghitung perbandingan SAW.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Jalankan perhitungan SAW murni di browser
      const sawResult = calculateSAW(criteria, phones);
      if (!sawResult.isReady || !sawResult.rekomendasiTerbaik) {
        throw new Error('Gagal menghitung preferensi SAW. Periksa kembali spesifikasi smartphone.');
      }

      // 2. KOREKSI PENGGUNA: Simpan smartphone ke database akun user SETELAH perhitungan selesai
      let savedPhones = [];
      if (user?.id) {
        savedPhones = await saveNewlyCreatedPhones(phones, user.id);
        const refreshed = await fetchSmartphones();
        setSmartphones(refreshed);
      }

      const activePhones = savedPhones.length ? savedPhones : phones;

      // 3. Panggil Edge Function untuk membuat narasi ulasan ilmiah AI
      let aiExplanation = '';
      try {
        aiExplanation = await explainSawRecommendation(
          sawResult.hasilAkhir,
          criteria
        );
      } catch (aiErr) {
        console.warn('Gagal memuat ulasan AI:', aiErr);
        aiExplanation = `Berdasarkan metode Simple Additive Weighting (SAW), **${sawResult.rekomendasiTerbaik.smartphone.name}** berhasil menempati peringkat pertama dengan nilai preferensi tertinggi (${formatDecimal(sawResult.rekomendasiTerbaik.totalScore, 4)}).`;
      }

      // 4. Tambahkan bubble hasil rekomendasi ke chat
      setMessages((prev) => [
        ...prev,
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
    } catch (err) {
      alert(err.message || 'Terjadi kesalahan saat menghitung rekomendasi.');
    } finally {
      setIsProcessing(false);
    }
  }

  // Alihkan ke halaman Detail Perhitungan SAW dengan HANYA HP percakapan ini yang tercentang
  async function handleOpenComparison(phones) {
    let allPhones = smartphones;
    if (!allPhones || allPhones.length === 0) {
      allPhones = await fetchSmartphones();
      setSmartphones(allPhones);
    }

    // 1. Kumpulkan ID dari HP yang dibandingkan di percakapan SEDO AI ini
    const targetIds = [];
    for (const p of phones) {
      if (p.id && !String(p.id).startsWith('temp-')) {
        targetIds.push(p.id);
      } else {
        const found = allPhones.find(
          (ap) => ap.name.toLowerCase().trim() === String(p.name).toLowerCase().trim()
        );
        if (found?.id) targetIds.push(found.id);
      }
    }

    // 2. Masukkan seluruh HP LAIN di katalog ke dalam deselectedIds
    // Sehingga HANYA HP percakapan ini yang TERCENTANG di halaman perhitungan!
    const targetSet = new Set(targetIds.map(String));
    const otherIds = allPhones
      .map((p) => p.id)
      .filter((id) => !targetSet.has(String(id)));

    deselectIds(otherIds);
    setMaxBudget(''); // Reset filter budget agar tidak ada HP percakapan yang tersembunyi
    setCompareIds(targetIds.slice(0, 4));

    // 3. Arahkan langsung ke halaman Proses & Detail Perhitungan SAW
    navigate('/perhitungan');
  }

  return (
    <div className="relative flex h-[calc(100vh-4.5rem)] flex-col overflow-hidden">
      {/* Header Halaman */}
      <div className="border-b border-slate-200 bg-white px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-emerald-600 text-white shadow-2xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-slate-900">SEDO AI</h1>
                <span className="rounded-xs bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  SPK Assistant
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pencarian spesifikasi cerdas dan rekomendasi smartphone metode SAW
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden lg:inline text-xs text-slate-500 mr-1">
              Kriteria aktif: <strong>{criteria.length} kriteria</strong>
            </span>

            {/* Tombol Toggle Riwayat Percakapan */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs font-semibold transition ${
                isHistoryOpen
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title="Lihat riwayat percakapan"
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Riwayat</span>
              {sessions.length > 0 && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 border border-slate-200">
                  {sessions.length}
                </span>
              )}
            </button>

            {/* Tombol Obrolan Baru */}
            <button
              type="button"
              onClick={handleStartNewChat}
              className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition"
              title="Mulai sesi obrolan baru"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Obrolan Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kontainer Utama: Chat + Riwayat Sidebar */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Kolom Percakapan (Scrollable Chat + Input Form) */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Area Obrolan Chat (Scrollable) */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar AI */}
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-emerald-600 text-white shadow-2xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              {/* Chat Bubble Body */}
              <div
                className={`max-w-3xl space-y-3 ${
                  isUser
                    ? 'rounded-sm bg-emerald-600 px-3.5 py-2.5 text-sm text-white'
                    : msg.isError
                    ? 'rounded-sm border border-rose-300 bg-rose-50/80 p-4 shadow-2xs text-rose-800'
                    : 'rounded-sm border border-slate-200 bg-white p-4 shadow-2xs text-slate-800'
                }`}
              >
                {/* Teks Pesan Biasa */}
                {msg.text && (
                  isUser ? (
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                      {msg.text}
                    </p>
                  ) : (
                    <MarkdownRenderer content={msg.text} className="text-sm" />
                  )
                )}

                {/* Tipe: Kartu Spesifikasi Interaktif (Editable Spec Cards) */}
                {msg.type === 'spec_card' && msg.phones && (
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {msg.phones.map((phone, pIdx) => (
                        <div
                          key={phone.tempId || pIdx}
                          className="relative rounded-sm border border-slate-200 bg-slate-50/70 p-3"
                        >
                          {/* Header Kartu HP */}
                          <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-2">
                            <div className="flex-1 pr-2">
                              <input
                                type="text"
                                value={phone.name}
                                onChange={(e) =>
                                  handleUpdatePhoneSpec(
                                    msg.id,
                                    phone.tempId,
                                    'name',
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-xs border border-slate-300 bg-white px-2 py-0.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                                placeholder="Nama Smartphone"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              {phone.isFromDb ? (
                                <span className="inline-flex items-center gap-0.5 rounded-xs bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800">
                                  <Database className="h-3 w-3" />
                                  <span>Database</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 rounded-xs bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                                  <Sparkles className="h-3 w-3" />
                                  <span>AI Spec</span>
                                </span>
                              )}
                              {msg.phones.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemovePhoneFromCard(
                                      msg.id,
                                      phone.tempId
                                    )
                                  }
                                  className="rounded-xs p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                  title="Hapus HP ini"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 6 Kotak Input Spesifikasi C1-C6 */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] font-semibold text-slate-500">
                                C1 Harga (Rp)
                              </label>
                              <input
                                type="number"
                                value={phone.price}
                                onChange={(e) =>
                                  handleUpdatePhoneSpec(
                                    msg.id,
                                    phone.tempId,
                                    'price',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full rounded-xs border border-slate-300 bg-white px-2 py-1 font-mono text-xs outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-500">
                                C2 Kamera (MP)
                              </label>
                              <input
                                type="number"
                                value={phone.camera_mp}
                                onChange={(e) =>
                                  handleUpdatePhoneSpec(
                                    msg.id,
                                    phone.tempId,
                                    'camera_mp',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full rounded-xs border border-slate-300 bg-white px-2 py-1 font-mono text-xs outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-500">
                                C3 RAM (GB)
                              </label>
                              <input
                                type="number"
                                value={phone.ram_gb}
                                onChange={(e) =>
                                  handleUpdatePhoneSpec(
                                    msg.id,
                                    phone.tempId,
                                    'ram_gb',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full rounded-xs border border-slate-300 bg-white px-2 py-1 font-mono text-xs outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-500">
                                C4 Baterai (mAh)
                              </label>
                              <input
                                type="number"
                                value={phone.battery_mah}
                                onChange={(e) =>
                                  handleUpdatePhoneSpec(
                                    msg.id,
                                    phone.tempId,
                                    'battery_mah',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full rounded-xs border border-slate-300 bg-white px-2 py-1 font-mono text-xs outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-500">
                                C5 ROM (GB)
                              </label>
                              <input
                                type="number"
                                value={phone.storage_gb}
                                onChange={(e) =>
                                  handleUpdatePhoneSpec(
                                    msg.id,
                                    phone.tempId,
                                    'storage_gb',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full rounded-xs border border-slate-300 bg-white px-2 py-1 font-mono text-xs outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-500">
                                C6 AnTuTu
                              </label>
                              <input
                                type="number"
                                value={phone.antutu}
                                onChange={(e) =>
                                  handleUpdatePhoneSpec(
                                    msg.id,
                                    phone.tempId,
                                    'antutu',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full rounded-xs border border-slate-300 bg-white px-2 py-1 font-mono text-xs outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tombol Aksi Tambah HP Manual & Hitung SAW */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
                      <button
                        type="button"
                        onClick={() => handleAddManualPhoneToCard(msg.id)}
                        className="inline-flex items-center gap-1 rounded-sm border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Tambah HP Lain</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing || msg.phones.length < 2}
                        onClick={() => handleExecuteSaw(msg.id, msg.phones)}
                        className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <Calculator className="h-3.5 w-3.5" />
                        <span>Hitung Rekomendasi SAW</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tipe: Hasil Rekomendasi SAW & Analisis AI (saw_result) */}
                {msg.type === 'saw_result' && msg.sawResult && (
                  <div className="mt-3 space-y-3.5">
                    {/* Kartu Juara Peringkat 1 */}
                    <div className="rounded-sm border border-emerald-300 bg-emerald-50/70 p-3.5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-emerald-600 text-white">
                            <Trophy className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                              Rekomendasi Terbaik #1
                            </span>
                            <h3 className="text-base font-bold text-slate-900">
                              {msg.sawResult.rekomendasiTerbaik.smartphone.name}
                            </h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-slate-500">
                            Skor Preferensi SAW
                          </span>
                          <p className="font-mono text-base font-bold text-emerald-700">
                            V = {formatDecimal(msg.sawResult.rekomendasiTerbaik.totalScore, 4)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Narasi Analisis Pakar AI */}
                    <div className="rounded-sm border border-slate-200 bg-slate-50 p-3.5">
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        <span>Analisis &amp; Alasan Rekomendasi (SEDO AI)</span>
                      </div>
                      <div className="text-xs leading-relaxed text-slate-700">
                        <MarkdownRenderer content={msg.aiExplanation} />
                      </div>
                    </div>

                    {/* Tabel Urutan Ranking Ringkas */}
                    <div className="overflow-hidden rounded-sm border border-slate-200 bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-200 bg-slate-100/70 font-semibold text-slate-700">
                          <tr>
                            <th className="px-3 py-2">Rank</th>
                            <th className="px-3 py-2">Smartphone</th>
                            <th className="px-3 py-2">Harga</th>
                            <th className="px-3 py-2">RAM / ROM</th>
                            <th className="px-3 py-2 text-right">Nilai V</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {msg.sawResult.hasilAkhir.map((row) => (
                            <tr
                              key={row.rank}
                              className={row.rank === 1 ? 'bg-emerald-50/40 font-semibold' : ''}
                            >
                              <td className="px-3 py-2">
                                <span
                                  className={`inline-block rounded-xs px-1.5 py-0.5 text-[10px] font-bold ${
                                    row.rank === 1
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  #{row.rank}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-slate-900">
                                {row.smartphone.name}
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {formatRupiah(row.smartphone.price)}
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {row.smartphone.ram_gb}GB / {row.smartphone.storage_gb}GB
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-emerald-700">
                                {formatDecimal(row.totalScore, 4)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Navigasi ke Detail Perhitungan Lengkap */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2.5">
                      <span className="text-[11px] text-slate-500">
                        {msg.savedCount > 0 &&
                          `✓ ${msg.savedCount} smartphone otomatis tersimpan ke daftar akunmu.`}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenComparison(msg.phones)}
                        className="inline-flex items-center gap-1.5 rounded-sm bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        <Calculator className="h-3.5 w-3.5" />
                        <span>Buka Detail Langkah SAW (X, R, V)</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar User */}
              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-slate-800 text-white shadow-2xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Spinner / Typing indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-emerald-600 text-white shadow-2xs">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-3 py-2 shadow-2xs">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
              <span>SEDO AI sedang menganalisis spesifikasi smartphone...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips & Input Bar di Bawah */}
      <div className="border-t border-slate-200 bg-white p-3">
        {/* Suggestion Prompts */}
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          <span className="self-center text-[11px] font-semibold text-slate-400">
            Coba tanyakan:
          </span>
          {PROMPT_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              type="button"
              disabled={isProcessing}
              onClick={() => handleSendMessage(sug)}
              className="rounded-xs border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Text Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Tombol Speech-to-Text */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            title={isListening ? 'Hentikan merekam suara' : 'Bicara lewat suara'}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border transition ${
              isListening
                ? 'animate-pulse border-rose-300 bg-rose-50 text-rose-600'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isProcessing}
            placeholder={
              isListening
                ? 'Mendengarkan suara kamu... silakan bicara'
                : 'Ketik nama-nama smartphone (misal: "Oppo A77s vs Realme C55 vs Samsung A54")...'
            }
            className="flex-1 rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isProcessing}
            className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-emerald-600 px-4 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </div>

    {/* Backdrop untuk layar mobile ketika drawer riwayat terbuka */}
    {isHistoryOpen && (
      <div
        onClick={() => setIsHistoryOpen(false)}
        className="fixed inset-0 z-20 bg-slate-900/20 backdrop-blur-xs md:hidden"
      />
    )}

    {/* Drawer / Sidebar Riwayat Percakapan */}
    {isHistoryOpen && (
      <aside className="absolute right-0 top-0 bottom-0 z-30 flex w-80 md:w-88 flex-col border-l border-slate-200 bg-white shadow-xl">
        {/* Header Drawer */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-900">
              Riwayat Percakapan
            </h2>
            {sessions.length > 0 && (
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                {sessions.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(false)}
            className="rounded-xs p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            title="Tutup riwayat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tombol Aksi Cepat: Obrolan Baru */}
        <div className="border-b border-slate-100 bg-white p-3">
          <button
            type="button"
            onClick={handleStartNewChat}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Mulai Obrolan Baru</span>
          </button>
        </div>

        {/* Daftar Sesi Percakapan */}
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {sessions.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">Belum ada riwayat</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                Percakapan dan hasil perhitungan SAW kamu akan otomatis tersimpan di sini.
              </p>
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.id === currentSessionId;
              return (
                <div
                  key={sess.id}
                  onClick={() => handleSelectSession(sess)}
                  className={`group relative cursor-pointer rounded-sm border p-2.5 text-left transition ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-xs font-semibold ${
                          isActive ? 'font-bold text-emerald-950' : 'text-slate-800'
                        }`}
                        title={sess.title}
                      >
                        {sess.title || 'Percakapan Tanpa Judul'}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{formatSessionDate(sess.updatedAt)}</span>
                        <span>•</span>
                        <span>{sess.messages?.length || 0} pesan</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      className="rounded-xs p-1 text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 focus:opacity-100 group-hover:opacity-100"
                      title="Hapus riwayat ini"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {sess.winnerName && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-xs bg-emerald-100/80 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                      <Trophy className="h-3 w-3 text-emerald-700" />
                      <span className="max-w-[200px] truncate">
                        Juara: {sess.winnerName}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Drawer */}
        {sessions.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 p-3">
            <button
              type="button"
              onClick={handleClearAllHistory}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
            >
              <Trash2 className="h-3 w-3" />
              <span>Hapus Semua Riwayat</span>
            </button>
          </div>
        )}
      </aside>
    )}
  </div>
</div>
  );
}

