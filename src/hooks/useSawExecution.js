import { useEffect, useMemo, useState } from 'react';
import { fetchCriteria, fetchSmartphones } from '../services/spkService';
import { calculateSAW, isCompleteSmartphone } from '../utils/sawCalculator';
import { useAuth } from './useAuth';
import { useSawSession } from './useSawSession';

export function useSawExecution() {
  const { isAdmin } = useAuth();
  const session = useSawSession();
  const [criteria, setCriteria] = useState([]);
  const [smartphones, setSmartphones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [criteriaData, phoneData] = await Promise.all([
          fetchCriteria(),
          fetchSmartphones(),
        ]);
        if (!active) return;
        setCriteria(criteriaData);
        setSmartphones(phoneData);
      } catch (err) {
        if (active) setError(err.message || 'Gagal memuat data perhitungan.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const parsedBudget = useMemo(() => {
    const val = Number(session.maxBudget);
    return Number.isFinite(val) && val > 0 ? val : null;
  }, [session.maxBudget]);

  // Menggabungkan smartphone dari database dengan smartphone dari percakapan Chat AI (jika ada)
  const effectiveSmartphones = useMemo(() => {
    if (!session.chatSmartphones || session.chatSmartphones.length === 0) {
      return smartphones;
    }

    // Pastikan seluruh smartphone dari percakapan Chat AI memiliki ID yang valid
    const chatPhones = session.chatSmartphones.map((phone, idx) => {
      const dbMatch = smartphones.find(
        (dbP) =>
          (phone.id && !String(phone.id).startsWith('temp-') && String(dbP.id) === String(phone.id)) ||
          String(dbP.name).toLowerCase().trim() === String(phone.name).toLowerCase().trim()
      );

      const assignedId =
        dbMatch?.id ??
        (phone.id && !String(phone.id).startsWith('temp-')
          ? phone.id
          : `chat-${idx + 1}`);

      return {
        ...phone,
        id: assignedId,
        user_id: phone.user_id ?? dbMatch?.user_id ?? null,
        isFromChat: true,
      };
    });

    const chatNames = new Set(
      chatPhones.map((p) => String(p.name).toLowerCase().trim())
    );
    const chatIds = new Set(
      chatPhones.map((p) => String(p.id))
    );

    // HP database lain yang tidak ada di chat tetap disertakan agar user bisa menambah alternatif jika diinginkan
    const otherDbPhones = smartphones.filter(
      (dbP) =>
        !chatIds.has(String(dbP.id)) &&
        !chatNames.has(String(dbP.name).toLowerCase().trim())
    );

    return [...chatPhones, ...otherDbPhones];
  }, [smartphones, session.chatSmartphones]);

  const completePhones = useMemo(
    () => effectiveSmartphones.filter((p) => isCompleteSmartphone(p, criteria)),
    [effectiveSmartphones, criteria]
  );

  const incompleteCount = effectiveSmartphones.length - completePhones.length;

  const eligiblePhones = useMemo(() => {
    if (!parsedBudget) return completePhones;
    return completePhones.filter((p) => Number(p.price) <= parsedBudget);
  }, [completePhones, parsedBudget]);

  const selectedPhones = useMemo(() => {
    const deselectedSet = new Set(session.deselectedIds.map(String));
    return eligiblePhones.filter((p) => !deselectedSet.has(String(p.id)));
  }, [eligiblePhones, session.deselectedIds]);

  const effectiveWeightMode = isAdmin ? session.weightMode : 'default';

  const customWeightMap = useMemo(() => {
    if (effectiveWeightMode !== 'custom') return null;
    const map = {};
    for (const c of criteria) {
      const val = Number(session.customWeights[c.code]);
      map[c.code] = Number.isFinite(val) && val >= 0 ? val : 0;
    }
    return map;
  }, [effectiveWeightMode, session.customWeights, criteria]);

  const customWeightSum = useMemo(() => {
    if (!customWeightMap) return 1;
    return Object.values(customWeightMap).reduce((sum, w) => sum + w, 0);
  }, [customWeightMap]);

  const sawResult = useMemo(() => {
    if (effectiveWeightMode === 'custom' && customWeightSum <= 0) {
      return calculateSAW(criteria, [], null);
    }
    return calculateSAW(criteria, selectedPhones, customWeightMap);
  }, [criteria, selectedPhones, customWeightMap, effectiveWeightMode, customWeightSum]);

  return {
    ...session,
    weightMode: effectiveWeightMode,
    criteria,
    smartphones: effectiveSmartphones,
    completePhones,
    incompleteCount,
    eligiblePhones,
    selectedPhones,
    parsedBudget,
    customWeightSum,
    sawResult,
    loading,
    error,
  };
}

