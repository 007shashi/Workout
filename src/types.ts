export interface TaskItem {
  id: string;
  name: string;
  duration: number;
  type: 'task' | 'interval';
}

export interface WorkoutTask {
  id: string;
  title: string;
  items: TaskItem[];
}

export interface LapTime {
  id: string;
  lapNumber: number;
  lapTime: number;
  totalTime: number;
}
