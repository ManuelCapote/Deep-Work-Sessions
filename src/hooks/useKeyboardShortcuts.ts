import { useEffect } from 'react';

interface Actions {
  toggleTimer: () => void;
  reset: () => void;
  setModeWork: () => void;
  setModeShort: () => void;
  setModeLong: () => void;
}

export function useKeyboardShortcuts(actions: Actions) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          actions.toggleTimer();
          break;
        case 'KeyR':
          actions.reset();
          break;
        case 'Digit1':
          actions.setModeWork();
          break;
        case 'Digit2':
          actions.setModeShort();
          break;
        case 'Digit3':
          actions.setModeLong();
          break;
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions]);
}
