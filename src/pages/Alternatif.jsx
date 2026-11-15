import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Pencil, Plus, Scale, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSawSession } from '../hooks/useSawSession';
import { PageHeader } from '../components/PageHeader';
import { PageHeaderSkeleton, TableSkeleton } from '../components/Skeleton';
import { SmartphoneModal } from '../components/SmartphoneModal';
import { SourceBadge } from '../components/SmartphoneBadges';
import {
  createSmartphone,
  deleteSmartphone,
  fetchCriteria,
  fetchSmartphones,
  updateSmartphone,
} from '../services/spkService';
import { isCompleteSmartphone } from '../utils/sawCalculator';
import { formatRupiah } from '../utils/formatters';

const ITEMS_PER_PAGE = 10;

export default function Alternatif() {
  const { user, isAdmin } = useAuth();
  const { compareIds, toggleCompareId, clearCompareIds } = useSawSession();
  const [smartphones, setSmartphones] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [modalState, setModalState] = useState({ open: false, phone: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);

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
        if (active) setError(err.message || 'Gagal memuat daftar smartphone.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  // Reset ke halaman 1 jika user mencari atau mengganti filter
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sourceFilter]);

  const hasMyPhones = useMemo(
    () => smartphones.some((p) => p.user_id && p.user_id === user?.id),
    [smartphones, user?.id]
  );

  const filteredPhones = useMemo(() => {
    const q = search.trim().toLowerCase();
    return smartphones.filter((phone) => {
      if (q && !phone.name.toLowerCase().includes(q)) return false;
      if (sourceFilter === 'mine' && phone.user_id !== user?.id) return false;
      return true;
    });
  }, [smartphones, search, sourceFilter, user?.id]);

  // Logika Pagination
  const totalPages = Math.ceil(filteredPhones.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPhones = filteredPhones.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
      setError(err.message || 'Gagal menghapus smartphone.');
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeaderSkeleton />
        <TableSkeleton rows={8} cols={4} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Data Alternatif Smartphone"
        description={
          isAdmin
            ? 'Kelola daftar smartphone dan pantau alternatif yang tersedia.'
            : 'Lihat daftar smartphone atau tambahkan alternatif baru secara manual.'
        }
        action={
          <button
            type="button"
            onClick={() => setModalState({ open: true, phone: null })}
            className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Smartphone</span>
          </button>
        }
      />

      {error && (
        <div className="mb-3 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Toolbar Pencarian & Filter */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama smartphone..."
            className="w-full rounded-sm border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {hasMyPhones && (
          <div className="flex items-center gap-1 rounded-sm border border-slate-200 bg-white p-0.5">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'mine', label: 'Input Saya' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSourceFilter(tab.id)}
                className={`rounded-xs px-2.5 py-1 text-xs font-semibold transition ${
                  sourceFilter === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bar pintas jika ada HP yang dipilih untuk dibandingkan */}
      {compareIds.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>
              <strong>{compareIds.length} / 4</strong> smartphone masuk daftar perbandingan.
              {compareIds.length < 2 && ' Pilih minimal 1 lagi untuk membandingkan.'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearCompareIds}
              className="font-semibold text-slate-600 hover:text-rose-700 hover:underline"
            >
              Kosongkan
            </button>
            <Link
              to="/bandingkan"
              className="inline-flex items-center gap-1 rounded-sm bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700"
            >
              <span>Buka Perbandingan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Tabel Alternatif */}
      <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3.5 py-2.5">Kode</th>
                <th className="px-3.5 py-2.5">Nama Smartphone</th>
                <th className="px-3.5 py-2.5">Harga</th>
                <th className="px-3.5 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPhones.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Belum ada data smartphone yang cocok dengan filter ini.
                  </td>
                </tr>
              ) : (
                paginatedPhones.map((phone, idx) => {
                  const actualIndex = startIndex + idx;
                  const canEdit = isAdmin || phone.user_id === user?.id;
                  const complete = isCompleteSmartphone(phone, criteria);
                  const inCompare = compareIds.includes(phone.id);
                  const compareFull = !inCompare && compareIds.length >= 4;

                  return (
                    <tr key={phone.id} className="hover:bg-slate-50/70">
                      <td className="px-3.5 py-2 font-bold text-slate-700">
                        A{actualIndex + 1}
                      </td>
                      <td className="px-3.5 py-2 font-semibold text-slate-900">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span>{phone.name}</span>
                          <SourceBadge
                            ownerId={phone.user_id}
                            currentUserId={user?.id}
                          />
                        </div>
                      </td>
                      <td className="px-3.5 py-2 text-slate-700">
                        {phone.price ? formatRupiah(phone.price) : '-'}
                      </td>
                      <td className="px-3.5 py-2 text-right">
                        <div className="inline-flex items-center gap-1">
                          {complete && (
                            <button
                              type="button"
                              disabled={compareFull}
                              onClick={() => toggleCompareId(phone.id)}
                              title={
                                compareFull
                                  ? 'Maksimal 4 smartphone di perbandingan'
                                  : inCompare
                                    ? 'Keluarkan dari perbandingan'
                                    : 'Tambahkan ke perbandingan'
                              }
                              className={`inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-xs font-medium transition ${
                                inCompare
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                  : compareFull
                                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                                    : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {inCompare ? (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Di Perbandingan</span>
                                </>
                              ) : (
                                <>
                                  <span>+ Bandingkan</span>
                                </>
                              )}
                            </button>
                          )}

                          {canEdit ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setModalState({ open: true, phone })
                                }
                                className="inline-flex items-center gap-1 rounded-sm border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(phone)}
                                className="inline-flex items-center gap-1 rounded-sm border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Hapus</span>
                              </button>
                            </>
                          ) : (
                            !complete && (
                              <span className="text-xs text-slate-400">
                                Belum lengkap
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Navigasi Pagination */}
        {filteredPhones.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3.5 py-3">
            <span className="text-sm text-slate-600">
              Menampilkan <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(startIndex + ITEMS_PER_PAGE, filteredPhones.length)}</span> dari <span className="font-semibold">{filteredPhones.length}</span> data
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-sm border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Sebelumnya</span>
              </button>
              <span className="text-sm font-medium text-slate-700">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-sm border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalState.open && (
        <SmartphoneModal
          mode="alternatif"
          smartphone={modalState.phone}
          onClose={() => setModalState({ open: false, phone: null })}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
}