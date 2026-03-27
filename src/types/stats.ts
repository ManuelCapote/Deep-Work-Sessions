export interface DailyStats {
  date: string;              // YYYY-MM-DD
  pomodoros: number;
  sessions: number;
  focusMinutes: number;      // total work time
  todosCompleted: number;
  todosTotal: number;
}

export interface StreakInfo {
  current: number;           // consecutive days
  longest: number;
  lastActiveDate: string;    // YYYY-MM-DD
}

export interface HeatmapDay {
  date: string;              // YYYY-MM-DD
  dayOfWeek: number;         // 0=Sun, 6=Sat
  pomodoros: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

export interface WeekSummary {
  totalPomodoros: number;
  avgPerDay: number;
  totalSessions: number;
  totalFocusMinutes: number;
  prevWeekPomodoros: number;  // for comparison
}
