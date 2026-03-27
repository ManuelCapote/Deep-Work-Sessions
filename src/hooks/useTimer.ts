import { useState, useEffect, useRef, useCallback } from 'react';
import { playBeep } from '../utils/audio';

export type Mode = 'pomodoro' | 'short' | 'long';

const DEFAULT_DURATIONS: Record<Mode, number> = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

export interface TimerConfig {
  durations?: Partial<Record<Mode, number>>;
  autoAdvance?: boolean;
}

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

export function useTimer(config?: TimerConfig): TimerState & TimerActions {
  const durations: Record<Mode, number> = {
    pomodoro: config?.durations?.pomodoro ?? DEFAULT_DURATIONS.pomodoro,
    short: config?.durations?.short ?? DEFAULT_DURATIONS.short,
    long: config?.durations?.long ?? DEFAULT_DURATIONS.long,
  };

  const [mode, setModeState] = useState<Mode>('pomodoro');
  const [secondsLeft, setSecondsLeft] = useState(durations.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startSecondsRef = useRef<number>(durations.pomodoro);
  const modeRef = useRef<Mode>('pomodoro');
  const autoAdvanceRef = useRef(config?.autoAdvance ?? false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionCountRef = useRef(0);
  const durationsRef = useRef(durations);

  // Keep refs in sync
  useEffect(() => { autoAdvanceRef.current = config?.autoAdvance ?? false; }, [config?.autoAdvance]);
  useEffect(() => { sessionCountRef.current = sessionCount; }, [sessionCount]);
  useEffect(() => { durationsRef.current = durations; });

  // Update secondsLeft when duration changes for current mode (only when idle)
  const prevDurationRef = useRef(durations[mode]);
  useEffect(() => {
    const dur = durations[mode];
    if (!isRunning && secondsLeft === prevDurationRef.current) {
      setSecondsLeft(dur);
    }
    prevDurationRef.current = dur;
  }, [durations[mode]]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current !== null) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;
    clearAutoAdvance();
    startTimeRef.current = Date.now();
    startSecondsRef.current = secondsLeft;
    setIsRunning(true);
  }, [isRunning, secondsLeft, clearAutoAdvance]);

  const pause = useCallback(() => {
    clearTimer();
    clearAutoAdvance();
    setIsRunning(false);
  }, [clearTimer, clearAutoAdvance]);

  const setMode = useCallback((newMode: Mode) => {
    clearTimer();
    clearAutoAdvance();
    setIsRunning(false);
    setModeState(newMode);
    modeRef.current = newMode;
    setSecondsLeft(durationsRef.current[newMode]);
    prevDurationRef.current = durationsRef.current[newMode];
  }, [clearTimer, clearAutoAdvance]);

  const reset = useCallback(() => {
    clearTimer();
    clearAutoAdvance();
    setIsRunning(false);
    setSecondsLeft(durationsRef.current[modeRef.current]);
    prevDurationRef.current = durationsRef.current[modeRef.current];
  }, [clearTimer, clearAutoAdvance]);

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

        const completedMode = modeRef.current;
        if (completedMode === 'pomodoro') {
          setSessionCount(prev => prev + 1);
        }

        // Auto-advance with a short pause
        if (autoAdvanceRef.current) {
          autoAdvanceTimerRef.current = setTimeout(() => {
            let nextMode: Mode;
            if (completedMode === 'pomodoro') {
              nextMode = (sessionCountRef.current) % 4 === 0 ? 'long' : 'short';
            } else {
              nextMode = 'pomodoro';
            }
            setModeState(nextMode);
            modeRef.current = nextMode;
            const dur = durationsRef.current[nextMode];
            setSecondsLeft(dur);
            prevDurationRef.current = dur;
            // Auto-start after a brief delay
            startTimeRef.current = Date.now();
            startSecondsRef.current = dur;
            setIsRunning(true);
          }, 1500);
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

  // Cleanup auto-advance on unmount
  useEffect(() => {
    return () => {
      clearAutoAdvance();
    };
  }, [clearAutoAdvance]);

  return {
    mode,
    secondsLeft,
    isRunning,
    sessionCount,
    totalSeconds: durations[mode],
    start,
    pause,
    reset,
    setMode,
  };
}
