import { useEffect, useMemo, useState } from 'react';
import { Info, Pencil, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/PageHeader';
import { PageHeaderSkeleton, TableSkeleton } from '../components/Skeleton';
import { SmartphoneModal } from '../components/SmartphoneModal';
import { SourceBadge } from '../components/SmartphoneBadges';
import {
  fetchCriteria,
  fetchSmartphones,
  updateSmartphone,
} from '../services/spkService';
import { isCompleteSmartphone } from '../utils/sawCalculator';
import { formatCriterionValue } from '../utils/formatters';

const ITEMS_PER_PAGE = 10;

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
        if (active) setError(err.message || 'Gagal memuat data penilaian.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filteredPhones = useMemo(() => {
    const q = search.trim().toLowerCase();
    return smartphones.filter((phone) => {
      if (q && !phone.name.toLowerCase().includes(q)) return false;
      const complete = isCompleteSmartphone(phone, criteria);
      if (statusFilter === 'complete' && !complete) return false;
      if (statusFilter === 'incomplete' && complete) return false;
      return true;
    });
  }, [smartphones, criteria, search, statusFilter]);

  const totalPages = Math.ceil(filteredPhones.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPhones = filteredPhones.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  async function handleSavePenilaian(payload) {
    setError('');
    await updateSmartphone(editingPhone.id, payload);
    await reloadData();
  }

  if (loading) {
    return (
      <div>
        <PageHeaderSkeleton hasAction={false} />
        <TableSkeleton rows={8} cols={7} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Data Penilaian Alternatif"
        description="Matriks nilai asli spesifikasi setiap smartphone sebelum dinormalisasi oleh metode SAW."
      />

      <div className="mb-3 flex items-start gap-2 rounded-sm border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        <p>
          Semua nilai menggunakan <strong>angka asli (&gt; 0)</strong> tanpa konversi skala 1–5.
          Alternatif yang berstatus <strong>Belum Dinilai</strong> (masih ada kolom kosong)
          otomatis dilewati pada proses perhitungan SAW sampai spesifikasinya lengkap.
        </p>
      </div>

      {error && (
        <div className="mb-3 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

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

        <div className="flex items-center gap-1 rounded-sm border border-slate-200 bg-white p-0.5">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'complete', label: 'Lengkap' },
            { id: 'incomplete', label: 'Belum Dinilai' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-xs px-2.5 py-1 text-xs font-semibold transition ${
                statusFilter === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-2.5">Kode</th>
                <th className="px-3 py-2.5">Alternatif</th>
                {criteria.map((c) => (
                  <th key={c.code} className="whitespace-nowrap px-3 py-2.5">
                    {c.code} • {c.name}
                  </th>
                ))}
                {isAdmin && <th className="px-3 py-2.5 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPhones.length === 0 ? (
                <tr>
                  <td
                    colSpan={criteria.length + (isAdmin ? 3 : 2)}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Belum ada data smartphone pada filter ini.
                  </td>
                </tr>
              ) : (
                paginatedPhones.map((phone, idx) => {
                  const actualIndex = startIndex + idx;
                  const complete = isCompleteSmartphone(phone, criteria);

                  return (
                    <tr key={phone.id} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2 font-bold text-slate-700">
                        A{actualIndex + 1}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-semibold text-slate-900">
                          {phone.name}
                        </div>
                        <div className="mt-0.5">
                          <SourceBadge
                            ownerId={phone.user_id}
                            currentUserId={user?.id}
                          />
                        </div>
                      </td>
                      {criteria.map((c) => (
                        <td
                          key={c.code}
                          className="whitespace-nowrap px-3 py-2 text-slate-700"
                        >
                          {formatCriterionValue(c.field, phone[c.field])}
                        </td>
                      ))}
                      {isAdmin && (
                        <td className="whitespace-nowrap px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => setEditingPhone(phone)}
                            className="inline-flex items-center gap-1 rounded-sm border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>{complete ? 'Edit Nilai' : 'Isi Nilai'}</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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