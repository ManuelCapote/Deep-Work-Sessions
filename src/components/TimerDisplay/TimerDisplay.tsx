import { useRef, useEffect, useState } from 'react';
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

function Digit({ char, index }: { char: string; index: number }) {
  const prevRef = useRef(char);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (char !== prevRef.current) {
      prevRef.current = char;
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 200);
      return () => clearTimeout(t);
    }
  }, [char]);

  return (
    <span
      className={`${styles.digit} ${animate ? styles.digitSlide : ''}`}
      key={index}
    >
      {char}
    </span>
  );
}

export function TimerDisplay({ secondsLeft, totalSeconds, isRunning }: Props) {
  const progress = 1 - secondsLeft / totalSeconds;
  const completed = secondsLeft === 0 && !isRunning && totalSeconds > 0;
  const timeStr = format(secondsLeft);

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.display} ${isRunning ? styles.running : ''} ${completed ? styles.completed : ''}`}>
        <span className={styles.time}>
          {timeStr.split('').map((ch, i) => (
            ch === ':' ? <span key="colon" className={styles.colon}>:</span>
              : <Digit key={i} char={ch} index={i} />
          ))}
        </span>
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
