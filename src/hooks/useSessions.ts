import { useState, useEffect, useCallback } from 'react';
import type { WorkSession, Todo, Distraction, PlanTask } from '../types/session';

const STORAGE_KEY = 'te-pomodoro-sessions';

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function makeSession(name: string, startCount: number): WorkSession {
  return {
    id: uid(),
    name,
    todos: [],
    startPomodoroCount: startCount,
    finishedPomodoroCount: 0,
    status: 'active',
    createdAt: Date.now(),
  };
}

function load(): WorkSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as WorkSession[];
  } catch { /* ignore */ }
  return [];
}

export function useSessions(cumulativePomodoroCount: number) {
  const [sessions, setSessions] = useState<WorkSession[]>(() => {
    const stored = load();
    if (stored.length > 0) return stored;
    return [makeSession('Session 1', cumulativePomodoroCount)];
  });

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const activeSession = sessions.find(s => s.status === 'active') ?? null;
  const archivedSessions = sessions
    .filter(s => s.status === 'finished')
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0));

  const pomodorosInSession = activeSession
    ? cumulativePomodoroCount - activeSession.startPomodoroCount
    : 0;

  const renameSession = useCallback((name: string) => {
    setSessions(prev =>
      prev.map(s => s.status === 'active' ? { ...s, name } : s),
    );
  }, []);

  const finishSession = useCallback(() => {
    setSessions(prev => {
      const idx = prev.findIndex(s => s.status === 'active');
      if (idx === -1) return prev;
      const finished: WorkSession = {
        ...prev[idx],
        status: 'finished',
        finishedPomodoroCount: cumulativePomodoroCount,
        finishedAt: Date.now(),
      };
      const nextName = `Session ${prev.length + 1}`;
      return [...prev.slice(0, idx), finished, ...prev.slice(idx + 1),
        makeSession(nextName, cumulativePomodoroCount)];
    });
  }, [cumulativePomodoroCount]);

  const addTodo = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const todo: Todo = { id: uid(), text: trimmed, done: false };
    setSessions(prev =>
      prev.map(s =>
        s.status === 'active'
          ? { ...s, todos: [...s.todos, todo] }
          : s,
      ),
    );
  }, []);

  const toggleTodo = useCallback((todoId: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.status === 'active'
          ? { ...s, todos: s.todos.map(t => t.id === todoId ? { ...t, done: !t.done } : t) }
          : s,
      ),
    );
  }, []);

  const deleteTodo = useCallback((todoId: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.status === 'active'
          ? { ...s, todos: s.todos.filter(t => t.id !== todoId) }
          : s,
      ),
    );
  }, []);

  const setTags = useCallback((tags: string[]) => {
    setSessions(prev =>
      prev.map(s => s.status === 'active' ? { ...s, tags } : s),
    );
  }, []);

  const setNotes = useCallback((notes: string) => {
    setSessions(prev =>
      prev.map(s => s.status === 'active' ? { ...s, notes } : s),
    );
  }, []);

  const addDistraction = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const d: Distraction = { id: uid(), text: trimmed, timestamp: Date.now() };
    setSessions(prev =>
      prev.map(s =>
        s.status === 'active'
          ? { ...s, distractions: [...(s.distractions ?? []), d] }
          : s,
      ),
    );
  }, []);

  const reorderTodos = useCallback((fromIdx: number, toIdx: number) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.status !== 'active') return s;
        const todos = [...s.todos];
        const [moved] = todos.splice(fromIdx, 1);
        todos.splice(toIdx, 0, moved);
        return { ...s, todos };
      }),
    );
  }, []);

  const startFromPlan = useCallback((
    name: string,
    tasks: PlanTask[],
    targetPomodoros: number,
  ) => {
    const todos: Todo[] = tasks.map(t => ({ id: t.id, text: t.text, done: false }));
    setSessions(prev =>
      prev.map(s =>
        s.status === 'active'
          ? { ...s, name: name.trim() || s.name, todos, targetPomodoros }
          : s,
      ),
    );
  }, []);

  return {
    activeSession,
    archivedSessions,
    pomodorosInSession,
    renameSession,
    finishSession,
    addTodo,
    toggleTodo,
    deleteTodo,
    setTags,
    setNotes,
    addDistraction,
    reorderTodos,
    startFromPlan,
  };
}
