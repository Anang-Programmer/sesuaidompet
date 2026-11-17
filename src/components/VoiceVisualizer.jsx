import { Check, Mic, Send, X } from 'lucide-react';

/**
 * Animated soundwave equalizer bars that react to voice volume level.
 */
export function SoundWaveBars({ audioLevel = 0, isListening = false, barCount = 7 }) {
  // Base heights and animation delay multipliers for aesthetic wave shapes
  const barConfigs = [
    { delay: '0ms', minScale: 0.25, maxScale: 0.75 },
    { delay: '120ms', minScale: 0.35, maxScale: 0.95 },
    { delay: '240ms', minScale: 0.45, maxScale: 1.0 },
    { delay: '360ms', minScale: 0.55, maxScale: 0.9 },
    { delay: '180ms', minScale: 0.4, maxScale: 1.0 },
    { delay: '300ms', minScale: 0.3, maxScale: 0.8 },
    { delay: '80ms', minScale: 0.25, maxScale: 0.7 },
  ];

  return (
    <div className="flex items-center gap-[3px] h-7 px-1.5 py-1" aria-hidden="true">
      {barConfigs.slice(0, barCount).map((config, index) => {
        // Calculate dynamic height based on audioLevel + baseline activity
        const dynamicBoost = isListening ? audioLevel * (config.maxScale - config.minScale) : 0;
        const scale = Math.min(1, Math.max(0.18, config.minScale + dynamicBoost));
        const heightPercent = Math.round(scale * 100);

        return (
          <span
            key={index}
            className={`w-[3px] sm:w-[3.5px] rounded-full transition-all duration-75 ${
              isListening
                ? 'bg-gradient-to-t from-[#227943] via-[#38a15c] to-[#5fd385] animate-voice-bar'
                : 'bg-[#cbd8ce]'
            }`}
            style={{
              height: isListening ? `${heightPercent}%` : '20%',
              animationDelay: config.delay,
              transformOrigin: 'bottom',
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Mini Soundwave indicator when SEDO AI is speaking via TTS
 */
export function TTSWaveIndicator() {
  return (
    <span className="inline-flex items-center gap-[2.5px] h-3.5 px-1" title="Sedang bersuara...">
      <span className="w-[2px] h-2.5 rounded-full bg-[#2e8b4b] animate-voice-bar" style={{ animationDelay: '0ms' }} />
      <span className="w-[2px] h-3.5 rounded-full bg-[#38a15c] animate-voice-bar" style={{ animationDelay: '150ms' }} />
      <span className="w-[2px] h-2 rounded-full bg-[#48b96e] animate-voice-bar" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

/**
 * VoiceVisualizer Banner / Floating Panel that displays real-time speech transcription
 * and animated audio reactive soundwaves while the user is talking.
 */
export function VoiceVisualizer({
  isListening,
  liveTranscript,
  audioLevel,
  onStop,
  onCancel,
  onSubmit,
}) {
  if (!isListening) return null;

  return (
    <div className="mb-2 animate-fadeIn rounded-2xl border border-[#b7dfc0] bg-gradient-to-r from-[#edf8f0] via-[#f7fcf8] to-[#edf8f0] p-3 shadow-[0_8px_24px_rgba(35,112,59,0.12)] backdrop-blur-md transition-all">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Status & Soundwave */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#23773f] to-[#175b31] text-white shadow-[0_3px_10px_rgba(35,112,59,0.25)]">
            <Mic size={16} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#42bf68]" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2d6e3f]">
                Mendengarkan
              </span>
              <span className="h-1 w-1 rounded-full bg-[#7ca386]" />
              <SoundWaveBars audioLevel={audioLevel} isListening={isListening} barCount={7} />
            </div>

            <p className="truncate text-xs font-semibold text-[#68816e]">
              {liveTranscript ? (
                <span className="font-extrabold text-[#1d522e]">
                  &ldquo;{liveTranscript}&rdquo;
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#2e8b4b] animate-pulse align-middle" />
                </span>
              ) : (
                <span className="italic text-[#8aa190]">
                  Bicara sekarang, sebutkan nama smartphone...
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center justify-end gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            title="Batalkan rekaman"
            aria-label="Batalkan rekaman suara"
            className="inline-flex h-8 items-center gap-1 rounded-xl border border-[#e2d0cc] bg-white px-2.5 text-xs font-bold text-[#b44e43] shadow-sm transition hover:bg-[#fff4f2] hover:border-[#dbb5af]"
          >
            <X size={13} />
            <span>Batal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (liveTranscript?.trim() && onSubmit) {
                onSubmit(liveTranscript.trim());
              } else if (onStop) {
                onStop();
              }
            }}
            title={liveTranscript?.trim() ? 'Kirim pesan suara' : 'Selesai merekam'}
            aria-label="Selesai dan kirim"
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#216d3a] to-[#2e8b4b] px-3 text-xs font-extrabold text-white shadow-sm transition hover:from-[#1b592f] hover:to-[#25733e]"
          >
            {liveTranscript?.trim() ? (
              <>
                <Send size={12} />
                <span>Kirim</span>
              </>
            ) : (
              <>
                <Check size={13} />
                <span>Selesai</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
