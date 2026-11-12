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

  const completePhones = useMemo(
    () => smartphones.filter((p) => isCompleteSmartphone(p, criteria)),
    [smartphones, criteria]
  );

  const incompleteCount = smartphones.length - completePhones.length;

  const eligiblePhones = useMemo(() => {
    if (!parsedBudget) return completePhones;
    return completePhones.filter((p) => Number(p.price) <= parsedBudget);
  }, [completePhones, parsedBudget]);

  const selectedPhones = useMemo(
    () =>
      eligiblePhones.filter((p) => !session.deselectedIds.includes(p.id)),
    [eligiblePhones, session.deselectedIds]
  );

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
    smartphones,
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

