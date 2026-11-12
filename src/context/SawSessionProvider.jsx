import { useCallback, useEffect, useState } from 'react';
import { SawSessionContext } from './SawSessionContext';

const STORAGE_KEY = 'sesuaidompet_saw_session_v1';

const MAX_COMPARE = 4;

const DEFAULT_SESSION = {
  maxBudget: '',
  weightMode: 'default', // 'default' | 'custom'
  customWeights: {
    C1: '0.229',
    C2: '0.077',
    C3: '0.265',
    C4: '0.177',
    C5: '0.152',
    C6: '0.100',
  },
  deselectedIds: [],
  compareIds: [],
  compareInitialized: false,
};

function loadInitialState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SESSION;
    const parsed = JSON.parse(raw);
    return {
      maxBudget: typeof parsed.maxBudget === 'string' ? parsed.maxBudget : '',
      weightMode: parsed.weightMode === 'custom' ? 'custom' : 'default',
      customWeights:
        parsed.customWeights && typeof parsed.customWeights === 'object'
          ? { ...DEFAULT_SESSION.customWeights, ...parsed.customWeights }
          : DEFAULT_SESSION.customWeights,
      deselectedIds: Array.isArray(parsed.deselectedIds)
        ? parsed.deselectedIds
        : [],
      compareIds: Array.isArray(parsed.compareIds)
        ? parsed.compareIds.slice(0, MAX_COMPARE)
        : [],
      compareInitialized: Boolean(parsed.compareInitialized),
    };
  } catch {
    return DEFAULT_SESSION;
  }
}

export function SawSessionProvider({ children }) {
  const [state, setState] = useState(loadInitialState);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Abaikan jika sessionStorage tidak tersedia
    }
  }, [state]);

  const setMaxBudget = useCallback((maxBudget) => {
    setState((prev) => ({ ...prev, maxBudget }));
  }, []);

  const setWeightMode = useCallback((weightMode) => {
    setState((prev) => ({ ...prev, weightMode }));
  }, []);

  const setCustomWeight = useCallback((code, value) => {
    setState((prev) => ({
      ...prev,
      customWeights: { ...prev.customWeights, [code]: value },
    }));
  }, []);

  const applyCriteriaAsCustom = useCallback((criteria) => {
    const next = {};
    for (const c of criteria) {
      next[c.code] = String(c.weight);
    }
    setState((prev) => ({
      ...prev,
      customWeights: { ...prev.customWeights, ...next },
    }));
  }, []);

  const toggleSmartphoneId = useCallback((id) => {
    setState((prev) => {
      const exists = prev.deselectedIds.includes(id);
      return {
        ...prev,
        deselectedIds: exists
          ? prev.deselectedIds.filter((item) => item !== id)
          : [...prev.deselectedIds, id],
      };
    });
  }, []);

  const selectAllIds = useCallback(() => {
    setState((prev) => ({ ...prev, deselectedIds: [] }));
  }, []);

  const deselectIds = useCallback((ids) => {
    setState((prev) => ({ ...prev, deselectedIds: ids }));
  }, []);

  const resetSession = useCallback((criteria = []) => {
    const nextWeights = { ...DEFAULT_SESSION.customWeights };
    for (const c of criteria) {
      nextWeights[c.code] = String(c.weight);
    }
    setState((prev) => ({
      ...DEFAULT_SESSION,
      customWeights: nextWeights,
      compareIds: prev.compareIds,
      compareInitialized: prev.compareInitialized,
    }));
  }, []);

  const toggleCompareId = useCallback((id) => {
    setState((prev) => {
      const exists = prev.compareIds.includes(id);
      if (exists) {
        return {
          ...prev,
          compareInitialized: true,
          compareIds: prev.compareIds.filter((item) => item !== id),
        };
      }
      if (prev.compareIds.length >= MAX_COMPARE) {
        return prev;
      }
      return {
        ...prev,
        compareInitialized: true,
        compareIds: [...prev.compareIds, id],
      };
    });
  }, []);

  const setCompareIds = useCallback((updater) => {
    setState((prev) => {
      const nextIds =
        typeof updater === 'function' ? updater(prev.compareIds) : updater;
      return {
        ...prev,
        compareInitialized: true,
        compareIds: Array.isArray(nextIds) ? nextIds.slice(0, MAX_COMPARE) : [],
      };
    });
  }, []);

  const removeCompareId = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      compareInitialized: true,
      compareIds: prev.compareIds.filter((item) => item !== id),
    }));
  }, []);

  const clearCompareIds = useCallback(() => {
    setState((prev) => ({
      ...prev,
      compareInitialized: true,
      compareIds: [],
    }));
  }, []);

  return (
    <SawSessionContext.Provider
      value={{
        maxBudget: state.maxBudget,
        weightMode: state.weightMode,
        customWeights: state.customWeights,
        deselectedIds: state.deselectedIds,
        compareIds: state.compareIds,
        compareInitialized: state.compareInitialized,
        setMaxBudget,
        setWeightMode,
        setCustomWeight,
        applyCriteriaAsCustom,
        toggleSmartphoneId,
        selectAllIds,
        deselectIds,
        resetSession,
        toggleCompareId,
        setCompareIds,
        removeCompareId,
        clearCompareIds,
      }}
    >
      {children}
    </SawSessionContext.Provider>
  );
}

