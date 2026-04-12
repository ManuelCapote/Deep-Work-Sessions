import { useEffect } from 'react';

interface Actions {
  toggleTimer: () => void;
  reset: () => void;
  setModeFocus: () => void;
  setModeRest: () => void;
  toggleZen: () => void;
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
          actions.setModeFocus();
          break;
        case 'Digit2':
          actions.setModeRest();
          break;
        case 'KeyZ':
          actions.toggleZen();
          break;
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions]);
}
