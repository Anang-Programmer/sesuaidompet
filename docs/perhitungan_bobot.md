# Penentuan Bobot Kriteria — SPK Pemilihan Smartphone Terbaik

Bobot kriteria disusun dengan **menggabungkan dua jurnal referensi**. Setiap jurnal diberi kontribusi yang sama, yaitu **50%**.

| Kode Referensi | Jurnal |
|---|---|
| **Jurnal A** | Putri, Sari, & Garno (2026) — *PickPhone*, SPK pemilihan smartphone di e-commerce |
| **Jurnal B** | Ramadhani, Parulian, & Surajiyo (2025) — SPK pemilihan smartphone Android untuk siswa SMK |

> [!IMPORTANT]
> **Aturan pembulatan:** semua perhitungan memakai **nilai penuh, tanpa dibulatkan**. Pembulatan hanya dilakukan **satu kali di langkah terakhir**, yaitu ke **1 angka di belakang koma (dalam %)** dengan aturan pembulatan biasa (≥ 5 naik, < 5 turun).

---

## Langkah 1 — Daftar kriteria dari kedua jurnal

| No | Kriteria | Jenis | Bobot Jurnal A | Bobot Jurnal B |
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

## Langkah 2 — Eliminasi kriteria yang tidak relevan

Kriteria no. 7, 8, dan 9 **dibuang** karena:
- Ketiganya **tidak berkaitan dengan spesifikasi smartphone**. Nilainya bergantung pada toko atau marketplace tertentu, misalnya Shopee atau Tokopedia.
- Nilainya **selalu berubah** setiap hari, sehingga tidak cocok dipakai sebagai data alternatif yang tetap.
- Studi kasus di panduan proyek berfokus pada spesifikasi: harga, kamera, RAM, baterai, penyimpanan, dan kriteria relevan lainnya.

**Kriteria yang dipakai (6 kriteria):** Harga, Kamera, RAM, Baterai, Penyimpanan, Prosesor.

## Langkah 3 — Normalisasi ulang bobot Jurnal A

Setelah 3 kriteria dibuang, total bobot Jurnal A tidak lagi 100%:

$$\sum w_{A} = 0{,}20 + 0{,}15 + 0{,}10 + 0{,}10 + 0{,}10 = 0{,}65$$

Agar totalnya kembali 1, setiap bobot dibagi dengan total sisa tersebut:

$$w'_{j} = \frac{w_{j}}{\sum w_{j}} = \frac{w_{j}}{0{,}65}$$

| Kriteria | Bobot Awal | Perhitungan | Bobot Baru Jurnal A |
|---|:---:|:---:|:---:|
| Harga | 0,20 | 0,20 / 0,65 | 0,307692… |
| RAM | 0,15 | 0,15 / 0,65 | 0,230769… |
| Penyimpanan | 0,10 | 0,10 / 0,65 | 0,153846… |
| Kamera | 0,10 | 0,10 / 0,65 | 0,153846… |
| Baterai | 0,10 | 0,10 / 0,65 | 0,153846… |
| Prosesor | — | tidak diteliti | 0 |
| **Total** | **0,65** | | **1,000000** |

> [!NOTE]
> Bobot **Jurnal B tidak perlu dinormalisasi ulang** karena tidak ada kriteria yang dibuang, sehingga totalnya tetap 1,00. Kamera tidak diteliti di Jurnal B, jadi bobotnya **0** pada jurnal tersebut.

## Langkah 4 — Penggabungan kedua jurnal (rata-rata)

$$W_{j} = \frac{w'_{A,j} + w_{B,j}}{2}$$

| Kode | Kriteria | Jenis | Jurnal A | Jurnal B | Perhitungan | Bobot Gabungan |
|---|---|---|:---:|:---:|:---:|:---:|
| C1 | Harga | Cost | 0,307692 | 0,15 | (0,307692 + 0,15) / 2 | 0,228846 |
| C2 | Kamera | Benefit | 0,153846 | 0 | (0,153846 + 0) / 2 | 0,076923 |
| C3 | RAM | Benefit | 0,230769 | 0,30 | (0,230769 + 0,30) / 2 | 0,265385 |
| C4 | Baterai | Benefit | 0,153846 | 0,20 | (0,153846 + 0,20) / 2 | 0,176923 |
| C5 | Penyimpanan | Benefit | 0,153846 | 0,15 | (0,153846 + 0,15) / 2 | 0,151923 |
| C6 | Prosesor | Benefit | 0 | 0,20 | (0 + 0,20) / 2 | 0,100000 |
| | **Total** | | **1,000000** | **1,00** | | **1,000000** |

## Langkah 5 — Pembulatan (satu kali, di akhir)

Bobot dibulatkan ke **1 angka di belakang koma (%)**:

| Kode | Kriteria | Hasil Penuh (%) | Dibulatkan | Keterangan |
|---|---|:---:|:---:|---|
| C1 | Harga | 22,8846 | **22,9** | angka ke-2 = 8 → naik |
| C2 | Kamera | 7,6923 | **7,7** | angka ke-2 = 9 → naik |
| C3 | RAM | 26,5385 | **26,5** | angka ke-2 = 3 → turun |
| C4 | Baterai | 17,6923 | **17,7** | angka ke-2 = 9 → naik |
| C5 | Penyimpanan | 15,1923 | **15,2** | angka ke-2 = 9 → naik |
| C6 | Prosesor | 10,0000 | **10,0** | tetap |
| | **Total** | **100,0000** | **100,0** | ✅ |

Semua angka dibulatkan dengan aturan yang sama dan totalnya **tepat 100%**, tanpa ada angka yang perlu disesuaikan.

---

## ✅ Bobot Akhir yang Dipakai di Aplikasi dan Perhitungan Manual

| Kode | Kriteria | Jenis | Bobot (%) | Bobot (desimal) |
|---|---|---|:---:|:---:|
| C1 | Harga | Cost | 22,9% | 0,229 |
| C2 | Kamera | Benefit | 7,7% | 0,077 |
| C3 | RAM | Benefit | 26,5% | 0,265 |
| C4 | Baterai | Benefit | 17,7% | 0,177 |
| C5 | Kapasitas Penyimpanan | Benefit | 15,2% | 0,152 |
| C6 | Prosesor (AnTuTu) | Benefit | 10,0% | 0,100 |
| | **Total** | | **100%** | **1,000** |

> [!TIP]
> Pakai **angka desimal yang sama persis** (0,229; 0,077; 0,265; 0,177; 0,152; 0,100) di aplikasi dan di dokumen perhitungan manual. Dengan begitu hasil ranking dijamin sama, sesuai syarat dari panduan proyek.

