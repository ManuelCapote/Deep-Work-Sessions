import type { WorkSession } from '../types/session';
import type { DailyStats, StreakInfo, HeatmapDay, WeekSummary } from '../types/stats';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getDateKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return getDateKey(Date.now());
}

function addDays(dateKey: string, n: number): string {
  const d = new Date(dateKey + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return getDateKey(d.getTime());
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00').getTime();
  const db = new Date(b + 'T00:00:00').getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

// ─── Daily Stats ─────────────────────────────────────────────────────────────

export function computeDailyStats(sessions: WorkSession[]): Record<string, DailyStats> {
  const map: Record<string, DailyStats> = {};

  for (const s of sessions) {
    if (s.status !== 'finished' || !s.finishedAt) continue;

    const date = getDateKey(s.finishedAt);
    if (!map[date]) {
      map[date] = { date, pomodoros: 0, sessions: 0, focusMinutes: 0, todosCompleted: 0, todosTotal: 0 };
    }

    const entry = map[date];
    entry.pomodoros += s.finishedPomodoroCount - s.startPomodoroCount;
    entry.sessions += 1;
    entry.focusMinutes += Math.round((s.finishedAt - s.createdAt) / 60000);
    entry.todosCompleted += s.todos.filter(t => t.done).length;
    entry.todosTotal += s.todos.length;
  }

  return map;
}

// ─── Streak ──────────────────────────────────────────────────────────────────

export function computeStreak(dailyStats: Record<string, DailyStats>): StreakInfo {
  const today = todayKey();
  const dates = Object.keys(dailyStats).sort();

  if (dates.length === 0) {
    return { current: 0, longest: 0, lastActiveDate: '' };
  }

  const lastActive = dates[dates.length - 1];

  // Current streak: walk backwards from today (or yesterday if no activity today)
  let current = 0;
  let checkDate = dailyStats[today] ? today : addDays(today, -1);

  // If most recent activity is older than yesterday, current streak is 0
  if (daysBetween(lastActive, checkDate) > 0 && !dailyStats[checkDate]) {
    current = 0;
  } else {
    while (dailyStats[checkDate]) {
      current++;
      checkDate = addDays(checkDate, -1);
    }
  }

  // Longest streak: scan all dates
  let longest = 0;
  let streak = 0;
  let prev = '';

  for (const date of dates) {
    if (prev && daysBetween(prev, date) === 1) {
      streak++;
    } else {
      streak = 1;
    }
    longest = Math.max(longest, streak);
    prev = date;
  }

  return { current, longest, lastActiveDate: lastActive };
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

function intensityLevel(pomodoros: number): 0 | 1 | 2 | 3 | 4 {
  if (pomodoros === 0) return 0;
  if (pomodoros <= 2) return 1;
  if (pomodoros <= 4) return 2;
  if (pomodoros <= 7) return 3;
  return 4;
}

export function computeHeatmap(
  dailyStats: Record<string, DailyStats>,
  weeks = 12,
): HeatmapDay[] {
  const today = new Date();
  const todayDow = today.getDay(); // 0=Sun
  const totalDays = weeks * 7;

  // Start from the beginning of the grid (most recent Sunday that makes the grid end on today's week)
  const endOffset = 6 - todayDow; // days until Saturday of current week
  const result: HeatmapDay[] = [];

  for (let i = totalDays - 1 + endOffset; i >= endOffset; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i + endOffset);
    const date = getDateKey(d.getTime());
    const pomodoros = dailyStats[date]?.pomodoros ?? 0;
    result.push({
      date,
      dayOfWeek: d.getDay(),
      pomodoros,
      intensity: intensityLevel(pomodoros),
    });
  }

  return result;
}

// ─── Week Summary ────────────────────────────────────────────────────────────

export function computeWeekSummary(dailyStats: Record<string, DailyStats>): WeekSummary {
  const today = todayKey();
  const todayDate = new Date(today + 'T00:00:00');
  const dow = todayDate.getDay(); // 0=Sun

  // This week: Monday to Sunday
  const mondayOffset = dow === 0 ? 6 : dow - 1;
  const thisMonday = addDays(today, -mondayOffset);

  let totalPomodoros = 0;
  let totalSessions = 0;
  let totalFocusMinutes = 0;
  let daysWithActivity = 0;

  for (let i = 0; i < 7; i++) {
    const d = addDays(thisMonday, i);
    const stats = dailyStats[d];
    if (stats) {
      totalPomodoros += stats.pomodoros;
      totalSessions += stats.sessions;
      totalFocusMinutes += stats.focusMinutes;
      daysWithActivity++;
    }
  }

  // Previous week for comparison
  const prevMonday = addDays(thisMonday, -7);
  let prevWeekPomodoros = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(prevMonday, i);
    const stats = dailyStats[d];
    if (stats) prevWeekPomodoros += stats.pomodoros;
  }

  return {
    totalPomodoros,
    avgPerDay: daysWithActivity > 0 ? Math.round((totalPomodoros / daysWithActivity) * 10) / 10 : 0,
    totalSessions,
    totalFocusMinutes,
    prevWeekPomodoros,
  };
}

// ─── Today Stats ─────────────────────────────────────────────────────────────

export function getTodayStats(dailyStats: Record<string, DailyStats>): DailyStats {
  const today = todayKey();
  return dailyStats[today] ?? { date: today, pomodoros: 0, sessions: 0, focusMinutes: 0, todosCompleted: 0, todosTotal: 0 };
}
