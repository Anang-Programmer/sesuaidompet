import { supabase } from '../lib/supabase';
import { createSmartphone } from './spkService';

/**
 * Helper untuk timeout agar request tidak muter selamanya jika Edge Function belum aktif.
 */
function withTimeout(promise, timeoutMs = 30000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `Request timeout (${timeoutMs / 1000} detik). Supabase Edge Function 'sedo-ai' tidak merespon. Pastikan function sudah di-deploy di Supabase.`
            )
          ),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Memanggil Supabase Edge Function 'sedo-ai' untuk ekstraksi nama HP & pelengkapan 6 spesifikasi.
 */
export async function extractAndLookupPhones(message, existingPhones = []) {
  console.group('🤖 [SEDO AI] extractAndLookupPhones');
  console.log('📝 Pesan Pengguna:', message);
  console.log('📱 Total HP Database Lokal yang dikirim sebagai referensi:', existingPhones.length);

  try {
    const invokePromise = supabase.functions.invoke('sedo-ai', {
      body: {
        action: 'extract_and_lookup',
        message,
        existingPhones,
      },
    });

    console.log('⏳ Mengirim request ke Edge Function "sedo-ai"...');
    const { data, error } = await withTimeout(invokePromise, 35000);

    if (error) {
      console.error('❌ Supabase invoke error:', error);
      console.groupEnd();
      throw new Error(
        error.message?.includes('Failed to send') || error.message?.includes('fetch')
          ? 'Gagal terhubung ke Edge Function. Pastikan function "sedo-ai" sudah di-deploy di Dashboard Supabase.'
          : error.message || 'Gagal memanggil SEDO AI Edge Function.'
      );
    }

    console.log('✅ Respon mentah dari Edge Function:', data);

    if (!data?.success) {
      console.error('❌ Edge function melaporkan gagal:', data?.error);
      console.groupEnd();
      throw new Error(data?.error || 'Gagal mengekstrak spesifikasi smartphone.');
    }

    console.log('🎉 Data berhasil diekstrak:', data.data);
    console.groupEnd();
    return data.data; // { greeting, smartphones: [...] }
  } catch (err) {
    console.error('💥 Error pada extractAndLookupPhones:', err);
    console.groupEnd();
    throw err;
  }
}

/**
 * Memanggil Supabase Edge Function 'sedo-ai' untuk menghasilkan narasi analisis rekomendasi juara SAW.
 */
export async function explainSawRecommendation(rankedPhones = [], criteria = []) {
  console.group('🤖 [SEDO AI] explainSawRecommendation');
  console.log('🏆 Juara 1:', rankedPhones[0]?.smartphone?.name);
  console.log('📊 Total Alternatif yang dianalisis:', rankedPhones.length);

  try {
    const invokePromise = supabase.functions.invoke('sedo-ai', {
      body: {
        action: 'explain_recommendation',
        rankedPhones,
        criteria,
      },
    });

    console.log('⏳ Mengirim data hasil SAW ke Edge Function untuk narasi AI...');
    const { data, error } = await withTimeout(invokePromise, 30000);

    if (error) {
      console.error('❌ Supabase invoke error:', error);
      console.groupEnd();
      throw new Error(error.message || 'Gagal membuat ulasan rekomendasi AI.');
    }

    console.log('✅ Ulasan AI diterima:', data);

    if (!data?.success) {
      console.error('❌ Edge function error:', data?.error);
      console.groupEnd();
      throw new Error(data?.error || 'Gagal menghasilkan narasi analisis.');
    }

    console.groupEnd();
    return data.text; // string Markdown
  } catch (err) {
    console.error('💥 Error pada explainSawRecommendation:', err);
    console.groupEnd();
    throw err;
  }
}

/**
 * Menyimpan smartphone yang belum terdaftar di DB ke daftar smartphone milik user setelah perhitungan SAW selesai.
 */
export async function saveNewlyCreatedPhones(smartphones = [], userId) {
  console.group('💾 [SEDO AI] Menyimpan HP Baru ke Akun User');
  console.log('👤 User ID:', userId);

  if (!userId || !Array.isArray(smartphones)) {
    console.log('⚠️ Tidak ada user ID atau smartphones list kosong.');
    console.groupEnd();
    return [];
  }

  const savedList = [];
  for (const phone of smartphones) {
    // Jika belum punya ID numerik/UUID dari database, simpan sebagai alternatif milik user
    if (!phone.id || String(phone.id).startsWith('temp-')) {
      try {
        console.log(`➕ Menyimpan "${phone.name}" ke database...`);
        const payload = {
          name: phone.name,
          price: Number(phone.price) || 0,
          camera_mp: Number(phone.camera_mp) || 0,
          ram_gb: Number(phone.ram_gb) || 0,
          battery_mah: Number(phone.battery_mah) || 0,
          storage_gb: Number(phone.storage_gb) || 0,
          antutu: Number(phone.antutu) || 0,
          user_id: userId,
        };
        const created = await createSmartphone(payload);
        console.log(`✅ Berhasil tersimpan dengan ID:`, created.id);
        savedList.push(created);
      } catch (err) {
        console.warn(`⚠️ Gagal menyimpan smartphone ${phone.name} ke database user:`, err);
      }
    } else {
      console.log(`ℹ️ "${phone.name}" sudah ada di database (ID: ${phone.id}), tidak perlu disimpan ulang.`);
      savedList.push(phone);
    }
  }

  console.log('🏁 Selesai. Total tersimpan:', savedList.length);
  console.groupEnd();
  return savedList;
}
