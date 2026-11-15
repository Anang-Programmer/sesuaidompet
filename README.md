# SesuaiDompet
### Sistem Pendukung Keputusan (SPK) Pemilihan Smartphone Berdasarkan Budget dan Kebutuhan Pengguna Menggunakan Metode Simple Additive Weighting (SAW) Terintegrasi Asisten AI (SEDO AI)

[![React](https://img.shields.io/badge/React-19.3-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Edge%20Functions-3ECF8E.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Academic%20Project-green.svg)]()

---

## Tentang Proyek

**SesuaiDompet** adalah aplikasi Sistem Pendukung Keputusan (SPK) berbasis web modern yang dirancang untuk membantu pengguna menentukan pilihan smartphone terbaik yang paling optimal, rasional, dan objektif sesuai ketersediaan anggaran (budget) serta preferensi spesifikasi teknis.

Sistem ini menerapkan metode **Simple Additive Weighting (SAW)**, yaitu metode penjumlahan terbobot yang mencari penjumlahan berbobot dari rating kinerja pada setiap alternatif di semua atribut/kriteria.

Selain perhitungan matematis SAW konvensional yang transparan, SesuaiDompet dilengkapi dengan **SEDO AI**, asisten cerdas berbasis Large Language Model (LLM) dengan kapabilitas *web grounding search* yang dapat mengekstrak nama smartphone dari percakapan santai, melengkapi 6 spesifikasi kriteria secara otomatis dari web, hingga menyajikan ulasan ilmiah alasan rekomendasi juara SAW lengkap dengan notasi matematika KaTeX.

---

## Kriteria Keputusan dan Pembobotan SAW

Sistem menggunakan 6 kriteria utama evaluasi smartphone dengan total bobot ternormalisasi $\sum w_j = 1.000$ (100%):

| Kode | Kriteria | Kategori (Atribut) | Bobot ($w_j$) | Satuan | Deskripsi Penilaian |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **C1** | **Harga** | **Cost** | **0.229 (22.9%)** | Rupiah (Rp) | Semakin murah harga smartphone, semakin tinggi nilai preferensinya. |
| **C2** | **Kamera Utama** | **Benefit** | **0.077 (7.7%)** | Megapixel (MP) | Semakin tinggi resolusi kamera, semakin optimal kualitas tangkapan foto. |
| **C3** | **RAM** | **Benefit** | **0.265 (26.5%)** | Gigabyte (GB) | Kapasitas memori multitasking dan stabilitas sistem. |
| **C4** | **Kapasitas Baterai** | **Benefit** | **0.177 (17.7%)** | Miliampere-hour (mAh) | Ketahanan daya operasional harian perangkat. |
| **C5** | **Penyimpanan Internal (ROM)** | **Benefit** | **0.152 (15.2%)** | Gigabyte (GB) | Ruang simpan data, foto, video, dan aplikasi. |
| **C6** | **Performa Prosesor (AnTuTu)** | **Benefit** | **0.100 (10.0%)** | Skor Benchmark | Kecepatan CPU dan GPU dalam menangani komputasi berat dan gaming. |

---

## Metodologi Penentuan dan Perhitungan Bobot Kriteria

Penentuan bobot kriteria pada sistem SesuaiDompet didasarkan pada kajian ilmiah dengan **menggabungkan dua jurnal penelitian SPK smartphone**. Masing-masing jurnal diberikan kontribusi bobot seimbang, yaitu **50% (0.50)**.

Dokumentasi lengkap dan referensi kalkulasi tersimpan pada file [docs/perhitungan_bobot.md](docs/perhitungan_bobot.md).

### Referensi Jurnal:
1. **Jurnal A**: Putri, Sari, & Garno (2026) - *PickPhone*, SPK pemilihan smartphone di e-commerce.
2. **Jurnal B**: Ramadhani, Parulian, & Surajiyo (2025) - SPK pemilihan smartphone Android untuk siswa SMK.

---

### Tahapan Perhitungan Bobot:

#### 1. Kompilasi Kriteria Awal dari Kedua Jurnal
Pada awalnya, kedua jurnal memiliki total 9 kriteria:

| No | Kriteria | Kategori | Bobot Jurnal A | Bobot Jurnal B |
| :---: | :--- | :---: | :---: | :---: |
| 1 | Harga | Cost | 20% | 15% |
| 2 | RAM | Benefit | 15% | 30% |
| 3 | Penyimpanan (ROM) | Benefit | 10% | 15% |
| 4 | Kamera Utama | Benefit | 10% | - |
| 5 | Baterai | Benefit | 10% | 20% |
| 6 | Prosesor (Skor AnTuTu) | Benefit | - | 20% |
| 7 | Jumlah Terjual | Benefit | 10% | - |
| 8 | Rating Produk | Benefit | 15% | - |
| 9 | Rating Toko | Benefit | 10% | - |
| | **Total** | | **100%** | **100%** |

#### 2. Eliminasi Kriteria Non-Spesifikasi Perangkat
Kriteria nomor 7 (Jumlah Terjual), 8 (Rating Produk), dan 9 (Rating Toko) dieliminasi karena:
- Bukan merupakan atribut spesifikasi teknis bawaan smartphone, melainkan atribut toko/marketplace (misal Shopee atau Tokopedia).
- Nilainya sangat dinamis dan selalu berubah setiap hari, sehingga tidak valid untuk perbandingan katalog smartphone yang konsisten.
- Kriteria yang dipertahankan adalah **6 kriteria spesifikasi murni**: Harga, Kamera, RAM, Baterai, Penyimpanan, dan Prosesor.

#### 3. Normalisasi Ulang Bobot Jurnal A
Setelah 3 kriteria dieliminasi, total bobot Jurnal A tersisa:
$$\sum w_A = 0.20 + 0.15 + 0.10 + 0.10 + 0.10 = 0.65$$

Agar total bobot kembali tepat 1 (100%), setiap bobot dibagi dengan total sisa:
$$w'_{A,j} = \frac{w_{A,j}}{\sum w_A} = \frac{w_{A,j}}{0.65}$$

| Kriteria | Bobot Awal | Rumus Normalisasi | Bobot Ternormalisasi ($w'_A$) |
| :--- | :---: | :---: | :---: |
| Harga | 0.20 | 0.20 / 0.65 | 0.307692... |
| RAM | 0.15 | 0.15 / 0.65 | 0.230769... |
| Penyimpanan | 0.10 | 0.10 / 0.65 | 0.153846... |
| Kamera | 0.10 | 0.10 / 0.65 | 0.153846... |
| Baterai | 0.10 | 0.10 / 0.65 | 0.153846... |
| Prosesor | - | (tidak diteliti pada Jurnal A) | 0.000000 |
| **Total** | **0.65** | | **1.000000** |

*(Jurnal B tidak mengalami eliminasi kriteria sehingga totalnya tetap 1.00. Kriteria Kamera tidak diteliti pada Jurnal B sehingga bernilai 0).*

#### 4. Penggabungan Rata-Rata Kedua Jurnal (Bobot Gabungan 50:50)
Bobot gabungan dihitung dengan rata-rata berbobot seimbang:
$$W_j = \frac{w'_{A,j} + w_{B,j}}{2}$$

| Kode | Kriteria | Kategori | Jurnal A ($w'_A$) | Jurnal B ($w_B$) | Perhitungan | Bobot Penuh ($W_j$) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **C1** | Harga | Cost | 0.307692 | 0.15 | (0.307692 + 0.15) / 2 | 0.228846 |
| **C2** | Kamera | Benefit | 0.153846 | 0.00 | (0.153846 + 0) / 2 | 0.076923 |
| **C3** | RAM | Benefit | 0.230769 | 0.30 | (0.230769 + 0.30) / 2 | 0.265385 |
| **C4** | Baterai | Benefit | 0.153846 | 0.20 | (0.153846 + 0.20) / 2 | 0.176923 |
| **C5** | Penyimpanan | Benefit | 0.153846 | 0.15 | (0.153846 + 0.15) / 2 | 0.151923 |
| **C6** | Prosesor | Benefit | 0.000000 | 0.20 | (0 + 0.20) / 2 | 0.100000 |
| | **Total** | | **1.000000** | **1.000000** | | **1.000000** |

#### 5. Pembulatan Akhir (1 Desimal Persentase)
Seluruh perhitungan perantara dilakukan dengan nilai desimal penuh tanpa pembulatan awal. Pembulatan dilakukan hanya satu kali pada langkah akhir ke **1 angka di belakang koma (dalam %)**:

| Kode | Kriteria | Hasil Penuh (%) | Dibulatkan (%) | Bobot Desimal ($w_j$) | Aturan Pembulatan |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **C1** | Harga | 22.8846% | **22.9%** | **0.229** | Angka ke-2 desimal = 8 (>= 5) -> naik |
| **C2** | Kamera | 7.6923% | **7.7%** | **0.077** | Angka ke-2 desimal = 9 (>= 5) -> naik |
| **C3** | RAM | 26.5385% | **26.5%** | **0.265** | Angka ke-2 desimal = 3 (< 5) -> turun |
| **C4** | Baterai | 17.6923% | **17.7%** | **0.177** | Angka ke-2 desimal = 9 (>= 5) -> naik |
| **C5** | Penyimpanan | 15.1923% | **15.2%** | **0.152** | Angka ke-2 desimal = 9 (>= 5) -> naik |
| **C6** | Prosesor | 10.0000% | **10.0%** | **0.100** | Tetap |
| | **Total** | **100.0000%** | **100.0%** | **1.000** | **Tepat 100% (Valid)** |

> [!NOTE]
> Nilai bobot desimal inilah (**0.229, 0.077, 0.265, 0.177, 0.152, 0.100**) yang ditanamkan ke dalam database Supabase dan engine perhitungan aplikasi agar seluruh proses kalkulasi matematis konsisten antara sistem dan dokumen akademik.

---

## Tahapan Perhitungan Metode SAW

Perhitungan pada aplikasi mengikuti 8 langkah baku metode Simple Additive Weighting:

1. **Pembentukan Kriteria ($C_j$) & Alternatif ($A_i$)**: Mengidentifikasi daftar smartphone yang akan dibandingkan dan kriteria yang relevan.
2. **Penentuan & Normalisasi Bobot ($w_j$)**: Memastikan total bobot kriteria berjumlah 1. Jika pengguna mengubah bobot, sistem melakukan normalisasi otomatis:
   $$w_j = \frac{W_j}{\sum_{k=1}^m W_k}$$
3. **Pembentukan Matriks Keputusan ($X$)**: Matriks berukuran $m \times n$ di mana elemen $x_{ij}$ menyatakan nilai alternatif ke-$i$ pada kriteria ke-$j$.
4. **Penentuan Nilai Ekstrem**:
   - Nilai Maksimum untuk kriteria Benefit: $\max_i(x_{ij})$
   - Nilai Minimum untuk kriteria Cost: $\min_i(x_{ij})$
5. **Normalisasi Matriks Keputusan ($R$)**:
   - Kriteria **Benefit**:
     $$r_{ij} = \frac{x_{ij}}{\max_i(x_{ij})}$$
   - Kriteria **Cost**:
     $$r_{ij} = \frac{\min_i(x_{ij})}{x_{ij}}$$
6. **Perhitungan Nilai Preferensi ($V_i$)**: Penjumlahan hasil kali matriks ternormalisasi dengan bobot kriteria:
   $$V_i = \sum_{j=1}^{n} (w_j \times r_{ij})$$
7. **Perangkingan (Ranking)**: Mengurutkan alternatif berdasarkan nilai preferensi $V_i$ dari yang tertinggi ke yang terendah.
8. **Pengambilan Keputusan**: Alternatif dengan nilai $V_i$ tertinggi ditetapkan sebagai rekomendasi terbaik (Juara #1).

---

## Fitur-Fitur Utama

### 1. Modul SPK Klasik
- **Katalog Alternatif Smartphone**: Manajemen data smartphone (CRUD) lengkap dengan filter harga dan 6 spesifikasi kriteria.
- **Manajemen Kriteria & Bobot**: Penyesuaian bobot fleksibel dengan validasi normalisasi otomatis.
- **Matriks Keputusan (X)**: Tinjauan tabel matriks mentah seluruh alternatif aktif.
- **Bandingkan Fleksibel**: Memilih subset smartphone tertentu (misal 2 sampai 4 HP) dengan filter batas maksimal budget pengguna.
- **Detail Langkah Perhitungan SAW**: Transparansi penuh tahapan matematis (Matriks X, Matriks Ternormalisasi R, dan Nilai Preferensi V) yang dapat ditinjau langkah demi langkah.
- **Hasil & Rekomendasi Juara**: Visualisasi pemenang peringkat 1, kartu keunggulan spesifikasi, dan tabel komparasi ranking.
- **Riwayat Perhitungan**: Penyimpanan snapshot hasil kalkulasi ke database untuk ditinjau kembali di kemudian hari.

### 2. Asisten Cerdas SEDO AI
- **Natural Language Parsing**: Ekstraksi nama smartphone dari pesan percakapan bebas (contoh: *"Bantu pilihkan Oppo A77s, Realme C55, atau Samsung Galaxy A54"*).
- **Web Grounding via Tavily Search**: Pencarian cerdas spesifikasi terkini di web untuk model-model smartphone yang belum terdaftar di database.
- **Interactive Spec Cards**: Kartu spesifikasi interaktif di dalam chat di mana pengguna dapat mengedit angka spesifikasi sebelum perhitungan dijalankan.
- **Multi-Provider AI Fallback**: Mendukung integrasi provider AI fleksibel melalui format OpenAI-compatible (Groq, OpenRouter, DeepSeek, dsb.) dan Google Gemini API.
- **Scientific KaTeX Rendering**: Menampilkan penjelasan matematis dan formula formula ilmiah ($\Sigma$, pecahan normalisasi, skor preferensi) menggunakan engine KaTeX.
- **Riwayat Obrolan Persisten**: Percakapan tidak hilang saat berpindah halaman atau me-refresh browser. Dilengkapi panel drawer riwayat untuk membuka obrolan lama atau memulai obrolan baru.
- **Sinkronisasi Otomatis ke Halaman Detail**: Mengklik tombol *"Buka Detail Langkah SAW"* dari chat akan langsung mengarahkan ke halaman perhitungan dengan HANYA smartphone percakapan yang tercentang.

---

## Arsitektur dan Teknologi

| Lapisan | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** + **Vite 8** | Single Page Application (SPA) dengan performa build ultra cepat |
| **Styling** | **Tailwind CSS v4** | Desain enterprise kompak, clean, responsif, dan konsisten |
| **Routing** | **React Router DOM v7** | Manajemen rute dengan sistem Protected Route |
| **Icons & Visuals** | **Lucide React** | Ikon vektor modern dan ringan |
| **Math Typesetting** | **KaTeX** | Rendering formula matematika LaTeX di sisi klien tanpa lag |
| **Backend as a Service**| **Supabase** | PostgreSQL Database, Autentikasi Pengguna (Email & Google OAuth), Row Level Security (RLS) |
| **Serverless Function** | **Supabase Edge Functions (Deno)** | Backend serverless untuk orkestrasi AI, penelusuran web, dan analisis ulasan |
| **Search Engine API** | **Tavily Search API** | Penelusuran web terstruktur untuk grounding spesifikasi smartphone |
| **AI LLM Engine** | **Groq / OpenRouter / Gemini** | Ekstraksi entitas smartphone dan narasi ulasan ilmiah SAW |

---

## Struktur Direktori Proyek

```
sesuaidompet/
├── public/                       # Aset publik statis
├── src/
│   ├── components/               # Komponen UI modular
│   │   ├── GoogleLoginButton.jsx # Tombol autentikasi Google OAuth
│   │   ├── Layout.jsx            # Layout utama aplikasi dengan Sidebar navigasi
│   │   ├── MarkdownRenderer.jsx  # Perender Markdown & Formula KaTeX
│   │   ├── PageHeader.jsx        # Komponen header halaman standar
│   │   ├── ProtectedRoute.jsx    # Guard halaman khusus pengguna terautentikasi
│   │   ├── SawStepTables.jsx     # Komponen visualisasi 3 matriks SAW (X, R, V)
│   │   └── Sidebar.jsx           # Navigasi samping
│   ├── context/                  # State management React Context
│   │   ├── AuthContext.js        # Konteks status login pengguna
│   │   ├── AuthProvider.jsx      # Provider autentikasi Supabase
│   │   └── SawSessionProvider.jsx# Provider sesi filter & pilihan alternatif aktif
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.js            # Hook akses AuthContext
│   │   └── useSawSession.js      # Hook akses SawSessionContext
│   ├── lib/
│   │   └── supabase.js           # Inisialisasi klien Supabase JS
│   ├── pages/                    # Halaman-halaman rute aplikasi
│   │   ├── Alternatif.jsx        # CRUD data smartphone
│   │   ├── Bandingkan.jsx        # Pilihan alternatif & filter budget
│   │   ├── Dashboard.jsx         # Ringkasan analitik dan status kriteria
│   │   ├── Hasil.jsx             # Hasil rekomendasi juara #1 dan perangkingan
│   │   ├── Home.jsx              # Landing page publik
│   │   ├── Kriteria.jsx          # Manajemen 6 kriteria & pembobotan
│   │   ├── Login.jsx             # Halaman masuk
│   │   ├── Penilaian.jsx         # Matriks keputusan awal
│   │   ├── Perhitungan.jsx       # Detail langkah matematis SAW
│   │   ├── Register.jsx          # Halaman pendaftaran
│   │   ├── Riwayat.jsx           # Log riwayat perhitungan tersimpan
│   │   └── SedoAI.jsx            # Asisten cerdas SEDO AI
│   ├── services/
│   │   ├── sedoAiService.js      # Service penghubung ke Edge Function
│   │   └── spkService.js         # Service CRUD database Supabase
│   ├── utils/
│   │   ├── formatters.js         # Format mata uang Rupiah dan desimal
│   │   └── sawCalculator.js      # Engine murni kalkulasi matematis metode SAW
│   ├── App.jsx                   # Konfigurasi rute React Router
│   ├── index.css                 # Konfigurasi Tailwind CSS v4 & theme
│   └── main.jsx                  # Entry point aplikasi React
├── supabase/
│   └── functions/
│       └── sedo-ai/
│           └── index.ts          # Kode Deno Edge Function untuk SEDO AI
├── .env.local                    # Konfigurasi environment lokal (API keys)
├── package.json                  # Dependensi dan skrip proyek
├── vite.config.js                # Konfigurasi bundler Vite
└── README.md                     # Dokumentasi komprehensif proyek
```

---

## Panduan Instalasi dan Menjalankan Proyek

### Prasyarat
- [Node.js](https://nodejs.org/) versi 20.x atau 22.x
- [NPM](https://www.npmjs.com/) versi 10.x ke atas
- Akun dan proyek aktif di [Supabase](https://supabase.com/)

### 1. Kloning Repositori
```bash
git clone https://github.com/username/sesuaidompet.git
cd sesuaidompet
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan (`.env.local`)
Buat file `.env.local` pada direktori *root* proyek:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Skema Database Supabase
Jalankan query berikut pada **SQL Editor** di Dashboard Supabase kamu:

```sql
-- 1. Tabel Kriteria
CREATE TABLE public.criteria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  field VARCHAR(50) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('cost', 'benefit')) NOT NULL,
  weight NUMERIC(5,3) NOT NULL,
  unit VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Data Kriteria Default
INSERT INTO public.criteria (code, name, field, type, weight, unit) VALUES
  ('C1', 'Harga', 'price', 'cost', 0.229, 'Rp'),
  ('C2', 'Kamera Utama', 'camera_mp', 'benefit', 0.077, 'MP'),
  ('C3', 'RAM', 'ram_gb', 'benefit', 0.265, 'GB'),
  ('C4', 'Kapasitas Baterai', 'battery_mah', 'benefit', 0.177, 'mAh'),
  ('C5', 'Penyimpanan Internal', 'storage_gb', 'benefit', 0.152, 'GB'),
  ('C6', 'Performa Prosesor', 'antutu', 'benefit', 0.100, 'Skor');

-- 2. Tabel Alternatif Smartphone
CREATE TABLE public.smartphones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  price BIGINT NOT NULL,
  camera_mp NUMERIC(5,1) NOT NULL,
  ram_gb INT NOT NULL,
  battery_mah INT NOT NULL,
  storage_gb INT NOT NULL,
  antutu INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Riwayat Perhitungan
CREATE TABLE public.calculation_histories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  max_budget BIGINT,
  weights_used JSONB NOT NULL,
  top_smartphone_name VARCHAR(150) NOT NULL,
  top_score NUMERIC(8,4) NOT NULL,
  results_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS) sesuai kebutuhan kebijakan data
ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartphones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculation_histories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read criteria" ON public.criteria FOR SELECT USING (true);
CREATE POLICY "Allow all access for smartphones" ON public.smartphones FOR ALL USING (true);
CREATE POLICY "Allow all access for calculation_histories" ON public.calculation_histories FOR ALL USING (true);
```

### 5. Konfigurasi Supabase Edge Function (`sedo-ai`)
Untuk mengaktifkan asisten cerdas **SEDO AI**:
1. Pasang rahasia API (*Secrets*) di **Project Settings > Edge Functions > Secrets**:
   - `GROQ_API_KEY`: Kunci API gratis dari [Groq Console](https://console.groq.com/)
   - `OPENROUTER_API_KEY`: Kunci API gratis dari [OpenRouter](https://openrouter.ai/) (cadangan)
   - `TAVILY_API_KEY`: Kunci API gratis dari [Tavily AI](https://tavily.com/)
2. Buka menu **Edge Functions > Deploy** atau salin kode [supabase/functions/sedo-ai/index.ts](supabase/functions/sedo-ai/index.ts) ke editor Edge Function Supabase dengan nama `sedo-ai`.

### 6. Menjalankan Aplikasi
```bash
# Menjalankan server pengembangan lokal (Vite Dev Server)
npm run dev
```
Buka browser pada alamat `http://localhost:5173/`.

### 7. Membangun untuk Produksi
```bash
npm run build
npm run preview
```

---

## Kontributor

Proyek ini dikembangkan untuk memenuhi tugas kelompok mata kuliah **Sistem Pendukung Keputusan (Semester 5)**.

---

## Lisensi

Proyek ini dilisensikan untuk keperluan akademik dan edukasi. Dikembangkan dengan dedikasi untuk menyajikan implementasi nyata algoritma SPK modern berbasis web.
