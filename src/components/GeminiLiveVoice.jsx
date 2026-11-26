import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronUp,
  Database,
  Layers,
  Mic,
  MicOff,
  PhoneOff,
  Plus,
  Radio,
  Smartphone,
  Sparkles,
  Square,
  Trash2,
  Trophy,
  Volume2,
  X,
} from 'lucide-react';
import { SoundWaveBars } from './VoiceVisualizer';
import { MarkdownRenderer } from './MarkdownRenderer';
import { formatDecimal, formatRupiah } from '../utils/formatters';

/**
 * Gemini Live Style Interactive Voice Overlay
 * Complete with interactive pop-up card for Smartphone Spec Input & SAW Results.
 */
export function GeminiLiveVoice({
  isOpen,
  onClose,
  liveStatus = 'listening', // 'listening' | 'processing' | 'speaking' | 'idle'
  liveTranscript = '',
  aiResponseText = '',
  liveError = '',
  onDismissError,
  audioLevel = 0,
  onToggleMic,
  isMicMuted = false,
  onInterrupt,
  activeCard = null, // spec_card or saw_result message
  initialCardId = null, // Card ID that existed BEFORE opening live mode (don't auto-popup old cards)
  specFields = [],
  onUpdatePhoneSpec,
  onAddManualPhone,
  onRemovePhone,
  onExecuteSaw,
  onOpenComparison,
  isProcessing = false,
  speechRate = 1.22,
  onCycleSpeechRate,
}) {
  const [prevCardId, setPrevCardId] = useState(initialCardId ?? activeCard?.id ?? null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [isCardPopupOpen, setIsCardPopupOpen] = useState(false);

  // Saat mode Live baru dibuka, tutup pop-up kartu lama agar tidak langsung menutupi orb
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setPrevCardId(initialCardId ?? activeCard?.id ?? null);
      setIsCardPopupOpen(false);
    }
  }

  // Otomatis buka pop-up form HANYA saat kartu baru (spesifikasi / hasil SAW) tiba selama sesi Live
  if (isOpen && activeCard?.id && activeCard.id !== prevCardId) {
    setPrevCardId(activeCard.id);
    setIsCardPopupOpen(true);
  }

  // Escape key to minimize card first, then close Live overlay
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isCardPopupOpen && activeCard) {
          setIsCardPopupOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCardPopupOpen, activeCard, onClose]);

  if (!isOpen) return null;

  const isBusy = liveStatus === 'processing' || isProcessing;
  const isSpecCardReady =
    activeCard?.type === 'spec_card' &&
    isCardPopupOpen &&
    liveStatus === 'idle' &&
    !isBusy;

  // Dynamic scale for the central orb based on audioLevel (active only while listening)
  const dynamicScale =
    liveStatus === 'listening'
      ? Math.min(1.24, 1 + audioLevel * 0.35)
      : 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mode Percakapan Suara SEDO Live"
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-[#07130a]/95 p-3.5 sm:p-5 backdrop-blur-2xl animate-fadeIn text-white"
    >
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#1b7e43]/20 blur-[130px]" />

      {/* ====================================================
          TOP BAR: BRAND, CARD TOGGLE & EXIT
      ==================================================== */}
      <header className="relative z-20 flex w-full shrink-0 items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2ca458] to-[#166034] text-white shadow-[0_0_20px_rgba(44,164,88,0.4)]">
            <Radio size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-emerald-400">
                SEDO LIVE
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <p className="text-[11px] text-[#8ea394]">
              Percakapan Suara Interaktif 2 Arah
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed Toggle Pill */}
          {onCycleSpeechRate && (
            <button
              type="button"
              onClick={onCycleSpeechRate}
              title="Ubah kecepatan suara SEDO AI"
              className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 font-mono text-[11px] font-extrabold text-emerald-200 transition hover:bg-white/15"
            >
              <span>{Number(speechRate).toFixed(2).replace(/0$/, '')}x</span>
            </button>
          )}

          {/* Card Toggle Button if activeCard exists */}
          {activeCard && (
            <button
              type="button"
              onClick={() => setIsCardPopupOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition ${
                isCardPopupOpen
                  ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                  : 'border-white/15 bg-white/10 text-white/90 hover:bg-white/15'
              }`}
            >
              <Layers size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">
                {activeCard.type === 'spec_card' ? 'Form Spesifikasi' : 'Hasil SAW'}
              </span>
              {isCardPopupOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup mode live"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#a1b8a7] transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* ====================================================
          MAIN AREA: ORB + FLOATING INTERACTIVE POP-UP CARD
      ==================================================== */}
      <main className="relative z-10 flex flex-1 flex-col items-center overflow-y-auto custom-scrollbar w-full my-2 px-1">
        <div className="my-auto flex w-full flex-col items-center py-2">
          {/* Inline Error Banner (permission denied, no mic, calculation error) */}
          {liveError && (
            <div
              role="alert"
              className="mb-3 flex w-full max-w-xl items-center justify-between gap-2.5 rounded-2xl border border-red-400/35 bg-red-950/70 px-3.5 py-2.5 text-xs text-red-200 backdrop-blur-md animate-fadeIn"
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle size={15} className="shrink-0 text-red-300" />
                <span className="leading-snug">{liveError}</span>
              </div>
              {onDismissError && (
                <button
                  type="button"
                  onClick={onDismissError}
                  aria-label="Tutup pesan error"
                  className="shrink-0 rounded-lg p-1 text-red-300 hover:bg-white/10 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Dynamic Orb Container */}
          <div
            className={`relative transition-all duration-300 flex items-center justify-center ${
              activeCard && isCardPopupOpen
                ? 'my-1.5 scale-[0.82] sm:scale-90'
                : 'my-5 sm:my-7 scale-100'
            }`}
          >
            {/* Outer Ripple Wave Rings */}
            {liveStatus === 'listening' && (
              <>
                <div
                  className="pointer-events-none absolute h-48 w-48 sm:h-60 sm:w-60 rounded-full border border-emerald-500/25 animate-gemini-wave-ring"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="pointer-events-none absolute h-60 w-60 sm:h-72 sm:w-72 rounded-full border border-emerald-400/20 animate-gemini-wave-ring"
                  style={{ animationDelay: '700ms' }}
                />
              </>
            )}

            {/* Speaking Ripple Wave Ring */}
            {liveStatus === 'speaking' && (
              <div
                className="pointer-events-none absolute h-48 w-48 sm:h-56 sm:w-56 rounded-full border border-emerald-300/30 animate-gemini-wave-ring"
                style={{ animationDelay: '0ms' }}
              />
            )}

            {/* Processing / Rotating Orbit Ring */}
            {liveStatus === 'processing' && (
              <div
                className="pointer-events-none absolute h-44 w-44 sm:h-52 sm:w-52 rounded-full border-2 border-dashed border-emerald-400/50 animate-spin"
                style={{ animationDuration: '6s' }}
              />
            )}

            {/* The Central Glowing Orb */}
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                if (isBusy) return;
                if (liveStatus === 'speaking') {
                  onInterrupt?.();
                } else if (isSpecCardReady) {
                  onExecuteSaw?.(activeCard.phones);
                } else {
                  onToggleMic?.();
                }
              }}
              title={
                isBusy
                  ? 'SEDO AI sedang memproses...'
                  : liveStatus === 'speaking'
                    ? 'Klik untuk menyela (interupsi)'
                    : isSpecCardReady
                      ? 'Klik untuk hitung rekomendasi SAW'
                      : liveStatus === 'listening'
                        ? 'Klik untuk menjeda mikrofon'
                        : 'Klik untuk mulai bicara'
              }
              style={{
                transform: `scale(${dynamicScale})`,
                transition: 'transform 80ms ease-out',
              }}
              className={`relative flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full transition-shadow duration-300 disabled:cursor-wait ${
                liveStatus === 'listening'
                  ? 'bg-gradient-to-tr from-[#1b6b38] via-[#2ba95a] to-[#5ee18d] shadow-[0_0_50px_rgba(46,182,97,0.55)] cursor-pointer'
                  : liveStatus === 'processing'
                    ? 'bg-gradient-to-tr from-[#16562d] via-[#339e5b] to-[#7be0a2] shadow-[0_0_45px_rgba(51,158,91,0.4)] animate-pulse'
                    : liveStatus === 'speaking'
                      ? 'bg-gradient-to-tr from-[#145f31] via-[#3ebd6e] to-[#7ceeb0] shadow-[0_0_60px_rgba(62,189,110,0.6)] cursor-pointer'
                      : 'bg-[#1b3d27] shadow-[0_0_30px_rgba(27,61,39,0.3)] cursor-pointer hover:bg-[#224d31]'
              }`}
            >
              {/* Inner Core Shimmer */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/30 via-transparent to-black/30 pointer-events-none" />

              {/* Icon & Mini Visualizer inside the Orb */}
              <div className="relative z-10 flex flex-col items-center justify-center text-white">
                {liveStatus === 'listening' && (
                  <>
                    <Mic size={32} className="animate-pulse drop-shadow-md" />
                    <div className="mt-1.5">
                      <SoundWaveBars audioLevel={audioLevel} isListening={true} barCount={5} />
                    </div>
                  </>
                )}

                {liveStatus === 'processing' && (
                  <>
                    <Sparkles size={30} className="animate-spin text-emerald-200" style={{ animationDuration: '4s' }} />
                    <span className="mt-1 text-[10px] font-bold tracking-wide uppercase text-emerald-100">
                      Berpikir...
                    </span>
                  </>
                )}

                {liveStatus === 'speaking' && (
                  <>
                    <Volume2 size={32} className="animate-bounce text-white drop-shadow-md" />
                    <div className="mt-1.5">
                      <SoundWaveBars audioLevel={0.7} isListening={true} barCount={5} />
                    </div>
                  </>
                )}

                {liveStatus === 'idle' && (
                  isSpecCardReady ? (
                    <div className="flex flex-col items-center">
                      <Calculator size={26} className="text-emerald-300" />
                      <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-emerald-200">
                        Hitung SAW
                      </span>
                    </div>
                  ) : (
                    <MicOff size={28} className="text-[#84a38c]" />
                  )
                )}
              </div>
            </button>
          </div>

          {/* Status Pill Badge */}
          <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 backdrop-blur-md">
            {liveStatus === 'listening' && (
              <>
                <span className="h-2 w-2 rounded-full bg-[#41d272] animate-ping" />
                <span className="text-[11px] font-extrabold text-emerald-300">
                  Mendengarkan... Silakan bicara
                </span>
              </>
            )}

            {liveStatus === 'processing' && (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-extrabold text-amber-200">
                  SEDO AI sedang menganalisis smartphone...
                </span>
              </>
            )}

            {liveStatus === 'speaking' && (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-extrabold text-emerald-200">
                  SEDO AI sedang berbicara...
                </span>
              </>
            )}

            {liveStatus === 'idle' && (
              isSpecCardReady ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-extrabold text-emerald-200">
                    Mikrofon dijeda · Periksa angka lalu tekan Hitung Rekomendasi SAW
                  </span>
                </>
              ) : (
                <span className="text-[11px] font-bold text-[#8ba391]">
                  Mikrofon dijeda. Ketuk tombol mic untuk mulai bicara.
                </span>
              )
            )}
          </div>

          {/* Live Subtitle Transcript Display */}
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center backdrop-blur-md mb-2">
            {liveStatus === 'speaking' && aiResponseText ? (
              <div className="space-y-0.5 animate-fadeIn">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Jawaban SEDO AI
                </p>
                <p className="max-h-24 overflow-y-auto custom-scrollbar text-xs sm:text-sm font-semibold text-white/95 leading-relaxed px-1">
                  &ldquo;{aiResponseText}&rdquo;
                </p>
              </div>
            ) : liveStatus === 'listening' && liveTranscript ? (
              <div className="space-y-0.5 animate-fadeIn">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Suara Kamu
                </p>
                <p className="max-h-20 overflow-y-auto custom-scrollbar text-xs sm:text-sm font-bold text-white leading-relaxed px-1">
                  &ldquo;{liveTranscript}&rdquo;
                  <span className="inline-block w-1.5 h-3 ml-1 bg-emerald-400 animate-pulse align-middle" />
                </p>
              </div>
            ) : liveStatus === 'processing' && liveTranscript ? (
              <div className="space-y-0.5 animate-fadeIn">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Memproses Permintaan
                </p>
                <p className="text-xs sm:text-sm font-semibold text-white/85 leading-relaxed">
                  &ldquo;{liveTranscript}&rdquo;
                </p>
              </div>
            ) : (
              <div className="py-1 text-[#7f9886]">
                <p className="text-xs italic">
                  {liveStatus === 'listening'
                    ? 'Katakan misalnya: "Bantu pilihkan Poco X6 Pro atau Redmi Note 13 Pro"...'
                    : liveStatus === 'processing'
                      ? 'Sedang menyiapkan analisis spesifikasi smartphone...'
                      : 'Menunggu percakapan suara...'}
                </p>
              </div>
            )}
          </div>

          {/* ====================================================
              POP-UP INTERAKTIF: FORM SPESIFIKASI / HASIL SAW
          ==================================================== */}
          {activeCard && isCardPopupOpen && (
            <div className="w-full max-w-2xl animate-scaleUp rounded-3xl border border-emerald-500/35 bg-[#0f2415]/95 p-3.5 sm:p-4 text-left shadow-[0_15px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl mb-2">
              {/* Pop-up Header */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                    {activeCard.type === 'spec_card' ? (
                      <Sparkles size={14} />
                    ) : (
                      <Trophy size={14} />
                    )}
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-emerald-200">
                      {activeCard.type === 'spec_card'
                        ? 'Form Spesifikasi Smartphone (Siap Dihitung)'
                        : 'Hasil Rekomendasi Juara SAW'}
                    </h3>
                    <p className="text-[11px] text-[#91a897]">
                      {activeCard.type === 'spec_card'
                        ? 'Kamu bisa ubah angka spesifikasi di bawah atau langsung hitung!'
                        : 'Peringkat smartphone berdasarkan metode SAW.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCardPopupOpen(false)}
                  title="Sembunyikan form"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              {/* KONTEN 1: FORM SPESIFIKASI KARTU SMARTPHONE */}
              {activeCard.type === 'spec_card' && activeCard.phones && (
                <div className="space-y-3 max-h-[38vh] sm:max-h-[44vh] overflow-y-auto custom-scrollbar pr-1.5">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {activeCard.phones.map((phone, phoneIndex) => (
                      <article
                        key={phone.tempId || phoneIndex}
                        className="rounded-2xl border border-white/15 bg-white/[0.06] p-3 text-white"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                          <div className="flex min-w-0 flex-1 items-center gap-1.5">
                            <Smartphone size={14} className="text-emerald-400 shrink-0" />
                            <input
                              type="text"
                              value={phone.name || ''}
                              onChange={(e) =>
                                onUpdatePhoneSpec?.(
                                  activeCard.id,
                                  phone.tempId,
                                  'name',
                                  e.target.value
                                )
                              }
                              className="min-h-[28px] w-full rounded-lg bg-black/30 border border-white/15 px-2 py-1 text-xs font-bold text-white outline-none focus:border-emerald-400"
                              placeholder="Nama smartphone"
                            />
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            {phone.isFromDb ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300">
                                <Database size={9} />
                                DB
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                                <Sparkles size={9} />
                                AI
                              </span>
                            )}

                            {activeCard.phones.length > 2 && (
                              <button
                                type="button"
                                onClick={() =>
                                  onRemovePhone?.(activeCard.id, phone.tempId)
                                }
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Hapus"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Enam Input Kriteria */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {specFields.map((spec) => {
                            const Icon = spec.icon;
                            return (
                              <label key={spec.field} className="block min-w-0">
                                <span className="mb-0.5 flex items-center justify-between text-[10px] font-bold text-white/70">
                                  <span className="flex items-center gap-1 truncate">
                                    <Icon size={10} className="text-emerald-400 shrink-0" />
                                    <span className="truncate">{spec.label}</span>
                                  </span>
                                  <span className="text-[9px] text-white/50">{spec.unit}</span>
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step={spec.step}
                                  value={phone[spec.field] ?? ''}
                                  onChange={(e) =>
                                    onUpdatePhoneSpec?.(
                                      activeCard.id,
                                      phone.tempId,
                                      spec.field,
                                      e.target.value === '' ? '' : Number(e.target.value)
                                    )
                                  }
                                  className="min-h-[30px] w-full rounded-lg bg-black/40 border border-white/15 px-2 py-1 font-mono text-xs font-bold text-emerald-300 outline-none focus:border-emerald-400"
                                />
                              </label>
                            );
                          })}
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Aksi Form di dalam Pop-up */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onAddManualPhone?.(activeCard.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/15 disabled:opacity-50"
                    >
                      <Plus size={13} />
                      <span>Tambah HP</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy || activeCard.phones.length < 2}
                      onClick={() => onExecuteSaw?.(activeCard.phones)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#216d3a] to-[#2ea458] px-4 py-2 text-xs font-extrabold text-white shadow-md hover:from-[#1b5c30] hover:to-[#268a49] disabled:opacity-50"
                    >
                      <Calculator size={14} />
                      <span>Hitung Rekomendasi SAW</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* KONTEN 2: HASIL REKOMENDASI SAW */}
              {activeCard.type === 'saw_result' && activeCard.sawResult && (
                <div className="space-y-3 max-h-[38vh] sm:max-h-[44vh] overflow-y-auto custom-scrollbar pr-1.5">
                  {/* Juara 1 */}
                  <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-950/60 to-emerald-900/40 p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#287b44] text-white shadow-md">
                        <Trophy size={18} />
                      </span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                          Rekomendasi Terbaik · Juara 1
                        </span>
                        <h4 className="text-sm font-extrabold text-white">
                          {activeCard.sawResult.rekomendasiTerbaik?.smartphone?.name}
                        </h4>
                        <p className="text-xs text-emerald-300/80">
                          {formatRupiah(activeCard.sawResult.rekomendasiTerbaik?.smartphone?.price)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                      <span className="text-[10px] text-white/60">Skor SAW</span>
                      <p className="font-mono text-sm font-black text-emerald-300">
                        {formatDecimal(activeCard.sawResult.rekomendasiTerbaik?.totalScore, 4)}
                      </p>
                    </div>
                  </div>

                  {/* Ringkasan Analisis AI */}
                  {activeCard.aiExplanation && (
                    <div className="rounded-2xl border border-emerald-500/35 bg-[#09180e]/95 p-3.5 text-xs text-white/95 leading-relaxed shadow-inner">
                      <MarkdownRenderer
                        content={activeCard.aiExplanation}
                        className="text-xs text-white/95"
                        isDark={true}
                      />
                    </div>
                  )}

                  {/* Urutan Peringkat */}
                  <div className="space-y-1.5">
                    {activeCard.sawResult.hasilAkhir.map((row) => (
                      <div
                        key={row.rank}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                          row.rank === 1
                            ? 'border-emerald-400/40 bg-emerald-500/10'
                            : 'border-white/10 bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold ${
                              row.rank === 1 ? 'bg-[#287b44] text-white' : 'bg-white/10 text-white/70'
                            }`}
                          >
                            #{row.rank}
                          </span>
                          <span className="font-bold text-white">{row.smartphone.name}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-300">
                          V: {formatDecimal(row.totalScore, 4)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tombol ke Detail SAW */}
                  <div className="pt-2 border-t border-white/10 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenComparison?.(activeCard.phones);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#216d3a] to-[#2ea458] px-3.5 py-2 text-xs font-extrabold text-white shadow-md hover:from-[#1b5c30] hover:to-[#268a49]"
                    >
                      <Calculator size={13} />
                      <span>Buka Detail Langkah SAW</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ====================================================
          BOTTOM CONTROLS: MIC, INTERRUPT, EXIT
      ==================================================== */}
      <footer className="relative z-20 flex w-full shrink-0 max-w-md items-center justify-center gap-4 py-1 mx-auto border-t border-white/10 pt-2.5">
        {/* Toggle Mute / Mic */}
        <button
          type="button"
          disabled={isBusy}
          onClick={onToggleMic}
          aria-label={isMicMuted ? 'Buka mic' : 'Matikan mic'}
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition disabled:opacity-40 disabled:cursor-not-allowed ${
            isMicMuted
              ? 'border-red-500/40 bg-red-500/20 text-red-300 hover:bg-red-500/30'
              : 'border-white/15 bg-white/10 text-white hover:bg-white/20'
          }`}
          title={isMicMuted ? 'Nyalakan mikrofon' : 'Matikan mikrofon'}
        >
          {isMicMuted ? <MicOff size={19} /> : <Mic size={19} />}
        </button>

        {/* Interrupt button (visible when AI is speaking) */}
        {liveStatus === 'speaking' && (
          <button
            type="button"
            onClick={onInterrupt}
            className="flex h-11 items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 text-xs font-extrabold text-emerald-200 transition hover:bg-emerald-500/30"
          >
            <Square size={13} className="fill-current" />
            <span>Sela / Bicara Sekarang</span>
          </button>
        )}

        {/* End Live Session Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 items-center gap-2 rounded-2xl border border-red-500/30 bg-red-600/20 px-4 text-xs font-extrabold text-red-200 transition hover:bg-red-600/30"
        >
          <PhoneOff size={15} />
          <span>Akhiri Live</span>
        </button>
      </footer>
    </div>
  );
}
