const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('id-ID');

/** Format nominal Rupiah tanpa desimal (contoh: Rp 2.599.000). */
export function formatRupiah(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return rupiahFormatter.format(num);
}

/** Format angka bulat dengan pemisah ribuan Indonesia (contoh: 850.000). */
export function formatNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return numberFormatter.format(num);
}

/**
 * Format desimal hasil perhitungan SAW (default 4 angka di belakang koma
 * agar selaras dengan tampilan Slide 15 & 17 pada PPT referensi).
 */
export function formatDecimal(value, digits = 4) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
}

/** Format angka sesuai field kriteria (Rupiah, GB, mAh, MP, atau skor). */
export function formatCriterionValue(field, value) {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';

  switch (field) {
    case 'price':
      return formatRupiah(num);
    case 'camera_mp':
      return `${num} MP`;
    case 'ram_gb':
      return `${num} GB`;
    case 'battery_mah':
      return `${formatNumber(num)} mAh`;
    case 'storage_gb':
      return num === 1024 ? '1 TB (1024 GB)' : `${num} GB`;
    case 'antutu':
      return formatNumber(num);
    default:
      return String(num);
  }
}

