import styles from './Controls.module.css';

interface Props {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function Controls({ isRunning, onStart, onPause, onReset }: Props) {
  return (
    <div className={styles.container}>
      <button className={styles.primary} onClick={isRunning ? onPause : onStart}>
        {isRunning ? 'PAUSE' : 'START'}
      </button>
      <button className={styles.secondary} onClick={onReset}>
        RESET
      </button>
    </div>
  );
}
