
import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
} from 'lucide-react';

import {
  formatDecimal,
  formatRupiah,
} from '../utils/formatters';

const ROWS_PER_PAGE = 10;

/* =========================================
   BADGE PERINGKAT
========================================= */
function RankBadge({ rank }) {
  const isFirst = rank === 1;

  return (
    <span
      className={`inline-flex min-w-[37px] items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[9px] font-extrabold ${
        isFirst
          ? 'bg-[#287b44] text-white shadow-[0_3px_9px_rgba(40,123,68,0.17)]'
          : rank <= 3
            ? 'bg-[#e8f1e9] text-[#487551]'
            : 'bg-[#f0f3f0] text-[#728075]'
      }`}
    >
      {isFirst && <Trophy size={11} />}
      #{rank}
    </span>
  );
}

/* =========================================
   PROGRESS NILAI
========================================= */
function ScoreProgress({ score, maxScore, isFirst }) {
  const percentage =
    maxScore > 0
      ? Math.max(
          0,
          Math.min((Number(score) / maxScore) * 100, 100)
        )
      : 0;

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-[#e9f0e9]"
      aria-label={`Perbandingan skor ${percentage.toFixed(0)} persen`}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ${
          isFirst
            ? 'bg-gradient-to-r from-[#318a4c] to-[#55ae6b]'
            : 'bg-[#91c69a]'
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

/* =========================================
   SEL TABEL
========================================= */
function RankingTableCell({
  children,
  align = 'left',
  strong = false,
  highlight = false,
}) {
  return (
    <td
      className={`border-b border-[#edf2ed] px-3 py-3 text-[10px] ${
        align === 'right'
          ? 'text-right'
          : 'text-left'
      } ${
        strong
          ? 'font-extrabold text-[#36543d]'
          : 'font-medium text-[#718075]'
      } ${
        highlight
          ? 'bg-[#f1f8f2]'
          : ''
      }`}
    >
      {children}
    </td>
  );
}

/* =========================================
   HEADER TABEL
========================================= */
function RankingTableHeader({ children, align = 'left' }) {
  return (
    <th
      className={`whitespace-nowrap border-b border-[#e1ebe2] bg-[#f2f8f3] px-3 py-3 text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#637a68] ${
        align === 'right'
          ? 'text-right'
          : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

/* =========================================
   KOMPONEN PAGINATION
========================================= */
function RankingPagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-[#e6eee7] bg-[#fbfdfb] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <p className="text-center text-[9px] text-[#849188] sm:text-left">
        Menampilkan{' '}
        <strong className="text-[#46624b]">
          {startIndex + 1}
        </strong>
        {' - '}
        <strong className="text-[#46624b]">
          {endIndex}
        </strong>
        {' dari '}
        <strong className="text-[#46624b]">
          {totalItems}
        </strong>
        {' alternatif'}
      </p>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() =>
            onPageChange(Math.max(currentPage - 1, 1))
          }
          disabled={currentPage <= 1}
          className="sd-button-light inline-flex min-h-[34px] items-center gap-1 rounded-xl px-3 py-1.5 text-[9px] font-bold disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={13} />
          Sebelumnya
        </button>

        <span className="min-w-[54px] text-center text-[9px] font-extrabold text-[#52705a]">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() =>
            onPageChange(
              Math.min(currentPage + 1, totalPages)
            )
          }
          disabled={currentPage >= totalPages}
          className="sd-button-light inline-flex min-h-[34px] items-center gap-1 rounded-xl px-3 py-1.5 text-[9px] font-bold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Selanjutnya
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* =========================================
   KOMPONEN UTAMA TABEL RANKING
========================================= */
export function RankingTable({ rows = [] }) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#dce7dd] bg-[#fbfdfb] px-4 py-8 text-center">
        <Trophy
          size={22}
          className="mx-auto text-[#a0b0a3]"
        />

        <p className="mt-2 text-[10px] font-bold text-[#718477]">
          Belum ada data perankingan untuk ditampilkan.
        </p>
      </div>
    );
  }

  const maxScore = Math.max(
    ...rows.map((row) => Number(row.totalScore) || 0),
    0.0001
  );

  const totalPages = Math.ceil(
    rows.length / ROWS_PER_PAGE
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) * ROWS_PER_PAGE;

  const endIndex = Math.min(
    startIndex + ROWS_PER_PAGE,
    rows.length
  );

  const paginatedRows = rows.slice(
    startIndex,
    endIndex
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e3ece4] bg-white">
      {/* =================================
          TAMPILAN MOBILE
      ================================= */}
      <div className="space-y-2.5 p-3 md:hidden">
        {paginatedRows.map((row, index) => {
          const rank = row.rank ?? startIndex + index + 1;

          const name =
            row.smartphone?.name ??
            row.name ??
            '-';

          const price =
            row.smartphone?.price ??
            row.price;

          const score =
            Number(row.totalScore) || 0;

          const isFirst = rank === 1;

          return (
            <article
              key={`${rank}-${row.code}-${name}`}
              className={`rounded-[17px] border p-3.5 transition ${
                isFirst
                  ? 'border-[#c9e0ce] bg-[#f0f8f1] shadow-[0_4px_12px_rgba(40,100,55,0.045)]'
                  : 'border-[#e7eee7] bg-[#fbfdfb]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <RankBadge rank={rank} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-[11px] font-extrabold leading-snug text-[#36543d]">
                        {name}
                      </p>

                      <p className="mt-1 text-[9px] font-semibold text-[#8b988e]">
                        Kode alternatif {row.code || '-'}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[8px] font-bold text-[#87958a]">
                        Nilai Vᵢ
                      </p>

                      <p
                        className={`mt-1 font-mono text-sm font-extrabold ${
                          isFirst
                            ? 'text-[#287b44]'
                            : 'text-[#526b57]'
                        }`}
                      >
                        {formatDecimal(score, 4)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[9px] font-semibold text-[#738477]">
                      {formatRupiah(price)}
                    </p>

                    {isFirst && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e2f1e5] px-2 py-1 text-[8px] font-extrabold text-[#347b49]">
                        <Trophy size={10} />
                        Rekomendasi terbaik
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <ScoreProgress
                      score={score}
                      maxScore={maxScore}
                      isFirst={isFirst}
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* =================================
          TAMPILAN TABLET & DESKTOP
      ================================= */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr>
              <RankingTableHeader>
                Peringkat
              </RankingTableHeader>

              <RankingTableHeader>
                Kode
              </RankingTableHeader>

              <RankingTableHeader>
                Alternatif Smartphone
              </RankingTableHeader>

              <RankingTableHeader align="right">
                Harga
              </RankingTableHeader>

              <RankingTableHeader>
                Visual Skor
              </RankingTableHeader>

              <RankingTableHeader align="right">
                Nilai Preferensi (Vᵢ)
              </RankingTableHeader>
            </tr>
          </thead>

          <tbody>
            {paginatedRows.map((row, index) => {
              const rank =
                row.rank ?? startIndex + index + 1;

              const name =
                row.smartphone?.name ??
                row.name ??
                '-';

              const price =
                row.smartphone?.price ??
                row.price;

              const score =
                Number(row.totalScore) || 0;

              const isFirst = rank === 1;

              return (
                <tr
                  key={`${rank}-${row.code}-${name}`}
                  className={`transition ${
                    isFirst
                      ? 'bg-[#f0f8f1]'
                      : 'hover:bg-[#fbfdfb]'
                  }`}
                >
                  <RankingTableCell>
                    <RankBadge rank={rank} />
                  </RankingTableCell>

                  <RankingTableCell strong>
                    {row.code || '-'}
                  </RankingTableCell>

                  <RankingTableCell strong>
                    <div className="max-w-[230px] whitespace-normal leading-5">
                      {name}
                    </div>
                  </RankingTableCell>

                  <RankingTableCell align="right">
                    <span className="whitespace-nowrap">
                      {formatRupiah(price)}
                    </span>
                  </RankingTableCell>

                  <RankingTableCell>
                    <div className="min-w-[125px]">
                      <ScoreProgress
                        score={score}
                        maxScore={maxScore}
                        isFirst={isFirst}
                      />
                    </div>
                  </RankingTableCell>

                  <RankingTableCell
                    align="right"
                    strong
                    highlight
                  >
                    <span
                      className={`whitespace-nowrap font-mono ${
                        isFirst
                          ? 'text-[#287b44]'
                          : 'text-[#526b57]'
                      }`}
                    >
                      {formatDecimal(score, 4)}
                    </span>
                  </RankingTableCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <RankingPagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={rows.length}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
