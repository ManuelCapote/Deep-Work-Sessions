import { useState, useEffect, useRef, useCallback } from 'react';
import { playBeep } from '../utils/audio';

export type Mode = 'focus' | 'rest';

const DEFAULT_DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  rest: 5 * 60,
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
    focus: config?.durations?.focus ?? DEFAULT_DURATIONS.focus,
    rest: config?.durations?.rest ?? DEFAULT_DURATIONS.rest,
  };

  const [mode, setModeState] = useState<Mode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(durations.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startSecondsRef = useRef<number>(durations.focus);
  const modeRef = useRef<Mode>('focus');
  const autoAdvanceRef = useRef(config?.autoAdvance ?? false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationsRef = useRef(durations);

  // Keep refs in sync
  useEffect(() => { autoAdvanceRef.current = config?.autoAdvance ?? false; }, [config?.autoAdvance]);
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
        if (completedMode === 'focus') {
          setSessionCount(prev => prev + 1);
        }

        // Auto-advance with a short pause
        if (autoAdvanceRef.current) {
          autoAdvanceTimerRef.current = setTimeout(() => {
            const nextMode: Mode = completedMode === 'focus' ? 'rest' : 'focus';
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
    const modeLabel = mode === 'focus' ? 'FOCUS' : 'REST';
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
