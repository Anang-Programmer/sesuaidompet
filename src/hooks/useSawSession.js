import { useContext } from 'react';
import { SawSessionContext } from '../context/SawSessionContext';

export function useSawSession() {
  const ctx = useContext(SawSessionContext);
  if (!ctx) {
    throw new Error('useSawSession harus digunakan di dalam SawSessionProvider.');
  }
  return ctx;
}

