import { useMemo } from 'react';
import type { WorkSession } from '../../types/session';
import {
  computeDailyStats,
  computeStreak,
  computeWeekSummary,
  computeHeatmap,
  getTodayStats,
} from '../../utils/stats';
import { DailyChart } from './DailyChart';
import { Heatmap } from './Heatmap';
import { exportCSV, exportJSON } from '../../utils/export';
import styles from './StatsView.module.css';

interface Props {
  sessions: WorkSession[];
  dailyGoal: number;
}

export function StatsView({ sessions, dailyGoal }: Props) {
  const dailyStats = useMemo(() => computeDailyStats(sessions), [sessions]);
  const today = useMemo(() => getTodayStats(dailyStats), [dailyStats]);
  const streak = useMemo(() => computeStreak(dailyStats), [dailyStats]);
  const week = useMemo(() => computeWeekSummary(dailyStats), [dailyStats]);
  const heatmap = useMemo(() => computeHeatmap(dailyStats, 12), [dailyStats]);

  const weekDelta = week.totalPomodoros - week.prevWeekPomodoros;
  const weekDeltaLabel = weekDelta > 0 ? `+${weekDelta}` : weekDelta === 0 ? '=' : `${weekDelta}`;

  const goalActive = dailyGoal > 0;
  const goalMet = goalActive && today.pomodoros >= dailyGoal;

  return (
    <div className={styles.container}>

      {/* ── Today ──────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>TODAY</span>
        </div>
        <div className={styles.metricsRow}>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{today.pomodoros}</span>
            <span className={styles.metricLabel}>pomodoros</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{today.focusMinutes}</span>
            <span className={styles.metricLabel}>focus min</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{today.sessions}</span>
            <span className={styles.metricLabel}>sessions</span>
          </div>
        </div>
        {goalActive && (
          <div className={styles.goalRow}>
            <div className={styles.goalTrack}>
              <div
                className={`${styles.goalBar} ${goalMet ? styles.goalMet : ''}`}
                style={{ width: `${Math.min(100, (today.pomodoros / dailyGoal) * 100)}%` }}
              />
            </div>
            <span className={styles.goalLabel}>
              {goalMet ? '\u2713' : `${today.pomodoros}/${dailyGoal}`}
            </span>
          </div>
        )}
      </section>

      {/* ── Streak ─────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>STREAK</span>
        </div>
        <div className={styles.metricsRow}>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{streak.current}</span>
            <span className={styles.metricLabel}>current</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{streak.longest}</span>
            <span className={styles.metricLabel}>longest</span>
          </div>
        </div>
      </section>

      {/* ── This Week ──────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>THIS WEEK</span>
        </div>
        <div className={styles.metricsRow}>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{week.totalPomodoros}</span>
            <span className={styles.metricLabel}>pomodoros</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{week.avgPerDay}</span>
            <span className={styles.metricLabel}>avg/day</span>
          </div>
          <div className={styles.metric}>
            <span className={`${styles.metricValue} ${weekDelta > 0 ? styles.positive : weekDelta < 0 ? styles.negative : ''}`}>
              {weekDeltaLabel}
            </span>
            <span className={styles.metricLabel}>vs last wk</span>
          </div>
        </div>
      </section>

      {/* ── Daily Chart ────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>LAST 14 DAYS</span>
        </div>
        <div className={styles.chartBody}>
          <DailyChart dailyStats={dailyStats} days={14} />
        </div>
      </section>

      {/* ── Heatmap ────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>ACTIVITY</span>
        </div>
        <div className={styles.heatmapBody}>
          <Heatmap days={heatmap} />
        </div>
      </section>

      {/* ── Export ─────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>EXPORT</span>
        </div>
        <div className={styles.exportRow}>
          <button className={styles.exportBtn} onClick={() => exportCSV(sessions)}>
            CSV
          </button>
          <button className={styles.exportBtn} onClick={() => exportJSON(sessions)}>
            JSON
          </button>
        </div>
      </section>

    </div>
  );
}
