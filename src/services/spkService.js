import { supabase } from '../lib/supabase';

export const DEFAULT_CRITERIA_PRESET = [
  { code: 'C1', type: 'cost', weight: 0.229 },
  { code: 'C2', type: 'benefit', weight: 0.077 },
  { code: 'C3', type: 'benefit', weight: 0.265 },
  { code: 'C4', type: 'benefit', weight: 0.177 },
  { code: 'C5', type: 'benefit', weight: 0.152 },
  { code: 'C6', type: 'benefit', weight: 0.1 },
];

export const CRITERIA_SPEC_META = {
  price: {
    label: 'Harga (Rp)',
    placeholder: 'Contoh: 3500000',
    hint: 'Masukkan angka tanpa titik/koma, misal 3500000',
    integerOnly: true,
    step: '1',
  },
  camera_mp: {
    label: 'Kamera Utama (MP)',
    placeholder: 'Contoh: 50',
    hint: 'Resolusi kamera belakang utama (MP)',
    integerOnly: false,
    step: 'any',
  },
  ram_gb: {
    label: 'RAM (GB)',
    placeholder: 'Contoh: 8',
    hint: 'Kapasitas RAM dalam GB (bilangan bulat)',
    integerOnly: true,
    step: '1',
  },
  battery_mah: {
    label: 'Baterai (mAh)',
    placeholder: 'Contoh: 5000',
    hint: 'Kapasitas baterai dalam mAh',
    integerOnly: true,
    step: '1',
  },
  storage_gb: {
    label: 'Penyimpanan / ROM (GB)',
    placeholder: 'Contoh: 256',
    hint: 'Dalam GB (1 TB ditulis 1024)',
    integerOnly: true,
    step: '1',
  },
  antutu: {
    label: 'Prosesor (Skor AnTuTu)',
    placeholder: 'Contoh: 750000',
    hint: 'Gunakan versi AnTuTu yang seragam',
    integerOnly: true,
    step: '1',
  },
};

export async function fetchCriteria() {
  const { data, error } = await supabase
    .from('criteria')
    .select('id, code, name, field, type, weight, unit')
    .order('code', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function updateCriteriaList(rows) {
  const results = await Promise.all(
    rows.map((item) =>
      supabase
        .from('criteria')
        .update({
          type: item.type,
          weight: Number(Number(item.weight).toFixed(3)),
        })
        .eq('id', item.id)
    )
  );

  const failed = results.find((res) => res.error);
  if (failed?.error) throw failed.error;
}

export async function fetchSmartphones() {
  const { data, error } = await supabase
    .from('smartphones')
    .select(
      'id, user_id, name, price, camera_mp, ram_gb, battery_mah, storage_gb, antutu, created_at'
    )
    .order('id', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createSmartphone(payload) {
  const { data, error } = await supabase
    .from('smartphones')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSmartphone(id, payload) {
  const { data, error } = await supabase
    .from('smartphones')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSmartphone(id) {
  const { error } = await supabase.from('smartphones').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchHistoriesCount() {
  const { count, error } = await supabase
    .from('calculation_histories')
    .select('id', { count: 'exact', head: true });

  if (error) throw error;
  return count ?? 0;
}

export async function fetchHistories() {
  const { data, error } = await supabase
    .from('calculation_histories')
    .select(
      'id, user_id, title, max_budget, weights_used, top_smartphone_name, top_score, results_snapshot, created_at, users(name, email)'
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createHistory(payload) {
  const { data, error } = await supabase
    .from('calculation_histories')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHistory(id) {
  const { error } = await supabase
    .from('calculation_histories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}


