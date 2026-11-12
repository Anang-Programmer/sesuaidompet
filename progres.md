Progress Pengerjaan Aplikasi
Phase 1 — Setup & Initialization: ✅ Selesai (dependensi, koneksi supabase.js, struktur folder, Layout, ProtectedRoute).
Phase 2 — Database & Authentication: ✅ Selesai
Query 4 tabel + RLS sudah aktif di Supabase.
Barusan dibuat: Login.jsx, Register.jsx, dan GoogleAuthButton.jsx.
Sudah mendukung daftar akun baru (otomatis role = 'user'), login email/password, toggle lihat password, redirect otomatis kalau sudah login, dan tombol Sign in with Google (siap pakai begitu Google Provider diaktifkan di Supabase).
Phase 5 — Algoritma SAW (sawCalculator.js): ✅ Sudah siap (teruji cocok 4 desimal dengan kasus PPT dosen).
Phase 3 — Dashboard (Dashboard.jsx): ⏳ Berikutnya (statistik real-time dari Supabase, juara #1 saat ini, tombol pintas).
Phase 4 — Manajemen Data CRUD (Kriteria.jsx, Alternatif.jsx, Penilaian.jsx): ⏳ Berikutnya
Kriteria: tabel C1–C6 + mode edit bobot & jenis khusus Admin (validasi total 1,000 + reset default).
Alternatif: kelola Katalog Master (Admin) & Input Manual Pribadi (User Biasa).
Penilaian: tabel matriks angka asli + validasi wajib > 0.
Phase 6 — Perhitungan, Hasil & Riwayat (Perhitungan.jsx, Hasil.jsx, Riwayat.jsx): ⏳ Berikutnya
Perhitungan: filter budget SesuaiDompet, pilih alternatif, pilih bobot default/kustom, tampilkan Step 1–6 PPT Dosen (
𝑋
X, 

⁡
mmin,ax/ 
𝑅
R, rincianalian, 
V
i
	​

).
Hasil: Step 7–8 (ranking descending, Champion Card, kesimpulan) + tombol Simpan ke Riwayat.
Riwayat: lihat detail snapshot perhitungan lama & hapus.
Phase 7 (Opsional) — AI Explanation: ⏳ Opsional di akhir (pakai Supabase Edge Function / Vercel /api).