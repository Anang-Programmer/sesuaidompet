
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  History,
  LoaderCircle,
  RotateCw,
  Search,
  SlidersHorizontal,
  Smartphone,
  Trash2,
  Trophy,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { SawStepTables } from '../components/SawStepTables';
import { useAuth } from '../hooks/useAuth';
import {
  deleteHistory,
  fetchHistories,
} from '../services/spkService';
import {
  formatDecimal,
  formatRupiah,
} from '../utils/formatters';

const ITEMS_PER_PAGE = 6;
const HISTORY_FILTER_REFERENCE_TIME = Date.now();

const DATE_FILTERS = [
  { label: 'Semua waktu', value: 'all' },
  { label: '7 hari terakhir', value: '7d' },
  { label: '30 hari terakhir', value: '30d' },
];

const BUDGET_FILTERS = [
  { label: 'Semua', value: 'all' },
  { label: 'Dengan budget', value: 'budget' },
  { label: 'Tanpa budget', value: 'no-budget' },
];

/* =========================================
   FORMAT TANGGAL
========================================= */
function formatDateTime(iso) {
  if (!iso) return '-';

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatDateOnly(iso) {
  if (!iso) return '-';

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(date);
}

/* =========================================
   KOMPONEN RINGKASAN
========================================= */
function HistoryStat({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-[20px] border border-[#e1ebe2] bg-white p-4 shadow-[0_6px_18px_rgba(30,70,40,0.035)]">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf6ef] text-[#347c49]">
          <Icon size={17} />
        </span>

        <span className="text-xs font-bold text-[#819084]">
          {label}
        </span>
      </div>

      <p className="mt-3 break-words text-xl font-extrabold tracking-tight text-[#294d34]">
        {value}
      </p>

      <p className="mt-1 text-xs leading-4 text-[#8b988e]">
        {description}
      </p>
    </div>
  );
}

/* =========================================
   LABEL STATUS BUDGET
========================================= */
function BudgetBadge({ budget }) {
  const hasBudget = Number(budget) > 0;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-extrabold ${
        hasBudget
          ? 'border-[#e6e2d3] bg-[#fffaf0] text-[#94733b]'
          : 'border-[#dfe9e0] bg-[#f5f8f5] text-[#77887a]'
      }`}
    >
      <Wallet size={11} />

      {hasBudget
        ? `Budget ${formatRupiah(budget)}`
        : 'Semua harga'}
    </span>
  );
}

/* =========================================
   KARTU RIWAYAT
========================================= */
function HistoryCard({
  item,
  isAdmin,
  onDetail,
  onDelete,
  deleting,
}) {
  const winnerName =
    item.top_smartphone_name ||
    item.results_snapshot?.hasilAkhir?.[0]?.name ||
    '-';

  const alternativeCount =
    item.results_snapshot?.hasilAkhir?.length ??
    item.results_snapshot?.matriksAwal?.length ??
    0;

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-[#e1ebe2] bg-white p-4 shadow-[0_7px_22px_rgba(25,68,39,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-[#c6ddca] hover:shadow-[0_12px_28px_rgba(25,68,39,0.07)] sm:p-5">
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#eff8f0] opacity-70 transition group-hover:scale-110" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf5ec] text-[#347c49]">
              <FileText size={18} />
            </div>

            <div className="min-w-0">
              <h3 className="break-words text-sm font-extrabold leading-snug text-[#294d34]">
                {item.title || 'Perhitungan tanpa judul'}
              </h3>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1 text-xs text-[#849188]">
                  <CalendarDays size={11} />
                  {formatDateOnly(item.created_at)}
                </span>

                <span className="inline-flex items-center gap-1 text-xs text-[#849188]">
                  <Clock3 size={11} />
                  {new Date(item.created_at).toLocaleTimeString(
                    'id-ID',
                    {
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </span>
              </div>
            </div>
          </div>

          <span className="hidden shrink-0 rounded-lg bg-[#f0f7f1] px-2 py-1 text-xs font-extrabold text-[#52805c] sm:inline-flex">
            SAW
          </span>
        </div>

        {isAdmin && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#e7eee7] bg-[#fafcfa] px-3 py-2">
            <UserRound size={13} className="shrink-0 text-[#839488]" />

            <span className="truncate text-xs font-semibold text-[#728176]">
              {item.users?.name ||
                item.users?.email ||
                'Pengguna'}
            </span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[#e6eee6] bg-[#fbfdfb] p-3">
            <p className="text-xs font-semibold text-[#87958a]">
              Alternatif dihitung
            </p>

            <div className="mt-1.5 flex items-center gap-2">
              <Smartphone size={14} className="text-[#568360]" />

              <span className="text-sm font-extrabold text-[#36543d]">
                {alternativeCount}
              </span>

              <span className="text-xs text-[#8b988e]">
                smartphone
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[#e6eee6] bg-[#fbfdfb] p-3">
            <p className="text-xs font-semibold text-[#87958a]">
              Nilai preferensi
            </p>

            <p className="mt-1.5 font-mono text-sm font-extrabold text-[#287b44]">
              {formatDecimal(item.top_score, 4)}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-[#dceade] bg-[#f0f8f1] p-3">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="shrink-0 text-[#438653]" />

            <span className="text-xs font-bold text-[#66816b]">
              Rekomendasi terbaik
            </span>
          </div>

          <p className="mt-1.5 break-words text-xs font-extrabold leading-snug text-[#31583b]">
            {winnerName}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <BudgetBadge budget={item.max_budget} />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDetail(item)}
              className="sd-button-light inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition"
            >
              <Eye size={13} />
              Detail
            </button>

            <button
              type="button"
              onClick={() => onDelete(item)}
              disabled={deleting}
              aria-label={`Hapus riwayat ${item.title}`}
              className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-xl border border-[#f0deda] bg-white px-3 py-2 text-xs font-extrabold text-[#b65b52] transition hover:bg-[#fff5f3] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? (
                <LoaderCircle size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              Hapus
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================
   TABEL RANKING PADA DETAIL
========================================= */
function HistoryRankingTable({ rows = [] }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#dce7dd] bg-[#fbfdfb] p-6 text-center">
        <Trophy size={22} className="mx-auto text-[#a0b0a3]" />

        <p className="mt-2 text-xs font-bold text-[#718477]">
          Belum ada data perankingan pada snapshot ini.
        </p>
      </div>
    );
  }

  const maxScore = Math.max(
    ...rows.map((row) => Number(row.totalScore) || 0),
    0.0001
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e3ece4] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse text-left">
          <thead>
            <tr>
              <th className="bg-[#f2f8f3] px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-[#637a68]">
                Peringkat
              </th>

              <th className="bg-[#f2f8f3] px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-[#637a68]">
                Kode
              </th>

              <th className="bg-[#f2f8f3] px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-[#637a68]">
                Alternatif Smartphone
              </th>

              <th className="bg-[#f2f8f3] px-3 py-3 text-right text-xs font-extrabold uppercase tracking-wide text-[#637a68]">
                Harga
              </th>

              <th className="min-w-[125px] bg-[#f2f8f3] px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-[#637a68]">
                Visual Skor
              </th>

              <th className="bg-[#f2f8f3] px-3 py-3 text-right text-xs font-extrabold uppercase tracking-wide text-[#637a68]">
                Nilai V
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => {
              const rank = row.rank ?? index + 1;
              const name = row.smartphone?.name ?? row.name ?? '-';
              const price = row.smartphone?.price ?? row.price;
              const score = Number(row.totalScore) || 0;
              const width = Math.max(
                4,
                Math.round((score / maxScore) * 100)
              );
              const isFirst = rank === 1;

              return (
                <tr
                  key={`${row.code}-${rank}-${name}`}
                  className={`border-t border-[#edf2ed] ${
                    isFirst ? 'bg-[#f1f8f2]' : 'hover:bg-[#fbfdfb]'
                  }`}
                >
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-extrabold ${
                        isFirst
                          ? 'bg-[#287b44] text-white'
                          : 'bg-[#eef3ee] text-[#66796a]'
                      }`}
                    >
                      {isFirst && <Trophy size={11} />}
                      #{rank}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-xs font-extrabold text-[#66806b]">
                    {row.code || '-'}
                  </td>

                  <td className="px-3 py-3 text-xs font-bold text-[#36543d]">
                    {name}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-right text-xs text-[#718075]">
                    {formatRupiah(price)}
                  </td>

                  <td className="px-3 py-3">
                    <div className="h-2 overflow-hidden rounded-full bg-[#eaf0ea]">
                      <div
                        className={`h-full rounded-full ${
                          isFirst ? 'bg-[#287b44]' : 'bg-[#7db98a]'
                        }`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-xs font-extrabold text-[#287b44]">
                    {formatDecimal(score, 4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================
   MODAL DETAIL RIWAYAT
========================================= */
function HistoryDetailModal({
  item,
  isAdmin,
  onClose,
}) {
  const [detailTab, setDetailTab] = useState('ranking');

  const snapshot = item.results_snapshot ?? {};

  const canShowSteps =
    Array.isArray(snapshot.matriksAwal) &&
    Array.isArray(snapshot.bobotTernormalisasi) &&
    Array.isArray(snapshot.nilaiMaxMin) &&
    Array.isArray(snapshot.matriksNormalisasi) &&
    Array.isArray(snapshot.rincianPreferensi);

  const weights =
    item.weights_used ??
    snapshot.bobotTernormalisasi ??
    [];

  const ranking = snapshot.hasilAkhir ?? [];

  const winnerName =
    item.top_smartphone_name ||
    ranking[0]?.smartphone?.name ||
    ranking[0]?.name ||
    '-';

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#14271b]/60 p-2 backdrop-blur-sm sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-detail-title"
        className="my-auto flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-[22px] border border-[#dce8dd] bg-[#f8fbf8] shadow-[0_25px_80px_rgba(15,40,23,0.25)] sm:rounded-[26px]"
      >
        {/* Header modal */}
        <div className="relative shrink-0 overflow-hidden border-b border-[#e2ebe3] bg-white px-4 py-4 sm:px-6">
          <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-[#edf7ef]" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#dceade] bg-[#f0f8f1] px-2.5 py-1 text-xs font-extrabold uppercase tracking-[0.1em] text-[#397b4b]">
                <History size={11} />
                Snapshot perhitungan SAW
              </div>

              <h2
                id="history-detail-title"
                className="mt-2 break-words text-base font-extrabold leading-snug text-[#294d34] sm:text-lg"
              >
                {item.title || 'Detail perhitungan'}
              </h2>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#849188]">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={11} />
                  {formatDateTime(item.created_at)}
                </span>

                {isAdmin && (
                  <span className="inline-flex items-center gap-1">
                    <UserRound size={11} />
                    {item.users?.name ||
                      item.users?.email ||
                      'Pengguna'}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup detail riwayat"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e4ece5] bg-white text-[#809084] transition hover:bg-[#f0f7f1] hover:text-[#347c49]"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Isi modal */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3 sm:p-5">
          {/* Ringkasan pemenang */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-2xl border border-[#d9e9dc] bg-gradient-to-r from-[#edf7ef] to-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#287b44] text-white">
                  <Trophy size={19} />
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#588161]">
                    Rekomendasi terbaik saat disimpan
                  </p>

                  <h3 className="mt-1 break-words text-sm font-extrabold text-[#2d5838] sm:text-base">
                    {winnerName}
                  </h3>

                  <div className="mt-2">
                    <BudgetBadge budget={item.max_budget} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e3ece4] bg-white p-4">
              <p className="text-xs font-bold text-[#87958a]">
                Nilai preferensi tertinggi
              </p>

              <p className="mt-2 font-mono text-2xl font-extrabold text-[#287b44]">
                {formatDecimal(item.top_score, 4)}
              </p>

              <p className="mt-1 text-xs text-[#8a978d]">
                Skor Vᵢ peringkat pertama
              </p>
            </div>
          </div>

          {/* Tab navigasi detail */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDetailTab('ranking')}
              aria-pressed={detailTab === 'ranking'}
              className={`min-h-[38px] rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${
                detailTab === 'ranking'
                  ? 'border-[#267840] bg-[#287b44] text-white shadow-[0_4px_12px_rgba(40,123,68,0.15)]'
                  : 'border-[#e0e9e1] bg-white text-[#718176] hover:bg-[#f0f7f1]'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Trophy size={13} />
                Ringkasan Bobot & Ranking
              </span>
            </button>

            {canShowSteps && (
              <button
                type="button"
                onClick={() => setDetailTab('steps')}
                aria-pressed={detailTab === 'steps'}
                className={`min-h-[38px] rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${
                  detailTab === 'steps'
                    ? 'border-[#267840] bg-[#287b44] text-white shadow-[0_4px_12px_rgba(40,123,68,0.15)]'
                    : 'border-[#e0e9e1] bg-white text-[#718176] hover:bg-[#f0f7f1]'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <CalculatorIcon />
                  Detail Langkah SAW (X, R, V)
                </span>
              </button>
            )}
          </div>

          {detailTab === 'ranking' ? (
            <div className="space-y-4">
              {/* Bobot yang dipakai */}
              <section className="rounded-2xl border border-[#e2ebe3] bg-white p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#31513a]">
                      Bobot Kriteria yang Digunakan
                    </h3>

                    <p className="mt-1 text-xs text-[#87958a]">
                      Snapshot bobot pada saat perhitungan disimpan.
                    </p>
                  </div>

                  <SlidersHorizontal
                    size={17}
                    className="shrink-0 text-[#6e9276]"
                  />
                </div>

                {weights.length === 0 ? (
                  <p className="rounded-xl bg-[#f8fbf8] px-3 py-4 text-center text-xs text-[#87958a]">
                    Data bobot tidak tersedia pada snapshot.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {weights.map((weight) => (
                      <div
                        key={weight.code}
                        className="rounded-xl border border-[#e6eee6] bg-[#fbfdfb] p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-xs font-extrabold text-[#829086]">
                              {weight.code}
                            </span>

                            <p className="mt-1 break-words text-xs font-extrabold text-[#36543d]">
                              {weight.name}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-2 py-1 text-sm font-extrabold ${
                              String(weight.type).toLowerCase() === 'cost'
                                ? 'bg-[#fff5e7] text-[#9c743b]'
                                : 'bg-[#eaf5ec] text-[#347c49]'
                            }`}
                          >
                            {weight.type}
                          </span>
                        </div>

                        <p className="mt-2 font-mono text-sm font-extrabold text-[#287b44]">
                          {formatDecimal(weight.normalizedWeight, 4)}
                        </p>

                        {weight.rawWeight !== undefined && (
                          <p className="mt-1 text-xs text-[#8b988e]">
                            Bobot input: {formatDecimal(weight.rawWeight, 3)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Ranking */}
              <section className="rounded-2xl border border-[#e2ebe3] bg-white p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#31513a]">
                      Snapshot Perankingan
                    </h3>

                    <p className="mt-1 text-xs text-[#87958a]">
                      Urutan alternatif berdasarkan skor preferensi saat disimpan.
                    </p>
                  </div>

                  <Trophy
                    size={17}
                    className="shrink-0 text-[#6e9276]"
                  />
                </div>

                <HistoryRankingTable rows={ranking} />
              </section>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-xl border border-[#dceade] bg-[#f0f8f1] px-3.5 py-3">
                <CheckCircle2
                  size={15}
                  className="mt-0.5 shrink-0 text-[#438653]"
                />

                <p className="text-xs leading-5 text-[#718477]">
                  Berikut adalah rincian perhitungan yang tersimpan pada saat
                  riwayat dibuat. Data ini merupakan snapshot, sehingga tidak
                  berubah ketika data smartphone atau bobot master diperbarui.
                </p>
              </div>

              <SawStepTables
                sawResult={{
                  ...snapshot,
                  isReady: true,
                }}
              />
            </div>
          )}

          {!canShowSteps && detailTab === 'ranking' && (
            <div className="flex items-start gap-2 rounded-xl border border-[#e9e5d7] bg-[#fffaf0] px-3.5 py-3">
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0 text-[#a17a38]"
              />

              <p className="text-xs leading-5 text-[#8d784f]">
                Riwayat ini tidak memiliki data seluruh tahapan SAW.
                Ringkasan bobot dan ranking tetap dapat dilihat jika tersedia.
              </p>
            </div>
          )}
        </div>

        {/* Footer modal */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#e2ebe3] bg-white px-4 py-3 sm:px-6">
          <span className="text-xs text-[#8b988e]">
            Data riwayat tersimpan secara permanen di database.
          </span>

          <button
            type="button"
            onClick={onClose}
            className="sd-button-dark inline-flex min-h-[36px] items-center justify-center rounded-xl px-4 py-2 text-xs font-extrabold"
          >
            Tutup detail
          </button>
        </div>
      </section>
    </div>
  );
}

/* =========================================
   IKON KECIL TAB
========================================= */
function CalculatorIcon() {
  return <SlidersHorizontal size={13} />;
}

/* =========================================
   KOMPONEN HALAMAN RIWAYAT
========================================= */
export default function Riwayat() {
  const { isAdmin } = useAuth();

  const [histories, setHistories] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  /* =====================================
     MEMUAT DATA
  ===================================== */
  async function loadHistories(showLoading = false) {
    if (showLoading) {
      setRefreshing(true);
    }

    setError('');

    try {
      const data = await fetchHistories();
      setHistories(data);
    } catch (err) {
      setError(
        err.message || 'Gagal memuat riwayat perhitungan.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await fetchHistories();

        if (active) {
          setHistories(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || 'Gagal memuat riwayat perhitungan.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  /* =====================================
     FILTER DAN PENCARIAN
  ===================================== */
  const filteredHistories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const now = HISTORY_FILTER_REFERENCE_TIME;

    return histories.filter((item) => {
      const winnerName =
        item.top_smartphone_name ||
        item.results_snapshot?.hasilAkhir?.[0]?.name ||
        '';

      const userName =
        item.users?.name ||
        item.users?.email ||
        '';

      const searchableText = [
        item.title,
        winnerName,
        userName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (keyword && !searchableText.includes(keyword)) {
        return false;
      }

      if (dateFilter !== 'all') {
        const createdAt = new Date(item.created_at).getTime();

        if (Number.isNaN(createdAt)) {
          return false;
        }

        const days = dateFilter === '7d' ? 7 : 30;
        const age = (now - createdAt) / (1000 * 60 * 60 * 24);

        if (age > days) {
          return false;
        }
      }

      const hasBudget = Number(item.max_budget) > 0;

      if (budgetFilter === 'budget' && !hasBudget) {
        return false;
      }

      if (budgetFilter === 'no-budget' && hasBudget) {
        return false;
      }

      return true;
    });
  }, [
    histories,
    searchTerm,
    dateFilter,
    budgetFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredHistories.length / ITEMS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const visibleHistories = filteredHistories.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  /* =====================================
     STATISTIK
  ===================================== */
  const totalWithBudget = histories.filter(
    (item) => Number(item.max_budget) > 0
  ).length;

  const winnerCount = new Set(
    histories
      .map((item) => item.top_smartphone_name)
      .filter(Boolean)
  ).size;

  const latestHistory = histories[0];

  /* =====================================
     DETAIL
  ===================================== */
  function openDetail(item) {
    setSelectedHistory(item);
  }

  function closeDetail() {
    setSelectedHistory(null);
  }

  /* =====================================
     HAPUS RIWAYAT
  ===================================== */
  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Hapus riwayat "${item.title}"?\n\nData riwayat yang dihapus tidak dapat dikembalikan.`
    );

    if (!confirmed) return;

    setError('');
    setDeletingId(item.id);

    try {
      await deleteHistory(item.id);

      if (selectedHistory?.id === item.id) {
        setSelectedHistory(null);
      }

      await loadHistories();
    } catch (err) {
      setError(
        err.message || 'Gagal menghapus riwayat.'
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =====================================
     LOADING
  ===================================== */
  if (loading) {
    return (
      <div className="space-y-5">
        <PageHeader
          kicker="Arsip perhitungan"
          title="Riwayat Perhitungan"
          description="Kumpulan hasil rekomendasi yang pernah disimpan."
        />

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[115px] animate-pulse rounded-[20px] border border-[#e5ece5] bg-white"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[245px] animate-pulse rounded-[22px] border border-[#e5ece5] bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  /* =====================================
     TAMPILAN UTAMA
  ===================================== */
  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        kicker="Arsip dan aktivitas"
        title="Riwayat Perhitungan"
        description={
          isAdmin
            ? 'Lihat dan kelola snapshot perhitungan SAW dari seluruh pengguna.'
            : 'Temukan kembali hasil perhitungan dan rekomendasi smartphone yang pernah kamu simpan.'
        }
        badge={
          <span className="rounded-full border border-[#d9e9dc] bg-[#eef7ef] px-2.5 py-1 text-xs font-extrabold text-[#367b49]">
            {histories.length} tersimpan
          </span>
        }
        action={
          <button
            type="button"
            onClick={() => loadHistories(true)}
            disabled={refreshing}
            className="sd-button-light inline-flex min-h-[38px] items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition disabled:opacity-50 sm:text-sm"
          >
            <RotateCw
              size={14}
              className={refreshing ? 'animate-spin' : ''}
            />
            Perbarui
          </button>
        }
      />

      {/* BANNER PENGANTAR */}
      <section className="relative overflow-hidden rounded-[24px] border border-[#dceade] bg-gradient-to-br from-[#eef7ef] via-white to-[#eaf4ec] p-5 shadow-[0_10px_28px_rgba(30,80,43,0.04)] sm:p-6">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8e9db] bg-white/80 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#438154]">
              <History size={12} />
              Arsip rekomendasi
            </span>

            <h2 className="mt-3 text-lg font-extrabold leading-snug tracking-tight text-[#244832] sm:text-xl">
              Semua hasil perhitungan tersimpan di satu tempat.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#718477] sm:text-xs">
              Buka kembali hasil SAW yang pernah disimpan, lihat urutan
              rekomendasi, dan telusuri perhitungan tanpa harus
              menjalankannya dari awal.
            </p>
          </div>

          <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-white/80 bg-white/75 text-[#39804d] shadow-[0_8px_24px_rgba(40,100,55,0.07)] sm:flex">
            <History size={36} strokeWidth={1.6} />
          </div>
        </div>

        <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full border-[24px] border-white/30" />
        <div className="pointer-events-none absolute -bottom-16 right-20 h-40 w-40 rounded-full bg-[#d9eddd]/40 blur-2xl" />
      </section>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#f0d9d6] bg-[#fff7f6] px-4 py-3 text-xs text-[#a54a42]"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="font-extrabold">
              Terjadi kendala saat memproses riwayat
            </p>

            <p className="mt-1 break-words leading-5">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError('')}
            aria-label="Tutup pesan error"
            className="shrink-0 rounded-lg p-1 hover:bg-[#fcebe8]"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* RINGKASAN */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <HistoryStat
          icon={History}
          label="Total riwayat"
          value={histories.length}
          description="Seluruh perhitungan yang tersimpan"
        />

        <HistoryStat
          icon={Wallet}
          label="Dengan budget"
          value={totalWithBudget}
          description="Riwayat yang memakai batas harga"
        />

        <HistoryStat
          icon={Trophy}
          label="Smartphone pemenang"
          value={winnerCount}
          description="Nama pemenang yang berbeda"
        />

        <HistoryStat
          icon={CalendarDays}
          label="Terakhir disimpan"
          value={
            latestHistory
              ? formatDateOnly(latestHistory.created_at)
              : '-'
          }
          description="Riwayat paling baru"
        />
      </section>

      {/* PENCARIAN DAN FILTER */}
      <section className="rounded-[22px] border border-[#e1ebe2] bg-white p-4 shadow-[0_7px_22px_rgba(25,68,39,0.035)] sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={16}
                className="text-[#438154]"
              />

              <h2 className="text-xs font-extrabold text-[#31513a]">
                Cari dan filter riwayat
              </h2>
            </div>

            <p className="mt-1 text-xs text-[#87958a]">
              Gunakan judul, nama pemenang, atau pengguna untuk menemukan data.
            </p>
          </div>

          <span className="text-xs font-bold text-[#718477]">
            {filteredHistories.length} hasil ditemukan
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#91a093]"
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul, smartphone terbaik, atau pengguna..."
              aria-label="Cari riwayat perhitungan"
              className="min-h-[42px] w-full rounded-xl border border-[#e1ebe2] bg-[#fbfdfb] py-2 pl-9 pr-10 text-xs font-medium text-[#36543d] outline-none transition placeholder:text-[#a0aba2] focus:border-[#80b78b] focus:ring-4 focus:ring-[#e7f3e9]"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#87968a] hover:bg-[#edf5ee] hover:text-[#347c49]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter waktu riwayat"
              className="min-h-[42px] w-full rounded-xl border border-[#e1ebe2] bg-[#fbfdfb] px-3 py-2 text-xs font-semibold text-[#536b58] outline-none focus:border-[#80b78b] focus:ring-4 focus:ring-[#e7f3e9]"
            >
              {DATE_FILTERS.map((filter) => (
                <option
                  key={filter.value}
                  value={filter.value}
                >
                  {filter.label}
                </option>
              ))}
            </select>

            <select
              value={budgetFilter}
              onChange={(event) => {
                setBudgetFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter budget riwayat"
              className="min-h-[42px] w-full rounded-xl border border-[#e1ebe2] bg-[#fbfdfb] px-3 py-2 text-xs font-semibold text-[#536b58] outline-none focus:border-[#80b78b] focus:ring-4 focus:ring-[#e7f3e9]"
            >
              {BUDGET_FILTERS.map((filter) => (
                <option
                  key={filter.value}
                  value={filter.value}
                >
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm ||
          dateFilter !== 'all' ||
          budgetFilter !== 'all') && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[#849188]">
              Filter sedang diterapkan.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
                setBudgetFilter('all');
                setCurrentPage(1);
              }}
              className="text-xs font-extrabold text-[#397b4b] hover:underline"
            >
              Reset semua filter
            </button>
          </div>
        )}
      </section>

      {/* DAFTAR RIWAYAT */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-[#294d34]">
              Daftar riwayat
            </h2>

            <p className="mt-1 text-xs text-[#87958a]">
              Diurutkan dari penyimpanan terbaru.
            </p>
          </div>

          {filteredHistories.length > 0 && (
            <span className="rounded-full border border-[#dceade] bg-[#f0f8f1] px-2.5 py-1 text-xs font-extrabold text-[#397b4b]">
              {filteredHistories.length} data
            </span>
          )}
        </div>

        {histories.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#cddfce] bg-white px-5 py-10 text-center shadow-[0_7px_22px_rgba(25,68,39,0.025)]">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf6ef] text-[#428052]">
              <History size={25} />
            </span>

            <h3 className="mt-4 text-sm font-extrabold text-[#31513a]">
              Belum ada riwayat perhitungan
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#87958a]">
              Hasil perhitungan yang disimpan akan muncul di sini.
              Jalankan analisis SAW terlebih dahulu, kemudian simpan hasilnya.
            </p>

            <Link
              to="/hasil"
              className="sd-button-dark mt-4 inline-flex min-h-[39px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold"
            >
              Buka hasil rekomendasi
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : filteredHistories.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#dce7dd] bg-white px-5 py-10 text-center">
            <Search size={24} className="mx-auto text-[#a0b0a3]" />

            <h3 className="mt-3 text-xs font-extrabold text-[#48614d]">
              Riwayat tidak ditemukan
            </h3>

            <p className="mt-1 text-xs text-[#87958a]">
              Coba ubah kata kunci atau filter pencarian.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
                setBudgetFilter('all');
                setCurrentPage(1);
              }}
              className="sd-button-light mt-4 inline-flex min-h-[36px] items-center justify-center rounded-xl px-3.5 py-2 text-xs font-extrabold"
            >
              Tampilkan semua riwayat
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {visibleHistories.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onDetail={openDetail}
                  onDelete={handleDelete}
                  deleting={deletingId === item.id}
                />
              ))}
            </div>

            {filteredHistories.length > ITEMS_PER_PAGE && (
              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#e3ece4] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-center text-xs text-[#849188] sm:text-left">
                  Menampilkan{' '}
                  <strong className="text-[#46624b]">
                    {(safePage - 1) * ITEMS_PER_PAGE + 1}
                  </strong>
                  {' - '}
                  <strong className="text-[#46624b]">
                    {Math.min(
                      safePage * ITEMS_PER_PAGE,
                      filteredHistories.length
                    )}
                  </strong>
                  {' dari '}
                  <strong className="text-[#46624b]">
                    {filteredHistories.length}
                  </strong>
                  {' riwayat'}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(page - 1, 1)
                      )
                    }
                    disabled={safePage === 1}
                    className="sd-button-light inline-flex min-h-[34px] items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={13} />
                    Sebelumnya
                  </button>

                  <span className="min-w-[52px] text-center text-xs font-extrabold text-[#52705a]">
                    {safePage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(page + 1, totalPages)
                      )
                    }
                    disabled={safePage >= totalPages}
                    className="sd-button-light inline-flex min-h-[34px] items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Selanjutnya
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* MODAL DETAIL */}
      {selectedHistory && (
        <HistoryDetailModal
          item={selectedHistory}
          isAdmin={isAdmin}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}
