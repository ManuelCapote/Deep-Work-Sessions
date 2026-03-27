import styles from './TabSwitcher.module.css';

export type AppTab = 'timer' | 'plan' | 'sessions' | 'stats';

interface Props {
  activeTab: AppTab;
  onSetTab: (tab: AppTab) => void;
}

export function TabSwitcher({ activeTab, onSetTab }: Props) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.btn} ${activeTab === 'timer' ? styles.active : ''}`}
        onClick={() => onSetTab('timer')}
      >
        TIMER
      </button>
      <button
        className={`${styles.btn} ${activeTab === 'plan' ? styles.active : ''}`}
        onClick={() => onSetTab('plan')}
      >
        PLAN
      </button>
      <button
        className={`${styles.btn} ${activeTab === 'sessions' ? styles.active : ''}`}
        onClick={() => onSetTab('sessions')}
      >
        SESSIONS
      </button>
      <button
        className={`${styles.btn} ${activeTab === 'stats' ? styles.active : ''}`}
        onClick={() => onSetTab('stats')}
      >
        STATS
      </button>
    </div>
  );
}
