import { useMemo } from 'react';
import type { DailyStats } from '../../types/stats';
import { getDateKey } from '../../utils/stats';
import styles from './DailyChart.module.css';

interface Props {
  dailyStats: Record<string, DailyStats>;
  days?: number;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DailyChart({ dailyStats, days = 14 }: Props) {
  const bars = useMemo(() => {
    const result: { date: string; label: string; count: number }[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = getDateKey(d.getTime());
      const count = dailyStats[key]?.pomodoros ?? 0;
      result.push({
        date: key,
        label: DAY_LABELS[d.getDay()],
        count,
      });
    }

    return result;
  }, [dailyStats, days]);

  const maxCount = Math.max(1, ...bars.map(b => b.count));

  return (
    <div className={styles.chart}>
      <div className={styles.bars}>
        {bars.map(bar => (
          <div key={bar.date} className={styles.barCol} title={`${bar.date}: ${bar.count}`}>
            <div className={styles.barTrack}>
              <div
                className={`${styles.bar} ${bar.count > 0 ? styles.barFilled : ''}`}
                style={{ height: `${(bar.count / maxCount) * 100}%` }}
              />
            </div>
            <span className={styles.barLabel}>{bar.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.yAxis}>
        <span className={styles.yLabel}>{maxCount}</span>
        <span className={styles.yLabel}>{Math.round(maxCount / 2)}</span>
        <span className={styles.yLabel}>0</span>
      </div>
    </div>
  );
}
