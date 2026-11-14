import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ============================================================================
// DAFTAR MODEL & ENDPOINT AI (Bisa kamu edit, tambah, atau ubah urutannya)
// ============================================================================
// Format tipe ada 2:
// 1. 'openai' : Mendukung Groq, OpenRouter, DeepSeek, OpenAI, Together, dll
// 2. 'gemini' : Format asli Google Gemini API
//
// Urutan di bawah adalah prioritas: sistem akan mencoba dari atas ke bawah.
// Jika API Key tidak ada atau limit habis, otomatis loncat ke provider berikutnya!
// ============================================================================
interface AIProviderConfig {
  name: string;
  type: 'openai' | 'gemini';
  endpoint: string;
  model: string;
  apiKey: string;
  enabled?: boolean;
}

const AI_PROVIDERS: AIProviderConfig[] = [
  // 1. Groq (Gratis, kuota generous, kecepatan ultra-tinggi)
  // Dapatkan key gratis di: https://console.groq.com/
  // Pilihan model: 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'
  {
    name: 'Groq',
    type: 'openai',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'openai/gpt-oss-120b',
    apiKey: Deno.env.get('GROQ_API_KEY') || '',
  },
  {
    name: 'OpenRouter',
    type: 'openai',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'baidu/ernie-5.5-flash-preview:free',
    apiKey: Deno.env.get('OPENROUTER_API_KEY') || '',
  },
];

// ============================================================================
// TAVILY WEB GROUNDING
// Tavily adalah search provider, bukan LLM. API key disimpan di Supabase Secrets.
// Basic Search = 1 credit/request menurut dokumentasi Tavily.
// ============================================================================
const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY') || '';
const MAX_PHONE_MODELS_PER_REQUEST = 5;

interface PhoneCandidate {
  name: string;
  databaseId: string | null;
  databaseName: string | null;
}

interface TavilySearchResult {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
  published_date?: string | null;
}

class HttpError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

function parseJsonResponse<T = any>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
    }
    throw new Error('AI mengembalikan format JSON yang tidak valid.');
  }
}

function safeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(value)) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getIndonesiaDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

async function tavilySearchPhone(phoneName: string): Promise<{
  query: string;
  results: TavilySearchResult[];
}> {
  const query = `"${phoneName}" spesifikasi resmi harga Indonesia RAM ROM kamera baterai AnTuTu benchmark`;

  if (!TAVILY_API_KEY) {
    console.log(`[SEDO-AI Edge] TAVILY_API_KEY belum dipasang, fallback ke internal knowledge untuk ${phoneName}`);
    return { query, results: [] };
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        topic: 'general',
        max_results: 4,
        include_answer: false,
        include_raw_content: false,
        include_published_date: true,
        country: 'indonesia',
        language: 'id',
        filter_by_language: false,
        include_usage: true,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('[SEDO-AI Edge] Tavily Search Warning:', response.status, errorText);
      return { query, results: [] };
    }

    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];

    return {
      query,
      results: results.slice(0, 4).map((item: any) => ({
        title: String(item?.title || ''),
        url: String(item?.url || ''),
        content: String(item?.content || '').slice(0, 1600),
        score: safeNumber(item?.score) ?? undefined,
        published_date: item?.published_date || null,
      })).filter((item: TavilySearchResult) => item.url),
    };
  } catch (err: any) {
    console.warn(`[SEDO-AI Edge] Tavily search error (${phoneName}):`, err.message);
    return { query, results: [] };
  }
}

function buildPhoneCandidateContext(
  candidates: PhoneCandidate[],
  existingPhones: any[],
  searches: Map<string, { query: string; results: TavilySearchResult[] }>
) {
  return candidates.map((candidate) => {
    const databaseRecord = candidate.databaseId
      ? existingPhones.find((phone: any) =>
          String(phone?.id) === candidate.databaseId &&
          String(phone?.name || '').trim() === String(candidate.databaseName || '').trim()
        )
      : null;

    if (databaseRecord) {
      return {
        requestedName: candidate.name,
        sourceType: 'database',
        databaseRecord: {
          id: databaseRecord.id,
          name: databaseRecord.name,
          price: databaseRecord.price,
          camera_mp: databaseRecord.camera_mp,
          ram_gb: databaseRecord.ram_gb,
          battery_mah: databaseRecord.battery_mah,
          storage_gb: databaseRecord.storage_gb,
          antutu: databaseRecord.antutu,
        },
        search: null,
      };
    }

    return {
      requestedName: candidate.name,
      sourceType: 'web_search',
      databaseRecord: null,
      search: searches.get(candidate.name) || { query: '', results: [] },
    };
  });
}

async function callAI(prompt: string, systemInstruction?: string, isJson = false) {
  // Ambil hanya provider yang memiliki API Key
  const activeProviders = AI_PROVIDERS.filter((p) => Boolean(p.apiKey && p.enabled !== false));

  console.log(
    `[SEDO-AI Edge] Provider yang memiliki API Key: ${activeProviders.map((p) => p.name).join(', ') || 'TIDAK ADA'}`
  );

  if (activeProviders.length === 0) {
    throw new Error(
      'Belum ada API Key yang dipasang di Supabase Secrets. Tambahkan salah satu: GROQ_API_KEY, OPENROUTER_API_KEY, DEEPSEEK_API_KEY, OPENAI_API_KEY, atau GEMINI_API_KEY.'
    );
  }

  let lastError: any = null;

  for (const provider of activeProviders) {
    try {
      console.log(`[SEDO-AI Edge] Mencoba memanggil ${provider.name} (model: ${provider.model})...`);

      // PROTOKOL 1: OpenAI Compatible (Groq, OpenRouter, DeepSeek, OpenAI, dll)
      if (provider.type === 'openai') {
        const payload: any = {
          model: provider.model,
          messages: [
            ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
        };

        if (isJson) {
          payload.response_format = { type: 'json_object' };
        }

        const res = await fetch(provider.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15000),
        });

        console.log(`[SEDO-AI Edge] Status respon dari ${provider.name}:`, res.status, res.statusText);

        if (!res.ok) {
          const errText = await res.text();
          console.error(`[SEDO-AI Edge] Error dari ${provider.name}:`, errText);
          throw new Error(`${provider.name} Error: ${errText}`);
        }

        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content || '';
        console.log(`[SEDO-AI Edge] Berhasil mendapatkan respon dari ${provider.name} (${text.length} karakter)`);
        return text;
      }

      // PROTOKOL 2: Google Gemini Native API
      if (provider.type === 'gemini') {
        const url = `${provider.endpoint}/${provider.model}:generateContent?key=${provider.apiKey}`;
        const payload: any = {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 },
        };

        if (systemInstruction) {
          payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        if (isJson) {
          payload.generationConfig.responseMimeType = 'application/json';
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15000),
        });

        console.log(`[SEDO-AI Edge] Status respon dari ${provider.name}:`, res.status, res.statusText);

        if (!res.ok) {
          const errText = await res.text();
          console.error(`[SEDO-AI Edge] Error dari ${provider.name}:`, errText);
          throw new Error(`${provider.name} Error: ${errText}`);
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log(`[SEDO-AI Edge] Berhasil mendapatkan respon dari ${provider.name} (${text.length} karakter)`);
        return text;
      }
    } catch (err: any) {
      console.warn(`[SEDO-AI Edge] Percobaan dengan ${provider.name} gagal:`, err.message);
      lastError = err;
      // Otomatis lanjut ke provider berikutnya di array!
    }
  }

  throw lastError || new Error('Semua provider AI dalam daftar gagal merespon.');
}

serve(async (req) => {
  console.log('[SEDO-AI Edge] Request masuk:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, message, existingPhones = [], rankedPhones = [], criteria = [] } = body;
    console.log('[SEDO-AI Edge] Action yang diminta:', action);

    // 0. Action: Diagnosis Test Koneksi & Cek Provider Aktif
    if (action === 'test_connection') {
      const configured = AI_PROVIDERS.map((p) => ({
        name: p.name,
        type: p.type,
        model: p.model,
        hasKey: Boolean(p.apiKey),
      }));

      const activeList = configured.filter((p) => p.hasKey);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Edge Function sedo-ai aktif dan merespon!',
          configuredProviders: configured,
          activeCount: activeList.length,
          primaryProvider: activeList[0]?.name || 'Belum ada API Key aktif',
          grounding: {
            provider: 'Tavily',
            configured: Boolean(TAVILY_API_KEY),
            searchDepth: 'basic',
            estimatedCreditsPerSearch: 1,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Action: Ekstraksi nama HP + Tavily Grounded Search + lookup 6 kriteria
    if (action === 'extract_and_lookup') {
      if (typeof message !== 'string' || !message.trim()) {
        throw new HttpError('Pesan pengguna wajib diisi.', 400, 'MESSAGE_REQUIRED');
      }

      const safeExistingPhones = Array.isArray(existingPhones) ? existingPhones : [];
      console.log('[SEDO-AI Edge] Memproses extract_and_lookup:', message);

      // Tahap A: deteksi model HP dan tentukan apakah model sudah tersedia di database.
      // ID database harus berasal dari daftar yang diberikan backend, bukan dibuat oleh LLM.
      const databaseIndex = safeExistingPhones
        .filter((phone: any) => phone?.id !== undefined && phone?.name)
        .map((phone: any) => ({ id: String(phone.id), name: String(phone.name) }));

      const candidateSystemInstruction = `
Kamu adalah parser nama smartphone untuk aplikasi SPK SesuaiDompet.
Tugas utamamu adalah mendeteksi dan mengekstrak SEMUA nama model smartphone yang disebutkan pengguna dalam pesan (contoh: "Redmi Note 13", "Poco M6 Pro", "Oppo A77s", "Realme C55", "Samsung Galaxy A54").

ATURAN PENTING:
1. Ekstrak setiap nama smartphone secara terpisah. Jika pengguna menyebutkan "Bandingkan Redmi Note 13 vs Poco M6 Pro", kamu WAJIB mengekstrak kedua perangkat: "Redmi Note 13" dan "Poco M6 Pro".
2. Cocokkan dengan daftar perangkat di database jika ada kemiripan nama. Jika cocok, isi databaseId dan databaseName. Jika belum ada di database, isi keduanya dengan null.
3. Kembalikan HANYA format JSON valid berikut:
{
  "phones": [
    { "name": "Redmi Note 13", "databaseId": null, "databaseName": null },
    { "name": "Poco M6 Pro", "databaseId": null, "databaseName": null }
  ]
}
`;

      const candidatePrompt = `
Pesan pengguna:
${JSON.stringify(message)}

Daftar perangkat di database:
${JSON.stringify(databaseIndex)}

Ekstrak seluruh model smartphone yang disebutkan pengguna. Pertahankan urutan penyebutan pengguna.
`;

      const candidateRaw = await callAI(candidatePrompt, candidateSystemInstruction, true);
      console.log('[SEDO-AI Edge] Raw Candidate Parser Response:', candidateRaw);
      const candidateParsed = parseJsonResponse<any>(candidateRaw);

      let rawCandidates: any[] = [];
      if (Array.isArray(candidateParsed)) {
        rawCandidates = candidateParsed;
      } else if (Array.isArray(candidateParsed?.phones)) {
        rawCandidates = candidateParsed.phones;
      } else if (Array.isArray(candidateParsed?.smartphones)) {
        rawCandidates = candidateParsed.smartphones;
      } else if (Array.isArray(candidateParsed?.candidates)) {
        rawCandidates = candidateParsed.candidates;
      } else if (Array.isArray(candidateParsed?.models)) {
        rawCandidates = candidateParsed.models;
      } else if (Array.isArray(candidateParsed?.data)) {
        rawCandidates = candidateParsed.data;
      }

      // Hilangkan duplikasi berdasarkan nama model.
      const seenCandidates = new Set<string>();
      const phoneCandidates: PhoneCandidate[] = rawCandidates
        .filter((candidate: any) => typeof candidate?.name === 'string' && candidate.name.trim())
        .map((candidate: any) => ({
          name: candidate.name.trim(),
          databaseId: candidate.databaseId == null ? null : String(candidate.databaseId),
          databaseName: candidate.databaseName == null ? null : String(candidate.databaseName),
        }))
        .filter((candidate) => {
          const key = candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
          if (!key || seenCandidates.has(key)) return false;
          seenCandidates.add(key);
          return true;
        });

      if (phoneCandidates.length < 2) {
        return new Response(JSON.stringify({
          success: true,
          data: {
            greeting: 'Silakan sebutkan minimal dua nama smartphone yang ingin dibandingkan agar SEDO AI dapat membantu melakukan perangkingan.',
            smartphones: [],
            grounding: {
              provider: 'Tavily',
              searchesMade: 0,
              estimatedCreditsUsed: 0,
            },
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (phoneCandidates.length > MAX_PHONE_MODELS_PER_REQUEST) {
        throw new HttpError(
          `Maksimal ${MAX_PHONE_MODELS_PER_REQUEST} model smartphone dapat diproses dalam satu permintaan agar biaya pencarian terkendali.`,
          400,
          'TOO_MANY_PHONE_MODELS'
        );
      }

      // Tentukan model yang benar-benar belum ada di database.
      const newPhoneCandidates = phoneCandidates.filter((candidate) => {
        if (!candidate.databaseId || !candidate.databaseName) return true;
        return !safeExistingPhones.some((phone: any) =>
          String(phone?.id) === candidate.databaseId &&
          String(phone?.name || '').trim() === candidate.databaseName
        );
      });

      // Tahap B: cari hanya model yang belum ada di database.
      // Setiap Basic Search Tavily menggunakan 1 credit per request.
      const searchEntries = await Promise.all(
        newPhoneCandidates.map(async (candidate) => {
          const search = await tavilySearchPhone(candidate.name);
          console.log(`[SEDO-AI Edge] Tavily menemukan ${search.results.length} hasil untuk ${candidate.name}`);
          return [candidate.name, search] as const;
        })
      );
      const searches = new Map<string, { query: string; results: TavilySearchResult[] }>(searchEntries);

      // Tahap C: minta LLM menyusun spesifikasi dengan konteks database dan hasil web.
      const phoneContext = buildPhoneCandidateContext(phoneCandidates, safeExistingPhones, searches);
      const systemInstruction = `
Kamu adalah asisten SPK smartphone "SEDO AI" (SesuaiDompet).
Tugasmu menyiapkan data smartphone untuk perbandingan metode Simple Additive Weighting (SAW).

Kamu akan menerima data untuk setiap smartphone. Sebagian berasal dari database SesuaiDompet, sebagian dari hasil pencarian web Tavily.

ATURAN SUMBER DATA:
1. Jika sourceType adalah "database", salin nilai spesifikasi dari databaseRecord secara persis.
2. Jika sourceType adalah "web_search", gunakan informasi dari search.results sebagai acuan utama. Jika ada kriteria yang belum tertera di cuplikan web (seperti skor AnTuTu), gunakan pengetahuan teknismu mengenai spesifikasi resmi smartphone tersebut di pasar Indonesia agar seluruh 6 kriteria terisi angka.
3. Seluruh 6 kriteria (price, camera_mp, ram_gb, battery_mah, storage_gb, antutu) wajib berupa angka (number > 0).
4. Harga adalah estimasi harga pasar Indonesia dalam Rupiah (integer), prioritaskan harga resmi atau penjual Indonesia yang kredibel.
5. camera_mp adalah resolusi kamera utama belakang (angka bulat/desimal).
6. ram_gb dan storage_gb harus sesuai varian perangkat yang umum/dimaksud pengguna.
7. battery_mah adalah kapasitas baterai dalam mAh.
8. antutu adalah estimasi skor AnTuTu benchmark.
9. Pertahankan urutan dan jumlah smartphone pada input.

Kembalikan HANYA JSON valid dengan skema:
{
  "greeting": "Pembuka singkat dalam bahasa Indonesia",
  "smartphones": [
    {
      "name": "Nama lengkap smartphone",
      "price": 2999000,
      "camera_mp": 50,
      "ram_gb": 8,
      "battery_mah": 5000,
      "storage_gb": 128,
      "antutu": 410000,
      "specsNote": "Varian yang digunakan dan catatan singkat sumber data"
    }
  ]
}
Gunakan JSON number untuk angka dan null untuk data yang tidak dapat diverifikasi. Jangan memasukkan markdown atau teks di luar JSON.
`;

      const prompt = `
Tanggal pencarian (WIB): ${getIndonesiaDate()}
Pesan pengguna: ${JSON.stringify(message)}

Data smartphone dan hasil grounding:
${JSON.stringify(phoneContext)}

Susun spesifikasi enam kriteria untuk setiap smartphone sesuai aturan sumber data.
`;

      const aiResponse = await callAI(prompt, systemInstruction, true);
      const parsed = parseJsonResponse<any>(aiResponse);
      const aiPhones = Array.isArray(parsed?.smartphones)
        ? parsed.smartphones
        : Array.isArray(parsed?.phones)
        ? parsed.phones
        : Array.isArray(parsed)
        ? parsed
        : [];

      // Post-process: paksa data database tetap identik dan sumber web hanya berasal dari Tavily.
      const finalSmartphones = phoneCandidates.map((candidate, index) => {
        const context = phoneContext[index];
        const aiPhone = aiPhones[index] || {};

        if (context.sourceType === 'database' && context.databaseRecord) {
          const record = context.databaseRecord;
          const values = {
            price: safeNumber(record.price),
            camera_mp: safeNumber(record.camera_mp),
            ram_gb: safeNumber(record.ram_gb),
            battery_mah: safeNumber(record.battery_mah),
            storage_gb: safeNumber(record.storage_gb),
            antutu: safeNumber(record.antutu),
          };
          const missingFields = Object.entries(values)
            .filter(([, value]) => value === null)
            .map(([field]) => field);

          return {
            name: record.name,
            ...values,
            specsNote: missingFields.length
              ? `Data diambil dari database SesuaiDompet. Belum tersedia: ${missingFields.join(', ')}.`
              : 'Data diambil dari database SesuaiDompet.',
            dataSource: 'database',
            sources: [],
            missingFields,
          };
        }

        const values = {
          price: safeNumber(aiPhone.price),
          camera_mp: safeNumber(aiPhone.camera_mp),
          ram_gb: safeNumber(aiPhone.ram_gb),
          battery_mah: safeNumber(aiPhone.battery_mah),
          storage_gb: safeNumber(aiPhone.storage_gb),
          antutu: safeNumber(aiPhone.antutu),
        };
        const missingFields = Object.entries(values)
          .filter(([, value]) => value === null)
          .map(([field]) => field);
        const search = searches.get(candidate.name);
        const sources = (search?.results || []).slice(0, 5).map((result) => ({
          title: result.title || result.url || 'Sumber web',
          url: result.url,
          publishedDate: result.published_date || null,
          score: result.score ?? null,
        }));

        return {
          name: candidate.name,
          ...values,
          specsNote: String(aiPhone.specsNote || (missingFields.length
            ? 'Sebagian spesifikasi belum dapat diverifikasi dari hasil pencarian.'
            : 'Spesifikasi disusun berdasarkan hasil pencarian web.')),
          dataSource: 'web_search',
          sources,
          missingFields,
        };
      });

      const searchedCount = newPhoneCandidates.length;
      console.log(`[SEDO-AI Edge] Selesai. Model: ${finalSmartphones.length}, Tavily searches: ${searchedCount}`);

      return new Response(JSON.stringify({
        success: true,
        data: {
          greeting: String(parsed?.greeting || 'Berikut data smartphone yang berhasil disiapkan untuk perbandingan.'),
          smartphones: finalSmartphones,
          grounding: {
            provider: 'Tavily',
            searchDepth: 'basic',
            searchesMade: searchedCount,
            // Basic Search = 1 credit/request. Angka ini estimasi berdasarkan request yang dikirim.
            estimatedCreditsUsed: searchedCount,
            date: getIndonesiaDate(),
          },
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Action: Ulasan & Analisis Naratif Hasil Rekomendasi Juara SAW
    if (action === 'explain_recommendation') {
      console.log('[SEDO-AI Edge] Memproses explain_recommendation');
      const topPhone = rankedPhones[0];
      const contenders = rankedPhones.slice(1);

      const systemInstruction = `
Kamu adalah analis pakar Sistem Pendukung Keputusan (SPK) smartphone untuk platform "SesuaiDompet".
Tugasmu adalah memberikan ulasan narasi mengapa smartphone pemenang (#1) terpilih sebagai rekomendasi terbaik berdasarkan metode Simple Additive Weighting (SAW).

Kriteria & Bobot yang digunakan:
- C1 Harga (Cost / Makin murah makin baik): 22.9%
- C2 Kamera Utama (Benefit / Makin tinggi makin baik): 7.7%
- C3 RAM (Benefit / Makin besar makin baik): 26.5%
- C4 Baterai (Benefit / Makin besar makin baik): 17.7%
- C5 Penyimpanan ROM (Benefit / Makin besar makin baik): 15.2%
- C6 Prosesor AnTuTu (Benefit / Makin kencang makin baik): 10.0%

Aturan penulisan ulasan:
1. Berikan ucapan selamat/highlight kepada smartphone juara peringkat 1.
2. Jelaskan alasan ilmiah matematis secara logis (trade-off antara harga vs spesifikasi performa RAM/Baterai/Kamera/AnTuTu).
3. Berikan poin ringkas keunggulan utama dibanding pesaing lainnya.
4. Berikan saran persona: Smartphone ini paling cocok untuk tipe pengguna seperti apa.
5. Gunakan bahasa Indonesia santun, profesional, antusias, dan rapi dalam format Markdown (gunakan bullet points, tanpa tanda em-dash panjang).
`;

      const prompt = `
Hasil Perangkingan SAW:
- Juara 1: ${topPhone?.smartphone?.name} (Skor Preferensi V = ${topPhone?.totalScore?.toFixed(4)})
  Spesifikasi: Harga Rp ${topPhone?.smartphone?.price?.toLocaleString('id-ID')}, Kamera ${topPhone?.smartphone?.camera_mp} MP, RAM ${topPhone?.smartphone?.ram_gb} GB, Baterai ${topPhone?.smartphone?.battery_mah} mAh, ROM ${topPhone?.smartphone?.storage_gb} GB, AnTuTu ${topPhone?.smartphone?.antutu?.toLocaleString('id-ID')}

Kandidat Pesaing:
${contenders.map((c: any) => `- Peringkat ${c.rank}: ${c.smartphone.name} (Skor V = ${c.totalScore.toFixed(4)}, Harga Rp ${c.smartphone.price?.toLocaleString('id-ID')}, RAM ${c.smartphone.ram_gb}GB, AnTuTu ${c.smartphone.antutu})`).join('\n')}

Buatkan narasi analisis rekomendasi yang meyakinkan dan mudah dipahami.
`;

      const aiResponse = await callAI(prompt, systemInstruction, false);

      return new Response(JSON.stringify({ success: true, text: aiResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.warn('[SEDO-AI Edge] Action tidak dikenal:', action);
    return new Response(JSON.stringify({ error: `Action '${action}' tidak dikenal` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[SEDO-AI Edge] Fatal Handler Error:', err);
    const status = err instanceof HttpError ? err.status : 500;
    const code = err instanceof HttpError ? err.code : 'INTERNAL_ERROR';
    return new Response(JSON.stringify({
      success: false,
      code,
      error: err?.message || 'Server error',
    }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
