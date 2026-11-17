/**
 * Utilitas Deteksi & Respon Percakapan Cerdas untuk SEDO AI (SesuaiDompet)
 * Menangani percakapan kasual (terima kasih, salam, pujian, identitas) secara instan, ramah,
 * dan manusiawi tanpa respon kaku/robotik.
 */

// Daftar merek smartphone umum untuk mendeteksi apakah pesan mengandung niat perbandingan HP
const PHONE_BRANDS = [
  'samsung',
  'galaxy',
  'xiaomi',
  'redmi',
  'poco',
  'infinix',
  'oppo',
  'vivo',
  'realme',
  'iphone',
  'apple',
  'asus',
  'rog',
  'iqoo',
  'tecno',
  'motorola',
  'huawei',
  'honor',
  'pixel',
  'sony',
  'oneplus',
  'nokia',
];

/**
 * Cek apakah pesan pengguna mengandung indikasi kuat ingin membandingkan smartphone
 */
export function hasPhoneComparisonIntent(text = '') {
  if (!text) return false;
  const clean = text.toLowerCase();

  // Indikator perbandingan eksplisit
  const comparisonKeywords = [
    ' vs ',
    ' vs. ',
    ' versus ',
    'bandingkan',
    'perbandingan',
    'pilihkan',
    'bagusan mana',
    'lebih bagus mana',
    'mana yang lebih',
    'rekomendasi hp',
    'rekomendasikan',
    'carikan hp',
  ];

  if (comparisonKeywords.some((kw) => clean.includes(kw))) {
    return true;
  }

  // Hitung berapa brand smartphone yang disebut
  const mentionedBrands = PHONE_BRANDS.filter((brand) => clean.includes(brand));
  if (mentionedBrands.length >= 2) {
    return true;
  }

  return false;
}

/**
 * Deteksi intent percakapan ramah (gratitude, greeting, compliment, identity, dll.)
 * Mengembalikan string respon ramah jika cocok, atau null jika perlu diproses oleh sistem pencari HP.
 */
export function detectConversationalResponse(text = '') {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim().toLowerCase();

  // Jika pesan mengandung niat komparasi HP yang jelas, serahkan ke proses pencarian HP
  if (hasPhoneComparisonIntent(clean)) {
    return null;
  }

  // 1. UCAPAN TERIMA KASIH (Gratitude)
  // Contoh: "thank you", "thanks", "terima kasih", "makasih ya", "thx sedo", "makasi"
  const gratitudeRegex =
    /\b(thank\s*you|thanks|thank\s*u|thx|ty|tq|terima\s*kasih|terimakasih|makasih|makasi|mksih|tengkyu|matur\s*nuwun|hatur\s*nuhun|nuhun|arigatou?|syukron)\b/i;
  if (gratitudeRegex.test(clean)) {
    const gratitudeReplies = [
      'Sama-sama! Senang banget bisa bantu kamu menemukan smartphone terbaik sesuai dompet. Ada smartphone lain yang ingin kamu bandingkan?',
      'Sama-sama! Semoga hasil rekomendasinya bermanfaat untuk pilihan belanjamu ya. Jika butuh perbandingan HP lainnya, silakan katakan kapan saja!',
      'Dengan senang hati! Kalau kamu mau bandingkan smartphone lainnya atau butuh rekomendasi lagi, tinggal bilang ya!',
    ];
    // Pilih acak agar bervariasi dan terasa alami
    return gratitudeReplies[Math.floor(Math.random() * gratitudeReplies.length)];
  }

  // 2. SALAM & SAPAAN (Greetings)
  // Contoh: "halo", "hai", "hello", "selamat pagi", "assalamualaikum"
  const greetingRegex =
    /^(halo|hai|hello|hi|hey|hei|hola|pagi|selamat\s*(pagi|siang|sore|malam)|assalamu\s*['a]?alaikum|sampurasun)\b/i;
  if (greetingRegex.test(clean) && clean.length < 50) {
    const greetingReplies = [
      'Halo! Saya SEDO AI, asisten pintar SesuaiDompet. Sebutkan minimal dua nama smartphone yang ingin kamu bandingkan, nanti saya bantu analisis menggunakan metode SAW!',
      'Hai! Sedang bingung memilih smartphone? Coba sebutkan nama-nama HP yang kamu incar (misal: "Poco X6 Pro vs Redmi Note 13 Pro"), biar saya bantu hitung mana yang paling juara!',
    ];
    return greetingReplies[Math.floor(Math.random() * greetingReplies.length)];
  }

  // 3. PUJIAN & RESPON POSITIF (Compliments / Acknowledgement)
  // Contoh: "keren", "mantap", "bagus banget", "oke siap", "sip"
  const complimentRegex =
    /^(keren|keren\s*banget|mantap|mantul|bagus|hebat|top|good\s*job|nice|awesome|gokil|oke\s*deh|ok\s*deh|siap|sip|oke|ok)\b/i;
  if (complimentRegex.test(clean) && clean.length < 40) {
    const complimentReplies = [
      'Terima kasih! Senang kamu puas dengan analisisnya. Mau coba bandingkan merk atau tipe smartphone lainnya?',
      'Sip, mantap! Kalau ada rekomendasi HP lain yang ingin disimulasikan perhitungannya, kabari aku ya!',
    ];
    return complimentReplies[Math.floor(Math.random() * complimentReplies.length)];
  }

  // 4. IDENTITAS & FITUR (Identity / Capability inquiries)
  // Contoh: "kamu siapa", "siapa kamu", "apa itu sedo ai", "bisa bantu apa"
  const identityRegex =
    /\b(kamu\s*siapa|siapa\s*kamu|siapa\s*anda|apa\s*itu\s*sedo|bisa\s*bantu\s*apa|apa\s*fungsimu|apa\s*tugasmu|fitur\s*apa|gimana\s*cara\s*pakainya|cara\s*kerja)\b/i;
  if (identityRegex.test(clean)) {
    return 'Saya **SEDO AI** (*SesuaiDompet AI*), asisten pendukung keputusan pemilihan smartphone. Kamu cukup sebutkan minimal dua smartphone yang ingin dibandingkan, dan saya akan otomatis mengumpulkan data 6 kriteria (Harga, Kamera, RAM, Baterai, Memori, AnTuTu) serta merangking yang paling worth it dengan metode SAW (*Simple Additive Weighting*)!';
  }

  // 5. PAMITAN (Farewell)
  // Contoh: "bye", "dadah", "sampai jumpa", "udah dulu ya"
  const farewellRegex =
    /\b(bye|goodbye|dadah|sampai\s*jumpa|selesai|udah\s*dulu|sudah\s*cukup)\b/i;
  if (farewellRegex.test(clean) && clean.length < 35) {
    return 'Sampai jumpa! Semoga sukses mendapatkan smartphone impianmu yang paling pas di kantong. Panggil aku lagi kapan saja ya!';
  }

  return null;
}

/**
 * Format fallback pesan ramah jika hasil ekstraksi AI tidak menemukan HP atau hanya menemukan 1 HP
 */
export function formatFriendlyFallback(rawGreeting, originalMessage = '') {
  const cleanMsg = (originalMessage || '').trim().toLowerCase();

  // Jika pengguna hanya menyebutkan 1 brand smartphone
  const matchedBrands = PHONE_BRANDS.filter((brand) => cleanMsg.includes(brand));
  if (matchedBrands.length === 1) {
    const brandName = matchedBrands[0].charAt(0).toUpperCase() + matchedBrands[0].slice(1);
    return `Saya melihat kamu tertarik dengan smartphone **${brandName}**. Namun metode SAW memerlukan minimal **2 smartphone** untuk dibandingkan dan dirangking secara adil. Coba sebutkan satu smartphone pesaingnya lagi, misalnya: *"Bandingkan ${brandName} dengan Poco X6 Pro"*.`;
  }

  // Jika pesan pembuka adalah pesan default yang kaku
  if (
    !rawGreeting ||
    rawGreeting.includes('Silakan sebutkan minimal dua nama smartphone') ||
    rawGreeting.includes('Saya belum menemukan nama smartphone')
  ) {
    return 'Halo! Untuk memulai perbandingan SAW, sebutkan minimal dua nama smartphone yang ingin kamu bandingkan ya. Misalnya: *"Bantu pilihkan Poco X6 Pro atau Redmi Note 13 Pro"* 😊';
  }

  return rawGreeting;
}
