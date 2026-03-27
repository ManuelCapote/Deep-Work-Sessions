export interface Settings {
  // Timer
  workDuration: number;       // seconds
  shortBreakDuration: number; // seconds
  longBreakDuration: number;  // seconds
  autoAdvance: boolean;

  // Theme
  theme: 'light' | 'dark' | 'auto';

  // Notifications
  notificationsEnabled: boolean;

  // Sound
  masterVolume: number; // 0–1
  tickVolume: number;   // 0–1

  // Goals
  dailyGoal: number; // 0 = disabled

  // Onboarding
  onboardingDismissed: boolean;
}
