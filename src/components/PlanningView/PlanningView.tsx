import { useState, type KeyboardEvent } from 'react';
import type { PlanTask } from '../../types/session';
import styles from './PlanningView.module.css';

interface Props {
  name: string;
  targetPomodoros: number;
  tasks: PlanTask[];
  onSetName: (name: string) => void;
  onSetTargetPomodoros: (n: number) => void;
  onAddTask: (text: string) => void;
  onRemoveTask: (id: string) => void;
  onStart: () => void;
}

export function PlanningView({
  name,
  targetPomodoros,
  tasks,
  onSetName,
  onSetTargetPomodoros,
  onAddTask,
  onRemoveTask,
  onStart,
}: Props) {
  const [taskInput, setTaskInput] = useState('');

  function handleAddTask() {
    onAddTask(taskInput);
    setTaskInput('');
  }

  function handleTaskKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAddTask();
  }

  return (
    <div className={styles.container}>

      {/* ── Session name ───────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>SESSION</span>
        </div>
        <div className={styles.inputBody}>
          <input
            className={styles.nameInput}
            placeholder="Session name..."
            value={name}
            onChange={e => onSetName(e.target.value)}
            maxLength={40}
          />
        </div>
      </section>

      {/* ── Target pomodoros ───────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>POMODOROS</span>
        </div>
        <div className={styles.stepperBody}>
          <button
            className={styles.stepBtn}
            onClick={() => onSetTargetPomodoros(targetPomodoros - 1)}
            disabled={targetPomodoros <= 1}
            aria-label="Decrease"
          >
            −
          </button>
          <span className={styles.stepValue}>{targetPomodoros}</span>
          <button
            className={styles.stepBtn}
            onClick={() => onSetTargetPomodoros(targetPomodoros + 1)}
            disabled={targetPomodoros >= 12}
            aria-label="Increase"
          >
            +
          </button>
          <span className={styles.stepHint}>
            ~{targetPomodoros * 25} min
          </span>
        </div>
      </section>

      {/* ── Tasks ─────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>TASKS</span>
          {tasks.length > 0 && (
            <span className={styles.sectionCount}>{tasks.length}</span>
          )}
        </div>

        <div className={styles.tasksBody}>
          {tasks.length > 0 && (
            <div className={styles.taskList}>
              {tasks.map(task => (
                <div key={task.id} className={styles.taskRow}>
                  <span className={styles.taskBullet}>—</span>
                  <span className={styles.taskText}>{task.text}</span>
                  <button
                    className={styles.taskDelete}
                    onClick={() => onRemoveTask(task.id)}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.addRow}>
            <input
              className={styles.addInput}
              placeholder="+ add a task..."
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
              onKeyDown={handleTaskKey}
            />
            <button
              className={styles.addBtn}
              onClick={handleAddTask}
              disabled={!taskInput.trim()}
            >
              ADD
            </button>
          </div>
        </div>
      </section>

      {/* ── Start button ──────────────────────────────────────────────── */}
      <button className={styles.startBtn} onClick={onStart}>
        START SESSION
      </button>

    </div>
  );
}
