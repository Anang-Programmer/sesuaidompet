
/**
 * Cek apakah satu alternatif smartphone memiliki seluruh nilai kriteria > 0
 * yang dibutuhkan untuk perhitungan metode SAW.
 */
export function isCompleteSmartphone(smartphone, criteria) {
  if (
    !smartphone ||
    !Array.isArray(criteria) ||
    criteria.length === 0
  ) {
    return false;
  }

  return criteria.every((criterion) => {
    const value = Number(smartphone[criterion.field]);

    return Number.isFinite(value) && value > 0;
  });
}

/**
 * Struktur hasil ketika perhitungan SAW belum dapat dilakukan.
 * Struktur dibuat konsisten agar komponen pemanggil tetap aman.
 */
function createNotReadyResult(weightSum = 0) {
  return {
    isReady: false,
    wasWeightNormalized: false,
    weightSum,
    bobotTernormalisasi: [],
    matriksAwal: [],
    nilaiMaxMin: [],
    matriksNormalisasi: [],
    rincianPreferensi: [],
    hasilAkhir: [],
    rekomendasiTerbaik: null,
    normalisasi: {},
    skorAkhir: 0,
  };
}

/**
 * Menjalankan perhitungan Metode Simple Additive Weighting (SAW).
 *
 * Tahapan:
 * 1. Memeriksa alternatif dan kriteria.
 * 2. Mengambil serta menormalisasi bobot.
 * 3. Membentuk matriks keputusan.
 * 4. Mencari nilai maksimum dan minimum.
 * 5. Melakukan normalisasi matriks.
 * 6. Menghitung nilai preferensi.
 * 7. Melakukan perangkingan.
 * 8. Menentukan alternatif terbaik.
 */
export function calculateSAW(
  criteria = [],
  smartphones = [],
  customWeights = null
) {
  // Pastikan data kriteria dan alternatif tersedia.
  if (
    !Array.isArray(criteria) ||
    criteria.length === 0 ||
    !Array.isArray(smartphones)
  ) {
    return createNotReadyResult();
  }

  // Hanya smartphone dengan seluruh nilai kriteria yang lengkap
  // yang boleh masuk ke dalam perhitungan.
  const validSmartphones = smartphones.filter((phone) =>
    isCompleteSmartphone(phone, criteria)
  );

  // SAW membutuhkan minimal dua alternatif untuk dibandingkan.
  if (validSmartphones.length < 2) {
    return createNotReadyResult();
  }

  // Langkah 2: Ambil bobot kriteria.
  const rawWeights = criteria.map((criterion) => {
    const override =
      customWeights &&
      customWeights[criterion.code] !== undefined
        ? Number(customWeights[criterion.code])
        : Number(criterion.weight);

    return Number.isFinite(override) && override >= 0
      ? override
      : 0;
  });

  const weightSum = rawWeights.reduce(
    (total, weight) => total + weight,
    0
  );

  // Bobot tidak boleh seluruhnya nol atau menghasilkan nilai tidak valid.
  if (!Number.isFinite(weightSum) || weightSum <= 0) {
    return createNotReadyResult(
      Number.isFinite(weightSum) ? weightSum : 0
    );
  }

  const wasWeightNormalized =
    Math.abs(weightSum - 1) > 1e-6;

  const bobotTernormalisasi = criteria.map(
    (criterion, index) => {
      const rawWeight = rawWeights[index];

      return {
        ...criterion,
        rawWeight,
        normalizedWeight: rawWeight / weightSum,
      };
    }
  );

  // Langkah 3: Matriks Keputusan (X).
  const matriksAwal = validSmartphones.map(
    (phone, index) => {
      const values = {};

      for (const criterion of bobotTernormalisasi) {
        values[criterion.code] = Number(
          phone[criterion.field]
        );
      }

      return {
        code: `A${index + 1}`,
        smartphone: phone,
        values,
      };
    }
  );

  // Langkah 4: Nilai maksimum (Benefit) dan minimum (Cost).
  const nilaiMaxMin = bobotTernormalisasi.map(
    (criterion) => {
      const columnValues = matriksAwal.map(
        (row) => row.values[criterion.code]
      );

      const max = Math.max(...columnValues);
      const min = Math.min(...columnValues);

      const isCost =
        String(criterion.type).toLowerCase() === 'cost';

      return {
        code: criterion.code,
        name: criterion.name,
        field: criterion.field,
        type: criterion.type,
        unit: criterion.unit,
        max,
        min,
        extrema: isCost ? min : max,
        extremaLabel: isCost ? 'Min' : 'Max',
      };
    }
  );

  const extremaByCode = Object.fromEntries(
    nilaiMaxMin.map((item) => [
      item.code,
      item,
    ])
  );

  // Langkah 5: Normalisasi matriks keputusan (R).
  const matriksNormalisasi = matriksAwal.map(
    (row) => {
      const values = {};

      for (const criterion of bobotTernormalisasi) {
        const value = row.values[criterion.code];
        const { max, min } = extremaByCode[criterion.code];

        const isCost =
          String(criterion.type).toLowerCase() === 'cost';

        values[criterion.code] = isCost
          ? min / value
          : value / max;
      }

      return {
        code: row.code,
        smartphone: row.smartphone,
        values,
      };
    }
  );

  // Langkah 6: Menghitung nilai preferensi (V).
  const rincianPreferensi = matriksNormalisasi.map(
    (row) => {
      const weightedValues = {};
      let totalScore = 0;

      for (const criterion of bobotTernormalisasi) {
        const product =
          criterion.normalizedWeight *
          row.values[criterion.code];

        weightedValues[criterion.code] = product;
        totalScore += product;
      }

      return {
        code: row.code,
        smartphone: row.smartphone,
        weightedValues,
        totalScore,
      };
    }
  );

  // Langkah 7: Perangkingan berdasarkan nilai preferensi tertinggi.
  // Jika nilai sama, harga lebih murah menjadi penentu.
  // Jika harga juga sama, ID lebih kecil menjadi penentu.
  const hasilAkhir = [...rincianPreferensi]
    .sort((a, b) => {
      if (
        Math.abs(b.totalScore - a.totalScore) > 1e-12
      ) {
        return b.totalScore - a.totalScore;
      }

      const priceA = Number(a.smartphone.price);
      const priceB = Number(b.smartphone.price);

      const safePriceA = Number.isFinite(priceA)
        ? priceA
        : Number.POSITIVE_INFINITY;

      const safePriceB = Number.isFinite(priceB)
        ? priceB
        : Number.POSITIVE_INFINITY;

      if (safePriceA !== safePriceB) {
        return safePriceA - safePriceB;
      }

      const idA = Number(a.smartphone.id);
      const idB = Number(b.smartphone.id);

      const safeIdA = Number.isFinite(idA)
        ? idA
        : Number.POSITIVE_INFINITY;

      const safeIdB = Number.isFinite(idB)
        ? idB
        : Number.POSITIVE_INFINITY;

      return safeIdA - safeIdB;
    })
    .map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

  // Langkah 8: Mengembalikan hasil akhir.
  return {
    isReady: true,
    wasWeightNormalized,
    weightSum,
    bobotTernormalisasi,
    matriksAwal,
    nilaiMaxMin,
    matriksNormalisasi,
    rincianPreferensi,
    hasilAkhir,
    rekomendasiTerbaik: hasilAkhir[0] ?? null,

    // Dipertahankan untuk kompatibilitas dengan pemanggil lama.
    normalisasi: matriksNormalisasi[0]?.values || {},
    skorAkhir: rincianPreferensi[0]?.totalScore || 0,
  };
}
