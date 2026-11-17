
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Filter,
  Info,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Smartphone,
  Square,
  Trophy,
  Wallet,
  X,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { CalculationSkeleton } from '../components/Skeleton';
import { SawStepTables } from '../components/SawStepTables';
import { SourceBadge } from '../components/SmartphoneBadges';
import { useAuth } from '../hooks/useAuth';
import { useSawExecution } from '../hooks/useSawExecution';
import { formatDecimal, formatRupiah } from '../utils/formatters';

const BUDGET_PRESETS = [
  { label: 'Semua harga', value: '' },
  { label: '≤ Rp 2 juta', value: '2000000' },
  { label: '≤ Rp 3 juta', value: '3000000' },
  { label: '≤ Rp 4 juta', value: '4000000' },
  { label: '≤ Rp 5 juta', value: '5000000' },
  { label: '≤ Rp 8 juta', value: '8000000' },
];

const CALCULATION_STEPS = [
  {
    id: 'saw-step-0102',
    number: '01–02',
    title: 'Alternatif, kriteria, dan bobot',
    description: 'Menentukan HP yang dihitung serta bobot aktif setiap kriteria.',
  },
  {
    id: 'saw-step-03',
    number: '03',
    title: 'Matriks keputusan (X)',
    description: 'Melihat nilai asli setiap smartphone pada seluruh kriteria.',
  },
  {
    id: 'saw-step-04',
    number: '04',
    title: 'Nilai maksimum dan minimum',
    description: 'Menentukan acuan Max untuk Benefit dan Min untuk Cost.',
  },
  {
    id: 'saw-step-05',
    number: '05',
    title: 'Matriks normalisasi (R)',
    description: 'Mengubah nilai agar dapat dibandingkan pada skala yang sama.',
  },
  {
    id: 'saw-step-06',
    number: '06',
    title: 'Nilai preferensi (Vᵢ)',
    description: 'Mengalikan nilai normalisasi dengan bobot untuk memperoleh skor.',
  },
];

function SummaryCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-[20px] border border-[#e1ebe2] bg-white p-4 shadow-[0_6px_18px_rgba(30,70,40,0.035)]">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf6ef] text-[#347c49]">
          <Icon size={17} />
        </span>
        <span className="text-xs font-bold text-[#819084]">{label}</span>
      </div>
      <p className="mt-3 text-xl font-extrabold tracking-tight text-[#294d34]">
        {value}
      </p>
      <p className="mt-1 text-xs leading-4 text-[#8b988e]">{detail}</p>
    </div>
  );
}

function PanelHeading({ icon: Icon, eyebrow, title, description, trailing }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf6ef] text-[#347c49]">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#6b9675]">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-0.5 text-sm font-extrabold leading-snug text-[#294d34] sm:text-base">
            {title}
          </h2>
          {description && (
            <p className="mt-1 max-w-2xl text-xs leading-5 text-[#819084]">
              {description}
            </p>
          )}
        </div>
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}

export default function Perhitungan() {
  const { user, isAdmin } = useAuth();
  const {
    criteria,
    completePhones,
    incompleteCount,
    eligiblePhones,
    selectedPhones,
    maxBudget,
    parsedBudget,
    weightMode,
    customWeights,
    customWeightSum,
    deselectedIds,
    sawResult,
    loading,
    error,
    setMaxBudget,
    setWeightMode,
    setCustomWeight,
    applyCriteriaAsCustom,
    toggleSmartphoneId,
    selectAllIds,
    deselectIds,
    resetSession,
  } = useSawExecution();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredPhones = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return eligiblePhones;

    return eligiblePhones.filter((phone) =>
      String(phone.name || '').toLowerCase().includes(keyword)
    );
  }, [eligiblePhones, searchTerm]);

  const bestResult = sawResult?.rekomendasiTerbaik;
  const bestPhone = bestResult?.smartphone;

  if (loading) {
    return <CalculationSkeleton />;
  }

  let emptyTitle = 'Perhitungan belum dapat dijalankan';
  let emptyDescription = 'Periksa kembali pilihan alternatif dan bobot kriteria.';

  if (criteria.length === 0) {
    emptyTitle = 'Kriteria belum tersedia';
    emptyDescription = 'Data kriteria belum berhasil dimuat. Periksa koneksi dan data aplikasi.';
  } else if (completePhones.length === 0) {
    emptyTitle = 'Belum ada smartphone dengan spesifikasi lengkap';
    emptyDescription = 'Lengkapi seluruh spesifikasi yang dibutuhkan pada halaman Data Penilaian.';
  } else if (eligiblePhones.length === 0) {
    emptyTitle = 'Tidak ada alternatif yang memenuhi budget';
    emptyDescription = 'Naikkan batas budget atau pilih opsi Semua harga untuk menampilkan alternatif lainnya.';
  } else if (selectedPhones.length === 0) {
    emptyTitle = 'Belum ada alternatif yang dipilih';
    emptyDescription = 'Pilih setidaknya satu smartphone pada panel Alternatif yang Dihitung.';
  } else if (isAdmin && weightMode === 'custom' && customWeightSum <= 0) {
    emptyTitle = 'Total bobot kustom masih nol';
    emptyDescription = 'Masukkan bobot lebih dari nol pada minimal satu kriteria agar perhitungan dapat dilakukan.';
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Proses Perhitungan SAW"
        description="Atur alternatif dan bobot, lalu telusuri setiap tahapan perhitungan untuk memahami hasil rekomendasi smartphone."
        kicker="ANALISIS DAN PERHITUNGAN"
        badge={
          <span className="rounded-full border border-[#d9e9dc] bg-[#eef7ef] px-2.5 py-1 text-xs font-extrabold text-[#367b49]">
            Metode SAW
          </span>
        }
        action={
          <button
            type="button"
            onClick={() => resetSession(criteria)}
            className="sd-button-light inline-flex min-h-[38px] items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition sm:text-sm"
          >
            <RotateCcw size={14} />
            Reset pengaturan
          </button>
        }
      />

      {/* Banner pengantar */}
      <section className="relative overflow-hidden rounded-[26px] border border-[#dceade] bg-gradient-to-br from-[#eef7ef] via-white to-[#eaf4ec] p-5 shadow-[0_10px_28px_rgba(30,80,43,0.045)] sm:p-6">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8e9db] bg-white/80 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#438154]">
              <Calculator size={12} />
              Ruang perhitungan
            </span>
            <h2 className="mt-3 text-lg font-extrabold leading-snug tracking-tight text-[#244832] sm:text-xl">
              Kenali proses di balik rekomendasi HP.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#718477] sm:text-xs">
              Tentukan batas harga dan alternatif yang ingin dibandingkan.
              Sistem kemudian menyusun matriks, melakukan normalisasi, dan
              menghitung nilai preferensi menggunakan data yang tersedia.
            </p>
          </div>
          <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-[26px] border border-white/80 bg-white/70 text-[#39804d] shadow-[0_8px_24px_rgba(40,100,55,0.07)] sm:flex">
            <Calculator size={42} strokeWidth={1.5} />
          </div>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full border-[24px] border-white/30" />
        <div className="pointer-events-none absolute -bottom-16 right-20 h-40 w-40 rounded-full bg-[#d9eddd]/40 blur-2xl" />
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#f0d9d6] bg-[#fff7f6] px-4 py-3 text-xs text-[#a54a42]"
        >
          <AlertTriangle size={17} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-extrabold">Data perhitungan tidak berhasil dimuat</p>
            <p className="mt-1 leading-5">{error}</p>
          </div>
        </div>
      )}

      {/* Ringkasan kondisi perhitungan */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard
          icon={Smartphone}
          label="Alternatif terpilih"
          value={`${selectedPhones.length} / ${eligiblePhones.length}`}
          detail="Smartphone yang masuk perhitungan"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Data lengkap"
          value={completePhones.length}
          detail="Memiliki seluruh spesifikasi kriteria"
        />
        <SummaryCard
          icon={SlidersHorizontal}
          label="Kriteria aktif"
          value={criteria.length}
          detail="Kriteria yang digunakan oleh SAW"
        />
        <SummaryCard
          icon={Wallet}
          label="Batas budget"
          value={parsedBudget ? formatRupiah(parsedBudget) : 'Tanpa batas'}
          detail={parsedBudget ? 'Harga maksimum alternatif' : 'Semua rentang harga'}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Pengaturan budget dan bobot */}
        <div className="rounded-[24px] border border-[#e1ebe2] bg-white p-4 shadow-[0_7px_22px_rgba(25,68,39,0.04)] sm:p-5">
          <PanelHeading
            icon={Filter}
            eyebrow="Pengaturan 01"
            title="Budget dan bobot kriteria"
            description="Atur rentang harga smartphone dan metode pembobotan yang digunakan dalam perhitungan."
          />

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Wallet size={14} className="text-[#488357]" />
              <h3 className="text-sm font-extrabold text-[#3d5b43]">
                Budget maksimal
              </h3>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset.value || 'all'}
                  type="button"
                  onClick={() => setMaxBudget(preset.value)}
                  aria-pressed={maxBudget === preset.value}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-extrabold transition ${
                    maxBudget === preset.value
                      ? 'border-[#216e3c] bg-[#216e3c] text-white shadow-[0_4px_12px_rgba(33,110,60,0.16)]'
                      : 'border-[#e1ebe2] bg-[#fbfdfb] text-[#64766a] hover:border-[#bfd9c4] hover:bg-[#f3f8f3]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <label
              htmlFor="budget-custom"
              className="mb-1.5 mt-2 block text-xs font-bold text-[#718477]"
            >
              Atau masukkan budget sendiri (Rupiah)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#8b9b8e]">
                Rp
              </span>
              <input
                id="budget-custom"
                type="number"
                min="0"
                step="100000"
                value={maxBudget}
                onChange={(event) => setMaxBudget(event.target.value)}
                placeholder="Kosongkan untuk semua harga"
                className="min-h-[42px] w-full rounded-xl border border-[#dfe9e0] bg-[#fbfdfb] py-2 pl-10 pr-3 text-xs font-semibold text-[#36543d] outline-none transition placeholder:font-normal placeholder:text-[#a0aba2] focus:border-[#80b78b] focus:ring-4 focus:ring-[#e7f3e9]"
              />
            </div>
          </div>

          {isAdmin ? (
            <div className="mt-5 border-t border-[#edf2ed] pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-[#488357]" />
                  <h3 className="text-sm font-extrabold text-[#3d5b43]">
                    Mode bobot kriteria
                  </h3>
                </div>
                {weightMode === 'custom' && (
                  <button
                    type="button"
                    onClick={() => applyCriteriaAsCustom(criteria)}
                    className="text-xs font-extrabold text-[#397b4b] hover:underline"
                  >
                    Samakan ke standar
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWeightMode('default')}
                  aria-pressed={weightMode === 'default'}
                  className={`min-h-[39px] rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
                    weightMode === 'default'
                      ? 'border-[#b9d9bf] bg-[#edf7ef] text-[#2f7443]'
                      : 'border-[#e3ebe4] bg-white text-[#7b897e] hover:bg-[#f8fbf8]'
                  }`}
                >
                  Bobot standar
                </button>
                <button
                  type="button"
                  onClick={() => setWeightMode('custom')}
                  aria-pressed={weightMode === 'custom'}
                  className={`min-h-[39px] rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
                    weightMode === 'custom'
                      ? 'border-[#b9d9bf] bg-[#edf7ef] text-[#2f7443]'
                      : 'border-[#e3ebe4] bg-white text-[#7b897e] hover:bg-[#f8fbf8]'
                  }`}
                >
                  Bobot kustom
                </button>
              </div>

              {weightMode === 'custom' && (
                <div className="mt-3 rounded-2xl border border-[#e6eee7] bg-[#f8fbf8] p-3.5">
                  <div className="flex items-start gap-2 rounded-xl border border-[#e1ece2] bg-white px-3 py-2.5">
                    <Info size={14} className="mt-0.5 shrink-0 text-[#6f9678]" />
                    <p className="text-xs leading-5 text-[#7c8b7f]">
                      Masukkan bobot dalam bentuk desimal atau skala 0–100.
                      Jika totalnya bukan 1, sistem akan menormalisasi bobot
                      dengan rumus Wⱼ = wⱼ / Σwⱼ. Bobot standar di database
                      tidak berubah.
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {criteria.map((criterion) => (
                      <div key={criterion.code}>
                        <label
                          htmlFor={`cw-${criterion.code}`}
                          className="mb-1 block text-xs font-extrabold text-[#657a69]"
                        >
                          {criterion.code} · {criterion.name}
                        </label>
                        <input
                          id={`cw-${criterion.code}`}
                          type="number"
                          min="0"
                          step="any"
                          value={customWeights[criterion.code] ?? ''}
                          onChange={(event) =>
                            setCustomWeight(criterion.code, event.target.value)
                          }
                          className="min-h-[38px] w-full rounded-lg border border-[#dfe9e0] bg-white px-3 py-2 text-xs font-semibold text-[#36543d] outline-none transition focus:border-[#80b78b] focus:ring-4 focus:ring-[#e7f3e9]"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5">
                    <span className="text-xs font-bold text-[#718477]">
                      Total input bobot
                    </span>
                    <span
                      className={`font-mono text-xs font-extrabold ${
                        customWeightSum > 0 ? 'text-[#347c49]' : 'text-[#b94e45]'
                      }`}
                    >
                      {formatDecimal(customWeightSum, 3)}
                    </span>
                  </div>
                  {customWeightSum <= 0 && (
                    <p className="mt-2 text-xs font-semibold text-[#b94e45]">
                      Minimal satu kriteria harus memiliki bobot lebih dari nol.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#e5eee6] bg-[#f7faf7] px-3 py-2.5">
              <Info size={14} className="mt-0.5 shrink-0 text-[#719078]" />
              <p className="text-xs leading-5 text-[#7b897e]">
                Perhitungan menggunakan bobot standar yang telah ditetapkan
                pada data kriteria.
              </p>
            </div>
          )}
        </div>

        {/* Pemilihan alternatif */}
        <div className="rounded-[24px] border border-[#e1ebe2] bg-white p-4 shadow-[0_7px_22px_rgba(25,68,39,0.04)] sm:p-5">
          <PanelHeading
            icon={Smartphone}
            eyebrow="Pengaturan 02"
            title="Alternatif yang dihitung"
            description="Pilih smartphone dengan spesifikasi lengkap yang ingin disertakan dalam perhitungan SAW."
            trailing={
              <span className="rounded-full border border-[#dceade] bg-[#f0f8f1] px-2.5 py-1 text-xs font-extrabold text-[#347c49]">
                {selectedPhones.length} dipilih
              </span>
            }
          />

          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-[#88958a]">
              {parsedBudget
                ? `Daftar dibatasi pada harga maksimal ${formatRupiah(parsedBudget)}.`
                : `Menampilkan ${completePhones.length} smartphone dengan spesifikasi lengkap.`}
            </p>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                type="button"
                onClick={selectAllIds}
                disabled={eligiblePhones.length === 0}
                className="text-xs font-extrabold text-[#347c49] transition hover:underline disabled:opacity-40"
              >
                Pilih semua
              </button>
              <span className="h-3 w-px bg-[#dce6dd]" />
              <button
                type="button"
                onClick={() => deselectIds(eligiblePhones.map((phone) => phone.id))}
                disabled={eligiblePhones.length === 0 || selectedPhones.length === 0}
                className="text-xs font-extrabold text-[#89958b] transition hover:text-[#b45b52] disabled:opacity-40"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <div className="relative mb-3">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#93a095]"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari nama smartphone..."
              aria-label="Cari nama smartphone"
              className="min-h-[40px] w-full rounded-xl border border-[#e1ebe2] bg-[#fbfdfb] py-2 pl-9 pr-10 text-sm font-medium text-[#36543d] outline-none transition placeholder:text-[#a0aba2] focus:border-[#80b78b] focus:ring-4 focus:ring-[#e7f3e9]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#87968a] hover:bg-[#edf5ee] hover:text-[#347c49]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-[#87958a]">
              {filteredPhones.length} dari {eligiblePhones.length} smartphone
            </span>
            <span className="text-xs font-semibold text-[#9aa59c]">
              Tekan kartu untuk memilih
            </span>
          </div>

          <div className="grid max-h-[350px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-1">
            {filteredPhones.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-[#dce7dd] bg-[#fafcfa] px-4 py-8 text-center">
                <Search size={20} className="mx-auto text-[#a0b0a3]" />
                <p className="mt-2 text-xs font-bold text-[#718477]">
                  {eligiblePhones.length === 0
                    ? 'Tidak ada smartphone yang memenuhi filter budget.'
                    : 'Nama smartphone tidak ditemukan.'}
                </p>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-xs font-extrabold text-[#347c49] hover:underline"
                  >
                    Hapus pencarian
                  </button>
                )}
              </div>
            ) : (
              filteredPhones.map((phone) => {
                const checked = !deselectedIds.includes(phone.id);

                return (
                  <button
                    key={phone.id}
                    type="button"
                    onClick={() => toggleSmartphoneId(phone.id)}
                    aria-pressed={checked}
                    className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      checked
                        ? 'border-[#c5dfca] bg-[#f1f8f2] shadow-[0_3px_10px_rgba(40,100,55,0.04)]'
                        : 'border-[#e7eee7] bg-white hover:border-[#cbdccd] hover:bg-[#fbfdfb]'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                        checked
                          ? 'bg-[#287b44] text-white'
                          : 'bg-[#f0f3f0] text-[#9aa59c]'
                      }`}
                    >
                      {checked ? <CheckSquare size={16} /> : <Square size={16} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-extrabold text-[#36543d]">
                        {phone.name}
                      </span>
                      <span className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-[#78877b]">
                          {formatRupiah(phone.price)}
                        </span>
                        <SourceBadge
                          ownerId={phone.user_id}
                          currentUserId={user?.id}
                        />
                      </span>
                    </span>
                    {checked && (
                      <CheckCircle2 size={15} className="shrink-0 text-[#438653]" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {incompleteCount > 0 && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#f0e5cf] bg-[#fffaf0] px-3 py-2.5">
              <Info size={14} className="mt-0.5 shrink-0 text-[#a57d3d]" />
              <p className="text-xs leading-5 text-[#92784d]">
                {incompleteCount} smartphone belum memiliki seluruh spesifikasi
                yang dibutuhkan sehingga tidak ditampilkan dalam daftar ini.{' '}
                <Link
                  to="/penilaian"
                  className="font-extrabold text-[#8b6a34] underline underline-offset-2"
                >
                  Lengkapi di Data Penilaian
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>

      {selectedPhones.length === 1 && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#f0e5cf] bg-[#fffaf0] px-4 py-3 text-xs text-[#92784d]">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p className="leading-5">
            Saat ini baru satu alternatif yang dipilih. Perhitungan tetap dapat
            ditampilkan, tetapi pilih minimal dua smartphone agar perbandingan
            nilai normalisasi lebih bermakna.
          </p>
        </div>
      )}

      {sawResult.isReady ? (
        <>
          {bestPhone && (
            <section className="overflow-hidden rounded-[24px] border border-[#d8e9dc] bg-gradient-to-r from-[#edf7ef] via-white to-[#f5faf5] p-4 shadow-[0_8px_24px_rgba(32,87,47,0.045)] sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#287b44] text-white shadow-[0_5px_14px_rgba(40,123,68,0.18)]">
                    <Trophy size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#54835e]">
                      Nilai preferensi tertinggi saat ini
                    </p>
                    <h2 className="mt-1 break-words text-base font-extrabold leading-snug text-[#294d34] sm:text-lg">
                      {bestPhone.name}
                    </h2>
                    <p className="mt-1 text-xs text-[#7d8c80]">
                      {formatRupiah(bestPhone.price)} · Dari {selectedPhones.length}{' '}
                      alternatif terpilih
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#e1ece2] bg-white/90 px-4 py-3 sm:min-w-[150px] sm:text-right">
                  <p className="text-xs font-bold text-[#819084]">
                    Skor preferensi (Vᵢ)
                  </p>
                  <p className="mt-1 font-mono text-xl font-extrabold text-[#287b44]">
                    {formatDecimal(bestResult.totalScore, 4)}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Navigasi menuju bagian rincian SAW */}
          <section className="rounded-[24px] border border-[#e1ebe2] bg-white p-4 shadow-[0_7px_22px_rgba(25,68,39,0.04)] sm:p-5">
            <PanelHeading
              icon={Calculator}
              eyebrow="Urutan pemeriksaan"
              title="Alur perhitungan SAW"
              description="Pilih salah satu bagian untuk langsung menuju rincian tahap tersebut. Semua nilai di bawah berasal dari hasil perhitungan yang sama."
            />
            <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2">
              {CALCULATION_STEPS.map((step, index) => (
                <a
                  key={step.id}
                  href={`#${step.id}`}
                  className="group min-w-[205px] max-w-[235px] flex-1 snap-start rounded-2xl border border-[#e4ece5] bg-[#fbfdfb] p-3.5 transition hover:border-[#bcd9c2] hover:bg-[#f2f8f3]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-[#eaf4ec] px-2 py-1 text-xs font-extrabold text-[#397b4b]">
                      {step.number}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-[#9aab9d] transition group-hover:translate-x-0.5 group-hover:text-[#397b4b]"
                    />
                  </div>
                  <p className="mt-3 text-xs font-extrabold leading-snug text-[#36543d]">
                    {step.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-[#849188]">
                    {step.description}
                  </p>
                  {index === 0 && (
                    <p className="mt-2 text-sm font-extrabold text-[#4a8758]">
                      Awal proses
                    </p>
                  )}
                </a>
              ))}
            </div>
          </section>

          <SawStepTables sawResult={sawResult} />

          <section className="flex flex-col gap-3 rounded-[22px] border border-[#dceade] bg-[#f1f8f2] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#347c49]">
                <CheckCircle2 size={19} />
              </span>
              <div>
                <h3 className="text-xs font-extrabold text-[#315b3b]">
                  Rincian perhitungan berhasil disusun
                </h3>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-[#758879]">
                  Matriks keputusan, acuan normalisasi, nilai R, dan nilai
                  preferensi dapat diperiksa pada bagian di atas. Buka halaman
                  hasil untuk melihat urutan peringkat seluruh alternatif.
                </p>
              </div>
            </div>
            <Link
              to="/hasil"
              className="sd-button-dark inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition sm:text-sm"
            >
              Lihat hasil dan ranking
              <ArrowRight size={15} />
            </Link>
          </section>
        </>
      ) : (
        <section className="rounded-[24px] border border-dashed border-[#cddfce] bg-white px-5 py-10 text-center shadow-[0_7px_22px_rgba(25,68,39,0.025)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf6ef] text-[#428052]">
            <Calculator size={25} />
          </span>
          <h2 className="mt-4 text-sm font-extrabold text-[#31513a]">
            {emptyTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-xs leading-6 text-[#87958a]">
            {emptyDescription}
          </p>

          {eligiblePhones.length > 0 && selectedPhones.length === 0 && (
            <button
              type="button"
              onClick={selectAllIds}
              className="sd-button-dark mt-4 inline-flex min-h-[38px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold"
            >
              Pilih semua alternatif
              <ArrowRight size={14} />
            </button>
          )}

          {completePhones.length === 0 && incompleteCount > 0 && (
            <Link
              to="/penilaian"
              className="sd-button-dark mt-4 inline-flex min-h-[38px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold"
            >
              Buka Data Penilaian
              <ArrowRight size={14} />
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
