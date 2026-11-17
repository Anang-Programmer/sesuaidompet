
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BookmarkCheck,
  Calculator,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Crown,
  Info,
  LoaderCircle,
  Save,
  SlidersHorizontal,
  Smartphone,
  Trophy,
  Wallet,
} from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { ResultsSkeleton } from '../components/Skeleton';
import { RankingTable } from '../components/RankingTable';
import { useAuth } from '../hooks/useAuth';
import { useSawExecution } from '../hooks/useSawExecution';
import { createHistory } from '../services/spkService';
import {
  formatCriterionValue,
  formatDecimal,
  formatRupiah,
} from '../utils/formatters';

/* =========================================
   JUDUL DEFAULT RIWAYAT
========================================= */
function buildDefaultTitle(parsedBudget) {
  const dateLabel = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  if (parsedBudget) {
    return `Rekomendasi Budget ≤ ${formatRupiah(parsedBudget)} (${dateLabel})`;
  }

  return `Rekomendasi Smartphone SAW (${dateLabel})`;
}

/* =========================================
   KARTU RINGKASAN
========================================= */
function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}) {
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
   INFORMASI SPESIFIKASI PEMENANG
========================================= */
function SpecificationCard({ criterion, smartphone }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#e3ece4] bg-white p-3 transition hover:border-[#c7ddca] hover:bg-[#fbfdfb]">
      <div className="flex items-center gap-1.5">
        <span className="rounded-md bg-[#edf5ee] px-1.5 py-1 text-sm font-extrabold text-[#598064]">
          {criterion.code}
        </span>

        <span className="min-w-0 truncate text-xs font-bold text-[#849188]">
          {criterion.name}
        </span>
      </div>

      <p className="mt-2 break-words text-xs font-extrabold leading-snug text-[#31583b]">
        {formatCriterionValue(
          criterion.field,
          smartphone?.[criterion.field]
        )}
      </p>
    </div>
  );
}

/* =========================================
   BADGE PARAMETER
========================================= */
function ParameterBadge({ children, icon: Icon }) {
  return (
    <span className="inline-flex min-h-[28px] items-center gap-1.5 rounded-full border border-[#e0e9e1] bg-white px-3 py-1.5 text-xs font-bold text-[#64786a]">
      {Icon && <Icon size={11} className="text-[#52805c]" />}
      {children}
    </span>
  );
}

/* =========================================
   KOMPONEN UTAMA
========================================= */
export default function Hasil() {
  const { user, isAdmin } = useAuth();

  const {
    criteria,
    parsedBudget,
    weightMode,
    sawResult,
    loading,
    error,
  } = useSawExecution();

  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const top = sawResult?.rekomendasiTerbaik;
  const rankingRows = sawResult?.hasilAkhir ?? [];
  const isReady = Boolean(sawResult?.isReady && top);

  /* =====================================
     SIMPAN HASIL KE RIWAYAT
  ===================================== */
  async function handleSaveHistory(event) {
    event.preventDefault();

    if (!isReady || !top) {
      return;
    }

    if (!user?.id) {
      setSaveError(
        'Akun pengguna tidak ditemukan. Silakan login kembali.'
      );
      return;
    }

    setSaving(true);
    setSaveError('');
    setSavedSuccess(false);

    const finalTitle =
      title.trim() || buildDefaultTitle(parsedBudget);

    const weightsUsed = sawResult.bobotTernormalisasi.map(
      (criterion) => ({
        code: criterion.code,
        name: criterion.name,
        type: criterion.type,
        rawWeight: Number(criterion.rawWeight),
        normalizedWeight: Number(
          criterion.normalizedWeight.toFixed(4)
        ),
      })
    );

    /*
     * Struktur snapshot dipertahankan sesuai format
     * yang digunakan oleh spkService dan halaman Riwayat.
     */
    const resultsSnapshot = {
      wasWeightNormalized: sawResult.wasWeightNormalized,
      weightSum: sawResult.weightSum,

      bobotTernormalisasi: sawResult.bobotTernormalisasi,

      nilaiMaxMin: sawResult.nilaiMaxMin,

      matriksAwal: sawResult.matriksAwal.map((row) => ({
        code: row.code,
        name: row.smartphone.name,
        values: row.values,
      })),

      matriksNormalisasi: sawResult.matriksNormalisasi.map(
        (row) => ({
          code: row.code,
          name: row.smartphone.name,
          values: row.values,
        })
      ),

      rincianPreferensi: sawResult.rincianPreferensi.map(
        (row) => ({
          code: row.code,
          name: row.smartphone.name,
          weightedValues: row.weightedValues,
          totalScore: row.totalScore,
        })
      ),

      hasilAkhir: sawResult.hasilAkhir.map((row) => ({
        rank: row.rank,
        code: row.code,
        name: row.smartphone.name,
        price: row.smartphone.price,
        totalScore: row.totalScore,
      })),
    };

    try {
      await createHistory({
        user_id: user.id,
        title: finalTitle,
        max_budget: parsedBudget,
        weights_used: weightsUsed,
        top_smartphone_name: top.smartphone.name,
        top_score: Number(top.totalScore.toFixed(4)),
        results_snapshot: resultsSnapshot,
      });

      setSavedSuccess(true);
      setTitle('');
    } catch (err) {
      setSaveError(
        err.message ||
          'Gagal menyimpan riwayat perhitungan.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ResultsSkeleton />;
  }

  /* =====================================
     TAMPILAN UTAMA
  ===================================== */
  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        kicker="Keputusan akhir"
        title="Hasil Rekomendasi & Perankingan"
        description="Lihat smartphone dengan nilai preferensi tertinggi dan urutan ranking seluruh alternatif berdasarkan perhitungan metode SAW."
        badge={
          <span className="rounded-full border border-[#d9e9dc] bg-[#eef7ef] px-2.5 py-1 text-xs font-extrabold text-[#367b49]">
            Tahap 7 & 8 SAW
          </span>
        }
        action={
          <Link
            to="/perhitungan"
            className="sd-button-light inline-flex min-h-[38px] items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition sm:text-sm"
          >
            <Calculator size={14} />
            Detail perhitungan
            <ChevronRight size={13} />
          </Link>
        }
      />

      {/* ERROR DATA */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#f0d9d6] bg-[#fff7f6] px-4 py-3 text-xs text-[#a54a42]"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-extrabold">
              Hasil perhitungan tidak berhasil dimuat
            </p>

            <p className="mt-1 leading-5">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* RINGKASAN PARAMETER */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard
          icon={Smartphone}
          label="Alternatif dinilai"
          value={rankingRows.length}
          description="Smartphone yang masuk perhitungan SAW"
        />

        <SummaryCard
          icon={Wallet}
          label="Batas budget"
          value={
            parsedBudget
              ? formatRupiah(parsedBudget)
              : 'Semua harga'
          }
          description="Rentang harga yang digunakan"
        />

        <SummaryCard
          icon={ClipboardList}
          label="Kriteria aktif"
          value={criteria.length}
          description="Kriteria penilaian smartphone"
        />

        <SummaryCard
          icon={SlidersHorizontal}
          label="Metode bobot"
          value={
            isAdmin && weightMode === 'custom'
              ? 'Kustom'
              : 'Standar'
          }
          description={
            isAdmin && weightMode === 'custom'
              ? 'Bobot khusus yang diatur Admin'
              : 'Bobot standar dari data kriteria'
          }
        />
      </section>

      {isReady ? (
        <>
          {/* =================================
              REKOMENDASI TERBAIK
          ================================= */}
          <section className="relative overflow-hidden rounded-[26px] border border-[#cfe4d3] bg-gradient-to-br from-[#eaf6ec] via-white to-[#f3faf4] p-4 shadow-[0_10px_28px_rgba(30,80,43,0.055)] sm:p-6">
            <div className="pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full border-[30px] border-white/50" />
            <div className="pointer-events-none absolute -bottom-20 right-28 h-48 w-48 rounded-full bg-[#d9eddd]/50 blur-3xl" />

            <div className="relative z-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#338c4e] to-[#1d6839] text-white shadow-[0_6px_16px_rgba(37,117,61,0.2)]">
                    <Trophy size={23} />
                  </div>

                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d3e7d6] bg-white/90 px-2.5 py-1 text-xs font-extrabold text-[#397b4b]">
                      <Crown size={11} />
                      REKOMENDASI TERBAIK · PERINGKAT #1
                    </span>

                    <h2 className="mt-2 break-words text-lg font-extrabold leading-snug tracking-tight text-[#244832] sm:text-2xl">
                      {top.smartphone.name}
                    </h2>

                    <p className="mt-1 text-xs font-bold text-[#39804d] sm:text-sm">
                      {formatRupiah(top.smartphone.price)}
                    </p>

                    <p className="mt-1 text-xs text-[#7e9081]">
                      Kode alternatif {top.code}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#dceade] bg-white/90 p-4 shadow-[0_5px_16px_rgba(38,86,45,0.04)] sm:min-w-[190px] sm:text-right">
                  <p className="text-xs font-bold text-[#819084]">
                    Nilai preferensi tertinggi (Vᵢ)
                  </p>

                  <p className="mt-1 font-mono text-2xl font-extrabold tracking-tight text-[#287b44] sm:text-3xl">
                    {formatDecimal(top.totalScore, 4)}
                  </p>

                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#edf7ef] px-2.5 py-1 text-sm font-extrabold text-[#397b4b]">
                    <CheckCircle2 size={10} />
                    Skor tertinggi
                  </div>
                </div>
              </div>

              {/* SPESIFIKASI PEMENANG */}
              <div className="mt-5">
                <div className="mb-2 flex items-center gap-2">
                  <Smartphone size={14} className="text-[#52805c]" />

                  <h3 className="text-xs font-extrabold text-[#49674f]">
                    Spesifikasi smartphone terpilih
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                  {criteria.map((criterion) => (
                    <SpecificationCard
                      key={criterion.code}
                      criterion={criterion}
                      smartphone={top.smartphone}
                    />
                  ))}
                </div>
              </div>

              {/* KESIMPULAN */}
              <div className="mt-4 rounded-2xl border border-[#dceade] bg-white/85 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={15}
                    className="text-[#438653]"
                  />

                  <h3 className="text-xs font-extrabold text-[#31583b]">
                    Kesimpulan hasil perhitungan
                  </h3>
                </div>

                <p className="mt-2 text-xs leading-6 text-[#63796a] sm:text-sm">
                  Berdasarkan perhitungan metode Simple Additive
                  Weighting (SAW) terhadap{' '}
                  <strong className="text-[#36583e]">
                    {rankingRows.length} alternatif smartphone
                  </strong>
                  , <strong className="text-[#287b44]">
                    {top.smartphone.name}
                  </strong>{' '}
                  ({top.code}) menempati peringkat pertama dengan
                  nilai preferensi sebesar{' '}
                  <strong className="font-mono text-[#287b44]">
                    {formatDecimal(top.totalScore, 4)}
                  </strong>
                  . Dengan demikian, smartphone tersebut menjadi
                  alternatif yang paling direkomendasikan berdasarkan
                  kriteria dan bobot yang sedang digunakan.
                </p>
              </div>

              {/* PARAMETER AKTIF */}
              <div className="mt-3 flex flex-wrap gap-2">
                <ParameterBadge icon={Smartphone}>
                  {rankingRows.length} alternatif
                </ParameterBadge>

                <ParameterBadge icon={Wallet}>
                  {parsedBudget
                    ? `Budget ≤ ${formatRupiah(parsedBudget)}`
                    : 'Tanpa batas budget'}
                </ParameterBadge>

                <ParameterBadge icon={SlidersHorizontal}>
                  Bobot{' '}
                  {isAdmin && weightMode === 'custom'
                    ? 'kustom'
                    : 'standar'}
                </ParameterBadge>
              </div>
            </div>
          </section>

          {/* =================================
              PERANKINGAN LENGKAP
          ================================= */}
          <section className="overflow-hidden rounded-[24px] border border-[#e1ebe2] bg-white shadow-[0_7px_22px_rgba(25,68,39,0.04)]">
            <div className="flex flex-col gap-3 border-b border-[#e6eee7] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf6ef] text-[#347c49]">
                  <ClipboardList size={18} />
                </span>

                <div>
                  <h2 className="text-sm font-extrabold text-[#294d34]">
                    Hasil Perankingan
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-[#849188]">
                    Seluruh alternatif diurutkan berdasarkan nilai
                    preferensi (Vᵢ), dari skor tertinggi ke terendah.
                  </p>
                </div>
              </div>

              <span className="self-start rounded-full border border-[#dceade] bg-[#f0f8f1] px-3 py-1.5 text-xs font-extrabold text-[#397b4b]">
                Urutan descending
              </span>
            </div>

            <div className="p-3 sm:p-4">
              <RankingTable rows={rankingRows} />
            </div>
          </section>

          {/* =================================
              SIMPAN RIWAYAT
          ================================= */}
          <section className="overflow-hidden rounded-[24px] border border-[#e1ebe2] bg-white shadow-[0_7px_22px_rgba(25,68,39,0.04)]">
            <div className="flex items-start gap-3 border-b border-[#e6eee7] px-4 py-4 sm:px-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf6ef] text-[#347c49]">
                <BookmarkCheck size={18} />
              </span>

              <div>
                <h2 className="text-sm font-extrabold text-[#294d34]">
                  Simpan Hasil ke Riwayat
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#849188]">
                  Simpan snapshot bobot, matriks, dan hasil ranking
                  agar dapat dibuka kembali kapan saja.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {saveError && (
                <div
                  role="alert"
                  className="mb-3 flex items-start gap-2.5 rounded-xl border border-[#f0d9d6] bg-[#fff7f6] px-3.5 py-3 text-xs text-[#a54a42]"
                >
                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="leading-5">{saveError}</p>
                </div>
              )}

              {savedSuccess && (
                <div className="mb-3 flex flex-col gap-2 rounded-xl border border-[#cfe4d3] bg-[#eff8f1] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-[#347c49]"
                    />

                    <p className="text-xs font-extrabold text-[#347c49]">
                      Riwayat perhitungan berhasil disimpan!
                    </p>
                  </div>

                  <Link
                    to="/riwayat"
                    className="text-xs font-extrabold text-[#347c49] underline underline-offset-2"
                  >
                    Buka Riwayat
                  </Link>
                </div>
              )}

              <form
                onSubmit={handleSaveHistory}
                className="flex flex-col gap-2.5 sm:flex-row"
              >
                <label
                  htmlFor="history-title"
                  className="sr-only"
                >
                  Judul riwayat perhitungan
                </label>

                <input
                  id="history-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Judul riwayat (kosongkan untuk judul otomatis)"
                  maxLength={120}
                  className="min-h-[43px] min-w-0 flex-1 rounded-xl border border-[#dfe9e0] bg-[#fbfdfb] px-3.5 py-2.5 text-xs font-semibold text-[#36543d] outline-none transition placeholder:font-normal placeholder:text-[#a0aba2] focus:border-[#80b78b] focus:ring-4 focus:ring-[#e7f3e9]"
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="sd-button-dark inline-flex min-h-[43px] shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={15} />
                  )}

                  {saving
                    ? 'Menyimpan...'
                    : 'Simpan ke Riwayat'}
                </button>
              </form>

              <div className="mt-3 flex items-start gap-2">
                <Info
                  size={13}
                  className="mt-0.5 shrink-0 text-[#87968a]"
                />

                <p className="text-xs leading-5 text-[#87958a]">
                  Data yang disimpan merupakan snapshot hasil pada saat
                  tombol ditekan. Perubahan data smartphone atau bobot
                  di kemudian hari tidak mengubah riwayat tersebut.
                </p>
              </div>
            </div>
          </section>

          {/* =================================
              NAVIGASI LANJUTAN
          ================================= */}
          <section className="flex flex-col gap-3 rounded-[22px] border border-[#dceade] bg-[#f0f8f1] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h3 className="text-xs font-extrabold text-[#315b3b]">
                Ingin memeriksa proses di balik hasil ini?
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#758879]">
                Buka matriks keputusan, normalisasi, dan kontribusi
                bobot setiap kriteria.
              </p>
            </div>

            <Link
              to="/perhitungan"
              className="sd-button-dark inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold"
            >
              <Calculator size={14} />
              Detail Perhitungan SAW
              <ArrowRight size={14} />
            </Link>
          </section>
        </>
      ) : (
        /* =================================
           BELUM ADA HASIL
        ================================= */
        <section className="rounded-[24px] border border-dashed border-[#cddfce] bg-white px-5 py-10 text-center shadow-[0_7px_22px_rgba(25,68,39,0.025)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf6ef] text-[#428052]">
            <Calculator size={25} />
          </span>

          <h2 className="mt-4 text-sm font-extrabold text-[#31513a]">
            Belum ada hasil rekomendasi
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-6 text-[#87958a]">
            Belum terdapat alternatif yang dapat dihitung dengan
            konfigurasi saat ini. Periksa budget, pilihan smartphone,
            serta kelengkapan spesifikasinya pada halaman proses
            perhitungan.
          </p>

          <Link
            to="/perhitungan"
            className="sd-button-dark mt-4 inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold"
          >
            <Calculator size={14} />
            Buka Proses Perhitungan
            <ArrowRight size={14} />
          </Link>
        </section>
      )}
    </div>
  );
}
