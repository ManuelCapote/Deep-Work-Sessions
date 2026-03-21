import styles from './SessionCounter.module.css';

interface Props {
  sessionCount: number;
}

const CYCLE = 4;

export function SessionCounter({ sessionCount }: Props) {
  const cycles = Math.floor(sessionCount / CYCLE);
  const dots = sessionCount % CYCLE;

  return (
    <div className={styles.container}>
      <span className={styles.label}>SESSION</span>
      <div className={styles.indicators}>
        {Array.from({ length: CYCLE }).map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i < dots ? styles.filled : ''}`}
          />
        ))}
        {cycles > 0 && (
          <span className={styles.cycles}>×{cycles}</span>
        )}
      </div>
      <span className={styles.count}>{String(sessionCount).padStart(2, '0')}</span>
    </div>
  );
}
