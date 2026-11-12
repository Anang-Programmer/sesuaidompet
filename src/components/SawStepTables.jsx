import { useState } from 'react';
import { formatCriterionValue, formatDecimal } from '../utils/formatters';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function TablePagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
  if (totalItems === 0) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3.5 py-2.5">
      <span className="text-xs text-slate-600">
        Menampilkan <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{endIndex}</span> dari <span className="font-semibold">{totalItems}</span> data
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-0.5 rounded-sm border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Prev</span>
        </button>
        <span className="text-xs font-semibold text-slate-700">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-0.5 rounded-sm border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function SawStepTables({ sawResult }) {
  const [pageX, setPageX] = useState(1);
  const [pageR, setPageR] = useState(1);
  const [pageV, setPageV] = useState(1);
  const rowsPerPage = 10;

  if (!sawResult?.isReady) {
    return null;
  }

  const {
    wasWeightNormalized,
    weightSum,
    bobotTernormalisasi,
    matriksAwal,
    nilaiMaxMin,
    matriksNormalisasi,
    rincianPreferensi,
  } = sawResult;

  const paginate = (data, page) => {
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  };

  const paginatedX = paginate(matriksAwal, pageX);
  const paginatedR = paginate(matriksNormalisasi, pageR);
  const paginatedV = paginate(rincianPreferensi, pageV);

  return (
    <div className="space-y-3.5">
      {/* Langkah 1 & 2: Kriteria & Bobot */}
      <section className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs">
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Langkah 1 &amp; 2: Alternatif, Kriteria, dan Bobot ({matriksAwal.length} Alternatif)
            </h3>
            <p className="text-xs text-slate-500">
              Menentukan alternatif HP terpilih, sifat kriteria (Cost/Benefit), serta bobot kepentingan.
            </p>
          </div>
          {wasWeightNormalized && (
            <span className="self-start rounded-xs bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
              Bobot otomatis dinormalisasi (Σw = {formatDecimal(weightSum, 3)} → 1,000)
            </span>
          )}
        </div>

        <div className="overflow-x-auto rounded-sm border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-2">Kode</th>
                <th className="px-3 py-2">Kriteria</th>
                <th className="px-3 py-2">Jenis</th>
                <th className="px-3 py-2 text-right">Bobot Input</th>
                {wasWeightNormalized && (
                  <th className="px-3 py-2 text-right">
                    Normalisasi (w_j / Σw)
                  </th>
                )}
                <th className="px-3 py-2 text-right">Bobot Aktif (W_j)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bobotTernormalisasi.map((c) => {
                const isCost = String(c.type).toLowerCase() === 'cost';
                return (
                  <tr key={c.code} className="hover:bg-slate-50/70">
                    <td className="px-3 py-2 font-bold text-slate-800">{c.code}</td>
                    <td className="px-3 py-2 font-medium text-slate-800">{c.name}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-xs px-2 py-0.5 text-[11px] font-semibold ${
                          isCost
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isCost ? 'Cost' : 'Benefit'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-slate-700">
                      {formatDecimal(c.rawWeight, 3)}
                    </td>
                    {wasWeightNormalized && (
                      <td className="px-3 py-2 text-right font-mono text-xs text-slate-500">
                        {formatDecimal(c.rawWeight, 3)} ÷ {formatDecimal(weightSum, 3)}
                      </td>
                    )}
                    <td className="px-3 py-2 text-right font-mono font-semibold text-emerald-700">
                      {formatDecimal(c.normalizedWeight, 4)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Langkah 3: Matriks Keputusan (X) */}
      <section className="rounded-sm border border-slate-200 bg-white shadow-2xs">
        <div className="p-3.5 pb-0">
          <h3 className="text-base font-bold text-slate-900">
            Langkah 3: Matriks Keputusan (X)
          </h3>
          <p className="text-xs text-slate-500 mb-2">
            Nilai angka asli spesifikasi setiap alternatif smartphone terhadap ke-6 kriteria.
          </p>
        </div>

        <div className="overflow-x-auto border-y border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-2">Kode</th>
                <th className="px-3 py-2">Alternatif</th>
                {bobotTernormalisasi.map((c) => (
                  <th key={c.code} className="whitespace-nowrap px-3 py-2 text-right">
                    {c.code} ({c.name})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedX.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 font-bold text-slate-700">{row.code}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-900">
                    {row.smartphone?.name ?? row.name}
                  </td>
                  {bobotTernormalisasi.map((c) => (
                    <td
                      key={c.code}
                      className="whitespace-nowrap px-3 py-2 text-right text-slate-700"
                    >
                      {formatCriterionValue(c.field, row.values[c.code])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination 
          currentPage={pageX} 
          totalPages={Math.ceil(matriksAwal.length / rowsPerPage)} 
          onPageChange={setPageX} 
          totalItems={matriksAwal.length} 
          itemsPerPage={rowsPerPage} 
        />
      </section>

      {/* Langkah 4: Nilai Max & Min setiap kriteria */}
      <section className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs">
        <div className="mb-2">
          <h3 className="text-base font-bold text-slate-900">
            Langkah 4: Nilai Maksimum &amp; Minimum Setiap Kriteria
          </h3>
          <p className="text-xs text-slate-500">
            Kriteria <strong>Benefit</strong> memakai nilai <strong>Max</strong>, sedangkan
            kriteria <strong>Cost</strong> memakai nilai <strong>Min</strong> sebagai pembagi/acuan normalisasi.
          </p>
        </div>

        <div className="overflow-x-auto rounded-sm border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-2">Kriteria</th>
                <th className="px-3 py-2">Jenis</th>
                <th className="px-3 py-2 text-right">Nilai Maksimum (Max)</th>
                <th className="px-3 py-2 text-right">Nilai Minimum (Min)</th>
                <th className="px-3 py-2 text-right">Acuan Dipakai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {nilaiMaxMin.map((item) => {
                const isCost = String(item.type).toLowerCase() === 'cost';
                return (
                  <tr key={item.code} className="hover:bg-slate-50/70">
                    <td className="px-3 py-2 font-semibold text-slate-900">
                      {item.code}: {item.name}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-xs px-2 py-0.5 text-[11px] font-semibold ${
                          isCost
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isCost ? 'Cost' : 'Benefit'}
                      </span>
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-2 text-right ${
                        !isCost ? 'font-bold text-emerald-700' : 'text-slate-600'
                      }`}
                    >
                      {formatCriterionValue(item.field, item.max)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-2 text-right ${
                        isCost ? 'font-bold text-orange-700' : 'text-slate-600'
                      }`}
                    >
                      {formatCriterionValue(item.field, item.min)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-slate-900">
                      {item.extremaLabel}: {formatCriterionValue(item.field, item.extrema)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Langkah 5: Matriks Ternormalisasi (R) */}
      <section className="rounded-sm border border-slate-200 bg-white shadow-2xs">
        <div className="p-3.5 pb-0">
          <h3 className="text-base font-bold text-slate-900">
            Langkah 5: Matriks Ternormalisasi (R)
          </h3>
          <p className="text-xs text-slate-500 mb-2">
            Benefit: <code className="rounded-xs bg-slate-100 px-1 py-0.5">r_ij = x_ij / max(x_ij)</code> ·
            Cost: <code className="rounded-xs bg-slate-100 px-1 py-0.5">r_ij = min(x_ij) / x_ij</code> (ditampilkan 4 angka di belakang koma).
          </p>
        </div>

        <div className="overflow-x-auto border-y border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-2">Kode</th>
                <th className="px-3 py-2">Alternatif</th>
                {bobotTernormalisasi.map((c) => {
                  const isCost = String(c.type).toLowerCase() === 'cost';
                  return (
                    <th key={c.code} className="whitespace-nowrap px-3 py-2 text-right">
                      <div>{c.code}</div>
                      <div className="text-[10px] font-normal normal-case text-slate-400">
                        {isCost ? 'min ÷ x' : 'x ÷ max'}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedR.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 font-bold text-slate-700">{row.code}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-900">
                    {row.smartphone?.name ?? row.name}
                  </td>
                  {bobotTernormalisasi.map((c) => (
                    <td
                      key={c.code}
                      className="px-3 py-2 text-right font-mono text-slate-800"
                    >
                      {formatDecimal(row.values[c.code], 4)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination 
          currentPage={pageR} 
          totalPages={Math.ceil(matriksNormalisasi.length / rowsPerPage)} 
          onPageChange={setPageR} 
          totalItems={matriksNormalisasi.length} 
          itemsPerPage={rowsPerPage} 
        />
      </section>

      {/* Langkah 6: Perhitungan Nilai Preferensi (V_i) */}
      <section className="rounded-sm border border-slate-200 bg-white shadow-2xs">
        <div className="p-3.5 pb-0">
          <h3 className="text-base font-bold text-slate-900">
            Langkah 6: Perhitungan Nilai Preferensi (V_i)
          </h3>
          <p className="text-xs text-slate-500 mb-2">
            Rincian perkalian <code className="rounded-xs bg-slate-100 px-1 py-0.5">W_j × r_ij</code> pada setiap kriteria dan penjumlahannya menjadi nilai akhir{' '}
            <code className="rounded-xs bg-slate-100 px-1 py-0.5">V_i = Σ (W_j × r_ij)</code>.
          </p>
        </div>

        <div className="overflow-x-auto border-y border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-2">Kode</th>
                <th className="px-3 py-2">Alternatif</th>
                {bobotTernormalisasi.map((c) => (
                  <th key={c.code} className="whitespace-nowrap px-3 py-2 text-right">
                    <div>W × {c.code}</div>
                    <div className="text-[10px] font-normal text-slate-400">
                      ({formatDecimal(c.normalizedWeight, 3)})
                    </div>
                  </th>
                ))}
                <th className="px-3 py-2 text-right text-emerald-700">
                  Total (V_i)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedV.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 font-bold text-slate-700">{row.code}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-900">
                    {row.smartphone?.name ?? row.name}
                  </td>
                  {bobotTernormalisasi.map((c) => (
                    <td
                      key={c.code}
                      className="px-3 py-2 text-right font-mono text-slate-600"
                    >
                      {formatDecimal(row.weightedValues[c.code], 4)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right font-mono font-bold text-emerald-700">
                    {formatDecimal(row.totalScore, 4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination 
          currentPage={pageV} 
          totalPages={Math.ceil(rincianPreferensi.length / rowsPerPage)} 
          onPageChange={setPageV} 
          totalItems={rincianPreferensi.length} 
          itemsPerPage={rowsPerPage} 
        />
      </section>
    </div>
  );
}