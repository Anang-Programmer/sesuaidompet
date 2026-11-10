# PROJECT BRIEF & PRODUCT REQUIREMENT DOCUMENT (PRD)
## **SesuaiDompet — Sistem Pendukung Keputusan Pemilihan Smartphone Terbaik (Metode SAW)**

---

### **1. Executive Summary & Product Vision**
* **Nama Produk:** SesuaiDompet
* **Tagline:** *Rekomendasi Smartphone Cerdas, Objektif, dan Pas Sesuai Dompet Anda.*
* **Kategori Produk:** Web-based Decision Support System (SPK / DSS), Consumer Tech Recommender System.
* **Visi Produk:** Membantu pengguna memilih smartphone terbaik secara objektif, transparan, dan sesuai anggaran menggunakan metode **Simple Additive Weighting (SAW)**, dengan dukungan fitur AI opsional sebagai asisten penjelasan (*AI Explanation*) tanpa menggantikan perhitungan matematis SPK.

---

### **2. Background & Problem Statement**
1. **Choice Overload & Spesifikasi Teknis yang Membingungkan:** Banyaknya model smartphone dengan variasi harga, kamera, RAM, baterai, kapasitas penyimpanan, dan prosesor membuat calon pembeli kesulitan membandingkan secara objektif.
2. **Bias Promosi & Pilihan Subjektif:** Keputusan pembelian sering kali hanya dipengaruhi merek populer atau harga termurah tanpa memperhitungkan keseimbangan seluruh spesifikasi.
3. **Budget Mismatch:** Pengguna berisiko mengeluarkan biaya melebihi anggaran (*overbudget*) atau membeli perangkat dengan spesifikasi yang kurang memadai.
4. **Ketiadaan Transparansi Matematis:** Sistem rekomendasi konvensional sering bersifat *black-box*, sehingga pengguna dan penguji akademik tidak dapat memeriksa langkah perhitungannya.

---

### **3. Target Audience & Personas**

| Persona | Profil & Hak Akses | Kebutuhan Utama | Fitur SesuaiDompet yang Menjawab |
| :--- | :--- | :--- | :--- |
| **Admin (`admin`)** | Pengelola sistem yang mengelola katalog master dan bobot kriteria. | Mengelola daftar smartphone katalog utama (`smartphones`), menginput spesifikasi, serta mengubah bobot/jenis kriteria saat kalibrasi atau demo. | CRUD Katalog Master, Input Penilaian, Pengaturan Kriteria & Bobot (validasi total = 100%). |
| **User Biasa (`user`)** | Calon pembeli / pengguna umum. | Melihat katalog smartphone, menambahkan smartphone **input manual** milik pribadi untuk dibandingkan, memfilter budget, memakai bobot default atau kustom, dan menyimpan riwayat. | Input Manual Smartphone Pribadi, Filter Budget, Perhitungan SAW, Riwayat Perhitungan. |
| **Akademisi / Penguji SPK** | Dosen pengampu mata kuliah Sistem Pendukung Keputusan. | Memverifikasi bahwa aplikasi menerapkan seluruh 8 langkah metode SAW sesuai PPT perkuliahan dan hasilnya cocok 100% dengan perhitungan manual. | Halaman Detail Perhitungan Lengkap ($X \rightarrow \max/\min \rightarrow R \rightarrow w_j \cdot r_{ij} \rightarrow V_i \rightarrow$ Ranking). |

---

### **4. Core Architecture: SAW Decision Engine (+ AI Opsional)**

Sesuai ketentuan Panduan Proyek Akhir SPK, **seluruh proses perankingan dikerjakan sepenuhnya oleh algoritma SAW** berdasarkan data pada database:

```
[Data Alternatif (Katalog Master + Input Manual User)] + [Kriteria & Bobot (Default / Kustom)]
               │
               ▼
[SAW Mathematical Engine] ──────────► 1. Matriks Keputusan (X) dari angka asli
               │                     2. Penentuan Nilai Max (Benefit) & Min (Cost)
               │                     3. Normalisasi Matriks (R) -> skala 0..1
               │                     4. Perkalian Bobot & Penjumlahan (V_i)
               │                     5. Perangkingan Descending & Kesimpulan Terbaik
               ▼
[UI Transparan & Riwayat] ──────────► Detail Perhitungan + Simpan ke Riwayat
               │
               ▼ (Opsional - Fitur Tambahan)
[AI Explanation Layer] ─────────────► Menjelaskan hasil ranking SAW dalam bahasa natural
                                      tanpa mengubah nilai atau urutan ranking
```

#### **Daftar Kriteria, Jenis, Satuan, dan Bobot Default ($C_1 - C_6$):**
Bobot default ditentukan dari penggabungan proporsional dua referensi jurnal (*Putri dkk., 2026* dan *Ramadhani dkk., 2025*; lihat `docs/perhitungan_bobot.md`):

| Kode | Kriteria | Jenis | Satuan Input (Angka Asli) | Bobot Default ($w_j$) |
| :--- | :--- | :---: | :--- | :---: |
| **$C_1$** | **Harga** | Cost | Rupiah (tanpa titik) | **22,9% (0,229)** |
| **$C_2$** | **Kamera** | Benefit | MP (kamera belakang utama) | **7,7% (0,077)** |
| **$C_3$** | **RAM** | Benefit | GB | **26,5% (0,265)** |
| **$C_4$** | **Baterai** | Benefit | mAh | **17,7% (0,177)** |
| **$C_5$** | **Kapasitas Penyimpanan (ROM)** | Benefit | GB (`1 TB = 1024`) | **15,2% (0,152)** |
| **$C_6$** | **Prosesor (Skor AnTuTu)** | Benefit | Skor AnTuTu (versi seragam) | **10,0% (0,100)** |
| | **Total** | | | **100,0% (1,000)** |

#### **Rumus Resmi Metode SAW (Sesuai Referensi PPT Dosen):**
1. **Normalisasi Bobot** *(jika memakai bobot kustom yang totalnya belum 1)*:
   $$W_j = \frac{w_j}{\sum_{j=1}^{n} w_j}$$
2. **Normalisasi Matriks Keputusan ($R$):**
   $$r_{ij} = \begin{cases} \dfrac{x_{ij}}{\max_i x_{ij}}, & \text{jika kriteria } j \text{ bersifat Benefit} \\[10pt] \dfrac{\min_i x_{ij}}{x_{ij}}, & \text{jika kriteria } j \text{ bersifat Cost} \end{cases}$$
   *(Keterangan: $x_{ij}$ = nilai asli alternatif ke-$i$ pada kriteria ke-$j$, wajib $> 0$; $\max_i x_{ij}$ = nilai maksimum pada kriteria ke-$j$; $\min_i x_{ij}$ = nilai minimum pada kriteria ke-$j$.)*
3. **Nilai Preferensi ($V_i$):**
   $$V_i = \sum_{j=1}^{n} w_j \cdot r_{ij}$$
4. **Perangkingan & Kesimpulan:** Nilai $V_i$ diurutkan dari terbesar ke terkecil (*descending*). Alternatif dengan nilai $V_i$ tertinggi merupakan rekomendasi terbaik. Untuk konsistensi dengan perhitungan manual, nilai $r_{ij}$ dan $V_i$ ditampilkan hingga **4 angka di belakang koma**.

---

### **5. Functional Requirements & Feature Specification**

#### **5.1. Autentikasi (`/login`, `/register`)**
* Login menggunakan email & password via Supabase Auth dengan 2 role (`admin` dan `user`).
* Halaman Register untuk mendaftarkan akun baru (otomatis mendapat role `user` melalui trigger database).
* Proteksi rute (Private Route): seluruh halaman aplikasi hanya dapat diakses setelah login.

#### **5.2. Dashboard (`/dashboard`)**
* **Ringkasan Sistem:** Jumlah smartphone pada katalog master, jumlah HP input manual pribadi, jumlah kriteria aktif (6 kriteria), jumlah riwayat perhitungan tersimpan, serta smartphone peringkat 1 saat ini.
* **Navigasi Cepat:** Akses cepat ke Data Alternatif, Penilaian, Kriteria & Bobot, Detail Perhitungan SAW, dan Riwayat.

#### **5.3. Manajemen Data Alternatif & Penilaian (`/alternatif`, `/penilaian`)**
* **Katalog Master (`user_id = null`):** Dikelola penuh (CRUD) oleh **Admin**, dan dapat dilihat/dipakai menghitung oleh seluruh user.
* **Input Manual User (`user_id = auth.uid()`):** **User Biasa** dapat menambahkan, mengedit, dan menghapus smartphone miliknya sendiri (beserta 6 nilai spesifikasinya) untuk dibandingkan dengan katalog master tanpa mengubah data global.
* **Validasi Input:** Seluruh nilai kriteria wajib berupa angka $> 0$ dengan satuan yang konsisten (`Rupiah`, `MP`, `GB`, `mAh`, `skor AnTuTu`). Alternatif yang spesifikasinya belum lengkap ditandai *"Belum Dinilai"* dan tidak diikutsertakan dalam matriks perhitungan.

#### **5.4. Kriteria & Bobot (`/kriteria`)**
* Menampilkan daftar $C_1 - C_6$, jenis (`Cost` / `Benefit`), satuan, dan bobot default dari tabel `criteria`.
* **Admin:** Dapat mengedit bobot dan jenis kriteria secara langsung dengan validasi wajib $\sum w_j = 1{,}000$ ($100\%$) sebelum disimpan ke Supabase.
* **User Biasa:** Melihat bobot default secara *read-only*, serta dapat melakukan simulasi filter batas budget (*SesuaiDompet*) atau bobot kustom di sesi perhitungan tanpa mengubah bobot master Admin.

#### **5.5. Proses, Detail Perhitungan & Hasil Perankingan (`/perhitungan`, `/hasil`)**
Menampilkan seluruh 8 tahapan metode SAW secara transparan agar mudah diaudit saat demonstrasi:
1. **Alternatif & Bobot Aktif** yang digunakan pada perhitungan.
2. **Matriks Keputusan ($X$):** Tabel angka asli spesifikasi setiap smartphone.
3. **Nilai Ekstrem Kriteria:** Tabel $\max_i x_{ij}$ (untuk Benefit) dan $\min_i x_{ij}$ (untuk Cost).
4. **Matriks Ternormalisasi ($R$):** Nilai $r_{ij}$ tiap alternatif dalam skala $0 - 1$ (4 desimal).
5. **Perhitungan Nilai Preferensi ($V_i$):** Rincian komponen $w_j \cdot r_{ij}$ beserta total skor $V_i$ (4 desimal).
6. **Tabel Perangkingan & Kesimpulan (Champion Card):** Urutan alternatif dari skor $V_i$ tertinggi ke terendah beserta kesimpulan rekomendasi smartphone terbaik.
7. **Simpan ke Riwayat:** Tombol untuk menyimpan sesi perhitungan (judul, batas budget, bobot yang dipakai, juara 1, skor tertinggi, dan snapshot matriks/ranking) ke tabel `calculation_histories`.

#### **5.6. Riwayat Perhitungan (`/riwayat`)**
* Menampilkan daftar riwayat perhitungan yang pernah disimpan user (Admin dapat melihat seluruh riwayat, User Biasa melihat riwayat miliknya).
* Membuka detail snapshot perhitungan sebelumnya tanpa terpengaruh apabila data smartphone atau bobot di master berubah di kemudian hari.

#### **5.7. Integrasi AI — Opsional (`/hasil` / Modal AI Explanation)**
* Fitur nilai tambah sesuai Panduan Proyek Bagian 7 (*AI Explanation / Recommendation Assistant*).
* **Arsitektur Aman (Server-Side Proxy):** Frontend React mengirim hasil JSON perhitungan SAW beserta token autentikasi ke **Supabase Edge Function** (atau **Serverless Function** `/api` pada Vercel/Netlify) tempat API Key AI disimpan secara rahasia sebagai *server secrets* (tidak diletakkan di client-side `VITE_*`).
* Endpoint server memvalidasi sesi login pengguna terlebih dahulu sebelum memanggil LLM API (disarankan penyedia dengan paket gratis/*free tier* seperti Gemini API atau Groq) untuk merangkum alasan kenapa smartphone peringkat 1 menang berdasarkan data dan kontribusi bobotnya.
* **Batasan Ketat:** AI hanya menjelaskan hasil akhir; tidak boleh mengubah skor $V_i$ maupun urutan ranking dari mesin SAW.

---

### **6. Non-Functional Requirements**
* **Design & Aesthetics:** Menggunakan Tailwind CSS dengan tampilan bersih, kontras jelas, dan pembeda visual untuk atribut Cost vs Benefit.
* **Akurasi Matematis:** Hasil perhitungan `sawCalculator.js` di sisi klien harus **100% cocok** dengan dokumen perhitungan manual.
* **Performa:** Perhitungan SAW dijalankan secara *client-side* secara instan ketika bobot atau data alternatif berubah.
* **Keamanan Data:** Menggunakan Supabase Row Level Security (RLS) agar User Biasa hanya dapat mengubah/menghapus HP input manual dan riwayat miliknya sendiri, sementara modifikasi katalog master dan bobot kriteria dibatasi khusus untuk Admin. Selain itu, API Key AI disimpan di server/Edge Function (bukan di browser client) dan dilindungi autentikasi user.

---

### **7. Roadmap Implementasi**
* **Fase Saat Ini (Perencanaan & Setup):** Penyusunan spesifikasi final, dasar penentuan bobot (`docs/perhitungan_bobot.md`), dan skema database 4 tabel (`docs/plan.md`).
* **Fase Berikutnya (Implementasi Inti):** Setup Supabase (4 tabel + RLS + Auth), Layout & Dashboard, CRUD Alternatif/Penilaian/Kriteria, utilitas `sawCalculator.js`, Halaman Detail Perhitungan & Ranking, serta Riwayat Perhitungan.
* **Fase Tambahan (Opsional):** Integrasi fitur *AI Explanation* untuk menjelaskan hasil rekomendasi.
