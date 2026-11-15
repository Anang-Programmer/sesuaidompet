# Project Blueprint: SesuaiDompet (SPK Pemilihan Smartphone Terbaik)

## 1. Project Overview
- **Nama Aplikasi**: SesuaiDompet
- **Deskripsi**: Sistem Pendukung Keputusan (SPK) berbasis web untuk merekomendasikan smartphone terbaik sesuai dengan spesifikasi dan budget, menggunakan metode Simple Additive Weighting (SAW).
- **Tech Stack**: 
  - **Frontend**: React.js (JSX)
  - **Styling**: Tailwind CSS (direkomendasikan untuk UI yang cepat dan responsif)
  - **Routing**: React Router DOM
  - **Backend & Database**: Supabase (PostgreSQL, Authentication, Row Level Security)
  - **Hosting/Deployment**: Vercel / Netlify (Frontend), Supabase (Backend)

---

## 2. Spesifikasi Kriteria & Bobot (Berdasarkan Dokumen Perhitungan)
AI Agent wajib menggunakan struktur data ini untuk perhitungan logika SAW. Total bobot = 100%. Nilai setiap kriteria memakai **angka asli spesifikasi smartphone** (tanpa konversi ke skala 1–5). Lihat bagian "Format Nilai Kriteria (Angka Asli)" di bawah.

| Kode | Kriteria | Jenis | Bobot |
|---|---|---|---|
| **C1** | Harga | Cost | 22,9% (0.229) |
| **C2** | Kamera | Benefit | 7,7% (0.077) |
| **C3** | RAM | Benefit | 26,5% (0.265) |
| **C4** | Baterai | Benefit | 17,7% (0.177) |
| **C5** | Kapasitas Penyimpanan (ROM) | Benefit | 15,2% (0.152) |
| **C6** | Prosesor (Skor AnTuTu) | Benefit | 10,0% (0.100) |
| | **Total** | | **100% (1.000)** |

> **Penting:** Aplikasi dan dokumen perhitungan manual wajib memakai angka desimal yang sama persis (0.229; 0.077; 0.265; 0.177; 0.152; 0.100) supaya hasil ranking sama.

### Dasar Penentuan Bobot (Gabungan 2 Jurnal)
Bobot disusun dengan menggabungkan dua jurnal. Masing-masing jurnal memberi kontribusi yang sama, yaitu 50%.

| Kode Referensi | Jurnal |
|---|---|
| **Jurnal A** | Putri, Sari, & Garno (2026) — *PickPhone*, SPK pemilihan smartphone di e-commerce |
| **Jurnal B** | Ramadhani, Parulian, & Surajiyo (2025) — SPK pemilihan smartphone Android untuk siswa SMK |

**Aturan pembulatan:** semua perhitungan memakai nilai penuh tanpa dibulatkan. Pembulatan hanya dilakukan **satu kali di langkah terakhir**, ke 1 angka di belakang koma (dalam %), dengan aturan pembulatan biasa (≥ 5 naik, < 5 turun).

**Langkah 1 — Daftar kriteria dari kedua jurnal**

| No | Kriteria | Jenis | Jurnal A | Jurnal B |
|---|---|---|:---:|:---:|
| 1 | Harga | Cost | 20% | 15% |
| 2 | RAM | Benefit | 15% | 30% |
| 3 | Penyimpanan (ROM) | Benefit | 10% | 15% |
| 4 | Kamera | Benefit | 10% | — |
| 5 | Baterai | Benefit | 10% | 20% |
| 6 | Prosesor (skor AnTuTu) | Benefit | — | 20% |
| 7 | Jumlah Terjual | Benefit | 10% | — |
| 8 | Rating Produk | Benefit | 15% | — |
| 9 | Rating Toko | Benefit | 10% | — |
| | **Total** | | **100%** | **100%** |

**Langkah 2 — Eliminasi kriteria yang tidak relevan**

Kriteria no. 7, 8, dan 9 dibuang karena:
- Ketiganya tidak berkaitan dengan spesifikasi smartphone. Nilainya bergantung pada toko atau marketplace tertentu.
- Nilainya selalu berubah setiap hari, sehingga tidak cocok dipakai sebagai data alternatif yang tetap.
- Studi kasus di panduan proyek berfokus pada spesifikasi smartphone.

**Langkah 3 — Normalisasi ulang bobot Jurnal A**

Setelah 3 kriteria dibuang, total bobot Jurnal A yang tersisa = 0,20 + 0,15 + 0,10 + 0,10 + 0,10 = **0,65**. Agar totalnya kembali 1, setiap bobot dibagi dengan total tersebut: `w'j = wj / Σwj = wj / 0,65`

| Kriteria | Bobot Awal | Perhitungan | Bobot Baru Jurnal A |
|---|:---:|:---:|:---:|
| Harga | 0,20 | 0,20 / 0,65 | 0,307692… |
| RAM | 0,15 | 0,15 / 0,65 | 0,230769… |
| Penyimpanan | 0,10 | 0,10 / 0,65 | 0,153846… |
| Kamera | 0,10 | 0,10 / 0,65 | 0,153846… |
| Baterai | 0,10 | 0,10 / 0,65 | 0,153846… |
| Prosesor | — | tidak diteliti | 0 |
| **Total** | **0,65** | | **1,000000** |

Bobot Jurnal B tidak perlu dinormalisasi ulang karena tidak ada kriteria yang dibuang (total tetap 1,00). Kamera tidak diteliti di Jurnal B, jadi bobotnya 0 pada jurnal tersebut.

**Langkah 4 — Penggabungan kedua jurnal (rata-rata)**: `Wj = (w'A,j + wB,j) / 2`

| Kode | Kriteria | Jurnal A | Jurnal B | Perhitungan | Bobot Gabungan |
|---|---|:---:|:---:|:---:|:---:|
| C1 | Harga | 0,307692 | 0,15 | (0,307692 + 0,15) / 2 | 0,228846 |
| C2 | Kamera | 0,153846 | 0 | (0,153846 + 0) / 2 | 0,076923 |
| C3 | RAM | 0,230769 | 0,30 | (0,230769 + 0,30) / 2 | 0,265385 |
| C4 | Baterai | 0,153846 | 0,20 | (0,153846 + 0,20) / 2 | 0,176923 |
| C5 | Penyimpanan | 0,153846 | 0,15 | (0,153846 + 0,15) / 2 | 0,151923 |
| C6 | Prosesor | 0 | 0,20 | (0 + 0,20) / 2 | 0,100000 |
| | **Total** | **1,000000** | **1,00** | | **1,000000** |

**Langkah 5 — Pembulatan (satu kali, di akhir)**

| Kode | Kriteria | Hasil Penuh (%) | Dibulatkan | Keterangan |
|---|---|:---:|:---:|---|
| C1 | Harga | 22,8846 | **22,9** | angka ke-2 = 8 → naik |
| C2 | Kamera | 7,6923 | **7,7** | angka ke-2 = 9 → naik |
| C3 | RAM | 26,5385 | **26,5** | angka ke-2 = 3 → turun |
| C4 | Baterai | 17,6923 | **17,7** | angka ke-2 = 9 → naik |
| C5 | Penyimpanan | 15,1923 | **15,2** | angka ke-2 = 9 → naik |
| C6 | Prosesor | 10,0000 | **10,0** | tetap |
| | **Total** | **100,0000** | **100,0** | ✅ |

Semua angka dibulatkan dengan aturan yang sama dan totalnya tepat 100%, tanpa ada angka yang perlu disesuaikan.

### Format Nilai Kriteria (Angka Asli)
Matriks keputusan (X) diisi langsung dengan **angka asli spesifikasi smartphone**, tanpa konversi ke skala 1–5. Langkah normalisasi SAW sudah otomatis menyamakan setiap kriteria ke skala 0–1. Pendekatan ini mengikuti contoh di PPT dosen (nilai IPK dan penghasilan dipakai apa adanya) dan Jurnal A (Putri dkk., 2026).

| Kode | Kriteria | Jenis | Satuan Input | Contoh | Rumus Normalisasi |
|---|---|---|---|---|---|
| **C1** | Harga | Cost | Rupiah | 2599000 | $r_{ij} = \frac{\min_i x_{ij}}{x_{ij}}$ |
| **C2** | Kamera | Benefit | MP (kamera belakang utama) | 50 | $r_{ij} = \frac{x_{ij}}{\max_i x_{ij}}$ |
| **C3** | RAM | Benefit | GB | 8 | $r_{ij} = \frac{x_{ij}}{\max_i x_{ij}}$ |
| **C4** | Baterai | Benefit | mAh | 5000 | $r_{ij} = \frac{x_{ij}}{\max_i x_{ij}}$ |
| **C5** | Kapasitas Penyimpanan (ROM) | Benefit | GB (1 TB ditulis 1024) | 256 | $r_{ij} = \frac{x_{ij}}{\max_i x_{ij}}$ |
| **C6** | Prosesor | Benefit | Skor AnTuTu | 850000 | $r_{ij} = \frac{x_{ij}}{\max_i x_{ij}}$ |

**Aturan validasi input:**
- Semua nilai wajib berupa **angka positif lebih dari 0**. Nilai 0 akan membuat rumus Cost ($\frac{\min_i x_{ij}}{x_{ij}}$) membagi dengan nol.
- **Satuan wajib konsisten** untuk semua alternatif. Contohnya ROM selalu dalam GB, kamera selalu MP kamera utama, dan harga dalam Rupiah tanpa titik.
- Skor AnTuTu memakai **versi AnTuTu yang sama** untuk semua alternatif, supaya bisa dibandingkan.

### Alur & Rumus Perhitungan Metode SAW (Sesuai PPT Dosen)
Tahapan algoritma SAW di aplikasi **harus mengikuti 8 langkah pada materi PPT Dosen** secara persis agar hasilnya cocok 100% dengan dokumen perhitungan manual:

1. **Menentukan Alternatif ($A_i$) & Kriteria ($C_j$):** Memilih daftar smartphone yang memiliki 6 spesifikasi lengkap dan daftar kriteria C1–C6 beserta sifatnya (`Cost` / `Benefit`).
2. **Menentukan Bobot Kriteria ($w_j$):** Menggunakan bobot default Admin (`0.229; 0.077; 0.265; 0.177; 0.152; 0.100`, total = `1.000`) atau bobot kustom. Jika bobot kustom yang dimasukkan belum berjumlah $1$ (misal skala 0–100), lakukan normalisasi bobot terlebih dahulu (Slide 5 PPT):
   $$W_j = \frac{w_j}{\sum_{j=1}^{n} w_j}$$
3. **Menyusun Matriks Keputusan ($X$):** Membentuk matriks berukuran $m \times n$ ($m$ alternatif, $n = 6$ kriteria) dari angka asli spesifikasi masing-masing smartphone.
4. **Menentukan Nilai Maksimum dan Minimum Setiap Kriteria:** Mencari nilai $\max_i x_{ij}$ untuk kriteria **Benefit** dan $\min_i x_{ij}$ untuk kriteria **Cost** di setiap kolom kriteria.
5. **Melakukan Normalisasi Matriks Keputusan ($R$):** Menghitung nilai $r_{ij}$ agar seluruh kriteria berada pada skala $0 - 1$:
   $$r_{ij} = \begin{cases} \dfrac{x_{ij}}{\max_i x_{ij}}, & \text{jika kriteria Benefit} \\[8pt] \dfrac{\min_i x_{ij}}{x_{ij}}, & \text{jika kriteria Cost} \end{cases}$$
6. **Menghitung Nilai Preferensi ($V_i$):** Menjumlahkan hasil perkalian bobot dengan nilai normalisasi untuk setiap alternatif:
   $$V_i = \sum_{j=1}^{n} w_j \cdot r_{ij}$$
7. **Melakukan Perangkingan:** Mengurutkan nilai $V_i$ secara *descending* (dari terbesar ke terkecil).
8. **Menarik Kesimpulan:** Alternatif dengan nilai $V_i$ tertinggi ditetapkan sebagai smartphone terbaik yang paling direkomendasikan.

> **Aturan Presisi & Pembulatan (Sinkron dengan Manual):**
> Selama perhitungan di dalam kode (`sawCalculator.js`) dan Excel/manual, hitung menggunakan presisi penuh dan tampilkan/bulatkan hasil $r_{ij}$, perkalian $w_j \cdot r_{ij}$, serta skor akhir $V_i$ hingga **4 angka di belakang koma** (sesuai contoh pada Slide 15 & 17 PPT Dosen).

**Contoh normalisasi (3 HP):**

| HP | Harga | RAM | r Harga ($\min \div x$) | r RAM ($x \div \max$) |
|---|---|:---:|---|---|
| A | 2.500.000 | 8 | 1.800.000 ÷ 2.500.000 = 0,7200 | 8 ÷ 12 = 0,6667 |
| B | 3.500.000 | 12 | 1.800.000 ÷ 3.500.000 = 0,5143 | 12 ÷ 12 = 1,0000 |
| C | 1.800.000 | 6 | 1.800.000 ÷ 1.800.000 = 1,0000 | 6 ÷ 12 = 0,5000 |

---

## 3. Spesifikasi Fitur Utama (Sesuai Panduan Proyek)
Aplikasi wajib memuat fitur-fitur berikut agar memenuhi standar penilaian (poin 5 dalam panduan):

1. **Autentikasi (Login & Register)**: Halaman login dan daftar menggunakan Supabase Auth (email + password) dengan 2 role: **Admin** dan **User Biasa**. Akun baru otomatis menjadi User Biasa. Semua halaman lain hanya bisa dibuka setelah login.
2. **Dashboard**: Menampilkan ringkasan sistem (Total alternatif, Total kriteria, HP peringkat 1 saat ini, dll).
3. **Manajemen Data Kriteria & Bobot**: Menampilkan tabel C1–C6 dari tabel `criteria`.
   - **Admin**: dapat mengedit bobot dan jenis (Cost/Benefit) dengan validasi total bobot harus tepat 1,000 (100%) sebelum disimpan.
   - **User Biasa**: melihat bobot default dari Admin (read-only), dengan opsi simulasi bobot kustom/filter budget pribadi saat perhitungan tanpa mengubah data master.
4. **Manajemen Data Alternatif**: Fitur CRUD untuk mendata daftar smartphone pada tabel `smartphones`:
   - **Admin**: mengelola data katalog master (`user_id = null`, terlihat oleh semua user).
   - **User Biasa**: dapat melihat semua katalog master serta menambah/mengedit/menghapus data smartphone **input manual** miliknya sendiri (`user_id = auth.uid()`).
5. **Data Penilaian (Input Matriks Keputusan)**: Form untuk menginput angka asli spesifikasi smartphone (misal: Harga 3500000, RAM 8, Baterai 5000). Bisa diisi langsung saat menambah smartphone atau lewat halaman Penilaian. Angka ini langsung menjadi isi matriks keputusan (X) tanpa konversi, dengan validasi sesuai aturan di Bagian 2.
6. **Proses Perhitungan Metode SAW**: Logika di _frontend_ yang menjalankan algoritma SAW secara otomatis terhadap smartphone yang dipilih/memiliki spesifikasi lengkap.
7. **Detail Perhitungan**: Halaman transparan yang menampilkan tahapan SAW untuk memudahkan validasi dosen:
   - Tabel Matriks Keputusan (X)
   - Nilai Max (Benefit) / Min (Cost) setiap kriteria
   - Tabel Matriks Ternormalisasi (R)
   - Perhitungan Nilai Preferensi (V)
8. **Hasil Rekomendasi/Perankingan**: Tabel hasil akhir yang diurutkan dari skor V tertinggi ke terendah, menobatkan smartphone terbaik.
9. **Riwayat Perhitungan**: Menyimpan hasil perhitungan SAW (beserta bobot dan snapshot ranking saat itu) ke tabel `calculation_histories`, sehingga user dapat membuka kembali riwayat rekomendasi sebelumnya tanpa terpengaruh perubahan data master di kemudian hari.

---

## 4. Desain Skema Database (Supabase)

Database dibuat **ringkas dan jelas: 4 tabel saja**.
- **`users`**: menyimpan profil dan role pengguna (`'admin'` atau `'user'`), terhubung ke `auth.users` milik Supabase Auth.
- **`criteria`**: data kriteria dan bobot default (C1–C6). Hanya **Admin** yang bisa mengedit bobot (berguna saat demo jika dosen meminta mengubah bobot).
- **`smartphones`**: data alternatif sekaligus nilai spesifikasinya. Kolom `user_id` membedakan antara **katalog master dari Admin** (`user_id = null`, bisa dilihat semua user) dan **input manual dari User Biasa** (`user_id = id user`, hanya bisa dilihat & diubah oleh user pembuatnya).
- **`calculation_histories`**: menyimpan riwayat perhitungan & ranking yang pernah dijalankan oleh user, lengkap dengan snapshot bobot dan hasilnya agar tetap akurat walau data master berubah.

### Tabel `users`
| Column | Type | Keterangan |
|---|---|---|
| id | uuid | Primary Key, Foreign Key ke `auth.users(id)` |
| name | text | Nama pengguna |
| email | text | Email pengguna |
| role | text | `'admin'` atau `'user'` (default `'user'`) |
| created_at | timestamptz | Waktu akun dibuat |

### Tabel `criteria`
| Column | Type | Keterangan |
|---|---|---|
| id | serial | Primary Key |
| code | text | C1, C2, dst. (unik) |
| name | text | Harga, Kamera, dll |
| field | text | Nama kolom di tabel `smartphones` yang dinilai (misal: `price`) |
| type | text | `'cost'` atau `'benefit'` |
| weight | numeric(4,3) | 0.229, 0.077, dll |
| unit | text | Rupiah, MP, GB, mAh, skor |

### Tabel `smartphones` (Alternatif + Nilai Spesifikasi)
| Column | Type | Keterangan |
|---|---|---|
| id | serial | Primary Key |
| user_id | uuid | Foreign Key ke `public.users(id)` (opsional: `NULL` = katalog master Admin, terisi = input manual milik user) |
| name | text | Nama smartphone (misal: Redmi Note 14) |
| price | bigint | C1 — Harga dalam Rupiah |
| camera_mp | numeric | C2 — Kamera utama dalam MP |
| ram_gb | integer | C3 — RAM dalam GB |
| battery_mah | integer | C4 — Baterai dalam mAh |
| storage_gb | integer | C5 — Penyimpanan dalam GB |
| antutu | integer | C6 — Skor AnTuTu |
| created_at | timestamptz | Waktu data dibuat |

*(Catatan: Kolom spesifikasi boleh kosong saat HP baru ditambahkan di halaman Alternatif lalu dilengkapi di halaman Penilaian, atau langsung diisi sekaligus saat input manual. HP yang spesifikasinya belum lengkap **tidak diikutkan** dalam perhitungan SAW dan diberi tanda "belum dinilai". Angka asli langsung dipakai sebagai matriks keputusan (X), tanpa konversi ke skala 1–5.)*

### Tabel `calculation_histories` (Riwayat Perhitungan SAW)
| Column | Type | Keterangan |
|---|---|---|
| id | serial | Primary Key |
| user_id | uuid | Foreign Key ke `public.users(id)` |
| title | text | Judul/catatan perhitungan (misal: "Cari HP Budget 3 Jutaan") |
| max_budget | bigint | (Opsional) Batas budget maksimal yang dipilih user |
| weights_used | jsonb | Snapshot bobot kriteria yang dipakai saat itu |
| top_smartphone_name | text | Nama HP peringkat 1 |
| top_score | numeric(5,4) | Nilai preferensi (V) tertinggi |
| results_snapshot | jsonb | Snapshot matriks & daftar ranking lengkap |
| created_at | timestamptz | Waktu perhitungan disimpan |

### Script SQL (jalankan di Supabase → SQL Editor)
```sql
-- 1. Tabel users (profil + role)
create table if not exists public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  email      text not null,
  role       text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now()
);

-- Otomatis masukkan user baru ke public.users dengan role 'user'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.email, ''),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sinkronkan jika sudah terlanjur ada akun di auth.users sebelum script dijalankan
insert into public.users (id, name, email, role)
select
  id,
  coalesce(nullif(trim(raw_user_meta_data->>'name'), ''), split_part(coalesce(email, ''), '@', 1)),
  coalesce(email, ''),
  'user'
from auth.users
on conflict (id) do nothing;

-- Helper untuk cek apakah user yang login adalah admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 2. Tabel kriteria
create table if not exists public.criteria (
  id     serial primary key,
  code   text not null unique,
  name   text not null,
  field  text not null unique,
  type   text not null check (type in ('cost', 'benefit')),
  weight numeric(4,3) not null check (weight >= 0 and weight <= 1),
  unit   text
);

-- 3. Tabel smartphone (alternatif + nilai spesifikasi)
--    user_id NULL = katalog master Admin (terlihat semua user)
--    user_id terisi = input manual pribadi milik user tersebut
create table if not exists public.smartphones (
  id          serial primary key,
  user_id     uuid references public.users(id) on delete cascade default null,
  name        text not null,
  price       bigint  check (price > 0),
  camera_mp   numeric check (camera_mp > 0),
  ram_gb      integer check (ram_gb > 0),
  battery_mah integer check (battery_mah > 0),
  storage_gb  integer check (storage_gb > 0),
  antutu      integer check (antutu > 0),
  created_at  timestamptz default now()
);

-- 4. Tabel riwayat perhitungan SAW
create table if not exists public.calculation_histories (
  id                  serial primary key,
  user_id             uuid not null references public.users(id) on delete cascade default auth.uid(),
  title               text not null default 'Perhitungan SAW',
  max_budget          bigint check (max_budget > 0),
  weights_used        jsonb not null,
  top_smartphone_name text not null,
  top_score           numeric(5,4) not null,
  results_snapshot    jsonb not null,
  created_at          timestamptz default now()
);

-- 5. Data awal kriteria & bobot (lihat docs/perhitungan_bobot.md)
insert into public.criteria (code, name, field, type, weight, unit) values
  ('C1', 'Harga',                 'price',       'cost',    0.229, 'Rupiah'),
  ('C2', 'Kamera',                'camera_mp',   'benefit', 0.077, 'MP'),
  ('C3', 'RAM',                   'ram_gb',      'benefit', 0.265, 'GB'),
  ('C4', 'Baterai',               'battery_mah', 'benefit', 0.177, 'mAh'),
  ('C5', 'Kapasitas Penyimpanan', 'storage_gb',  'benefit', 0.152, 'GB'),
  ('C6', 'Prosesor (AnTuTu)',     'antutu',      'benefit', 0.100, 'skor')
on conflict (code) do nothing;

-- 6. Keamanan (Row Level Security)
alter table public.users                 enable row level security;
alter table public.criteria              enable row level security;
alter table public.smartphones           enable row level security;
alter table public.calculation_histories enable row level security;

-- Users: baca profil sendiri atau semua (jika admin), kelola hanya admin
drop policy if exists "read own or admin" on public.users;
create policy "read own or admin" on public.users
  for select to authenticated using (auth.uid() = id or public.is_admin());

drop policy if exists "admin manage users" on public.users;
create policy "admin manage users" on public.users
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Criteria: semua user login boleh baca, hanya admin boleh ubah
drop policy if exists "authenticated read criteria" on public.criteria;
create policy "authenticated read criteria" on public.criteria
  for select to authenticated using (true);

drop policy if exists "admin write criteria" on public.criteria;
create policy "admin write criteria" on public.criteria
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Smartphones: baca katalog master (user_id is null) atau milik sendiri (atau admin),
--              user biasa bisa tambah/edit/hapus milik sendiri, admin bisa kelola semua
drop policy if exists "read master or own smartphones" on public.smartphones;
create policy "read master or own smartphones" on public.smartphones
  for select to authenticated using (user_id is null or user_id = auth.uid() or public.is_admin());

drop policy if exists "user insert own smartphones" on public.smartphones;
create policy "user insert own smartphones" on public.smartphones
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "user update own smartphones" on public.smartphones;
create policy "user update own smartphones" on public.smartphones
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "user delete own smartphones" on public.smartphones;
create policy "user delete own smartphones" on public.smartphones
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "admin write smartphones" on public.smartphones;
create policy "admin write smartphones" on public.smartphones
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Calculation Histories: baca milik sendiri atau semua (jika admin), tambah/hapus milik sendiri
drop policy if exists "read own or admin histories" on public.calculation_histories;
create policy "read own or admin histories" on public.calculation_histories
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user insert own histories" on public.calculation_histories;
create policy "user insert own histories" on public.calculation_histories
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "user or admin delete histories" on public.calculation_histories;
create policy "user or admin delete histories" on public.calculation_histories
  for delete to authenticated using (user_id = auth.uid() or public.is_admin());
```

### Akun Login & Pembagian Hak Akses
- **2 Role:** `admin` dan `user` (user biasa).
- **Cara membuat akun:**
  - User biasa bisa daftar langsung dari halaman Register (otomatis masuk ke `public.users` dengan `role = 'user'`).
  - Akun **Admin** dibuat dengan mendaftar seperti biasa atau lewat **Supabase Dashboard → Authentication → Users**, lalu ubah role-nya menjadi `'admin'` lewat Table Editor atau SQL Editor:
    ```sql
    update public.users set role = 'admin' where email = 'admin@email.com';
    ```
- **Hak Akses:**
  - **Admin:** melihat semua halaman + edit bobot/jenis kriteria + kelola katalog master smartphone (`user_id = null`) + lihat semua riwayat perhitungan.
  - **User Biasa:** melihat katalog master smartphone, tambah/edit/hapus HP input manual miliknya sendiri, lihat kriteria & bobot default (plus opsi simulasi bobot kustom/budget), jalankan perhitungan SAW, serta simpan & lihat riwayat perhitungannya sendiri.
- File `.env.local` berisi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY`. `.env.example` berisi nama variabel yang sama dengan nilai kosong.

---

## 5. Rencana Fase Pengembangan (Roadmap for AI Agent)

### Phase 1: Setup & Initialization
- Inisialisasi project React (Vite).
- Install dependensi: `react-router-dom`, `@supabase/supabase-js`, `tailwindcss`, `lucide-react` (untuk icon).
- Setup koneksi client Supabase.

### Phase 2: Database & Authentication
- Jalankan script SQL di Bagian 4 pada Supabase SQL Editor (membuat 4 tabel `users`, `criteria`, `smartphones`, `calculation_histories`, trigger auto-create user, fungsi `is_admin()`, data kriteria awal, dan RLS).
- Buat minimal 2 akun untuk testing (1 akun **Admin** dengan mengubah `role = 'admin'` di `public.users`, dan 1 akun **User Biasa**).
- Buat halaman Login & Register, ambil `role` user dari tabel `public.users`, dan lindungi _routes_ menggunakan React Router (Private Route & pembatasan akses Admin).

### Phase 3: Core UI & Dashboard
- Buat layout utama (Sidebar navigasi mencakup menu Riwayat Perhitungan & info role, Header dengan info user & tombol Logout).
- Implementasi halaman Dashboard dengan statistik sederhana mengambil data dari Supabase (jumlah katalog master, HP input manual, total riwayat perhitungan, dll).

### Phase 4: Manajemen Data (CRUD)
- Halaman **Kriteria**: Fetch data dari tabel `criteria`. Khusus **Admin**, tampilkan form edit bobot/jenis (validasi total = 1,000).
- Halaman **Alternatif**: Tampilkan daftar `smartphones` (pisahkan/tandai antara katalog master dan input manual user). **Admin** mengelola katalog master (`user_id = null`), sedangkan **User Biasa** bisa tambah/edit/hapus HP input manual miliknya (`user_id = auth.uid()`).
- Halaman **Penilaian**: Tampilkan semua HP dalam bentuk tabel matriks. **Admin** mengisi/mengedit spesifikasi katalog master; **User Biasa** bisa mengisi/mengedit spesifikasi HP miliknya sendiri, dengan validasi (wajib angka > 0, satuan sesuai Bagian 2).

### Phase 5: Implementasi Algoritma SAW
- Buat fungsi utilitas terpisah `sawCalculator.js` yang menerima input:
  1. Daftar Kriteria (`code`, `field`, `type` Cost/Benefit, `weight`). Jika total bobot ≠ 1 (misal bobot kustom), normalisasikan dulu dengan $W_j = w_j / \sum w_j$.
  2. Matriks Keputusan (angka asli spesifikasi dari masing-masing alternatif yang datanya lengkap).
- Logika fungsi (mengikuti Langkah 3–8 PPT Dosen):
  - Susun matriks keputusan $X$.
  - Cari nilai $\max_i x_{ij}$ (untuk Benefit) dan $\min_i x_{ij}$ (untuk Cost) di tiap kolom kriteria.
  - Hitung normalisasi $r_{ij}$: $x_{ij} / \max_i x_{ij}$ (Benefit) atau $\min_i x_{ij} / x_{ij}$ (Cost).
  - Hitung rincian kontribusi $w_j \cdot r_{ij}$ per kriteria dan jumlahkan menjadi nilai preferensi $V_i = \sum_{j=1}^{n} w_j \cdot r_{ij}$.
  - Urutkan hasil secara *descending* (nilai $V_i$ terbesar ke terkecil) dan tentukan kesimpulan peringkat 1.
  - Return data lengkap: `bobotTernormalisasi`, `matriksAwal`, `nilaiMaxMin`, `matriksNormalisasi`, `rincianPreferensi`, `hasilAkhir`, `rekomendasiTerbaik`.

### Phase 6: Halaman Perhitungan, Rekomendasi & Riwayat
- **Detail Perhitungan**: Tampilkan seluruh tahapan PPT Dosen secara transparan menggunakan _return data_ dari `sawCalculator.js`:
  1. Tabel Matriks Keputusan ($X$)
  2. Tabel Nilai Max / Min setiap kriteria
  3. Tabel Matriks Ternormalisasi ($R$, format 4 desimal)
  4. Rincian Perkalian Bobot ($w_j \times r_{ij}$) dan Nilai Preferensi ($V_i$, format 4 desimal)
- **Hasil Perankingan & Kesimpulan**: Sortir `hasilAkhir` secara descending, tampilkan kesimpulan smartphone terbaik, dan sediakan tombol **Simpan ke Riwayat** untuk menyimpan snapshot hasil ke `calculation_histories`.
- **Riwayat Perhitungan**: Halaman daftar riwayat perhitungan yang tersimpan di `calculation_histories`, lengkap dengan detail snapshot bobot dan rankingnya (plus tombol hapus riwayat).

### Phase 7 (Opsional): Integrasi AI (Nilai Tambah Proyek)
- Sesuai panduan poin 7, integrasikan "AI Explanation".
- **Fitur**: Tambahkan tombol "Tanya AI tentang hasil ini" di halaman perankingan.
- **Arsitektur & Keamanan API Key (Server-Side)**:
  - API Key AI (misal Gemini API / Groq yang menyediakan *free tier*) **dilarang** ditaruh di kode client React (`VITE_...`) karena akan terekspos di browser.
  - Simpan API Key di sisi server menggunakan **Supabase Edge Function** (misal fungsi `ai-explain` dengan Supabase Secrets) atau **Serverless Function** (`/api/ai-explain` di Vercel/Netlify Environment Variables).
  - Edge/Serverless Function wajib memverifikasi token login Supabase Auth sebelum memanggil API AI agar kuota API tidak disalahgunakan pihak luar.
- **Cara Kerja**: Frontend mengirim data hasil SAW (JSON) ke Edge/Serverless Function, lalu server memanggil API LLM untuk merangkum secara natural mengapa Smartphone peringkat 1 menang (misal: *"Smartphone A terpilih menjadi nomor satu karena skor bobot tertingginya tertolong oleh RAM yang besar dan Harga yang murah..."*). AI hanya menjelaskan hasil, tidak mengubah skor maupun urutan ranking SAW.