import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'te-pomodoro-quick-notes';

function load(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) return raw;
  } catch { /* ignore */ }
  return '';
}

export function useQuickNotes() {
  const [notes, setNotes] = useState<string>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, notes);
  }, [notes]);

  const clear = useCallback(() => setNotes(''), []);

  return { notes, setNotes, clear };
}
