import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types/settings';

const STORAGE_KEY = 'te-pomodoro-settings';

const DEFAULTS: Settings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  autoAdvance: false,
  theme: 'auto',
  notificationsEnabled: false,
  masterVolume: 0.2,
  tickVolume: 0.07,
  dailyGoal: 0,
  onboardingDismissed: false,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULTS;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const setWorkDuration = useCallback((mins: number) => {
    update('workDuration', Math.max(1, Math.min(60, mins)) * 60);
  }, [update]);

  const setShortBreakDuration = useCallback((mins: number) => {
    update('shortBreakDuration', Math.max(1, Math.min(30, mins)) * 60);
  }, [update]);

  const setLongBreakDuration = useCallback((mins: number) => {
    update('longBreakDuration', Math.max(1, Math.min(30, mins)) * 60);
  }, [update]);

  const setAutoAdvance = useCallback((v: boolean) => update('autoAdvance', v), [update]);
  const setTheme = useCallback((v: Settings['theme']) => update('theme', v), [update]);
  const setNotificationsEnabled = useCallback((v: boolean) => update('notificationsEnabled', v), [update]);
  const setMasterVolume = useCallback((v: number) => update('masterVolume', Math.max(0, Math.min(1, v))), [update]);
  const setTickVolume = useCallback((v: number) => update('tickVolume', Math.max(0, Math.min(1, v))), [update]);
  const setDailyGoal = useCallback((n: number) => update('dailyGoal', Math.max(0, Math.min(20, n))), [update]);
  const setOnboardingDismissed = useCallback((v: boolean) => update('onboardingDismissed', v), [update]);

  return {
    settings,
    setWorkDuration,
    setShortBreakDuration,
    setLongBreakDuration,
    setAutoAdvance,
    setTheme,
    setNotificationsEnabled,
    setMasterVolume,
    setTickVolume,
    setDailyGoal,
    setOnboardingDismissed,
  };
}
