import { useState, useEffect, useRef, useCallback } from 'react';
import { playBeep } from '../utils/audio';

export type Mode = 'pomodoro' | 'short' | 'long';

const DURATIONS: Record<Mode, number> = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

export interface TimerState {
  mode: Mode;
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
  totalSeconds: number;
}

export interface TimerActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: Mode) => void;
}

export function useTimer(): TimerState & TimerActions {
  const [mode, setModeState] = useState<Mode>('pomodoro');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startSecondsRef = useRef<number>(DURATIONS.pomodoro);
  const modeRef = useRef<Mode>('pomodoro');

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;
    startTimeRef.current = Date.now();
    startSecondsRef.current = secondsLeft;
    setIsRunning(true);
  }, [isRunning, secondsLeft]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setSecondsLeft(DURATIONS[mode]);
  }, [clearTimer, mode]);

  const setMode = useCallback((newMode: Mode) => {
    clearTimer();
    setIsRunning(false);
    setModeState(newMode);
    modeRef.current = newMode;
    setSecondsLeft(DURATIONS[newMode]);
  }, [clearTimer]);

  // Run the interval when isRunning changes
  useEffect(() => {
    if (!isRunning) return;

    startTimeRef.current = startTimeRef.current ?? Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      const next = startSecondsRef.current - elapsed;

      if (next <= 0) {
        clearTimer();
        setSecondsLeft(0);
        setIsRunning(false);
        playBeep();
        if (modeRef.current === 'pomodoro') {
          setSessionCount(prev => prev + 1);
        }
      } else {
        setSecondsLeft(next);
      }
    }, 500);

    return clearTimer;
  }, [isRunning, clearTimer]);

  // Update document title
  useEffect(() => {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const ss = String(secondsLeft % 60).padStart(2, '0');
    const modeLabel = mode === 'pomodoro' ? 'WORK' : mode === 'short' ? 'SHORT' : 'LONG';
    document.title = `${mm}:${ss} — ${modeLabel}`;
    return () => { document.title = 'POMODORO'; };
  }, [secondsLeft, mode]);

  return {
    mode,
    secondsLeft,
    isRunning,
    sessionCount,
    totalSeconds: DURATIONS[mode],
    start,
    pause,
    reset,
    setMode,
  };
}
