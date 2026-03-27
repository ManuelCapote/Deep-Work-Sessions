import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTimer } from './hooks/useTimer';
import { useSounds } from './hooks/useSounds';
import { useSessions } from './hooks/useSessions';
import { usePlanning } from './hooks/usePlanning';
import { useSettings } from './hooks/useSettings';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useNotifications } from './hooks/useNotifications';
import { TabSwitcher } from './components/TabSwitcher/TabSwitcher';
import type { AppTab } from './components/TabSwitcher/TabSwitcher';
import { ModeSelector } from './components/ModeSelector/ModeSelector';
import { TimerDisplay } from './components/TimerDisplay/TimerDisplay';
import { Controls } from './components/Controls/Controls';
import { SessionCounter } from './components/SessionCounter/SessionCounter';
import { SoundControls } from './components/SoundControls/SoundControls';
import { SessionsView } from './components/SessionsView/SessionsView';
import { PlanningView } from './components/PlanningView/PlanningView';
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel';
import { Onboarding } from './components/Onboarding/Onboarding';
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isLandscape = useIsLandscape();

  const {
    settings,
    setWorkDuration, setShortBreakDuration, setLongBreakDuration,
    setAutoAdvance, setTheme, setNotificationsEnabled,
    setMasterVolume, setTickVolume, setOnboardingDismissed,
  } = useSettings();

  const {
    mode, secondsLeft, isRunning, sessionCount, totalSeconds,
    start, pause, reset, setMode,
  } = useTimer({
    durations: {
      pomodoro: settings.workDuration,
      short: settings.shortBreakDuration,
      long: settings.longBreakDuration,
    },
    autoAdvance: settings.autoAdvance,
  });

  const { tickEnabled, noiseType, setTickEnabled, setNoiseType } =
    useSounds(isRunning, secondsLeft, {
      master: settings.masterVolume,
      tick: settings.tickVolume,
    });

  const {
    activeSession, archivedSessions, pomodorosInSession,
    renameSession, finishSession, addTodo, toggleTodo, deleteTodo, startFromPlan,
  } = useSessions(sessionCount);

  const { plan, setName, setTargetPomodoros, addTask, removeTask } = usePlanning();

  const { notify } = useNotifications(settings.notificationsEnabled);

  // Notify on timer completion
  useEffect(() => {
    if (secondsLeft === 0 && !isRunning) {
      if (mode === 'pomodoro') {
        notify('Work session complete!', 'Time for a break.');
      } else {
        notify('Break is over!', 'Ready to focus?');
      }
    }
  }, [secondsLeft, isRunning, mode, notify]);

  // Apply theme
  useEffect(() => {
    const html = document.documentElement;
    if (settings.theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      html.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => {
        html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      html.setAttribute('data-theme', settings.theme);
    }
  }, [settings.theme]);

  // Keyboard shortcuts
  const toggleTimer = useCallback(() => {
    if (isRunning) pause(); else start();
  }, [isRunning, pause, start]);

  const shortcutActions = useMemo(() => ({
    toggleTimer,
    reset,
    setModeWork: () => setMode('pomodoro'),
    setModeShort: () => setMode('short'),
    setModeLong: () => setMode('long'),
  }), [toggleTimer, reset, setMode]);

  useKeyboardShortcuts(shortcutActions);

  // In landscape: timer is always visible (never hide it)
  const hideTimer = !isLandscape && activeTab !== 'timer';

  // Next mode indicator for auto-advance
  const nextModeLabel = mode === 'pomodoro'
    ? ((sessionCount + 1) % 4 === 0 ? 'LONG BREAK' : 'SHORT BREAK')
    : 'WORK';

  return (
    <main className={styles.main}>

      <header className={styles.header}>
        <span className={styles.brand}>TE POMODORO</span>
        <div className={styles.headerRight}>
          <button
            className={styles.gearBtn}
            onClick={() => setSettingsOpen(v => !v)}
            aria-label="Settings"
          >
            &#9881;
          </button>
          <span className={styles.version}>v1.0</span>
        </div>
      </header>

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onSetWorkDuration={setWorkDuration}
          onSetShortBreakDuration={setShortBreakDuration}
          onSetLongBreakDuration={setLongBreakDuration}
          onSetAutoAdvance={setAutoAdvance}
          onSetTheme={setTheme}
          onSetNotificationsEnabled={setNotificationsEnabled}
          onSetMasterVolume={setMasterVolume}
          onSetTickVolume={setTickVolume}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {!settings.onboardingDismissed && (
        <Onboarding onDismiss={() => setOnboardingDismissed(true)} />
      )}

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
        {settings.autoAdvance && isRunning && (
          <div className={styles.nextUp}>NEXT: {nextModeLabel}</div>
        )}
      </div>

      {/* RIGHT PANE — secondary content, driven by active tab */}
      <div className={styles.rightPane}>
        {activeTab === 'timer' && (
          <>
            <SessionCounter sessionCount={sessionCount} />
            <SoundControls
              tickEnabled={tickEnabled}
              noiseType={noiseType}
              masterVolume={settings.masterVolume}
              onSetTickEnabled={setTickEnabled}
              onSetNoiseType={setNoiseType}
              onSetMasterVolume={setMasterVolume}
            />
          </>
        )}
        {activeTab === 'plan' && (
          <PlanningView
            name={plan.name}
            targetPomodoros={plan.targetPomodoros}
            tasks={plan.tasks}
            workDurationMins={Math.round(settings.workDuration / 60)}
            onSetName={setName}
            onSetTargetPomodoros={setTargetPomodoros}
            onAddTask={addTask}
            onRemoveTask={removeTask}
            onStart={() => {
              startFromPlan(plan.name, plan.tasks, plan.targetPomodoros);
              setActiveTab('timer');
            }}
          />
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
