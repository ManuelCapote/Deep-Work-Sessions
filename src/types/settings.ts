export interface Settings {
  // Timer
  workDuration: number;       // seconds — Focus mode
  shortBreakDuration: number; // seconds — Rest mode
  autoAdvance: boolean;

  // Theme
  theme: 'light' | 'dark' | 'auto';

  // Notifications
  notificationsEnabled: boolean;

  // Sound
  masterVolume: number; // 0–1
  tickVolume: number;   // 0–1

  // Tags
  availableTags: string[];

  // Focus
  focusMode: boolean;

  // Zen mode — hides everything except the timer + controls.
  // Unlike focusMode (auto-on-run), zen is manual and persistent.
  zenMode: boolean;

  // Goals
  dailyGoal: number; // 0 = disabled

  // Onboarding
  onboardingDismissed: boolean;
}
