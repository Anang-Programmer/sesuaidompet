import { Trophy } from 'lucide-react';
import { formatDecimal, formatRupiah } from '../utils/formatters';

export function RankingTable({ rows = [] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
        Belum ada data perankingan untuk ditampilkan.
      </div>
    );
  }

  const maxScore = Math.max(...rows.map((r) => Number(r.totalScore) || 0), 0.0001);

  return (
    <div className="overflow-x-auto rounded-sm border border-slate-200 bg-white">
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
          {rows.map((row) => {
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
  );
}

