import styles from './TimerDisplay.module.css';

interface Props {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
}

function format(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function TimerDisplay({ secondsLeft, totalSeconds, isRunning }: Props) {
  const progress = 1 - secondsLeft / totalSeconds;

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.display} ${isRunning ? styles.running : ''}`}>
        <span className={styles.time}>{format(secondsLeft)}</span>
      </div>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressBar}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
