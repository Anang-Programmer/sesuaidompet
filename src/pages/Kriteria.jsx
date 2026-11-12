import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/PageHeader';
import { PageHeaderSkeleton, TableSkeleton } from '../components/Skeleton';
import {
  DEFAULT_CRITERIA_PRESET,
  fetchCriteria,
  updateCriteriaList,
} from '../services/spkService';
import { formatDecimal } from '../utils/formatters';

export default function Kriteria() {
  const { isAdmin } = useAuth();
  const [criteria, setCriteria] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await fetchCriteria();
        if (!active) return;
        setCriteria(data);
        setDrafts(data);
      } catch (err) {
        if (active) setError(err.message || 'Gagal memuat data kriteria.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const activeRows = editing ? drafts : criteria;

  const totalWeight = useMemo(
    () =>
      activeRows.reduce((sum, item) => {
        const w = Number(item.weight);
        return sum + (Number.isFinite(w) ? w : 0);
      }, 0),
    [activeRows]
  );

  const isWeightValid = Math.abs(totalWeight - 1) <= 0.0005;

  function startEditing() {
    setError('');
    setSuccess('');
    setDrafts(criteria.map((c) => ({ ...c, weight: String(c.weight) })));
    setEditing(true);
  }

  function cancelEditing() {
    setDrafts(criteria);
    setEditing(false);
    setError('');
  }

  function handleDraftChange(id, key, value) {
    setDrafts((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    );
  }

  function handleResetPreset() {
    const presetMap = Object.fromEntries(
      DEFAULT_CRITERIA_PRESET.map((p) => [p.code, p])
    );
    setDrafts((prev) =>
      prev.map((row) => {
        const preset = presetMap[row.code];
        return preset
          ? { ...row, type: preset.type, weight: String(preset.weight) }
          : row;
      })
    );
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    for (const row of drafts) {
      const w = Number(row.weight);
      if (!Number.isFinite(w) || w < 0 || w > 1) {
        setError(`Bobot ${row.code} (${row.name}) harus berada di antara 0 dan 1.`);
        return;
      }
    }

    if (!isWeightValid) {
      setError('Total bobot seluruh kriteria harus tepat 1,000 (100%) sebelum disimpan.');
      return;
    }

    setSaving(true);
    try {
      await updateCriteriaList(drafts);
      const updated = await fetchCriteria();
      setCriteria(updated);
      setDrafts(updated);
      setEditing(false);
      setSuccess('Bobot dan kriteria berhasil diperbarui di database.');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan perubahan kriteria.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeaderSkeleton hasAction={isAdmin} />
        <TableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Data Kriteria & Bobot"
        description="Kriteria C1–C6 beserta bobot kepentingan yang digunakan pada metode SAW."
        action={
          isAdmin &&
          !editing && (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit Bobot & Jenis</span>
            </button>
          )
        }
      />

      {error && (
        <div className="mb-3 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 flex items-center gap-2 rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-2xs"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3.5 py-2.5">Kode</th>
                <th className="px-3.5 py-2.5">Kriteria</th>
                <th className="px-3.5 py-2.5">Jenis</th>
                <th className="px-3.5 py-2.5">Satuan Input</th>
                <th className="px-3.5 py-2.5 text-right">Bobot (Desimal)</th>
                <th className="px-3.5 py-2.5 text-right">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activeRows.map((row) => {
                const isCost = String(row.type).toLowerCase() === 'cost';
                const weightNum = Number(row.weight);
                const pct = Number.isFinite(weightNum) ? weightNum * 100 : 0;

                return (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-3.5 py-2.5 font-bold text-slate-900">
                      {row.code}
                    </td>
                    <td className="px-3.5 py-2.5 font-medium text-slate-800">
                      {row.name}
                    </td>
                    <td className="px-3.5 py-2.5">
                      {editing ? (
                        <select
                          value={row.type}
                          onChange={(e) =>
                            handleDraftChange(row.id, 'type', e.target.value)
                          }
                          className="rounded-sm border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                        >
                          <option value="cost">Cost (Makin kecil makin baik)</option>
                          <option value="benefit">Benefit (Makin besar makin baik)</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex rounded-xs px-2 py-0.5 text-xs font-semibold ${
                            isCost
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isCost ? 'Cost' : 'Benefit'}
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600">
                      {row.unit || '-'}
                      {row.field === 'storage_gb' && (
                        <span className="ml-1.5 text-xs text-slate-400">
                          (1 TB = 1024)
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-slate-800">
                      {editing ? (
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.001"
                          value={row.weight}
                          onChange={(e) =>
                            handleDraftChange(row.id, 'weight', e.target.value)
                          }
                          className="w-24 rounded-sm border border-slate-300 px-2 py-1 text-right font-mono text-sm outline-none focus:border-emerald-500"
                        />
                      ) : (
                        formatDecimal(weightNum, 3)
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-semibold text-slate-700">
                      {pct.toFixed(1).replace('.', ',')}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold">
              <tr>
                <td colSpan={4} className="px-3.5 py-2.5 text-slate-800">
                  Total Bobot (Wajib tepat 1,000 / 100%)
                </td>
                <td
                  className={`px-3.5 py-2.5 text-right font-mono ${
                    isWeightValid ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {formatDecimal(totalWeight, 3)}
                </td>
                <td
                  className={`px-3.5 py-2.5 text-right ${
                    isWeightValid ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {(totalWeight * 100).toFixed(1).replace('.', ',')}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {editing && (
          <div className="flex flex-col gap-2.5 border-t border-slate-200 bg-slate-50 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleResetPreset}
              className="inline-flex items-center gap-1.5 self-start rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset ke Bobot Jurnal</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
                <span>Batal</span>
              </button>
              <button
                type="submit"
                disabled={saving || !isWeightValid}
                className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saving ? 'Menyimpan...' : 'Simpan Bobot'}</span>
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Panel Penjelasan Dasar Bobot */}
      <div className="mt-3.5 rounded-sm border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <div className="rounded-sm bg-emerald-50 p-1.5 text-emerald-700">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex-1 text-sm text-slate-600">
            <h2 className="font-bold text-slate-900">
              Dasar Penentuan Bobot Referensi (Gabungan 2 Jurnal)
            </h2>
            <p className="mt-1 leading-relaxed">
              Bobot diperoleh dari rata-rata seimbang (50% : 50%) dua penelitian
              rujukan: <strong>Jurnal A</strong> (Putri, Sari, &amp; Garno, 2026) setelah
              mengeliminasi 3 kriteria non-spesifikasi e-commerce (jumlah terjual, rating produk,
              rating toko) dan dinormalisasi ulang terhadap total sisa 0,65, serta{' '}
              <strong>Jurnal B</strong> (Ramadhani, Parulian, &amp; Surajiyo, 2025).
              Pembulatan dilakukan satu kali di akhir ke 1 angka di belakang koma sehingga
              total tetap tepat <strong>100% (1,000)</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
