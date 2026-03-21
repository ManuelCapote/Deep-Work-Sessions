import { useState, useEffect, useCallback } from 'react';
import type { PlanTask } from '../types/session';

const STORAGE_KEY = 'te-pomodoro-plan';

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

interface PlanState {
  name: string;
  targetPomodoros: number;
  tasks: PlanTask[];
}

const DEFAULT: PlanState = { name: '', targetPomodoros: 4, tasks: [] };

function load(): PlanState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PlanState;
  } catch { /* ignore */ }
  return DEFAULT;
}

export function usePlanning() {
  const [plan, setPlan] = useState<PlanState>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  const setName = useCallback((name: string) => {
    setPlan(p => ({ ...p, name }));
  }, []);

  const setTargetPomodoros = useCallback((n: number) => {
    setPlan(p => ({ ...p, targetPomodoros: Math.max(1, Math.min(12, n)) }));
  }, []);

  const addTask = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setPlan(p => ({ ...p, tasks: [...p.tasks, { id: uid(), text: trimmed }] }));
  }, []);

  const removeTask = useCallback((id: string) => {
    setPlan(p => ({ ...p, tasks: p.tasks.filter(t => t.id !== id) }));
  }, []);

  const reset = useCallback(() => {
    setPlan(DEFAULT);
  }, []);

  return { plan, setName, setTargetPomodoros, addTask, removeTask, reset };
}
