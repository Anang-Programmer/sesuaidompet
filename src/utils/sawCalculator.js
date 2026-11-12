/**
 * Cek apakah satu alternatif smartphone memiliki seluruh nilai kriteria > 0
 * yang dibutuhkan untuk perhitungan metode SAW.
 */
export function isCompleteSmartphone(smartphone, criteria) {
  if (!smartphone || !Array.isArray(criteria) || criteria.length === 0) {
    return false;
  }
  return criteria.every((c) => {
    const val = Number(smartphone[c.field]);
    return Number.isFinite(val) && val > 0;
  });
}

/**
 * Menjalankan perhitungan lengkap Metode Simple Additive Weighting (SAW)
 * mengikuti seluruh 8 tahapan pada materi perkuliahan:
 * 1. Alternatif & Kriteria
 * 2. Bobot Kriteria (+ normalisasi bobot jika total != 1)
 * 3. Matriks Keputusan (X)
 * 4. Nilai Maksimum (Benefit) & Minimum (Cost) per kriteria
 * 5. Matriks Ternormalisasi (R)
 * 6. Nilai Preferensi (V_i = sum(w_j * r_ij))
 * 7. Perangkingan descending
 * 8. Kesimpulan alternatif terbaik
 */
export function calculateSAW(criteria = [], smartphones = [], customWeights = null) {
  const validSmartphones = smartphones.filter((phone) =>
    isCompleteSmartphone(phone, criteria)
  );

  if (criteria.length === 0 || validSmartphones.length === 0) {
    return {
      isReady: false,
      wasWeightNormalized: false,
      bobotTernormalisasi: [],
      matriksAwal: [],
      nilaiMaxMin: [],
      matriksNormalisasi: [],
      rincianPreferensi: [],
      hasilAkhir: [],
      rekomendasiTerbaik: null,
    };
  }

  // Langkah 2: Ambil & normalisasi bobot jika total belum tepat 1
  const rawWeights = criteria.map((c) => {
    const override =
      customWeights && customWeights[c.code] !== undefined
        ? Number(customWeights[c.code])
        : Number(c.weight);
    return Number.isFinite(override) && override >= 0 ? override : 0;
  });

  const weightSum = rawWeights.reduce((acc, w) => acc + w, 0);
  const wasWeightNormalized = weightSum > 0 && Math.abs(weightSum - 1) > 1e-6;

  const bobotTernormalisasi = criteria.map((c, idx) => {
    const rawWeight = rawWeights[idx];
    const normalizedWeight = weightSum > 0 ? rawWeight / weightSum : 0;
    return {
      ...c,
      rawWeight,
      normalizedWeight,
    };
  });

  // Langkah 3: Matriks Keputusan (X)
  const matriksAwal = validSmartphones.map((phone, index) => {
    const values = {};
    for (const c of bobotTernormalisasi) {
      values[c.code] = Number(phone[c.field]);
    }
    return {
      code: `A${index + 1}`,
      smartphone: phone,
      values,
    };
  });

  // Langkah 4: Nilai Max (Benefit) & Min (Cost) tiap kriteria
  const nilaiMaxMin = bobotTernormalisasi.map((c) => {
    const colValues = matriksAwal.map((row) => row.values[c.code]);
    const max = Math.max(...colValues);
    const min = Math.min(...colValues);
    const isCost = String(c.type).toLowerCase() === 'cost';
    return {
      code: c.code,
      name: c.name,
      field: c.field,
      type: c.type,
      unit: c.unit,
      max,
      min,
      extrema: isCost ? min : max,
      extremaLabel: isCost ? 'Min' : 'Max',
    };
  });

  const extremaByCode = Object.fromEntries(
    nilaiMaxMin.map((item) => [item.code, item])
  );

  // Langkah 5: Normalisasi Matriks Keputusan (R)
  const matriksNormalisasi = matriksAwal.map((row) => {
    const values = {};
    for (const c of bobotTernormalisasi) {
      const x = row.values[c.code];
      const { max, min } = extremaByCode[c.code];
      const isCost = String(c.type).toLowerCase() === 'cost';
      values[c.code] = isCost ? min / x : x / max;
    }
    return {
      code: row.code,
      smartphone: row.smartphone,
      values,
    };
  });

  // Langkah 6: Rincian Perkalian Bobot & Nilai Preferensi (V_i)
  const rincianPreferensi = matriksNormalisasi.map((row) => {
    const weightedValues = {};
    let totalScore = 0;

    for (const c of bobotTernormalisasi) {
      const product = c.normalizedWeight * row.values[c.code];
      weightedValues[c.code] = product;
      totalScore += product;
    }

    return {
      code: row.code,
      smartphone: row.smartphone,
      weightedValues,
      totalScore,
    };
  });

  // Langkah 7 & 8: Perangkingan descending & kesimpulan
  const hasilAkhir = [...rincianPreferensi]
    .sort((a, b) => {
      if (Math.abs(b.totalScore - a.totalScore) > 1e-12) {
        return b.totalScore - a.totalScore;
      }
      // Tie-breaker: harga lebih murah menang, lalu id lebih kecil
      const priceDiff =
        Number(a.smartphone.price) - Number(b.smartphone.price);
      if (priceDiff !== 0) return priceDiff;
      return Number(a.smartphone.id) - Number(b.smartphone.id);
    })
    .map((item, idx) => ({
      rank: idx + 1,
      ...item,
    }));

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
  };
}

