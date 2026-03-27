export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export interface Distraction {
  id: string;
  text: string;
  timestamp: number; // Date.now()
}

export interface WorkSession {
  id: string;
  name: string;
  todos: Todo[];
  startPomodoroCount: number;
  finishedPomodoroCount: number; // snapshotted at finish time; 0 when active
  targetPomodoros?: number;
  tags?: string[];
  notes?: string;
  distractions?: Distraction[];
  status: 'active' | 'finished';
  createdAt: number;   // Date.now()
  finishedAt?: number;
}

export interface PlanTask {
  id: string;
  text: string;
}
