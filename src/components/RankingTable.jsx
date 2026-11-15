import { useState } from 'react';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDecimal, formatRupiah } from '../utils/formatters';

const ROWS_PER_PAGE = 10;

export function RankingTable({ rows = [] }) {
  const [currentPage, setCurrentPage] = useState(1);

  if (rows.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
        Belum ada data perankingan untuk ditampilkan.
      </div>
    );
  }

  const maxScore = Math.max(...rows.map((r) => Number(r.totalScore) || 0), 0.0001);
  
  const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedRows = rows.slice(startIndex, startIndex + ROWS_PER_PAGE);

  return (
    <div className="overflow-hidden rounded-sm border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-2">Peringkat</th>
              <th className="px-3 py-2">Kode</th>
              <th className="px-3 py-2">Alternatif Smartphone</th>
              <th className="px-3 py-2">Harga</th>
              <th className="min-w-[160px] px-3 py-2">Visual Skor</th>
              <th className="px-3 py-2 text-right">Nilai Preferensi (V)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedRows.map((row) => {
              const name = row.smartphone?.name ?? row.name;
              const price = row.smartphone?.price ?? row.price;
              const score = Number(row.totalScore) || 0;
              const widthPct = Math.max(4, Math.round((score / maxScore) * 100));
              const isFirst = row.rank === 1;

              return (
                <tr
                  key={`${row.rank}-${row.code}-${name}`}
                  className={isFirst ? 'bg-emerald-50/50' : 'hover:bg-slate-50/70'}
                >
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-xs px-2 py-0.5 text-xs font-bold ${
                        isFirst
                          ? 'bg-emerald-600 text-white'
                          : row.rank <= 3
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isFirst && <Trophy className="h-3 w-3" />}#{row.rank}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-600">
                    {row.code}
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-900">
                    {name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                    {formatRupiah(price)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-2 w-full overflow-hidden rounded-xs bg-slate-100">
                      <div
                        className={`h-full rounded-xs ${
                          isFirst ? 'bg-emerald-600' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                    {formatDecimal(score, 4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length > ROWS_PER_PAGE && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3.5 py-2.5">
          <span className="text-xs text-slate-600">
            Menampilkan <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(startIndex + ROWS_PER_PAGE, rows.length)}</span> dari <span className="font-semibold">{rows.length}</span> data
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-sm border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>
            <span className="text-xs font-medium text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-sm border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}