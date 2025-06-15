export interface Habit {
  id: number;
  name: string;
  icon: string;
  priority: number;
  logs: Record<string, boolean>;
  /** Indicates if the habit is archived (no longer shown in active list). */
  archived?: boolean;
}
