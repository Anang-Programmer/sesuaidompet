
import { useEffect, useMemo, useState } from 'react';

import {
  AlertCircle,
  BatteryCharging,
  BookOpen,
  Camera,
  CheckCircle2,
  Cpu,
  Gauge,
  HardDrive,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  Scale,
  Wallet,
  X,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/PageHeader';
import { PageHeaderSkeleton } from '../components/Skeleton';

import {
  DEFAULT_CRITERIA_PRESET,
  fetchCriteria,
  updateCriteriaList,
} from '../services/spkService';

import { formatDecimal } from '../utils/formatters';


const FIELD_ICONS = {
  price: Wallet,
  camera_mp: Camera,
  ram_gb: Cpu,
  battery_mah: BatteryCharging,
  storage_gb: HardDrive,
  antutu: Gauge,
};


/* =========================================
   KARTU KRITERIA
========================================= */

function CriterionCard({
  row,
  editing,
  onChange,
  saving,
}) {
  const isCost = String(row.type).toLowerCase() === 'cost';

  const Icon = FIELD_ICONS[row.field] || Scale;

  const weightNum = Number(row.weight);

  const safeWeight = Number.isFinite(weightNum) ? weightNum : 0;

  const percentage = safeWeight * 100;

  const progressWidth = Math.min(
    Math.max(percentage, 0),
    100
  );

  return (
    <article className="rounded-[21px] border border-[#e1ebe2] bg-white p-5 shadow-[0_6px_20px_rgba(24,67,38,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cce4d0] hover:shadow-[0_12px_26px_rgba(24,67,38,0.07)]">

      {/* HEADER KARTU */}

      <div className="flex items-start justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5eb] text-[#32844e]">
            <Icon size={21} />
          </div>

          <div className="min-w-0">

            <span className="inline-flex rounded-md bg-[#f0f5f0] px-2 py-1 text-[9px] font-extrabold tracking-wide text-[#728477]">
              {row.code}
            </span>

            <h3 className="mt-1.5 text-sm font-extrabold leading-snug text-[#254732]">
              {row.name}
            </h3>

          </div>

        </div>


        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${
            isCost
              ? 'border-[#f0dfc3] bg-[#fff7e9] text-[#a9782e]'
              : 'border-[#d2e9d6] bg-[#eaf6ec] text-[#2c7944]'
          }`}
        >
          {isCost ? 'Cost' : 'Benefit'}
        </span>

      </div>


      {/* SATUAN */}

      <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-[#f8fbf8] px-3 py-2.5">

        <span className="text-[10px] font-semibold text-[#89968c]">
          Satuan penilaian
        </span>

        <span className="text-[10px] font-extrabold text-[#526b58]">
          {row.unit || '-'}
        </span>

      </div>


      {/* BOBOT */}

      <div className="mt-5">

        <div className="flex items-end justify-between gap-3">

          <div>
            <p className="text-[10px] font-bold text-[#8a988d]">
              Bobot kepentingan
            </p>

            <p className="mt-1 text-[25px] font-extrabold leading-none tracking-tight text-[#247843]">
              {percentage.toFixed(1).replace('.', ',')}%
            </p>
          </div>

          <div className="text-right">
            <p className="text-[9px] font-semibold text-[#9ba69d]">
              Desimal
            </p>

            <p className="mt-1 font-mono text-xs font-bold text-[#58715d]">
              {formatDecimal(safeWeight, 3)}
            </p>
          </div>

        </div>


        {/* PROGRESS BAR */}

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-[#eaf1eb]"
          role="progressbar"
          aria-valuenow={progressWidth}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Bobot ${row.name}`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#24844a] to-[#5ac779] transition-all duration-300"
            style={{
              width: `${progressWidth}%`,
            }}
          />
        </div>

      </div>


      {/* FORM EDIT */}

      {editing && (

        <div className="mt-5 space-y-3 border-t border-[#edf1ed] pt-4">

          <div>

            <label
              htmlFor={`type-${row.id}`}
              className="mb-1.5 block text-[10px] font-bold text-[#66786b]"
            >
              Jenis kriteria
            </label>

            <select
              id={`type-${row.id}`}
              value={row.type}
              disabled={saving}
              onChange={(event) =>
                onChange(row.id, 'type', event.target.value)
              }
              className="min-h-[40px] w-full rounded-xl border border-[#dfe9e0] bg-[#fbfdfb] px-3 text-xs font-semibold text-[#34523b] outline-none focus:border-[#82c792] focus:bg-white focus:ring-4 focus:ring-[#e2f2e5] disabled:opacity-60"
            >
              <option value="cost">
                Cost — semakin kecil semakin baik
              </option>

              <option value="benefit">
                Benefit — semakin besar semakin baik
              </option>
            </select>

          </div>


          <div>

            <label
              htmlFor={`weight-${row.id}`}
              className="mb-1.5 block text-[10px] font-bold text-[#66786b]"
            >
              Bobot desimal
            </label>

            <input
              id={`weight-${row.id}`}
              type="number"
              min="0"
              max="1"
              step="0.001"
              value={row.weight}
              disabled={saving}
              onChange={(event) =>
                onChange(row.id, 'weight', event.target.value)
              }
              className="min-h-[40px] w-full rounded-xl border border-[#dfe9e0] bg-[#fbfdfb] px-3 text-xs font-semibold text-[#34523b] outline-none focus:border-[#82c792] focus:bg-white focus:ring-4 focus:ring-[#e2f2e5] disabled:opacity-60"
            />

            <p className="mt-1.5 text-[9px] text-[#8c998f]">
              Masukkan nilai desimal antara 0 sampai 1.
            </p>

          </div>

        </div>

      )}

    </article>
  );
}


/* =========================================
   HALAMAN KRITERIA
========================================= */

export default function Kriteria() {
  const { isAdmin } = useAuth();

  const [criteria, setCriteria] = useState([]);
  const [drafts, setDrafts] = useState([]);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  /* Pengambilan data */

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await fetchCriteria();

        if (!active) return;

        setCriteria(data);
        setDrafts(data);

      } catch (err) {
        if (active) {
          setError(
            err.message || 'Gagal memuat data kriteria.'
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


  /* Data yang sedang ditampilkan */

  const activeRows = editing ? drafts : criteria;


  /* Total bobot */

  const totalWeight = useMemo(
    () =>
      activeRows.reduce((sum, item) => {
        const weight = Number(item.weight);

        return sum + (
          Number.isFinite(weight) ? weight : 0
        );
      }, 0),
    [activeRows]
  );


  const isWeightValid = Math.abs(totalWeight - 1) <= 0.0005;

  const totalPercentage = totalWeight * 100;


  /* Mulai edit */

  function startEditing() {
    setError('');
    setSuccess('');

    setDrafts(
      criteria.map((criterion) => ({
        ...criterion,
        weight: String(criterion.weight),
      }))
    );

    setEditing(true);
  }


  /* Batalkan edit */

  function cancelEditing() {
    setDrafts(criteria);
    setEditing(false);
    setError('');
  }


  /* Ubah draft */

  function handleDraftChange(id, key, value) {
    setDrafts((previous) =>
      previous.map((row) =>
        row.id === id
          ? { ...row, [key]: value }
          : row
      )
    );
  }


  /* Reset bobot referensi */

  function handleResetPreset() {
    const presetMap = Object.fromEntries(
      DEFAULT_CRITERIA_PRESET.map((item) => [
        item.code,
        item,
      ])
    );

    setDrafts((previous) =>
      previous.map((row) => {
        const preset = presetMap[row.code];

        return preset
          ? {
              ...row,
              type: preset.type,
              weight: String(preset.weight),
            }
          : row;
      })
    );

    setError('');
  }


  /* Validasi dan simpan */

  async function handleSave(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    for (const row of drafts) {
      const weight = Number(row.weight);

      if (
        !Number.isFinite(weight) ||
        weight < 0 ||
        weight > 1
      ) {
        setError(
          `Bobot ${row.code} (${row.name}) harus berada di antara 0 dan 1.`
        );

        return;
      }
    }


    if (!isWeightValid) {
      setError(
        'Total bobot seluruh kriteria harus tepat 1,000 (100%) sebelum disimpan.'
      );

      return;
    }


    setSaving(true);

    try {
      await updateCriteriaList(drafts);

      const updated = await fetchCriteria();

      setCriteria(updated);
      setDrafts(updated);

      setEditing(false);

      setSuccess(
        'Bobot dan kriteria berhasil diperbarui di database.'
      );

    } catch (err) {
      setError(
        err.message || 'Gagal menyimpan perubahan kriteria.'
      );

    } finally {
      setSaving(false);
    }
  }


  /* Loading */

  if (loading) {
    return (
      <div className="space-y-5">
        <PageHeaderSkeleton hasAction={isAdmin} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-[21px] border border-[#e4ece5] bg-white p-5"
            >
              <div className="h-12 w-12 rounded-2xl bg-[#e8f1e9]" />
              <div className="mt-4 h-4 w-1/2 rounded bg-[#e8f1e9]" />
              <div className="mt-5 h-3 w-full rounded bg-[#edf3ed]" />
              <div className="mt-3 h-3 w-3/4 rounded bg-[#edf3ed]" />
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
        kicker="Pengaturan metode SAW"
        title="Kriteria & Bobot"
        description="Atur tingkat kepentingan dan jenis penilaian dari setiap kriteria yang digunakan dalam rekomendasi smartphone."
        action={
          isAdmin && !editing ? (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e7540] to-[#288c4c] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_7px_17px_rgba(31,117,64,0.18)] transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Pencil size={15} />
              Edit Bobot & Jenis
            </button>
          ) : null
        }
      />


      {/* NOTIFIKASI */}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-[#f0d6d4] bg-[#fff5f4] px-4 py-3 text-xs leading-5 text-[#a44747]"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}


      {success && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-2xl border border-[#d5ead8] bg-[#eef8f0] px-4 py-3 text-xs leading-5 text-[#327849]"
        >
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}


      {/* RINGKASAN TOTAL BOBOT */}

      <section className="rounded-[23px] border border-[#dceade] bg-gradient-to-br from-white to-[#f0f8f1] p-5 shadow-[0_7px_22px_rgba(24,67,38,0.04)] sm:p-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e2f3e6] text-[#2d8248]">
              <Scale size={22} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-[#849389]">
                Total bobot kriteria
              </p>

              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#214a30]">
                {totalPercentage.toFixed(1).replace('.', ',')}%
              </h2>

              <p className="mt-1 text-[10px] text-[#869589]">
                Target keseluruhan adalah 100%.
              </p>
            </div>

          </div>


          <div className="sm:w-[230px]">

            <div className="mb-2 flex items-center justify-between gap-3">

              <span className="text-[10px] font-semibold text-[#718176]">
                {criteria.length} kriteria aktif
              </span>

              <span
                className={`text-[10px] font-extrabold ${
                  isWeightValid
                    ? 'text-[#32824b]'
                    : 'text-[#b47a2d]'
                }`}
              >
                {isWeightValid ? 'Bobot valid' : 'Belum 100%'}
              </span>

            </div>


            <div className="h-2.5 overflow-hidden rounded-full bg-[#dfece1]">
              <div
                className={`h-full rounded-full transition-all ${
                  isWeightValid
                    ? 'bg-gradient-to-r from-[#278449] to-[#64c77b]'
                    : 'bg-gradient-to-r from-[#c28b39] to-[#e1b45d]'
                }`}
                style={{
                  width: `${Math.min(
                    Math.max(totalPercentage, 0),
                    100
                  )}%`,
                }}
              />
            </div>

          </div>

        </div>


        {editing && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#dcebdc] bg-white/80 px-3 py-2.5 text-[10px] leading-5 text-[#68806d]">
            <Pencil size={14} className="mt-0.5 shrink-0 text-[#398451]" />
            Perubahan belum disimpan. Pastikan total seluruh bobot tepat 100% sebelum menekan tombol simpan.
          </div>
        )}

      </section>


      {/* KARTU KRITERIA */}

      <form
        onSubmit={handleSave}
        className="space-y-4"
      >

        <div className="flex flex-wrap items-center justify-between gap-2">

          <div>
            <h2 className="text-sm font-extrabold text-[#254632]">
              Daftar kriteria penilaian
            </h2>

            <p className="mt-1 text-[10px] text-[#86948a]">
              Setiap kriteria memiliki jenis dan bobot masing-masing.
            </p>
          </div>

          <span className="rounded-full border border-[#dce9de] bg-white px-3 py-1.5 text-[9px] font-bold text-[#708174]">
            {editing ? 'Mode pengeditan' : 'Mode tampilan'}
          </span>

        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

          {activeRows.map((row) => (
            <CriterionCard
              key={row.id}
              row={row}
              editing={editing}
              saving={saving}
              onChange={handleDraftChange}
            />
          ))}

        </div>


        {/* AKSI EDIT */}

        {editing && (

          <div className="flex flex-col gap-3 rounded-[20px] border border-[#e2ebe3] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

            <button
              type="button"
              onClick={handleResetPreset}
              disabled={saving}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-[#dce9de] bg-white px-4 py-2 text-xs font-bold text-[#3b7149] transition hover:bg-[#f0f7f1] disabled:opacity-50"
            >
              <RotateCcw size={15} />
              Reset ke Bobot Jurnal
            </button>


            <div className="flex flex-col-reverse gap-2 sm:flex-row">

              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="inline-flex min-h-[41px] items-center justify-center gap-2 rounded-xl border border-[#e0e9e1] bg-white px-4 py-2 text-xs font-bold text-[#647468] transition hover:bg-[#f5f8f5] disabled:opacity-50"
              >
                <X size={15} />
                Batal
              </button>


              <button
                type="submit"
                disabled={saving || !isWeightValid}
                className="inline-flex min-h-[41px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e7540] to-[#288c4c] px-5 py-2 text-xs font-extrabold text-white shadow-[0_6px_16px_rgba(31,117,64,0.17)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-45"
              >

                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}

                {saving ? 'Menyimpan...' : 'Simpan Bobot'}

              </button>

            </div>

          </div>

        )}

      </form>


      {/* PENJELASAN BOBOT */}

      <section className="rounded-[21px] border border-[#e2ebe3] bg-white p-5 shadow-[0_6px_20px_rgba(24,67,38,0.035)] sm:p-6">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5eb] text-[#32844e]">
            <BookOpen size={19} />
          </div>

          <div className="min-w-0">

            <h2 className="text-sm font-extrabold text-[#254632]">
              Dasar Penentuan Bobot Referensi
            </h2>

            <p className="mt-1 text-[10px] text-[#89968c]">
              Penjelasan dasar pembobotan yang digunakan pada sistem.
            </p>

          </div>

        </div>


        <div className="mt-4 rounded-xl bg-[#f8fbf8] p-4 text-xs leading-7 text-[#63766a]">

          Bobot diperoleh dari rata-rata seimbang (50% : 50%) dua penelitian
          rujukan: <strong>Jurnal A</strong> (Putri, Sari, &amp; Garno, 2026)
          setelah mengeliminasi tiga kriteria non-spesifikasi e-commerce
          (jumlah terjual, rating produk, rating toko) dan dinormalisasi
          ulang terhadap total sisa 0,65, serta <strong>Jurnal B</strong>
          (Ramadhani, Parulian, &amp; Surajiyo, 2025).
          Pembulatan dilakukan satu kali di akhir ke satu angka di belakang
          koma sehingga total tetap tepat <strong>100% (1,000)</strong>.

        </div>

      </section>

    </div>
  );
}
