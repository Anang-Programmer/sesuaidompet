import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { CRITERIA_SPEC_META } from '../services/spkService';

const SPEC_FIELDS = [
  'price',
  'camera_mp',
  'ram_gb',
  'battery_mah',
  'storage_gb',
  'antutu',
];

function buildInitialForm(smartphone) {
  const initial = { name: smartphone?.name ?? '' };
  for (const field of SPEC_FIELDS) {
    const val = smartphone?.[field];
    initial[field] = val !== null && val !== undefined ? String(val) : '';
  }
  return initial;
}

export function SmartphoneModal({
  mode = 'alternatif', // 'alternatif' | 'penilaian'
  requireSpecs = false,
  smartphone = null,
  onClose,
  onSave,
}) {
  const isPenilaianMode = mode === 'penilaian';
  const mustFillSpecs = isPenilaianMode || requireSpecs;
  const isEditing = Boolean(smartphone);

  const [form, setForm] = useState(() => buildInitialForm(smartphone));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedName = form.name.trim();
    if (!isPenilaianMode && !trimmedName) {
      setError('Nama smartphone wajib diisi.');
      return;
    }

    const parsedSpecs = {};
    for (const field of SPEC_FIELDS) {
      const raw = form[field].trim();
      const meta = CRITERIA_SPEC_META[field];

      if (raw === '') {
        if (mustFillSpecs) {
          setError(`Kolom ${meta.label} wajib diisi.`);
          return;
        }
        parsedSpecs[field] = null;
        continue;
      }

      const num = Number(raw);
      if (!Number.isFinite(num) || num <= 0) {
        setError(`${meta.label} harus berupa angka lebih dari 0.`);
        return;
      }

      if (meta.integerOnly && !Number.isInteger(num)) {
        setError(`${meta.label} harus berupa bilangan bulat (tanpa koma/desimal).`);
        return;
      }

      parsedSpecs[field] = num;
    }

    setSubmitting(true);
    try {
      const payload = isPenilaianMode
        ? parsedSpecs
        : { name: trimmedName, ...parsedSpecs };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data smartphone.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-sm border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isPenilaianMode
                ? `Input Penilaian: ${smartphone?.name}`
                : isEditing
                  ? 'Edit Data Smartphone'
                  : 'Tambah Smartphone Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              {mustFillSpecs
                ? 'Isi seluruh 6 nilai spesifikasi asli (> 0) sesuai satuan yang berlaku.'
                : 'Spesifikasi boleh diisi langsung sekarang atau dilengkapi nanti di menu Penilaian.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 p-4">
          {error && (
            <div className="rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          {!isPenilaianMode && (
            <div>
              <label
                htmlFor="phone-name"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Nama Smartphone <span className="text-rose-500">*</span>
              </label>
              <input
                id="phone-name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Contoh: Xiaomi Redmi Note 14 Pro 5G (8/256GB)"
                required
                className="w-full rounded-sm border border-slate-300 px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {SPEC_FIELDS.map((field) => {
              const meta = CRITERIA_SPEC_META[field];
              return (
                <div key={field}>
                  <label
                    htmlFor={`spec-${field}`}
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    {meta.label}{' '}
                    {mustFillSpecs && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    id={`spec-${field}`}
                    type="number"
                    min={meta.integerOnly ? '1' : '0.01'}
                    step={meta.step}
                    value={form[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    placeholder={meta.placeholder}
                    required={mustFillSpecs}
                    className="w-full rounded-sm border border-slate-300 px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <p className="mt-0.5 text-[11px] text-slate-500">{meta.hint}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-sm border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{submitting ? 'Menyimpan...' : 'Simpan Data'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
