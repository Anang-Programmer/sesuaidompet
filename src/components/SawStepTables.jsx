
import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Info,
  Scale,
  Target,
  Trophy,
} from 'lucide-react';
import {
  formatCriterionValue,
  formatDecimal,
} from '../utils/formatters';

const ROWS_PER_PAGE = 10;

/* =========================================
   PAGINATION
========================================= */
function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) {
  if (totalItems === 0) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    totalItems
  );

  return (
    <div className="flex flex-col gap-3 border-t border-[#e6eee7] bg-[#fbfdfb] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-center text-[10px] text-[#849188] sm:text-left">
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
        {' data'}
      </span>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() =>
            onPageChange(Math.max(currentPage - 1, 1))
          }
          disabled={currentPage === 1}
          className="sd-button-light inline-flex min-h-[34px] items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          Sebelumnya
        </button>

        <span className="min-w-[65px] text-center text-[10px] font-extrabold text-[#536b58]">
          {currentPage} / {Math.max(totalPages, 1)}
        </span>

        <button
          type="button"
          onClick={() =>
            onPageChange(
              Math.min(currentPage + 1, totalPages)
            )
          }
          disabled={currentPage >= totalPages}
          className="sd-button-light inline-flex min-h-[34px] items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          Selanjutnya
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* =========================================
   HEADER SETIAP LANGKAH
========================================= */
function StepHeader({
  number,
  icon: Icon,
  title,
  description,
  badge,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#e8efe8] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f5eb] text-[#30834a]">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#398653]">
            Tahap {number}
          </div>

          <h3 className="mt-1 text-sm font-extrabold leading-snug text-[#244832] sm:text-base">
            {title}
          </h3>

          {description && (
            <p className="mt-1 max-w-3xl text-[10px] leading-5 text-[#849188]">
              {description}
            </p>
          )}
        </div>
      </div>

      {badge && (
        <div className="shrink-0">
          {badge}
        </div>
      )}
    </div>
  );
}

/* =========================================
   KERANGKA PANEL
========================================= */
function StepPanel({
  id,
  number,
  icon,
  title,
  description,
  badge,
  children,
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-[22px] border border-[#e1ebe2] bg-white shadow-[0_7px_22px_rgba(25,68,39,0.04)]"
    >
      <StepHeader
        number={number}
        icon={icon}
        title={title}
        description={description}
        badge={badge}
      />

      {children}
    </section>
  );
}

/* =========================================
   BADGE BENEFIT / COST
========================================= */
function TypeBadge({ type }) {
  const isCost = String(type).toLowerCase() === 'cost';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${
        isCost
          ? 'border-[#f0dfc3] bg-[#fff7e9] text-[#a5762f]'
          : 'border-[#d2e9d6] bg-[#eaf6ec] text-[#2d7944]'
      }`}
    >
      {isCost ? 'Cost' : 'Benefit'}
    </span>
  );
}

/* =========================================
   LABEL BOBOT
========================================= */
function WeightCard({
  criterion,
  wasWeightNormalized,
}) {
  const percentage =
    Number(criterion.normalizedWeight) * 100;

  const safePercentage = Number.isFinite(percentage)
    ? percentage
    : 0;

  return (
    <article className="rounded-2xl border border-[#e4ece5] bg-[#fbfdfb] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="inline-flex rounded-md bg-[#eaf1eb] px-2 py-1 text-[9px] font-extrabold text-[#718176]">
            {criterion.code}
          </span>

          <h4 className="mt-2 text-xs font-extrabold leading-snug text-[#31513a]">
            {criterion.name}
          </h4>
        </div>

        <TypeBadge type={criterion.type} />
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold text-[#849188]">
            Bobot aktif
          </p>

          <p className="mt-1 text-xl font-extrabold text-[#287b44]">
            {safePercentage.toFixed(1).replace('.', ',')}%
          </p>
        </div>

        <div className="text-right">
          <p className="text-[9px] font-semibold text-[#929e94]">
            Nilai Wj
          </p>

          <p className="mt-1 font-mono text-xs font-bold text-[#506b56]">
            {formatDecimal(criterion.normalizedWeight, 4)}
          </p>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7efe8]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#278449] to-[#63c87a]"
          style={{
            width: `${Math.min(
              Math.max(safePercentage, 0),
              100
            )}%`,
          }}
        />
      </div>

      {wasWeightNormalized && (
        <div className="mt-3 rounded-lg bg-white px-2.5 py-2 text-[9px] text-[#829087]">
          Bobot input:{' '}
          <strong className="font-mono text-[#506b56]">
            {formatDecimal(criterion.rawWeight, 3)}
          </strong>
        </div>
      )}
    </article>
  );
}

/* =========================================
   HEADER TABEL
========================================= */
function TableHeader({ children, align = 'left' }) {
  return (
    <th
      className={`whitespace-nowrap border-b border-[#e0eae1] bg-[#f2f8f3] px-4 py-3 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#637a68] ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

/* =========================================
   SEL TABEL
========================================= */
function TableCell({
  children,
  align = 'left',
  strong = false,
  highlight = false,
}) {
  return (
    <td
      className={`border-b border-[#edf2ed] px-4 py-3 text-[10px] ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${
        strong
          ? 'font-extrabold text-[#36563d]'
          : 'font-medium text-[#64766a]'
      } ${
        highlight ? 'bg-[#f1f8f2]' : ''
      }`}
    >
      {children}
    </td>
  );
}

/* =========================================
   KOMPONEN UTAMA RINCIAN SAW
========================================= */
export function SawStepTables({ sawResult }) {
  const [pageX, setPageX] = useState(1);
  const [pageR, setPageR] = useState(1);
  const [pageV, setPageV] = useState(1);

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

  /* Pagination */
  const paginate = (data, page) => {
    const start = (page - 1) * ROWS_PER_PAGE;

    return data.slice(
      start,
      start + ROWS_PER_PAGE
    );
  };

  const paginatedX = paginate(matriksAwal, pageX);
  const paginatedR = paginate(matriksNormalisasi, pageR);
  const paginatedV = paginate(rincianPreferensi, pageV);

  return (
    <div className="space-y-5">
      {/* INTRO DETAIL */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#dceade] bg-gradient-to-r from-[#eef8f0] to-[#f8fcf8] px-4 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#30844b] shadow-sm">
          <Calculator size={19} />
        </div>

        <div>
          <h2 className="text-xs font-extrabold text-[#285036]">
            Rincian proses perhitungan SAW
          </h2>

          <p className="mt-1 text-[10px] leading-5 text-[#718476]">
            Berikut seluruh tahapan perhitungan mulai dari penentuan
            bobot, penyusunan matriks keputusan, normalisasi,
            hingga perolehan nilai preferensi setiap alternatif.
          </p>
        </div>
      </div>

      {/* =====================================
          LANGKAH 1 & 2
      ===================================== */}
      <StepPanel
        id="saw-step-0102"
        number="01 & 02"
        icon={Scale}
        title="Alternatif, Kriteria, dan Bobot"
        description="Menampilkan sifat setiap kriteria, bobot input, dan bobot aktif yang digunakan dalam perhitungan."
        badge={
          <span className="rounded-full border border-[#dce9de] bg-[#f4f9f4] px-3 py-1.5 text-[9px] font-extrabold text-[#53705a]">
            {matriksAwal.length} Alternatif
          </span>
        }
      >
        <div className="p-5 sm:p-6">
          {wasWeightNormalized && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#f0e3c9] bg-[#fff9ef] px-3.5 py-3">
              <Info
                size={15}
                className="mt-0.5 shrink-0 text-[#a57935]"
              />

              <p className="text-[10px] leading-5 text-[#8e703e]">
                Total bobot input adalah{' '}
                <strong>
                  {formatDecimal(weightSum, 3)}
                </strong>
                {' '}dan sistem melakukan normalisasi otomatis
                agar jumlah bobot aktif menjadi 1,000.
              </p>
            </div>
          )}

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#77887a]">
              Bobot setiap kriteria
            </h4>

            <span className="rounded-full bg-[#eaf6ec] px-2.5 py-1 text-[9px] font-extrabold text-[#347d49]">
              Total 100%
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {bobotTernormalisasi.map((criterion) => (
              <WeightCard
                key={criterion.code}
                criterion={criterion}
                wasWeightNormalized={wasWeightNormalized}
              />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#e5ece5] bg-[#f9fbf9] p-3">
              <p className="text-[9px] font-semibold text-[#87948a]">
                Total bobot input
              </p>

              <p className="mt-1 font-mono text-base font-extrabold text-[#506b56]">
                {formatDecimal(weightSum, 3)}
              </p>
            </div>

            <div className="rounded-xl border border-[#d8eadd] bg-[#eff8f1] p-3">
              <p className="text-[9px] font-semibold text-[#718b76]">
                Total bobot aktif
              </p>

              <p className="mt-1 font-mono text-base font-extrabold text-[#287b44]">
                {formatDecimal(
                  bobotTernormalisasi.reduce(
                    (sum, item) =>
                      sum + item.normalizedWeight,
                    0
                  ),
                  4
                )}
              </p>
            </div>
          </div>
        </div>
      </StepPanel>

      {/* =====================================
          LANGKAH 3 — MATRIKS X
      ===================================== */}
      <StepPanel
        id="saw-step-03"
        number="03"
        icon={Database}
        title="Matriks Keputusan (X)"
        description="Nilai asli setiap smartphone berdasarkan keenam kriteria penilaian sebelum dilakukan normalisasi."
        badge={
          <span className="rounded-full border border-[#dce9de] bg-[#f4f9f4] px-3 py-1.5 text-[9px] font-extrabold text-[#53705a]">
            Matriks awal
          </span>
        }
      >
        <div className="border-b border-[#e6eee7] bg-[#fbfdfb] px-5 py-3 text-[9px] leading-5 text-[#839087] sm:px-6">
          Xij merupakan nilai asli alternatif ke-i pada kriteria ke-j.
          Nilai belum mengalami normalisasi.
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead>
              <tr>
                <TableHeader>Kode</TableHeader>
                <TableHeader>Alternatif Smartphone</TableHeader>

                {bobotTernormalisasi.map((criterion) => (
                  <TableHeader
                    key={criterion.code}
                    align="right"
                  >
                    <div>{criterion.code}</div>

                    <div className="mt-1 font-medium normal-case tracking-normal text-[#8a988d]">
                      {criterion.name}
                    </div>
                  </TableHeader>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedX.map((row) => (
                <tr
                  key={row.code}
                  className="transition hover:bg-[#f8fbf8]"
                >
                  <TableCell strong>
                    <span className="inline-flex rounded-md bg-[#edf5ee] px-2 py-1 text-[9px] font-extrabold text-[#3c754a]">
                      {row.code}
                    </span>
                  </TableCell>

                  <TableCell strong>
                    <div className="max-w-[190px] whitespace-normal leading-5">
                      {row.smartphone?.name ?? row.name}
                    </div>
                  </TableCell>

                  {bobotTernormalisasi.map((criterion) => (
                    <TableCell
                      key={criterion.code}
                      align="right"
                    >
                      {formatCriterionValue(
                        criterion.field,
                        row.values[criterion.code]
                      )}
                    </TableCell>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={pageX}
          totalPages={Math.ceil(
            matriksAwal.length / ROWS_PER_PAGE
          )}
          onPageChange={setPageX}
          totalItems={matriksAwal.length}
          itemsPerPage={ROWS_PER_PAGE}
        />
      </StepPanel>

      {/* =====================================
          LANGKAH 4 — MAXIMUM DAN MINIMUM
      ===================================== */}
      <StepPanel
        id="saw-step-04"
        number="04"
        icon={Target}
        title="Nilai Maksimum dan Minimum"
        description="Menentukan nilai acuan setiap kriteria untuk proses normalisasi."
        badge={
          <span className="rounded-full border border-[#dce9de] bg-[#f4f9f4] px-3 py-1.5 text-[9px] font-extrabold text-[#53705a]">
            Max / Min
          </span>
        }
      >
        <div className="p-5 sm:p-6">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2.5 rounded-xl border border-[#dcebdc] bg-[#f0f8f1] p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#35834d]">
                <ArrowUp size={16} />
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#327849]">
                  Benefit
                </p>

                <p className="mt-1 text-[9px] leading-5 text-[#728678]">
                  Menggunakan nilai maksimum (Max) sebagai
                  acuan normalisasi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-[#f0e5ce] bg-[#fff9ee] p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#a47835]">
                <ArrowDown size={16} />
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#9d742f]">
                  Cost
                </p>

                <p className="mt-1 text-[9px] leading-5 text-[#8f8060]">
                  Menggunakan nilai minimum (Min) sebagai
                  acuan normalisasi.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {nilaiMaxMin.map((item) => {
              const isCost =
                String(item.type).toLowerCase() === 'cost';

              return (
                <article
                  key={item.code}
                  className="rounded-2xl border border-[#e3ece4] bg-[#fbfdfb] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-extrabold text-[#8a988e]">
                        {item.code}
                      </span>

                      <h4 className="mt-1 text-xs font-extrabold text-[#34513b]">
                        {item.name}
                      </h4>
                    </div>

                    <TypeBadge type={item.type} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div
                      className={`rounded-xl border p-3 ${
                        isCost
                          ? 'border-[#f0e6d6] bg-[#fffaf1]'
                          : 'border-[#e3ece4] bg-white'
                      }`}
                    >
                      <p className="text-[9px] font-semibold text-[#929d93]">
                        Maksimum
                      </p>

                      <p className="mt-1 text-xs font-extrabold text-[#506b56]">
                        {formatCriterionValue(item.field, item.max)}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl border p-3 ${
                        isCost
                          ? 'border-[#e1eddf] bg-[#f0f8f1]'
                          : 'border-[#e3ece4] bg-white'
                      }`}
                    >
                      <p className="text-[9px] font-semibold text-[#929d93]">
                        Minimum
                      </p>

                      <p className="mt-1 text-xs font-extrabold text-[#506b56]">
                        {formatCriterionValue(item.field, item.min)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#eaf5ec] px-3 py-2.5">
                    <span className="text-[9px] font-bold text-[#66816b]">
                      Acuan dipakai
                    </span>

                    <span className="text-xs font-extrabold text-[#287b44]">
                      {item.extremaLabel}:{' '}
                      {formatCriterionValue(
                        item.field,
                        item.extrema
                      )}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </StepPanel>

      {/* =====================================
          LANGKAH 5 — MATRIKS R
      ===================================== */}
      <StepPanel
        id="saw-step-05"
        number="05"
        icon={Scale}
        title="Matriks Ternormalisasi (R)"
        description="Nilai asli dikonversi menjadi nilai normalisasi berdasarkan jenis Cost atau Benefit."
        badge={
          <span className="rounded-full border border-[#dce9de] bg-[#f4f9f4] px-3 py-1.5 text-[9px] font-extrabold text-[#53705a]">
            Hasil normalisasi
          </span>
        }
      >
        <div className="border-b border-[#e6eee7] bg-[#fbfdfb] px-5 py-3 sm:px-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-[#dcebdc] bg-[#f0f8f1] px-3 py-2.5">
              <span className="text-[9px] font-extrabold text-[#337b49]">
                Benefit
              </span>

              <code className="mt-1 block text-[10px] font-semibold text-[#486b50]">
                rᵢⱼ = xᵢⱼ / Max(xᵢⱼ)
              </code>
            </div>

            <div className="rounded-xl border border-[#f0e5ce] bg-[#fff9ee] px-3 py-2.5">
              <span className="text-[9px] font-extrabold text-[#a17631]">
                Cost
              </span>

              <code className="mt-1 block text-[10px] font-semibold text-[#8e774f]">
                rᵢⱼ = Min(xᵢⱼ) / xᵢⱼ
              </code>
            </div>
          </div>

          <p className="mt-2 text-[9px] text-[#87938a]">
            Seluruh hasil normalisasi ditampilkan dengan empat angka di belakang koma.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px] border-collapse text-left">
            <thead>
              <tr>
                <TableHeader>Kode</TableHeader>
                <TableHeader>Alternatif Smartphone</TableHeader>

                {bobotTernormalisasi.map((criterion) => {
                  const isCost =
                    String(criterion.type).toLowerCase() === 'cost';

                  return (
                    <TableHeader
                      key={criterion.code}
                      align="right"
                    >
                      <div>{criterion.code}</div>

                      <div className="mt-1 font-medium normal-case tracking-normal text-[#8a988d]">
                        {isCost ? 'Min ÷ X' : 'X ÷ Max'}
                      </div>
                    </TableHeader>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {paginatedR.map((row) => (
                <tr
                  key={row.code}
                  className="transition hover:bg-[#f8fbf8]"
                >
                  <TableCell strong>
                    <span className="inline-flex rounded-md bg-[#edf5ee] px-2 py-1 text-[9px] font-extrabold text-[#3c754a]">
                      {row.code}
                    </span>
                  </TableCell>

                  <TableCell strong>
                    <div className="max-w-[190px] whitespace-normal leading-5">
                      {row.smartphone?.name ?? row.name}
                    </div>
                  </TableCell>

                  {bobotTernormalisasi.map((criterion) => (
                    <TableCell
                      key={criterion.code}
                      align="right"
                    >
                      <span className="font-mono text-[11px] font-bold text-[#39784b]">
                        {formatDecimal(
                          row.values[criterion.code],
                          4
                        )}
                      </span>
                    </TableCell>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={pageR}
          totalPages={Math.ceil(
            matriksNormalisasi.length / ROWS_PER_PAGE
          )}
          onPageChange={setPageR}
          totalItems={matriksNormalisasi.length}
          itemsPerPage={ROWS_PER_PAGE}
        />
      </StepPanel>

      {/* =====================================
          LANGKAH 6 — NILAI PREFERENSI
      ===================================== */}
      <StepPanel
        id="saw-step-06"
        number="06"
        icon={Trophy}
        title="Perhitungan Nilai Preferensi (Vᵢ)"
        description="Hasil perkalian bobot aktif dengan nilai normalisasi pada setiap kriteria, kemudian dijumlahkan menjadi skor akhir."
        badge={
          <span className="rounded-full border border-[#dce9de] bg-[#f4f9f4] px-3 py-1.5 text-[9px] font-extrabold text-[#53705a]">
            Skor akhir
          </span>
        }
      >
        <div className="border-b border-[#e6eee7] bg-[#fbfdfb] px-5 py-3 sm:px-6">
          <div className="rounded-xl border border-[#dcebdd] bg-[#eff8f1] px-3.5 py-3">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#488257]">
              Rumus nilai preferensi
            </p>

            <code className="mt-1.5 block text-xs font-bold text-[#2e7043]">
              Vᵢ = Σ (Wⱼ × rᵢⱼ)
            </code>

            <p className="mt-1 text-[9px] leading-5 text-[#7a907e]">
              Total setiap nilai perkalian menjadi skor preferensi
              alternatif yang digunakan dalam perangkingan.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr>
                <TableHeader>Kode</TableHeader>
                <TableHeader>Alternatif Smartphone</TableHeader>

                {bobotTernormalisasi.map((criterion) => (
                  <TableHeader
                    key={criterion.code}
                    align="right"
                  >
                    <div>
                      W × {criterion.code}
                    </div>

                    <div className="mt-1 font-mono text-[9px] font-medium normal-case tracking-normal text-[#8a988d]">
                      {formatDecimal(
                        criterion.normalizedWeight,
                        4
                      )}
                    </div>
                  </TableHeader>
                ))}

                <TableHeader align="right">
                  Total Vᵢ
                </TableHeader>
              </tr>
            </thead>

            <tbody>
              {paginatedV.map((row) => (
                <tr
                  key={row.code}
                  className="transition hover:bg-[#f8fbf8]"
                >
                  <TableCell strong>
                    <span className="inline-flex rounded-md bg-[#edf5ee] px-2 py-1 text-[9px] font-extrabold text-[#3c754a]">
                      {row.code}
                    </span>
                  </TableCell>

                  <TableCell strong>
                    <div className="max-w-[190px] whitespace-normal leading-5">
                      {row.smartphone?.name ?? row.name}
                    </div>
                  </TableCell>

                  {bobotTernormalisasi.map((criterion) => (
                    <TableCell
                      key={criterion.code}
                      align="right"
                    >
                      <span className="font-mono text-[10px]">
                        {formatDecimal(
                          row.weightedValues[criterion.code],
                          4
                        )}
                      </span>
                    </TableCell>
                  ))}

                  <TableCell
                    align="right"
                    strong
                    highlight
                  >
                    <span className="font-mono text-xs font-extrabold text-[#287b44]">
                      {formatDecimal(row.totalScore, 4)}
                    </span>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={pageV}
          totalPages={Math.ceil(
            rincianPreferensi.length / ROWS_PER_PAGE
          )}
          onPageChange={setPageV}
          totalItems={rincianPreferensi.length}
          itemsPerPage={ROWS_PER_PAGE}
        />
      </StepPanel>

      {/* PENJELASAN PENUTUP */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#dceade] bg-[#f0f8f1] px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#33834c]">
          <CheckCircle2 size={18} />
        </div>

        <div>
          <h4 className="text-[10px] font-extrabold text-[#327849]">
            Perhitungan selesai
          </h4>

          <p className="mt-1 text-[10px] leading-5 text-[#738777]">
            Seluruh nilai preferensi telah diperoleh melalui
            tahapan SAW. Nilai Vᵢ yang lebih tinggi menunjukkan
            peringkat alternatif yang lebih baik.
          </p>
        </div>
      </div>
    </div>
  );
}
