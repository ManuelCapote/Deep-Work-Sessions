export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export interface WorkSession {
  id: string;
  name: string;
  todos: Todo[];
  startPomodoroCount: number;
  finishedPomodoroCount: number; // snapshotted at finish time; 0 when active
  status: 'active' | 'finished';
  createdAt: number;   // Date.now()
  finishedAt?: number;
}
