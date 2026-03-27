import type { WorkSession } from '../types/session';

function download(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(ts: number): string {
  return new Date(ts).toISOString().split('T')[0];
}

function formatDuration(startTs: number, endTs: number): number {
  return Math.round((endTs - startTs) / 60000);
}

export function exportCSV(sessions: WorkSession[]) {
  const finished = sessions
    .filter(s => s.status === 'finished' && s.finishedAt)
    .sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0));

  const header = 'Date,Session Name,Pomodoros,Todos Completed,Todos Total,Duration (min)';
  const rows = finished.map(s => {
    const date = formatDate(s.finishedAt!);
    const name = `"${s.name.replace(/"/g, '""')}"`;
    const pomos = s.finishedPomodoroCount - s.startPomodoroCount;
    const done = s.todos.filter(t => t.done).length;
    const total = s.todos.length;
    const duration = formatDuration(s.createdAt, s.finishedAt!);
    return `${date},${name},${pomos},${done},${total},${duration}`;
  });

  download([header, ...rows].join('\n'), 'pomodoro-sessions.csv', 'text/csv');
}

export function exportJSON(sessions: WorkSession[]) {
  const finished = sessions
    .filter(s => s.status === 'finished' && s.finishedAt)
    .sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0));

  const data = finished.map(s => ({
    date: formatDate(s.finishedAt!),
    name: s.name,
    pomodoros: s.finishedPomodoroCount - s.startPomodoroCount,
    todosCompleted: s.todos.filter(t => t.done).length,
    todosTotal: s.todos.length,
    durationMinutes: formatDuration(s.createdAt, s.finishedAt!),
    todos: s.todos.map(t => ({ text: t.text, done: t.done })),
  }));

  download(JSON.stringify(data, null, 2), 'pomodoro-sessions.json', 'application/json');
}
