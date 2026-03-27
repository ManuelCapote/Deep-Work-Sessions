import type { HeatmapDay } from '../../types/stats';
import styles from './Heatmap.module.css';

interface Props {
  days: HeatmapDay[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'M', '', 'W', '', 'F', ''];

export function Heatmap({ days }: Props) {
  // Group into weeks (columns)
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Month labels: check first day of each week
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  for (let i = 0; i < weeks.length; i++) {
    const firstDay = weeks[i][0];
    if (firstDay) {
      const month = new Date(firstDay.date + 'T00:00:00').getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ col: i, label: MONTH_NAMES[month] });
        lastMonth = month;
      }
    }
  }

  return (
    <div className={styles.heatmap}>
      {/* Month labels */}
      <div className={styles.monthRow}>
        <span className={styles.dayLabelSpacer} />
        {weeks.map((_, i) => {
          const label = monthLabels.find(m => m.col === i);
          return (
            <span key={i} className={styles.monthLabel}>
              {label ? label.label : ''}
            </span>
          );
        })}
      </div>

      {/* Grid rows (one per day of week) */}
      <div className={styles.gridWrap}>
        <div className={styles.dayLabels}>
          {DAY_LABELS.map((label, i) => (
            <span key={i} className={styles.dayLabel}>{label}</span>
          ))}
        </div>
        <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${weeks.length}, 12px)` }}>
          {/* Fill column by column (each week), row by row (Sun-Sat) */}
          {Array.from({ length: 7 }).map((_, row) =>
            weeks.map((week, col) => {
              const day = week[row];
              if (!day) return <span key={`${col}-${row}`} className={styles.cell} />;
              return (
                <span
                  key={day.date}
                  className={`${styles.cell} ${styles[`i${day.intensity}`]}`}
                  title={`${day.date}: ${day.pomodoros} pomodoros`}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
