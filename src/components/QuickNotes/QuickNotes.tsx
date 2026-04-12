import styles from './QuickNotes.module.css';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}

export function QuickNotes({ value, onChange, onClear }: Props) {
  const hasContent = value.trim().length > 0;

  return (
    <div className={styles.container}>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Capture thoughts, ideas, tasks…"
        spellCheck={false}
      />
      {hasContent && (
        <button
          className={styles.clearBtn}
          onClick={onClear}
          aria-label="Clear notes"
        >
          CLEAR
        </button>
      )}
    </div>
  );
}
