import type { Mode } from '../../hooks/useTimer';
import styles from './ModeSelector.module.css';

interface Props {
  mode: Mode;
  onSetMode: (mode: Mode) => void;
}

const MODES: { key: Mode; label: string }[] = [
  { key: 'pomodoro', label: 'WORK' },
  { key: 'short', label: 'SHORT' },
  { key: 'long', label: 'LONG' },
];

export function ModeSelector({ mode, onSetMode }: Props) {
  return (
    <div className={styles.container}>
      {MODES.map(({ key, label }) => (
        <button
          key={key}
          className={`${styles.btn} ${mode === key ? styles.active : ''}`}
          onClick={() => onSetMode(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
