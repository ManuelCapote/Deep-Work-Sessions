import styles from './Onboarding.module.css';

interface Props {
  onDismiss: () => void;
}

export function Onboarding({ onDismiss }: Props) {
  return (
    <div className={styles.backdrop} onClick={onDismiss}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>

        <div className={styles.header}>
          <span className={styles.brand}>TE POMODORO</span>
        </div>

        <div className={styles.body}>
          <p className={styles.intro}>
            A distraction-free focus timer built on the Pomodoro Technique:
            work in focused sprints, then take short breaks.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>&#9201;</span>
              <span className={styles.featureText}>Plan sessions with goals and tasks</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>&#9835;</span>
              <span className={styles.featureText}>9 ambient soundscapes to help you focus</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>&#9776;</span>
              <span className={styles.featureText}>Track your progress across sessions</span>
            </div>
          </div>

          <div className={styles.shortcuts}>
            <span className={styles.shortcutsLabel}>KEYBOARD SHORTCUTS</span>
            <div className={styles.shortcutGrid}>
              <span className={styles.key}>Space</span>
              <span className={styles.keyDesc}>Start / Pause</span>
              <span className={styles.key}>R</span>
              <span className={styles.keyDesc}>Reset timer</span>
              <span className={styles.key}>1 2 3</span>
              <span className={styles.keyDesc}>Work / Short / Long</span>
            </div>
          </div>
        </div>

        <button className={styles.startBtn} onClick={onDismiss}>
          GET STARTED
        </button>

      </div>
    </div>
  );
}
