import type { Settings } from '../../types/settings';
import styles from './SettingsPanel.module.css';

interface Props {
  settings: Settings;
  onSetWorkDuration: (mins: number) => void;
  onSetShortBreakDuration: (mins: number) => void;
  onSetLongBreakDuration: (mins: number) => void;
  onSetAutoAdvance: (v: boolean) => void;
  onSetTheme: (v: Settings['theme']) => void;
  onSetNotificationsEnabled: (v: boolean) => void;
  onSetMasterVolume: (v: number) => void;
  onSetTickVolume: (v: number) => void;
  onSetDailyGoal: (n: number) => void;
  onSetFocusMode: (v: boolean) => void;
  onClose: () => void;
}

function Stepper({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className={styles.stepperRow}>
      <span className={styles.stepperLabel}>{label}</span>
      <div className={styles.stepperControls}>
        <button
          className={styles.stepBtn}
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
        >
          −
        </button>
        <span className={styles.stepValue}>
          {value}{suffix && <span className={styles.stepSuffix}>{suffix}</span>}
        </span>
        <button
          className={styles.stepBtn}
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={styles.toggleRow}>
      <span className={styles.toggleLabel}>{label}</span>
      <button
        className={`${styles.toggleBtn} ${value ? styles.on : ''}`}
        onClick={() => onChange(!value)}
      >
        {value ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}

const THEMES: Settings['theme'][] = ['light', 'dark', 'auto'];

export function SettingsPanel({
  settings,
  onSetWorkDuration,
  onSetShortBreakDuration,
  onSetLongBreakDuration,
  onSetAutoAdvance,
  onSetTheme,
  onSetNotificationsEnabled,
  onSetMasterVolume,
  onSetTickVolume,
  onSetDailyGoal,
  onSetFocusMode,
  onClose,
}: Props) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>SETTINGS</span>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Timer durations */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>TIMER</span>
          </div>
          <div className={styles.sectionBody}>
            <Stepper
              label="Work"
              value={Math.round(settings.workDuration / 60)}
              min={1}
              max={60}
              suffix="m"
              onChange={onSetWorkDuration}
            />
            <Stepper
              label="Short break"
              value={Math.round(settings.shortBreakDuration / 60)}
              min={1}
              max={30}
              suffix="m"
              onChange={onSetShortBreakDuration}
            />
            <Stepper
              label="Long break"
              value={Math.round(settings.longBreakDuration / 60)}
              min={1}
              max={30}
              suffix="m"
              onChange={onSetLongBreakDuration}
            />
          </div>
        </section>

        {/* Flow */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>FLOW</span>
          </div>
          <div className={styles.sectionBody}>
            <Toggle
              label="Auto-advance"
              value={settings.autoAdvance}
              onChange={onSetAutoAdvance}
            />
            <Toggle
              label="Focus mode"
              value={settings.focusMode}
              onChange={onSetFocusMode}
            />
            <Stepper
              label="Daily goal"
              value={settings.dailyGoal}
              min={0}
              max={20}
              suffix={settings.dailyGoal === 0 ? '' : undefined}
              onChange={onSetDailyGoal}
            />
          </div>
        </section>

        {/* Theme */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>THEME</span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.themeGroup}>
              {THEMES.map(t => (
                <button
                  key={t}
                  className={`${styles.themeBtn} ${settings.theme === t ? styles.active : ''}`}
                  onClick={() => onSetTheme(t)}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>NOTIFICATIONS</span>
          </div>
          <div className={styles.sectionBody}>
            <Toggle
              label="Browser alerts"
              value={settings.notificationsEnabled}
              onChange={onSetNotificationsEnabled}
            />
          </div>
        </section>

        {/* Sound */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>SOUND</span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>Ambient</span>
              <input
                type="range"
                className={styles.slider}
                min={0}
                max={100}
                value={Math.round(settings.masterVolume * 100)}
                onChange={e => onSetMasterVolume(Number(e.target.value) / 100)}
              />
              <span className={styles.sliderValue}>
                {Math.round(settings.masterVolume * 100)}
              </span>
            </div>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>Tick</span>
              <input
                type="range"
                className={styles.slider}
                min={0}
                max={100}
                value={Math.round(settings.tickVolume * 100)}
                onChange={e => onSetTickVolume(Number(e.target.value) / 100)}
              />
              <span className={styles.sliderValue}>
                {Math.round(settings.tickVolume * 100)}
              </span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
