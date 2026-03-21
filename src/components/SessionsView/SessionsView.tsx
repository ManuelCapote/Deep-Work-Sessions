import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import type { WorkSession, Todo } from '../../types/session';
import styles from './SessionsView.module.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function PomoDots({ count }: { count: number }) {
  const MAX_DOTS = 8;
  const display = Math.min(count, MAX_DOTS);
  const overflow = count - MAX_DOTS;
  return (
    <span className={styles.dots}>
      {Array.from({ length: MAX_DOTS }).map((_, i) => (
        <span key={i} className={`${styles.dot} ${i < display ? styles.dotFilled : ''}`} />
      ))}
      {overflow > 0 && <span className={styles.dotsOverflow}>+{overflow}</span>}
    </span>
  );
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function TodoRow({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={styles.todoRow}>
      <button
        className={`${styles.todoCheck} ${todo.done ? styles.todoCheckDone : ''}`}
        onClick={onToggle}
        aria-label={todo.done ? 'Mark incomplete' : 'Mark complete'}
      />
      <span className={`${styles.todoText} ${todo.done ? styles.todoTextDone : ''}`}>
        {todo.text}
      </span>
      <button className={styles.todoDelete} onClick={onDelete} aria-label="Delete">
        ×
      </button>
    </div>
  );
}

function ArchivedRow({ session }: { session: WorkSession }) {
  const count = session.finishedPomodoroCount - session.startPomodoroCount;
  const done = session.todos.filter(t => t.done).length;
  const total = session.todos.length;
  return (
    <div className={styles.archivedRow}>
      <span className={styles.archivedName}>{session.name}</span>
      <span className={styles.archivedMeta}>
        {total > 0 && <span className={styles.archivedTodos}>{done}/{total}</span>}
        <PomoDots count={count} />
        {session.finishedAt && (
          <span className={styles.archivedDate}>{formatDate(session.finishedAt)}</span>
        )}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  activeSession: WorkSession | null;
  archivedSessions: WorkSession[];
  pomodorosInSession: number;
  onRename: (name: string) => void;
  onFinish: () => void;
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

export function SessionsView({
  activeSession,
  archivedSessions,
  pomodorosInSession,
  onRename,
  onFinish,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(activeSession?.name ?? '');
  const [todoInput, setTodoInput] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync name when active session changes (e.g. after finish → new session)
  useEffect(() => {
    setNameValue(activeSession?.name ?? '');
    setEditingName(false);
  }, [activeSession?.id]);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  function commitName() {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== activeSession?.name) onRename(trimmed);
    else setNameValue(activeSession?.name ?? '');
    setEditingName(false);
  }

  function handleNameKey(e: KeyboardEvent) {
    if (e.key === 'Enter') commitName();
    if (e.key === 'Escape') {
      setNameValue(activeSession?.name ?? '');
      setEditingName(false);
    }
  }

  function handleAddTodo() {
    onAddTodo(todoInput);
    setTodoInput('');
  }

  function handleTodoKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAddTodo();
  }

  return (
    <div className={styles.container}>

      {/* ── Current session ──────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>CURRENT</span>
        </div>

        {activeSession ? (
          <div className={styles.currentBody}>
            <div className={styles.currentTop}>
              {editingName ? (
                <input
                  ref={nameInputRef}
                  className={styles.nameInput}
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onBlur={commitName}
                  onKeyDown={handleNameKey}
                  maxLength={40}
                />
              ) : (
                <button
                  className={styles.nameDisplay}
                  onClick={() => setEditingName(true)}
                  title="Click to rename"
                >
                  {activeSession.name}
                </button>
              )}
              <button className={styles.finishBtn} onClick={onFinish}>
                FINISH
              </button>
            </div>
            <div className={styles.currentMeta}>
              <PomoDots count={pomodorosInSession} />
              <span className={styles.pomodorCount}>
                {pomodorosInSession} pomodoro{pomodorosInSession !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ) : (
          <p className={styles.empty}>No active session.</p>
        )}
      </section>

      {/* ── Goals / Todos ─────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>GOALS</span>
        </div>

        <div className={styles.todosBody}>
          {activeSession && activeSession.todos.length > 0 ? (
            <div className={styles.todoList}>
              {activeSession.todos.map(todo => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={() => onToggleTodo(todo.id)}
                  onDelete={() => onDeleteTodo(todo.id)}
                />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>No goals yet.</p>
          )}

          <div className={styles.addRow}>
            <input
              className={styles.addInput}
              placeholder="+ add a goal..."
              value={todoInput}
              onChange={e => setTodoInput(e.target.value)}
              onKeyDown={handleTodoKey}
              disabled={!activeSession}
            />
            <button
              className={styles.addBtn}
              onClick={handleAddTodo}
              disabled={!activeSession || !todoInput.trim()}
            >
              ADD
            </button>
          </div>
        </div>
      </section>

      {/* ── Archive ───────────────────────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionLast}`}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>ARCHIVE</span>
          <span className={styles.sectionCount}>{archivedSessions.length}</span>
        </div>

        {archivedSessions.length > 0 ? (
          <div className={styles.archiveList}>
            {archivedSessions.map(s => (
              <ArchivedRow key={s.id} session={s} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No finished sessions yet.</p>
        )}
      </section>

    </div>
  );
}
