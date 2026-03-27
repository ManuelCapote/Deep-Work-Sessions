import { useEffect, useCallback, useRef } from 'react';

export function useNotifications(enabled: boolean) {
  const permissionRef = useRef<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied',
  );

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied' as const;
    const result = await Notification.requestPermission();
    permissionRef.current = result;
    return result;
  }, []);

  const notify = useCallback((title: string, body: string) => {
    if (!enabled) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    new Notification(title, { body });
  }, [enabled]);

  // Request permission when enabled
  useEffect(() => {
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      requestPermission();
    }
  }, [enabled, requestPermission]);

  return { notify, requestPermission };
}
