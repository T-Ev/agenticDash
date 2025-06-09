export interface Task {
  id: string;
  name: string;
  agent: string;
  status: "running" | "completed" | "error" | "needs_input" | "paused";
  progress: number;
  startTime: Date;
  description: string;
  message?: string;
  streamingMessage?: string;
  errorMsg?: string;
  runId?: string;
  threadId?: string;
}
