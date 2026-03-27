import { getTip } from '../../utils/tips';
import styles from './FocusTip.module.css';

interface Props {
  sessionCount: number;
}

export function FocusTip({ sessionCount }: Props) {
  return (
    <div className={styles.tip}>
      {getTip(sessionCount)}
    </div>
  );
}
