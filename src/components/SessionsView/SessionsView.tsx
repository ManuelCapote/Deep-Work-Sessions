import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
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

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function TodoRow({
  todo,
  onToggle,
  onDelete,
  onDragStart,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onDragStart: (e: React.PointerEvent) => void;
}) {
  return (
    <div className={styles.todoRow}>
      <span
        className={styles.dragHandle}
        onPointerDown={onDragStart}
        touch-action="none"
      >
        ⠿
      </span>
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

function TagChips({
  availableTags,
  activeTags,
  onToggle,
  onAddCustom,
}: {
  availableTags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
  onAddCustom?: (tag: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  function commitTag() {
    const t = input.trim().toLowerCase();
    if (t) {
      onAddCustom?.(t);
      onToggle(t);
    }
    setInput('');
    setAdding(false);
  }

  return (
    <div className={styles.tagChips}>
      {availableTags.map(tag => (
        <button
          key={tag}
          className={`${styles.tagChip} ${activeTags.includes(tag) ? styles.tagActive : ''}`}
          onClick={() => onToggle(tag)}
        >
          {tag}
        </button>
      ))}
      {onAddCustom && (
        adding ? (
          <input
            ref={inputRef}
            className={styles.tagInput}
            value={input}
            onChange={e => setInput(e.target.value)}
            onBlur={commitTag}
            onKeyDown={e => { if (e.key === 'Enter') commitTag(); if (e.key === 'Escape') { setInput(''); setAdding(false); } }}
            placeholder="tag..."
            maxLength={20}
          />
        ) : (
          <button className={styles.tagAdd} onClick={() => setAdding(true)}>+</button>
        )
      )}
    </div>
  );
}

function ArchivedRow({ session }: { session: WorkSession }) {
  const count = session.finishedPomodoroCount - session.startPomodoroCount;
  const done = session.todos.filter(t => t.done).length;
  const total = session.todos.length;
  return (
    <div className={styles.archivedRow}>
      <div className={styles.archivedLeft}>
        <span className={styles.archivedName}>{session.name}</span>
        {session.tags && session.tags.length > 0 && (
          <span className={styles.archivedTags}>
            {session.tags.map(t => (
              <span key={t} className={styles.archivedTag}>{t}</span>
            ))}
          </span>
        )}
      </div>
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
  availableTags: string[];
  onRename: (name: string) => void;
  onFinish: () => void;
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onSetTags: (tags: string[]) => void;
  onSetNotes: (notes: string) => void;
  onAddDistraction: (text: string) => void;
  onReorderTodos: (from: number, to: number) => void;
  onAddTag: (tag: string) => void;
}

export function SessionsView({
  activeSession,
  archivedSessions,
  pomodorosInSession,
  availableTags,
  onRename,
  onFinish,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onSetTags,
  onSetNotes,
  onAddDistraction,
  onReorderTodos,
  onAddTag,
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(activeSession?.name ?? '');
  const [todoInput, setTodoInput] = useState('');
  const [distractionInput, setDistractionInput] = useState('');
  const [notesValue, setNotesValue] = useState(activeSession?.notes ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drag state
  const dragIdxRef = useRef<number | null>(null);
  const [, setDragIdx] = useState<number | null>(null);

  // Sync name/notes when active session changes
  useEffect(() => {
    setNameValue(activeSession?.name ?? '');
    setNotesValue(activeSession?.notes ?? '');
    setEditingName(false);
  }, [activeSession?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  // Debounced notes save
  const handleNotesChange = useCallback((val: string) => {
    setNotesValue(val);
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => onSetNotes(val), 300);
  }, [onSetNotes]);

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

  function handleAddDistraction() {
    onAddDistraction(distractionInput);
    setDistractionInput('');
  }

  function handleDistractionKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAddDistraction();
  }

  // Tag toggling for active session
  function toggleSessionTag(tag: string) {
    const current = activeSession?.tags ?? [];
    const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
    onSetTags(next);
  }

  // Drag-and-drop handlers
  function handleDragStart(idx: number, e: React.PointerEvent) {
    e.preventDefault();
    dragIdxRef.current = idx;
    setDragIdx(idx);

    const startY = e.clientY;
    const rowHeight = 36; // approximate

    function onMove(ev: PointerEvent) {
      if (dragIdxRef.current === null) return;
      const deltaRows = Math.round((ev.clientY - startY) / rowHeight);
      const todoCount = activeSession?.todos.length ?? 0;
      const target = Math.max(0, Math.min(todoCount - 1, idx + deltaRows));
      if (target !== dragIdxRef.current) {
        onReorderTodos(dragIdxRef.current, target);
        dragIdxRef.current = target;
        setDragIdx(target);
      }
    }

    function onUp() {
      dragIdxRef.current = null;
      setDragIdx(null);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  // Archive filtering
  const filteredArchive = archivedSessions.filter(s => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!s.name.toLowerCase().includes(q)) return false;
    }
    if (filterTags.length > 0) {
      if (!s.tags || !filterTags.some(t => s.tags!.includes(t))) return false;
    }
    return true;
  });

  const distractions = activeSession?.distractions ?? [];

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
            <TagChips
              availableTags={availableTags}
              activeTags={activeSession.tags ?? []}
              onToggle={toggleSessionTag}
              onAddCustom={onAddTag}
            />
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
              {activeSession.todos.map((todo, i) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={() => onToggleTodo(todo.id)}
                  onDelete={() => onDeleteTodo(todo.id)}
                  onDragStart={(e) => handleDragStart(i, e)}
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

      {/* ── Notes ─────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>NOTES</span>
        </div>
        <div className={styles.notesBody}>
          <textarea
            className={styles.notesArea}
            placeholder="Session notes..."
            value={notesValue}
            onChange={e => handleNotesChange(e.target.value)}
            disabled={!activeSession}
            rows={3}
          />
        </div>
      </section>

      {/* ── Distractions ──────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>DISTRACTIONS</span>
          {distractions.length > 0 && (
            <span className={styles.sectionCount}>{distractions.length}</span>
          )}
        </div>
        <div className={styles.todosBody}>
          {distractions.length > 0 && (
            <div className={styles.todoList}>
              {distractions.map(d => (
                <div key={d.id} className={styles.distractionRow}>
                  <span className={styles.distractionText}>{d.text}</span>
                  <span className={styles.distractionTime}>{formatTime(d.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
          <div className={styles.addRow}>
            <input
              className={styles.addInput}
              placeholder="+ log a distraction..."
              value={distractionInput}
              onChange={e => setDistractionInput(e.target.value)}
              onKeyDown={handleDistractionKey}
              disabled={!activeSession}
            />
            <button
              className={styles.addBtn}
              onClick={handleAddDistraction}
              disabled={!activeSession || !distractionInput.trim()}
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
          <span className={styles.sectionCount}>
            {filteredArchive.length !== archivedSessions.length
              ? `${filteredArchive.length} of ${archivedSessions.length}`
              : archivedSessions.length}
          </span>
        </div>

        {archivedSessions.length > 0 && (
          <div className={styles.archiveFilter}>
            <input
              className={styles.searchInput}
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {availableTags.length > 0 && (
              <TagChips
                availableTags={availableTags}
                activeTags={filterTags}
                onToggle={tag => {
                  setFilterTags(prev =>
                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
                  );
                }}
              />
            )}
          </div>
        )}

        {filteredArchive.length > 0 ? (
          <div className={styles.archiveList}>
            {filteredArchive.map(s => (
              <ArchivedRow key={s.id} session={s} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            {archivedSessions.length > 0 ? 'No matching sessions.' : 'No finished sessions yet.'}
          </p>
        )}
      </section>

    </div>
  );
}
