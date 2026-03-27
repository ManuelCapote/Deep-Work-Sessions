export const FOCUS_TIPS: string[] = [
  "Work on one task at a time. Multitasking reduces focus by up to 40%.",
  "If interrupted, jot it down and return to your task. Don't context-switch.",
  "Stand up and stretch during breaks. Movement boosts cognitive function.",
  "The first few minutes are the hardest. Commit to starting \u2014 momentum builds itself.",
  "Keep water nearby. Even mild dehydration impairs concentration.",
  "Close unrelated browser tabs before starting. Out of sight, out of mind.",
  "Break large tasks into smaller steps. Each completed step fuels motivation.",
  "Use short breaks for non-screen activities: walk, stretch, look out a window.",
  "After 4 pomodoros, take a longer break (15\u201330 min). Your brain needs recovery time.",
  "Track your distractions. Patterns reveal what to eliminate from your environment.",
  "Silence phone notifications during focus sessions. They fragment your attention.",
  "If a task feels overwhelming, commit to just 5 minutes. Starting is the hardest part.",
  "Review your completed sessions regularly \u2014 visible progress sustains motivation.",
  "Consistent daily practice matters more than marathon sessions. Build the habit.",
  "Your brain consolidates learning during rest. Breaks aren't wasted time.",
  "Set a clear intention before each pomodoro: \"I will work on X until the timer rings.\"",
  "Ambient sound can mask distracting noise. Experiment with different soundscapes.",
  "Peak focus typically lasts 90\u2013120 minutes. Plan your hardest work accordingly.",
  "End each session by noting where you left off. Tomorrow's you will thank you.",
  "Protect your deep work time. Say no to meetings during your focus blocks.",
  "The Pomodoro Technique was invented in the late 1980s by Francesco Cirillo.",
  "A tomato-shaped kitchen timer inspired the name \u2014 'pomodoro' is Italian for tomato.",
  "Perfectionism kills productivity. Done is better than perfect for most tasks.",
  "Tag your sessions to discover which types of work consume the most focus time.",
  "Your best ideas often come during breaks. Keep a notepad handy.",
];

export function getTip(sessionCount: number): string {
  return FOCUS_TIPS[sessionCount % FOCUS_TIPS.length];
}
