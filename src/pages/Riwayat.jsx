import { useEffect, useState } from 'react';
import {
  Calendar,
  Eye,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { PageHeaderSkeleton, TableSkeleton } from '../components/Skeleton';
import { RankingTable } from '../components/RankingTable';
import { SawStepTables } from '../components/SawStepTables';
import { useAuth } from '../hooks/useAuth';
import { deleteHistory, fetchHistories } from '../services/spkService';
import { formatDecimal, formatRupiah } from '../utils/formatters';

function formatDateTime(iso) {
  if (!iso) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export default function Riwayat() {
  const { isAdmin } = useAuth();
  const [histories, setHistories] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [detailTab, setDetailTab] = useState('ranking'); // 'ranking' | 'steps'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function reload() {
    const data = await fetchHistories();
    setHistories(data);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await fetchHistories();
        if (active) setHistories(data);
      } catch (err) {
        if (active) setError(err.message || 'Gagal memuat riwayat perhitungan.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleDelete(item) {
    const ok = window.confirm(`Hapus riwayat "${item.title}"?`);
    if (!ok) return;

    setError('');
    try {
      await deleteHistory(item.id);
      if (selectedHistory?.id === item.id) {
        setSelectedHistory(null);
      }
      await reload();
    } catch (err) {
      setError(err.message || 'Gagal menghapus riwayat.');
    }
  }

  function openDetail(item) {
    setDetailTab('ranking');
    setSelectedHistory(item);
  }

  if (loading) {
    return (
      <div>
        <PageHeaderSkeleton hasAction={false} />
        <TableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  const snapshot = selectedHistory?.results_snapshot ?? {};
  const canShowSteps =
    Array.isArray(snapshot.matriksAwal) &&
    Array.isArray(snapshot.bobotTernormalisasi) &&
    Array.isArray(snapshot.nilaiMaxMin) &&
    Array.isArray(snapshot.matriksNormalisasi) &&
    Array.isArray(snapshot.rincianPreferensi);

  return (
    <div>
      <PageHeader
        title="Riwayat Perhitungan"
        description={
          isAdmin
            ? 'Daftar snapshot perhitungan SAW yang disimpan oleh seluruh pengguna.'
            : 'Daftar snapshot perhitungan SAW dan rekomendasi terbaik yang pernah kamu simpan.'
        }
      />

      {error && (
        <div className="mb-3 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {histories.length === 0 ? (
        <div className="rounded-sm border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Belum ada riwayat perhitungan yang tersimpan.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Buka halaman Hasil &amp; Rekomendasi lalu klik tombol &ldquo;Simpan ke Riwayat&rdquo;.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3.5 py-2.5">Judul Perhitungan</th>
                  <th className="px-3.5 py-2.5">Waktu</th>
                  {isAdmin && <th className="px-3.5 py-2.5">Pengguna</th>}
                  <th className="px-3.5 py-2.5">Filter Budget</th>
                  <th className="px-3.5 py-2.5">Juara #1</th>
                  <th className="px-3.5 py-2.5 text-right">Skor (V)</th>
                  <th className="px-3.5 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {histories.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-3.5 py-2 font-semibold text-slate-900">
                      {item.title}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDateTime(item.created_at)}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-3.5 py-2 text-xs text-slate-600">
                        {item.users?.name || item.users?.email || '-'}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-3.5 py-2 text-xs text-slate-700">
                      {item.max_budget ? `≤ ${formatRupiah(item.max_budget)}` : 'Semua Harga'}
                    </td>
                    <td className="px-3.5 py-2 font-medium text-emerald-700">
                      <span className="inline-flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5 shrink-0" />
                        {item.top_smartphone_name}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">
                      {formatDecimal(item.top_score, 4)}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openDetail(item)}
                          className="inline-flex items-center gap-1 rounded-sm border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="inline-flex items-center gap-1 rounded-sm border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail Snapshot */}
      {selectedHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-sm border border-slate-200 bg-slate-50 shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {selectedHistory.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Disimpan pada {formatDateTime(selectedHistory.created_at)} •{' '}
                  {selectedHistory.max_budget
                    ? `Budget ≤ ${formatRupiah(selectedHistory.max_budget)}`
                    : 'Semua Harga'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistory(null)}
                className="rounded-sm p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Tutup modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 p-4">
              {canShowSteps && (
                <div className="inline-flex rounded-sm border border-slate-200 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setDetailTab('ranking')}
                    className={`rounded-xs px-2.5 py-1 text-xs font-semibold transition ${
                      detailTab === 'ranking'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Ringkasan Bobot &amp; Ranking
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('steps')}
                    className={`rounded-xs px-2.5 py-1 text-xs font-semibold transition ${
                      detailTab === 'steps'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Detail Langkah SAW (X, R, V)
                  </button>
                </div>
              )}

              {detailTab === 'ranking' ? (
                <>
                  {/* Snapshot Bobot yang Dipakai */}
                  <div className="rounded-sm border border-slate-200 bg-white p-3.5">
                    <h3 className="mb-2 text-sm font-bold text-slate-900">
                      Bobot Kriteria yang Digunakan
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                      {(selectedHistory.weights_used ?? []).map((w) => (
                        <div
                          key={w.code}
                          className="rounded-xs border border-slate-200 bg-slate-50 px-2.5 py-1.5"
                        >
                          <p className="text-[11px] font-semibold text-slate-600">
                            {w.code} • {w.name}
                          </p>
                          <p className="mt-0.5 font-mono text-sm font-bold text-emerald-700">
                            {formatDecimal(w.normalizedWeight, 4)}
                          </p>
                          <p className="text-[10px] uppercase text-slate-400">
                            {w.type}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Snapshot Tabel Ranking */}
                  <div className="rounded-sm border border-slate-200 bg-white p-3.5">
                    <h3 className="mb-2 text-sm font-bold text-slate-900">
                      Snapshot Perankingan
                    </h3>
                    <RankingTable rows={snapshot.hasilAkhir ?? []} />
                  </div>
                </>
              ) : (
                <SawStepTables
                  sawResult={{ isReady: true, ...snapshot }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
