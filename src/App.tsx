import { useState, useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import { useSounds } from './hooks/useSounds';
import { useSessions } from './hooks/useSessions';
import { TabSwitcher } from './components/TabSwitcher/TabSwitcher';
import type { AppTab } from './components/TabSwitcher/TabSwitcher';
import { ModeSelector } from './components/ModeSelector/ModeSelector';
import { TimerDisplay } from './components/TimerDisplay/TimerDisplay';
import { Controls } from './components/Controls/Controls';
import { SessionCounter } from './components/SessionCounter/SessionCounter';
import { SoundControls } from './components/SoundControls/SoundControls';
import { SessionsView } from './components/SessionsView/SessionsView';
import styles from './App.module.css';

function useIsLandscape(): boolean {
  const [landscape, setLandscape] = useState(
    () => window.matchMedia('(orientation: landscape)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(orientation: landscape)');
    const handler = (e: MediaQueryListEvent) => setLandscape(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return landscape;
}

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('timer');
  const isLandscape = useIsLandscape();

  const {
    mode, secondsLeft, isRunning, sessionCount, totalSeconds,
    start, pause, reset, setMode,
  } = useTimer();

  const { tickEnabled, noiseType, setTickEnabled, setNoiseType } =
    useSounds(isRunning, secondsLeft);

  const {
    activeSession, archivedSessions, pomodorosInSession,
    renameSession, finishSession, addTodo, toggleTodo, deleteTodo,
  } = useSessions(sessionCount);

  // In landscape: timer is always visible (never hide it)
  const hideTimer = !isLandscape && activeTab !== 'timer';

  return (
    <main className={styles.main}>

      <header className={styles.header}>
        <span className={styles.brand}>TE POMODORO</span>
        <span className={styles.version}>v1.0</span>
      </header>

      {/* TabSwitcher spans full width in both orientations */}
      <div className={styles.tabWrap}>
        <TabSwitcher activeTab={activeTab} onSetTab={setActiveTab} />
      </div>

      {/* LEFT PANE — timer core. Always visible in landscape. */}
      <div className={`${styles.leftPane} ${hideTimer ? styles.hidden : ''}`}>
        <ModeSelector mode={mode} onSetMode={setMode} />
        <TimerDisplay
          secondsLeft={secondsLeft}
          totalSeconds={totalSeconds}
          isRunning={isRunning}
        />
        <Controls
          isRunning={isRunning}
          onStart={start}
          onPause={pause}
          onReset={reset}
        />
      </div>

      {/* RIGHT PANE — secondary content, driven by active tab */}
      <div className={styles.rightPane}>
        {activeTab === 'timer' && (
          <>
            <SessionCounter sessionCount={sessionCount} />
            <SoundControls
              tickEnabled={tickEnabled}
              noiseType={noiseType}
              onSetTickEnabled={setTickEnabled}
              onSetNoiseType={setNoiseType}
            />
          </>
        )}
        {activeTab === 'sessions' && (
          <SessionsView
            activeSession={activeSession}
            archivedSessions={archivedSessions}
            pomodorosInSession={pomodorosInSession}
            onRename={renameSession}
            onFinish={finishSession}
            onAddTodo={addTodo}
            onToggleTodo={toggleTodo}
            onDeleteTodo={deleteTodo}
          />
        )}
      </div>

    </main>
  );
}

export default App;
