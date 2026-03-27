import { NOISE_OPTIONS } from '../../utils/sounds';
import type { NoiseType } from '../../hooks/useSounds';
import styles from './SoundControls.module.css';

interface Props {
  tickEnabled: boolean;
  noiseType: NoiseType;
  masterVolume: number;
  onSetTickEnabled: (v: boolean) => void;
  onSetNoiseType: (t: NoiseType) => void;
  onSetMasterVolume: (v: number) => void;
}

export function SoundControls({
  tickEnabled, noiseType, masterVolume,
  onSetTickEnabled, onSetNoiseType, onSetMasterVolume,
}: Props) {
  return (
    <div className={styles.container}>

      {/* ── Tick row ─────────────────────────────────────────────────────── */}
      <div className={styles.tickRow}>
        <span className={styles.rowLabel}>TICK</span>
        <button
          className={`${styles.toggle} ${tickEnabled ? styles.on : ''}`}
          onClick={() => onSetTickEnabled(!tickEnabled)}
        >
          {tickEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* ── Ambient grid ─────────────────────────────────────────────────── */}
      <div className={styles.ambientSection}>
        <div className={styles.ambientHeader}>
          <span className={styles.rowLabel}>AMBIENT</span>
        </div>
        <div className={styles.grid}>
          {NOISE_OPTIONS.map(({ key, label, hint }) => (
            <button
              key={key}
              className={`${styles.noiseBtn} ${noiseType === key ? styles.active : ''}`}
              onClick={() => onSetNoiseType(key)}
              title={hint}
            >
              {label}
              {key === 'binaural' && <span className={styles.hpBadge}>HP</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Volume ───────────────────────────────────────────────────────── */}
      <div className={styles.volumeRow}>
        <span className={styles.rowLabel}>VOL</span>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={100}
          value={Math.round(masterVolume * 100)}
          onChange={e => onSetMasterVolume(Number(e.target.value) / 100)}
        />
        <span className={styles.volumeValue}>
          {Math.round(masterVolume * 100)}
        </span>
      </div>

    </div>
  );
}
