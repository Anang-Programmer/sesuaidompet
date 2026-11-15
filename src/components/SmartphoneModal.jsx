
import { useState } from 'react';

import {
  AlertCircle,
  BatteryCharging,
  Camera,
  Cpu,
  Gauge,
  HardDrive,
  Info,
  Loader2,
  Save,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react';

import { CRITERIA_SPEC_META } from '../services/spkService';


const SPEC_FIELDS = [
  'price',
  'camera_mp',
  'ram_gb',
  'battery_mah',
  'storage_gb',
  'antutu',
];


const FIELD_ICONS = {
  price: Wallet,
  camera_mp: Camera,
  ram_gb: Cpu,
  battery_mah: BatteryCharging,
  storage_gb: HardDrive,
  antutu: Gauge,
};


function buildInitialForm(smartphone) {
  const initial = {
    name: smartphone?.name ?? '',
  };

  for (const field of SPEC_FIELDS) {
    const value = smartphone?.[field];

    initial[field] =
      value !== null && value !== undefined
        ? String(value)
        : '';
  }

  return initial;
}


export function SmartphoneModal({
  mode = 'alternatif',
  requireSpecs = false,
  smartphone = null,
  onClose,
  onSave,
}) {
  const isPenilaianMode = mode === 'penilaian';

  const mustFillSpecs = isPenilaianMode || requireSpecs;

  const isEditing = Boolean(smartphone);


  const [form, setForm] = useState(
    () => buildInitialForm(smartphone)
  );

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');


  function handleChange(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }


  /* =========================================
     VALIDASI DAN PENYIMPANAN
  ========================================= */

  async function handleSubmit(event) {
    event.preventDefault();

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
        setError(
          `${meta.label} harus berupa angka lebih dari 0.`
        );
        return;
      }


      if (meta.integerOnly && !Number.isInteger(num)) {
        setError(
          `${meta.label} harus berupa bilangan bulat (tanpa koma/desimal).`
        );
        return;
      }


      parsedSpecs[field] = num;
    }


    setSubmitting(true);

    try {
      const payload = isPenilaianMode
        ? parsedSpecs
        : {
            name: trimmedName,
            ...parsedSpecs,
          };

      await onSave(payload);

      onClose();

    } catch (err) {
      setError(
        err.message || 'Gagal menyimpan data smartphone.'
      );

    } finally {
      setSubmitting(false);
    }
  }


  /* =========================================
     TAMPILAN MODAL
  ========================================= */

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102d1e]/55 p-3 backdrop-blur-sm sm:p-5">

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="smartphone-modal-title"
        className="flex max-h-[94vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[25px] border border-white/80 bg-white shadow-[0_25px_80px_rgba(10,42,22,0.28)]"
      >

        {/* HEADER */}

        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#123b29] via-[#185538] to-[#277b46] px-5 py-5 text-white sm:px-7">

          <div className="pointer-events-none absolute -right-12 -top-24 h-52 w-52 rounded-full border border-white/10" />

          <div className="pointer-events-none absolute -right-4 -top-16 h-36 w-36 rounded-full border border-white/10" />

          <div className="relative flex items-start justify-between gap-4">

            <div className="flex min-w-0 items-start gap-3">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#b9f1c2] shadow-inner">
                <Smartphone size={23} />
              </div>

              <div className="min-w-0">

                <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#b7ebc0]">
                  Pengelolaan data perangkat
                </p>

                <h2
                  id="smartphone-modal-title"
                  className="mt-1 text-lg font-extrabold tracking-tight text-white sm:text-xl"
                >
                  {isPenilaianMode
                    ? 'Lengkapi Penilaian Smartphone'
                    : isEditing
                      ? 'Edit Data Smartphone'
                      : 'Tambah Smartphone Baru'}
                </h2>

                <p className="mt-1 max-w-xl text-[10px] leading-5 text-white/70">
                  {isPenilaianMode
                    ? `Lengkapi spesifikasi untuk ${smartphone?.name || 'smartphone ini'}.`
                    : mustFillSpecs
                      ? 'Lengkapi nama dan seluruh spesifikasi smartphone.'
                      : 'Masukkan informasi perangkat. Spesifikasi yang belum tersedia dapat dilengkapi nanti.'}
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Tutup formulir"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={18} />
            </button>

          </div>

        </div>


        {/* KONTEN FORM */}

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-7"
        >


          {/* INFORMASI TAMBAHAN */}

          <div className="flex items-start gap-2.5 rounded-xl border border-[#dcecdf] bg-[#f1f8f2] px-3.5 py-3">

            <Info
              size={16}
              className="mt-0.5 shrink-0 text-[#378651]"
            />

            <p className="text-[10px] leading-5 text-[#637b69]">
              {mustFillSpecs
                ? 'Semua enam spesifikasi wajib diisi dengan nilai lebih dari nol. Pastikan satuan yang digunakan sudah benar.'
                : 'Nama smartphone wajib diisi. Spesifikasi boleh dikosongkan apabila informasinya belum tersedia dan dapat dilengkapi melalui menu Penilaian.'}
            </p>

          </div>


          {/* NAMA SMARTPHONE */}

          {!isPenilaianMode && (

            <section>

              <div className="mb-2 flex items-center gap-2">

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f5eb] text-[#31864d]">
                  <Smartphone size={16} />
                </span>

                <div>
                  <h3 className="text-xs font-extrabold text-[#294a34]">
                    Identitas Smartphone
                  </h3>

                  <p className="mt-0.5 text-[9px] text-[#8a988d]">
                    Nama dan model perangkat
                  </p>
                </div>

              </div>


              <label
                htmlFor="phone-name"
                className="mb-1.5 block text-[11px] font-bold text-[#536b59]"
              >
                Nama Smartphone
                <span className="ml-1 text-rose-500">*</span>
              </label>

              <input
                id="phone-name"
                type="text"
                value={form.name}
                onChange={(event) =>
                  handleChange('name', event.target.value)
                }
                placeholder="Contoh: Samsung Galaxy A06 (6/128GB)"
                required
                disabled={submitting}
                autoComplete="off"
                className="min-h-[45px] w-full rounded-xl border border-[#dfe9e0] bg-[#fbfdfb] px-3.5 py-2.5 text-xs font-semibold text-[#31523a] outline-none transition placeholder:font-normal placeholder:text-[#a2ada4] focus:border-[#83c894] focus:bg-white focus:ring-4 focus:ring-[#e3f3e5] disabled:opacity-60"
              />

            </section>

          )}


          {/* SPESIFIKASI */}

          <section>

            <div className="mb-3 flex items-center justify-between gap-3">

              <div>
                <h3 className="text-xs font-extrabold text-[#294a34]">
                  Spesifikasi Smartphone
                </h3>

                <p className="mt-1 text-[9px] text-[#87958b]">
                  {mustFillSpecs
                    ? 'Seluruh spesifikasi wajib dilengkapi.'
                    : 'Lengkapi informasi yang sudah diketahui.'}
                </p>
              </div>

              <span className="rounded-full bg-[#e8f5eb] px-2.5 py-1 text-[9px] font-extrabold text-[#327d48]">
                6 Kriteria
              </span>

            </div>


            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              {SPEC_FIELDS.map((field) => {

                const meta = CRITERIA_SPEC_META[field];

                const Icon = FIELD_ICONS[field];

                return (
                  <div
                    key={field}
                    className="rounded-2xl border border-[#e5ede5] bg-[#fbfdfb] p-3.5 transition focus-within:border-[#9bd2a5] focus-within:bg-white"
                  >

                    <label
                      htmlFor={`spec-${field}`}
                      className="mb-2 flex items-center gap-2 text-[10px] font-bold text-[#506a56]"
                    >

                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f4e9] text-[#398451]">
                        <Icon size={14} />
                      </span>

                      <span>
                        {meta.label}

                        {mustFillSpecs && (
                          <span className="ml-1 text-rose-500">
                            *
                          </span>
                        )}
                      </span>

                    </label>


                    <input
                      id={`spec-${field}`}
                      type="number"
                      min={meta.integerOnly ? '1' : '0.01'}
                      step={meta.step}
                      value={form[field]}
                      onChange={(event) =>
                        handleChange(field, event.target.value)
                      }
                      placeholder={meta.placeholder}
                      required={mustFillSpecs}
                      disabled={submitting}
                      className="min-h-[41px] w-full rounded-xl border border-[#e0e9e1] bg-white px-3 py-2 text-xs font-semibold text-[#31513a] outline-none transition placeholder:font-normal placeholder:text-[#a6b0a7] focus:border-[#83c894] focus:ring-4 focus:ring-[#e4f3e6] disabled:opacity-60"
                    />

                    <p className="mt-2 text-[9px] leading-4 text-[#8a978d]">
                      {meta.hint}
                    </p>

                  </div>
                );

              })}

            </div>

          </section>


          {/* PESAN VALIDASI */}

          {error && (

            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-[#f0d4d2] bg-[#fff4f3] px-3.5 py-3 text-[11px] leading-5 text-[#a74848]"
            >

              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>

            </div>

          )}


          {/* FOOTER FORM */}

          <div className="flex flex-col-reverse gap-2 border-t border-[#eaf0ea] pt-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-[9px] leading-4 text-[#96a198]">
              Pastikan nilai spesifikasi sesuai satuan yang berlaku.
            </p>


            <div className="flex items-center justify-end gap-2">

              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-[#e0e8e1] bg-white px-4 py-2 text-[11px] font-bold text-[#647468] transition hover:bg-[#f5f8f5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>


              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#27884a] to-[#39a95d] px-5 py-2 text-[11px] font-extrabold text-white shadow-[0_6px_16px_rgba(39,136,74,0.18)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >

                {submitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}

                {submitting ? 'Menyimpan...' : 'Simpan Data'}

              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}
