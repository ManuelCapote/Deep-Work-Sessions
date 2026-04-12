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
import { StatsView } from './components/StatsView/StatsView';
import { FocusTip } from './components/FocusTip/FocusTip';
import { Onboarding } from './components/Onboarding/Onboarding';
import { QuickNotes } from './components/QuickNotes/QuickNotes';
import { useQuickNotes } from './hooks/useQuickNotes';
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
    setWorkDuration, setShortBreakDuration,
    setAutoAdvance, setTheme, setNotificationsEnabled,
    setMasterVolume, setTickVolume, setFocusMode, setZenMode, setAvailableTags, setDailyGoal, setOnboardingDismissed,
  } = useSettings();

  const {
    mode, secondsLeft, isRunning, sessionCount, totalSeconds,
    start, pause, reset, setMode,
  } = useTimer({
    durations: {
      focus: settings.workDuration,
      rest: settings.shortBreakDuration,
    },
    autoAdvance: settings.autoAdvance,
  });

  const { tickEnabled, noiseType, mixType, setTickEnabled, setNoiseType, setMixType } =
    useSounds(isRunning, secondsLeft, {
      master: settings.masterVolume,
      tick: settings.tickVolume,
    });

  const {
    activeSession, archivedSessions, pomodorosInSession,
    renameSession, finishSession, addTodo, toggleTodo, deleteTodo,
    setTags, setNotes, addDistraction, reorderTodos, startFromPlan,
  } = useSessions(sessionCount);

  const { plan, setName, setTargetPomodoros, addTask, removeTask } = usePlanning();

  const { notify } = useNotifications(settings.notificationsEnabled);

  const { notes: quickNotes, setNotes: setQuickNotes, clear: clearQuickNotes } = useQuickNotes();

  // Notify on timer completion
  useEffect(() => {
    if (secondsLeft === 0 && !isRunning) {
      if (mode === 'focus') {
        notify('Focus session complete!', 'Time to rest.');
      } else {
        notify('Rest is over!', 'Ready to focus?');
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
    setModeFocus: () => setMode('focus'),
    setModeRest: () => setMode('rest'),
    toggleZen: () => setZenMode(!settings.zenMode),
  }), [toggleTimer, reset, setMode, setZenMode, settings.zenMode]);

  useKeyboardShortcuts(shortcutActions);

  // Focus mode: hide non-essential UI when timer is running
  const inFocusMode = settings.focusMode && isRunning;

  // Zen mode: manual toggle, hides everything except TimerDisplay + Controls
  const inZenMode = settings.zenMode;

  // In landscape: timer is always visible (never hide it)
  const hideTimer = !inFocusMode && !inZenMode && !isLandscape && activeTab !== 'timer';

  // Next mode indicator for auto-advance
  const nextModeLabel = mode === 'focus' ? 'REST' : 'FOCUS';

  return (
    <main
      className={`${styles.main} ${inFocusMode ? styles.focusMode : ''} ${inZenMode ? styles.zenMode : ''}`}
    >

      {!inZenMode && (
        <header className={styles.header}>
          <span className={styles.brand}>TE POMODORO</span>
          <div className={styles.headerRight}>
            <button
              className={styles.zenBtn}
              onClick={() => setZenMode(true)}
              aria-label="Enter zen mode"
              title="Zen mode (Z)"
            >
              ZEN
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => setSettingsOpen(v => !v)}
              aria-label="Settings"
              title="Settings"
            >
              &#9881;
            </button>
            <span className={styles.version}>v1.0</span>
          </div>
        </header>
      )}

      {inZenMode && (
        <button
          className={styles.zenExit}
          onClick={() => setZenMode(false)}
          aria-label="Exit zen mode"
          title="Exit zen mode (Z)"
        >
          &times;
        </button>
      )}

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onSetWorkDuration={setWorkDuration}
          onSetShortBreakDuration={setShortBreakDuration}
          onSetAutoAdvance={setAutoAdvance}
          onSetTheme={setTheme}
          onSetNotificationsEnabled={setNotificationsEnabled}
          onSetMasterVolume={setMasterVolume}
          onSetTickVolume={setTickVolume}
          onSetDailyGoal={setDailyGoal}
          onSetFocusMode={setFocusMode}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {!settings.onboardingDismissed && (
        <Onboarding onDismiss={() => setOnboardingDismissed(true)} />
      )}

      {/* TabSwitcher spans full width in both orientations */}
      {!inFocusMode && !inZenMode && (
        <div className={styles.tabWrap}>
          <TabSwitcher activeTab={activeTab} onSetTab={setActiveTab} />
        </div>
      )}

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
        {inZenMode && (
          <QuickNotes
            value={quickNotes}
            onChange={setQuickNotes}
            onClear={clearQuickNotes}
          />
        )}
        {!inZenMode && settings.autoAdvance && isRunning && (
          <div className={styles.nextUp}>NEXT: {nextModeLabel}</div>
        )}
        {!inZenMode && isRunning && <FocusTip sessionCount={sessionCount} />}
      </div>

      {/* RIGHT PANE — secondary content, driven by active tab */}
      <div className={`${styles.rightPane} ${inFocusMode || inZenMode ? styles.hidden : ''}`}>
        {activeTab === 'timer' && (
          <>
            <SessionCounter sessionCount={sessionCount} />
            <SoundControls
              tickEnabled={tickEnabled}
              noiseType={noiseType}
              mixType={mixType}
              masterVolume={settings.masterVolume}
              onSetTickEnabled={setTickEnabled}
              onSetNoiseType={setNoiseType}
              onSetMixType={setMixType}
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
            availableTags={settings.availableTags}
            onRename={renameSession}
            onFinish={finishSession}
            onAddTodo={addTodo}
            onToggleTodo={toggleTodo}
            onDeleteTodo={deleteTodo}
            onSetTags={setTags}
            onSetNotes={setNotes}
            onAddDistraction={addDistraction}
            onReorderTodos={reorderTodos}
            onAddTag={(tag: string) => {
              const t = tag.trim().toLowerCase();
              if (t && !settings.availableTags.includes(t)) {
                setAvailableTags([...settings.availableTags, t]);
              }
            }}
          />
        )}
        {activeTab === 'stats' && (
          <StatsView
            sessions={[...(activeSession ? [activeSession] : []), ...archivedSessions]}
            dailyGoal={settings.dailyGoal ?? 0}
          />
        )}
      </div>

    </main>
  );
}

export default App;
