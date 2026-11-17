
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  AlertCircle,
  ArrowRight,
  BatteryCharging,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Pencil,
  Plus,
  Search,
  Scale,
  Smartphone,
  SlidersHorizontal,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { useSawSession } from '../hooks/useSawSession';
import { PageHeader } from '../components/PageHeader';
import { PageHeaderSkeleton } from '../components/Skeleton';
import {
  SmartphoneModal,
} from '../components/SmartphoneModal';
import {
  SourceBadge,
  SpecStatusBadge,
} from '../components/SmartphoneBadges';

import {
  createSmartphone,
  deleteSmartphone,
  fetchCriteria,
  fetchSmartphones,
  updateSmartphone,
} from '../services/spkService';

import { isCompleteSmartphone } from '../utils/sawCalculator';
import {
  formatCriterionValue,
  formatRupiah,
} from '../utils/formatters';


const ITEMS_PER_PAGE = 10;


/* =========================================
   KOMPONEN RINGKASAN
========================================= */

function SummaryCard({ icon: Icon, label, value, description }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#e1ebe2] bg-white p-4 shadow-[0_5px_18px_rgba(24,67,38,0.035)]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f5eb] text-[#28864b]">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold text-[#819087]">
          {label}
        </p>

        <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#1b432d]">
          {value}
        </p>

        <p className="mt-1 truncate text-xs text-[#93a097]">
          {description}
        </p>
      </div>
    </div>
  );
}


/* =========================================
   KOMPONEN SPESIFIKASI
========================================= */

function SpecificationItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-[#e8efe8] bg-[#f8fbf8] px-2.5 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#398653] shadow-sm">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#8b998e]">
          {label}
        </p>

        <p
          className="mt-0.5 truncate text-sm font-extrabold text-[#34513b]"
          title={String(value)}
        >
          {value}
        </p>
      </div>
    </div>
  );
}


/* =========================================
   KOMPONEN KARTU SMARTPHONE
========================================= */

function SmartphoneCard({
  phone,
  code,
  user,
  isAdmin,
  criteria,
  compareIds,
  toggleCompareId,
  onEdit,
  onDelete,
}) {
  const canEdit = isAdmin || phone.user_id === user?.id;

  const complete = isCompleteSmartphone(phone, criteria);

  const inCompare = compareIds.includes(phone.id);

  const specifications = [
    {
      label: 'RAM',
      value: formatCriterionValue('ram_gb', phone.ram_gb),
      icon: Cpu,
    },
    {
      label: 'Penyimpanan',
      value: formatCriterionValue('storage_gb', phone.storage_gb),
      icon: HardDrive,
    },
    {
      label: 'Kamera utama',
      value: formatCriterionValue('camera_mp', phone.camera_mp),
      icon: Camera,
    },
    {
      label: 'Baterai',
      value: formatCriterionValue('battery_mah', phone.battery_mah),
      icon: BatteryCharging,
    },
    {
      label: 'Skor AnTuTu',
      value: formatCriterionValue('antutu', phone.antutu),
      icon: Gauge,
    },
  ];

  return (
    <article
      className={`group overflow-hidden rounded-[22px] border bg-white shadow-[0_7px_22px_rgba(25,68,39,0.045)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_15px_32px_rgba(25,68,39,0.09)] ${
        inCompare
          ? 'border-[#a9dcb5] ring-2 ring-[#dff1e2]'
          : 'border-[#e2ebe3] hover:border-[#c9e4ce]'
      }`}
    >

      {/* BAGIAN ATAS KARTU */}

      <div className="p-5">

        <div className="flex items-start justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e7f5ea] to-[#d8efde] text-[#33864e] transition group-hover:scale-[1.03]">
              <Smartphone size={27} strokeWidth={1.7} />
            </div>

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-[#f0f5f0] px-2 py-1 text-xs font-extrabold tracking-wide text-[#718477]">
                  {code}
                </span>

                {inCompare && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#e2f4e6] px-2 py-1 text-xs font-extrabold text-[#277641]">
                    <Check size={11} />
                    Dipilih
                  </span>
                )}
              </div>

              <h3
                className="mt-2 line-clamp-2 text-[14px] font-extrabold leading-snug text-[#1d412c]"
                title={phone.name}
              >
                {phone.name}
              </h3>

            </div>

          </div>

        </div>


        {/* SUMBER DATA DAN STATUS */}

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <SourceBadge
            ownerId={phone.user_id}
            currentUserId={user?.id}
          />

          <SpecStatusBadge complete={complete} />
        </div>


        {/* HARGA */}

        <div className="mt-4 rounded-2xl bg-gradient-to-r from-[#edf8ef] to-[#f6fbf6] px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#788c7d]">
            <Wallet size={13} />
            Harga smartphone
          </div>

          <div className="mt-1.5 text-xl font-extrabold tracking-tight text-[#247742]">
            {phone.price !== null && phone.price !== undefined
              ? formatRupiah(phone.price)
              : '-'}
          </div>
        </div>


        {/* SPESIFIKASI */}

        <div className="mt-4">

          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#849389]">
              Spesifikasi
            </span>

            <span className="text-xs text-[#a0aaa3]">
              Ringkasan perangkat
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {specifications.map((spec) => (
              <SpecificationItem
                key={spec.label}
                {...spec}
              />
            ))}
          </div>

        </div>

      </div>


      {/* BAGIAN BAWAH / AKSI */}

      <div className="flex flex-wrap items-center gap-2 border-t border-[#eaf0ea] bg-[#fbfdfb] px-5 py-3.5">

        <div className="mr-auto">

          {complete ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#388250]">
              <CheckCircle2 size={13} />
              Siap dibandingkan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#b17b2e]">
              <AlertCircle size={13} />
              Belum siap SAW
            </span>
          )}

        </div>


        {/* TOMBOL PERBANDINGAN */}

        {complete && (
          <button
            type="button"
            onClick={() => toggleCompareId(phone.id)}
            title={
              inCompare
                ? 'Keluarkan dari perbandingan'
                : 'Tambahkan ke perbandingan'
            }
            className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              inCompare
                ? 'border-[#c4e5cb] bg-[#e7f5ea] text-[#287744] hover:bg-[#d9efdf]'
                : 'border-[#cde5d2] bg-white text-[#30804a] hover:bg-[#edf8ef]'
            }`}
          >
            {inCompare ? (
              <>
                <Check size={13} />
                Dipilih
              </>
            ) : (
              <>
                <Scale size={13} />
                Bandingkan
              </>
            )}
          </button>
        )}


        {/* TOMBOL EDIT DAN HAPUS */}

        {canEdit && (
          <>
            <button
              type="button"
              onClick={onEdit}
              title="Edit smartphone"
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-[#e1e9e2] bg-white px-3 py-1.5 text-xs font-bold text-[#647568] transition hover:border-[#c7dfcb] hover:bg-[#f0f8f1] hover:text-[#267541]"
            >
              <Pencil size={13} />
              Edit
            </button>

            <button
              type="button"
              onClick={onDelete}
              title="Hapus smartphone"
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-[#f0dede] bg-white px-3 py-1.5 text-xs font-bold text-[#ba6060] transition hover:border-[#e9bcbc] hover:bg-[#fff4f3] hover:text-[#a53e3e]"
            >
              <Trash2 size={13} />
              Hapus
            </button>
          </>
        )}

      </div>

    </article>
  );
}


/* =========================================
   HALAMAN DATA ALTERNATIF
========================================= */

export default function Alternatif() {
  const { user, isAdmin } = useAuth();

  const {
    compareIds,
    toggleCompareId,
    clearCompareIds,
  } = useSawSession();

  const [smartphones, setSmartphones] = useState([]);
  const [criteria, setCriteria] = useState([]);

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  const [modalState, setModalState] = useState({
    open: false,
    phone: null,
  });

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
            err.message || 'Gagal memuat daftar smartphone.'
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


  /* Ringkasan data */

  const hasMyPhones = useMemo(
    () =>
      smartphones.some(
        (phone) => phone.user_id && phone.user_id === user?.id
      ),
    [smartphones, user?.id]
  );


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
      const phoneName = String(phone.name ?? '').toLowerCase();

      if (query && !phoneName.includes(query)) {
        return false;
      }

      if (
        sourceFilter === 'mine' &&
        phone.user_id !== user?.id
      ) {
        return false;
      }

      return true;
    });
  }, [smartphones, search, sourceFilter, user?.id]);


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


  /* Simpan data */

  async function handleSaveModal(payload) {
    setError('');

    if (modalState.phone) {
      await updateSmartphone(modalState.phone.id, payload);

    } else {
      await createSmartphone({
        ...payload,
        user_id: isAdmin ? null : user.id,
      });
    }

    await reloadData();
  }


  /* Hapus data */

  async function handleDelete(phone) {
    const ok = window.confirm(
      `Hapus smartphone "${phone.name}"? Data yang sudah dihapus tidak bisa dikembalikan.`
    );

    if (!ok) return;

    setError('');

    try {
      await deleteSmartphone(phone.id);
      await reloadData();

    } catch (err) {
      setError(
        err.message || 'Gagal menghapus smartphone.'
      );
    }
  }


  /* Tampilan loading */

  if (loading) {
    return (
      <div>
        <PageHeaderSkeleton />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-[22px] border border-[#e5ece5] bg-white p-5"
            >
              <div className="flex gap-3">
                <div className="h-14 w-14 rounded-2xl bg-[#e9f0e9]" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 rounded bg-[#e9f0e9]" />
                  <div className="h-4 w-3/4 rounded bg-[#e9f0e9]" />
                </div>
              </div>

              <div className="mt-5 h-16 rounded-2xl bg-[#edf4ed]" />

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


      {/* HEADER HALAMAN */}

      <PageHeader
        kicker="Database smartphone"
        title="Data Alternatif Smartphone"
        description={
          isAdmin
            ? 'Kelola daftar smartphone dan pantau alternatif yang tersedia dalam sistem.'
            : 'Lihat daftar smartphone atau tambahkan alternatif baru sesuai kebutuhan.'
        }
        badge={
          isAdmin ? (
            <span className="rounded-full bg-[#e5f4e8] px-3 py-1 text-xs font-extrabold text-[#2d7c45]">
              Administrator
            </span>
          ) : null
        }
        action={
          <button
            type="button"
            onClick={() =>
              setModalState({ open: true, phone: null })
            }
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#278a4c] to-[#39ad61] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_7px_17px_rgba(39,138,76,0.18)] transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Plus size={17} />
            Tambah Smartphone
          </button>
        }
      />


      {/* PESAN ERROR */}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#f1d5d5] bg-[#fff5f4] px-4 py-3 text-xs text-[#a44848]"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}


      {/* RINGKASAN */}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          icon={Smartphone}
          label="Total smartphone"
          value={smartphones.length}
          description="Alternatif tersimpan"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Siap dihitung SAW"
          value={completeCount}
          description="Spesifikasi lengkap"
        />

        <SummaryCard
          icon={AlertCircle}
          label="Belum lengkap"
          value={incompleteCount}
          description="Perlu dilengkapi"
        />

        <SummaryCard
          icon={Scale}
          label="Daftar perbandingan"
          value={`${compareIds.length} HP`}
          description="Alternatif yang dibandingkan"
        />

      </section>


      {/* AREA PENCARIAN DAN FILTER */}

      <section className="rounded-[22px] border border-[#e1ebe2] bg-white p-4 shadow-[0_6px_20px_rgba(24,67,38,0.035)] sm:p-5">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#254632]">
              <SlidersHorizontal size={17} className="text-[#348550]" />
              Daftar smartphone
            </div>

            <p className="mt-1 text-xs text-[#89968c]">
              Cari perangkat atau pilih sumber data yang ingin ditampilkan.
            </p>
          </div>


          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            {/* SEARCH */}

            <div className="relative min-w-0 sm:w-[290px]">

              <Search
                size={17}
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
                className="min-h-[43px] w-full rounded-xl border border-[#e0e9e1] bg-[#f9fbf9] py-2.5 pl-10 pr-10 text-xs text-[#31513a] outline-none transition placeholder:text-[#a0aaa2] focus:border-[#83c894] focus:bg-white focus:ring-4 focus:ring-[#dff1e2]"
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


            {/* FILTER SUMBER DATA */}

            {hasMyPhones && (
              <div className="flex items-center gap-1 rounded-xl border border-[#e2ebe3] bg-[#f5f9f5] p-1">

                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'mine', label: 'Input Saya' },
                ].map((tab) => (

                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={sourceFilter === tab.id}
                    onClick={() => {
                      setSourceFilter(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`min-h-[34px] rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      sourceFilter === tab.id
                        ? 'bg-[#27884a] text-white shadow-sm'
                        : 'text-[#718176] hover:bg-white hover:text-[#287a43]'
                    }`}
                  >
                    {tab.label}
                  </button>

                ))}

              </div>
            )}

          </div>

        </div>


        {/* JUMLAH HASIL */}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf1ed] pt-3">

          <span className="text-xs text-[#859288]">
            Menampilkan{' '}
            <strong className="text-[#42634a]">
              {filteredPhones.length}
            </strong>{' '}
            dari{' '}
            <strong className="text-[#42634a]">
              {smartphones.length}
            </strong>{' '}
            smartphone
          </span>

          {(search || sourceFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSourceFilter('all');
                setCurrentPage(1);
              }}
              className="text-xs font-bold text-[#378450] hover:underline"
            >
              Reset pencarian dan filter
            </button>
          )}

        </div>

      </section>


      {/* BANNER PERBANDINGAN */}

      {compareIds.length > 0 && (
        <section className="flex flex-col gap-3 rounded-[20px] border border-[#cfe7d3] bg-gradient-to-r from-[#edf8ef] to-[#f8fcf8] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2d874a] shadow-sm">
              <Scale size={19} />
            </div>

            <div>
              <p className="text-xs font-extrabold text-[#285b37]">
                {compareIds.length} smartphone dipilih untuk perbandingan
              </p>

              <p className="mt-1 text-xs text-[#78907d]">
                {compareIds.length < 2
                  ? 'Pilih minimal satu smartphone lagi untuk mulai membandingkan.'
                  : 'Smartphone siap dibuka pada halaman perbandingan.'}
              </p>
            </div>

          </div>


          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={clearCompareIds}
              className="rounded-xl px-3 py-2 text-xs font-bold text-[#78877b] transition hover:bg-white hover:text-[#b44e4e]"
            >
              Kosongkan
            </button>

            <Link
              to="/bandingkan"
              className="sd-button-dark inline-flex min-h-[37px] items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition hover:-translate-y-0.5"
            >
              Buka Perbandingan
              <ArrowRight size={14} />
            </Link>

          </div>

        </section>
      )}


      {/* DAFTAR KARTU SMARTPHONE */}

      {filteredPhones.length === 0 ? (

        <section className="flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#ceddce] bg-white px-5 py-12 text-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#eaf5ec] text-[#398653]">
            <Database size={28} />
          </div>

          <h3 className="mt-5 text-base font-extrabold text-[#2a4a34]">
            {smartphones.length === 0
              ? 'Belum ada smartphone'
              : 'Smartphone tidak ditemukan'}
          </h3>

          <p className="mt-2 max-w-md text-xs leading-6 text-[#849188]">
            {smartphones.length === 0
              ? 'Tambahkan smartphone pertama untuk mulai membangun daftar alternatif.'
              : 'Coba ubah kata pencarian atau filter sumber data yang sedang digunakan.'}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">

            {smartphones.length === 0 ? (
              <button
                type="button"
                onClick={() =>
                  setModalState({ open: true, phone: null })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#27884a] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#1d733d]"
              >
                <Plus size={15} />
                Tambah Smartphone
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSourceFilter('all');
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-[#dce9de] bg-white px-4 py-2.5 text-xs font-bold text-[#347d49] transition hover:bg-[#f0f8f1]"
              >
                <X size={14} />
                Hapus filter
              </button>
            )}

          </div>

        </section>

      ) : (

        <>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">

            {paginatedPhones.map((phone, index) => (

              <SmartphoneCard
                key={phone.id}
                phone={phone}
                code={`A${startIndex + index + 1}`}
                user={user}
                isAdmin={isAdmin}
                criteria={criteria}
                compareIds={compareIds}
                toggleCompareId={toggleCompareId}
                onEdit={() =>
                  setModalState({
                    open: true,
                    phone,
                  })
                }
                onDelete={() => handleDelete(phone)}
              />

            ))}

          </div>


          {/* PAGINATION */}

          {filteredPhones.length > 0 && (

            <div className="flex flex-col gap-3 rounded-2xl border border-[#e2ebe3] bg-white px-4 py-3.5 shadow-[0_4px_16px_rgba(24,67,38,0.03)] sm:flex-row sm:items-center sm:justify-between">

              <p className="text-center text-xs text-[#839087] sm:text-left">
                Menampilkan{' '}
                <strong className="text-[#45634c]">
                  {startIndex + 1}
                </strong>
                {' '}-{' '}
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
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-[#e0e9e1] bg-white px-3 py-2 text-xs font-bold text-[#607365] transition hover:bg-[#f0f7f1] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  Sebelumnya
                </button>

                <span className="min-w-[90px] text-center text-xs font-extrabold text-[#48624d]">
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
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-[#e0e9e1] bg-white px-3 py-2 text-xs font-bold text-[#607365] transition hover:bg-[#f0f7f1] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Selanjutnya
                  <ChevronRight size={14} />
                </button>

              </div>

            </div>

          )}

        </>

      )}


      {/* MODAL TAMBAH / EDIT */}

      {modalState.open && (
        <SmartphoneModal
          mode="alternatif"
          smartphone={modalState.phone}
          onClose={() =>
            setModalState({ open: false, phone: null })
          }
          onSave={handleSaveModal}
        />
      )}

    </div>
  );
}
