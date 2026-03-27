import { NOISE_OPTIONS } from '../../utils/sounds';
import type { NoiseType } from '../../hooks/useSounds';
import styles from './SoundControls.module.css';

const MIX_OPTIONS = NOISE_OPTIONS.filter(o => o.key !== 'off');

interface Props {
  tickEnabled: boolean;
  noiseType: NoiseType;
  mixType: NoiseType;
  masterVolume: number;
  onSetTickEnabled: (v: boolean) => void;
  onSetNoiseType: (t: NoiseType) => void;
  onSetMixType: (t: NoiseType) => void;
  onSetMasterVolume: (v: number) => void;
}

export function SoundControls({
  tickEnabled, noiseType, mixType, masterVolume,
  onSetTickEnabled, onSetNoiseType, onSetMixType, onSetMasterVolume,
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

      {/* ── Mix row ──────────────────────────────────────────────────────── */}
      {noiseType !== 'off' && (
        <div className={styles.mixSection}>
          <div className={styles.mixHeader}>
            <span className={styles.rowLabel}>MIX</span>
          </div>
          <div className={styles.mixRow}>
            <button
              className={`${styles.mixBtn} ${mixType === 'off' ? styles.mixActive : ''}`}
              onClick={() => onSetMixType('off')}
            >
              OFF
            </button>
            {MIX_OPTIONS.filter(o => o.key !== noiseType).map(({ key, label }) => (
              <button
                key={key}
                className={`${styles.mixBtn} ${mixType === key ? styles.mixActive : ''}`}
                onClick={() => onSetMixType(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

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
