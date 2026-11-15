
import { useEffect, useMemo, useState } from 'react';

import {
  AlertCircle,
  BatteryCharging,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Info,
  Pencil,
  Search,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

import { PageHeader } from '../components/PageHeader';
import { PageHeaderSkeleton } from '../components/Skeleton';
import { SmartphoneModal } from '../components/SmartphoneModal';

import {
  SourceBadge,
  SpecStatusBadge,
} from '../components/SmartphoneBadges';

import {
  fetchCriteria,
  fetchSmartphones,
  updateSmartphone,
} from '../services/spkService';

import { isCompleteSmartphone } from '../utils/sawCalculator';
import { formatCriterionValue } from '../utils/formatters';


const ITEMS_PER_PAGE = 10;


const FIELD_ICONS = {
  price: Wallet,
  camera_mp: Camera,
  ram_gb: Cpu,
  battery_mah: BatteryCharging,
  storage_gb: HardDrive,
  antutu: Gauge,
};


/* =========================================
   KARTU STATISTIK
========================================= */

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#e1ebe2] bg-white p-4 shadow-[0_5px_18px_rgba(24,67,38,0.035)]">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f5eb] text-[#32844e]">
        <Icon size={20} />
      </div>

      <div className="min-w-0">

        <p className="text-[10px] font-bold text-[#849188]">
          {label}
        </p>

        <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#244832]">
          {value}
        </p>

        <p className="mt-1 truncate text-[9px] text-[#93a097]">
          {description}
        </p>

      </div>

    </article>
  );
}


/* =========================================
   NILAI KRITERIA
========================================= */

function CriterionValue({ criterion, value }) {
  const Icon = FIELD_ICONS[criterion.field] || ClipboardCheck;

  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[#e6eee7] bg-[#f8fbf8] px-3 py-2.5">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#398653] shadow-sm">
        <Icon size={15} />
      </div>

      <div className="min-w-0">

        <p className="truncate text-[9px] font-semibold text-[#8a978d]">
          {criterion.code} · {criterion.name}
        </p>

        <p className="mt-1 truncate text-xs font-extrabold text-[#34513b]">
          {formatCriterionValue(criterion.field, value)}
        </p>

      </div>

    </div>
  );
}


/* =========================================
   KARTU PENILAIAN SMARTPHONE
========================================= */

function AssessmentCard({
  phone,
  index,
  criteria,
  isAdmin,
  currentUserId,
  onEdit,
}) {
  const complete = isCompleteSmartphone(phone, criteria);

  return (
    <article className="overflow-hidden rounded-[21px] border border-[#e1ebe2] bg-white shadow-[0_7px_22px_rgba(25,68,39,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cce4d0] hover:shadow-[0_13px_28px_rgba(25,68,39,0.07)]">

      {/* HEADER */}

      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e8f5eb] to-[#d9efdf] text-[#32844e]">
            <Smartphone size={24} />
          </div>

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-1.5">

              <span className="rounded-md bg-[#f0f5f0] px-2 py-1 text-[9px] font-extrabold text-[#728477]">
                A{index + 1}
              </span>

              <SourceBadge
                ownerId={phone.user_id}
                currentUserId={currentUserId}
              />

            </div>

            <h3 className="mt-2 break-words text-sm font-extrabold leading-snug text-[#244832]">
              {phone.name}
            </h3>

          </div>

        </div>


        <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">

          <SpecStatusBadge complete={complete} />

          {isAdmin && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex min-h-[35px] items-center justify-center gap-1.5 rounded-xl border border-[#cfe5d3] bg-[#eaf6ec] px-3 py-2 text-[10px] font-extrabold text-[#287744] transition hover:bg-[#dff0e2]"
            >
              <Pencil size={13} />
              {complete ? 'Edit Nilai' : 'Isi Nilai'}
            </button>
          )}

        </div>

      </div>


      {/* RINCIAN KRITERIA */}

      <div className="border-t border-[#eaf0ea] px-5 py-4">

        <div className="mb-3 flex items-center justify-between gap-2">

          <div className="flex items-center gap-2">
            <ClipboardCheck size={15} className="text-[#398653]" />

            <h4 className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#748478]">
              Rincian nilai kriteria
            </h4>
          </div>

          <span className="text-[9px] text-[#9aa69d]">
            {criteria.length} kriteria
          </span>

        </div>


        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">

          {criteria.map((criterion) => (
            <CriterionValue
              key={criterion.code}
              criterion={criterion}
              value={phone[criterion.field]}
            />
          ))}

        </div>

      </div>


      {/* FOOTER STATUS */}

      <div className="flex items-center justify-between gap-3 border-t border-[#edf1ed] bg-[#fbfdfb] px-5 py-3">

        <span className="text-[9px] text-[#849188]">
          {complete
            ? 'Seluruh nilai spesifikasi sudah tersedia.'
            : 'Masih ada spesifikasi yang belum diisi.'}
        </span>

        {complete ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[9px] font-bold text-[#38814e]">
            <CheckCircle2 size={13} />
            Siap SAW
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 text-[9px] font-bold text-[#a57934]">
            <AlertCircle size={13} />
            Perlu dilengkapi
          </span>
        )}

      </div>

    </article>
  );
}


/* =========================================
   HALAMAN DATA PENILAIAN
========================================= */

export default function Penilaian() {
  const { user, isAdmin } = useAuth();

  const [smartphones, setSmartphones] = useState([]);
  const [criteria, setCriteria] = useState([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [editingPhone, setEditingPhone] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);


  /* Ambil data dari Supabase */

  async function reloadData() {
    const [phoneData, criteriaData] = await Promise.all([
      fetchSmartphones(),
      fetchCriteria(),
    ]);

    setSmartphones(phoneData);
    setCriteria(criteriaData);
  }


  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [phoneData, criteriaData] = await Promise.all([
          fetchSmartphones(),
          fetchCriteria(),
        ]);

        if (!active) return;

        setSmartphones(phoneData);
        setCriteria(criteriaData);

      } catch (err) {
        if (active) {
          setError(
            err.message || 'Gagal memuat data penilaian.'
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


  /* Hitung kelengkapan */

  const completeCount = useMemo(
    () =>
      smartphones.filter((phone) =>
        isCompleteSmartphone(phone, criteria)
      ).length,
    [smartphones, criteria]
  );

  const incompleteCount = smartphones.length - completeCount;


  /* Pencarian dan filter */

  const filteredPhones = useMemo(() => {
    const query = search.trim().toLowerCase();

    return smartphones.filter((phone) => {

      if (
        query &&
        !String(phone.name ?? '').toLowerCase().includes(query)
      ) {
        return false;
      }

      const complete = isCompleteSmartphone(phone, criteria);

      if (statusFilter === 'complete' && !complete) {
        return false;
      }

      if (statusFilter === 'incomplete' && complete) {
        return false;
      }

      return true;
    });
  }, [smartphones, criteria, search, statusFilter]);


  /* Pagination */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPhones.length / ITEMS_PER_PAGE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;

  const paginatedPhones = filteredPhones.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );


  /* Simpan penilaian */

  async function handleSavePenilaian(payload) {
    setError('');

    await updateSmartphone(editingPhone.id, payload);

    await reloadData();
  }


  /* Loading */

  if (loading) {
    return (
      <div className="space-y-5">

        <PageHeaderSkeleton hasAction={false} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-[#e5ece5] bg-white p-4"
            >
              <div className="h-10 w-10 rounded-xl bg-[#e9f0e9]" />
              <div className="mt-3 h-4 w-20 rounded bg-[#e9f0e9]" />
              <div className="mt-2 h-6 w-14 rounded bg-[#edf3ed]" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-[21px] border border-[#e5ece5] bg-white p-5"
            >
              <div className="h-12 w-12 rounded-2xl bg-[#e9f0e9]" />
              <div className="mt-4 h-4 w-1/2 rounded bg-[#e9f0e9]" />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((__, item) => (
                  <div
                    key={item}
                    className="h-12 rounded-xl bg-[#edf3ed]"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    );
  }


  return (
    <div className="space-y-6">


      {/* HEADER */}

      <PageHeader
        kicker="Matriks penilaian"
        title="Data Penilaian Smartphone"
        description="Periksa nilai asli enam spesifikasi smartphone sebelum diproses melalui normalisasi metode SAW."
      />


      {/* INFORMASI PENTING */}

      <div className="flex items-start gap-3 rounded-2xl border border-[#dcebdc] bg-[#f0f8f1] px-4 py-3.5">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#34854f] shadow-sm">
          <Info size={17} />
        </div>

        <div className="min-w-0">

          <p className="text-[11px] font-extrabold text-[#356547]">
            Gunakan nilai asli spesifikasi
          </p>

          <p className="mt-1 text-[10px] leading-5 text-[#6e8273]">
            Semua nilai menggunakan angka asli (&gt; 0), tanpa konversi
            skala 1–5. Alternatif yang masih memiliki nilai kosong
            otomatis dilewati pada proses perhitungan SAW sampai
            seluruh spesifikasinya lengkap.
          </p>

        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-[#f0d6d4] bg-[#fff5f4] px-4 py-3 text-xs leading-5 text-[#a44747]"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}


      {/* RINGKASAN */}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <SummaryCard
          icon={Smartphone}
          label="Total alternatif"
          value={smartphones.length}
          description="Smartphone terdaftar"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Penilaian lengkap"
          value={completeCount}
          description="Siap diproses metode SAW"
        />

        <SummaryCard
          icon={AlertCircle}
          label="Belum lengkap"
          value={incompleteCount}
          description="Masih perlu diisi"
        />

      </section>


      {/* TOOLBAR */}

      <section className="rounded-[21px] border border-[#e1ebe2] bg-white p-4 shadow-[0_6px_20px_rgba(24,67,38,0.035)] sm:p-5">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="text-sm font-extrabold text-[#254632]">
              Daftar penilaian
            </h2>

            <p className="mt-1 text-[10px] text-[#89968c]">
              Cari smartphone atau saring berdasarkan kelengkapan nilai.
            </p>
          </div>


          <div className="flex flex-col gap-3 sm:flex-row">

            {/* PENCARIAN */}

            <div className="relative min-w-0 sm:w-[280px]">

              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa79d]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama smartphone..."
                aria-label="Cari nama smartphone"
                className="min-h-[42px] w-full rounded-xl border border-[#e0e9e1] bg-[#f9fbf9] py-2.5 pl-10 pr-10 text-xs text-[#31513a] outline-none transition placeholder:text-[#a0aaa2] focus:border-[#83c894] focus:bg-white focus:ring-4 focus:ring-[#dff1e2]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCurrentPage(1);
                  }}
                  aria-label="Hapus pencarian"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8b998f] hover:bg-[#eaf3eb] hover:text-[#287a43]"
                >
                  <X size={14} />
                </button>
              )}

            </div>


            {/* FILTER STATUS */}

            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#e2ebe3] bg-[#f5f9f5] p-1">

              {[
                { id: 'all', label: 'Semua' },
                { id: 'complete', label: 'Lengkap' },
                { id: 'incomplete', label: 'Belum Dinilai' },
              ].map((tab) => (

                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={statusFilter === tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`min-h-[34px] rounded-lg px-3 py-1.5 text-[10px] font-bold transition ${
                    statusFilter === tab.id
                      ? 'bg-[#267f45] text-white shadow-sm'
                      : 'text-[#718176] hover:bg-white hover:text-[#287a43]'
                  }`}
                >
                  {tab.label}
                </button>

              ))}

            </div>

          </div>

        </div>


        <div className="mt-4 border-t border-[#edf1ed] pt-3 text-[10px] text-[#859288]">
          Menampilkan{' '}
          <strong className="text-[#45634c]">
            {filteredPhones.length}
          </strong>{' '}
          dari{' '}
          <strong className="text-[#45634c]">
            {smartphones.length}
          </strong>{' '}
          smartphone
        </div>

      </section>


      {/* DAFTAR PENILAIAN */}

      {filteredPhones.length === 0 ? (

        <section className="flex min-h-[280px] flex-col items-center justify-center rounded-[23px] border border-dashed border-[#cddfce] bg-white px-5 py-12 text-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#eaf5ec] text-[#398653]">
            <Database size={27} />
          </div>

          <h3 className="mt-5 text-sm font-extrabold text-[#294a34]">
            Tidak ada data penilaian
          </h3>

          <p className="mt-2 max-w-md text-[10px] leading-6 text-[#849188]">
            Tidak ditemukan smartphone pada pencarian atau filter ini.
            Coba ubah kata kunci atau pilih status lainnya.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className="mt-4 inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-[#cfe5d3] bg-[#eaf6ec] px-4 py-2 text-[10px] font-bold text-[#287744] transition hover:bg-[#dff0e2]"
          >
            <X size={14} />
            Reset pencarian
          </button>

        </section>

      ) : (

        <>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

            {paginatedPhones.map((phone, index) => (

              <AssessmentCard
                key={phone.id}
                phone={phone}
                index={startIndex + index}
                criteria={criteria}
                isAdmin={isAdmin}
                currentUserId={user?.id}
                onEdit={() => setEditingPhone(phone)}
              />

            ))}

          </div>


          {/* PAGINATION */}

          {filteredPhones.length > ITEMS_PER_PAGE && (

            <div className="flex flex-col gap-3 rounded-2xl border border-[#e2ebe3] bg-white px-4 py-3.5 shadow-[0_4px_16px_rgba(24,67,38,0.03)] sm:flex-row sm:items-center sm:justify-between">

              <p className="text-center text-[10px] text-[#839087] sm:text-left">

                Menampilkan{' '}

                <strong className="text-[#45634c]">
                  {startIndex + 1}
                </strong>

                {' - '}

                <strong className="text-[#45634c]">
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    filteredPhones.length
                  )}
                </strong>

                {' '}dari{' '}

                <strong className="text-[#45634c]">
                  {filteredPhones.length}
                </strong>{' '}

                smartphone

              </p>


              <div className="flex items-center justify-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  disabled={safeCurrentPage === 1}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-[#e0e9e1] bg-white px-3 py-2 text-[10px] font-bold text-[#607365] transition hover:bg-[#f0f7f1] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  Sebelumnya
                </button>


                <span className="min-w-[80px] text-center text-[10px] font-extrabold text-[#48624d]">
                  {safeCurrentPage} / {totalPages}
                </span>


                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(page + 1, totalPages)
                    )
                  }
                  disabled={safeCurrentPage === totalPages}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-[#e0e9e1] bg-white px-3 py-2 text-[10px] font-bold text-[#607365] transition hover:bg-[#f0f7f1] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Selanjutnya
                  <ChevronRight size={14} />
                </button>

              </div>

            </div>

          )}

        </>

      )}


      {/* MODAL EDIT PENILAIAN */}

      {editingPhone && (
        <SmartphoneModal
          mode="penilaian"
          smartphone={editingPhone}
          onClose={() => setEditingPhone(null)}
          onSave={handleSavePenilaian}
        />
      )}

    </div>
  );
}
