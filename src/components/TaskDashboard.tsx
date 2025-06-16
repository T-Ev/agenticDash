import React, { useState, useEffect, useRef } from "react";
import { TaskGrid } from "./TaskGrid";
import { Task } from "../types/Task";
import { Activity, Bot } from "lucide-react";
import { ChatInterface } from "./ChatInterface";

// Types for AG UI events
type EventType = "RUN_STARTED" | "RUN_FINISHED" | "TEXT_MESSAGE_START" | "TEXT_MESSAGE_CONTENT" | "TEXT_MESSAGE_END";

interface RunStartedEvent {
  type: "RUN_STARTED";
  thread_id: string;
  run_id: string;
}

interface RunFinishedEvent {
  type: "RUN_FINISHED";
  thread_id: string;
  run_id: string;
}

interface TextMessageStartEvent {
  type: "TEXT_MESSAGE_START";
  message_id: string;
  role: "assistant";
}

interface TextMessageContentEvent {
  type: "TEXT_MESSAGE_CONTENT";
  message_id: string;
  delta: string;
}

interface TextMessageEndEvent {
  type: "TEXT_MESSAGE_END";
  message_id: string;
}

type AGUIEvent = RunStartedEvent | RunFinishedEvent | TextMessageStartEvent | TextMessageContentEvent | TextMessageEndEvent;

// Minimal RunAgentInput for POST
interface RunAgentInput {
  thread_id: string;
  run_id: string;
  state: Record<string, unknown>;
  messages: Array<{
    role: string;
    content: string;
    id: string;
  }>;
  tools: Array<Record<string, unknown>>;
  context: Array<Record<string, unknown>>;
  forwardedProps: Record<string, unknown>;
}

const BACKEND_URL = "https://ag-ui-demo.onrender.com/awp"; //"http://localhost:8000/awp"; //

function parseSSEBuffer(buffer: string): AGUIEvent[] {
  const events: AGUIEvent[] = [];
  const parts = buffer.split("\n\n");
  for (const part of parts) {
    const dataLine = part.split("\n").find((line) => line.startsWith("data: "));
    if (dataLine) {
      const jsonStr = dataLine.replace(/^data: /, "");
      try {
        const event = JSON.parse(jsonStr);
        events.push(event);
      } catch {
        // Ignore parse errors
      }
    }
  }
  return events;
}

export const TaskDashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Handle incoming AG UI events
  const handleEvent = (event: AGUIEvent, taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        switch (event.type) {
          case "RUN_STARTED": {
            return {
              ...task,
              status: "running",
              runId: event.run_id,
              threadId: event.thread_id,
              progress: 0,
              description: "Starting task...",
            };
          }
          case "TEXT_MESSAGE_START": {
            return {
              ...task,
              message: "",
              progress: 25,
              description: "",
            };
          }
          case "TEXT_MESSAGE_CONTENT": {
            return {
              ...task,
              streamingMessage: (task.streamingMessage || "") + event.delta,
              description: (task.description || "") + event.delta,
              progress: 50,
            };
          }
          case "TEXT_MESSAGE_END": {
            return {
              ...task,
              message: task.streamingMessage || "",
              streamingMessage: undefined,
              status: "completed",
              progress: 100,
            };
          }
          case "RUN_FINISHED": {
            return { ...task, status: "completed", progress: 100 };
          }
          default:
            return task;
        }
      })
    );
  };

  // Function to start a new task and connect to SSE
  const addTask = async (taskName: string) => {
    let currentTaskId: string;
    try {
      // Generate IDs for the new task
      currentTaskId = Math.random().toString(36).slice(2);
      const runId = Math.random().toString(36).slice(2);
      const threadId = Math.random().toString(36).slice(2);

      // Create new task
      const newTask: Task = {
        id: currentTaskId,
        name: taskName,
        agent: "TJ's Agent",
        status: "running",
        progress: 0,
        startTime: new Date(),
        description: "Initializing task...",
        runId,
        threadId,
      };
      setTasks((prev) => [...prev, newTask]);

      // Prepare minimal RunAgentInput
      const userMessageId = Math.random().toString(36).slice(2);
      const payload: RunAgentInput = {
        thread_id: threadId,
        run_id: runId,
        state: {},
        messages: [
          {
            role: "user",
            content: taskName,
            id: userMessageId,
          },
        ],
        tools: [],
        context: [],
        forwardedProps: {},
      };

      // POST to /awp and connect to SSE
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += new TextDecoder().decode(value);

        const events = parseSSEBuffer(buffer);
        if (events.length > 0) {
          events.forEach((event) => handleEvent(event, currentTaskId));
          buffer = "";
        }
      }
    } catch (err) {
      console.error("SSE connection error:", err);
      setTasks((prev) => prev.map((task) => (task.id === currentTaskId ? { ...task, status: "error", errorMsg: String(err) } : task)));
    }
  };

  const updateTaskStatus = (taskId: string, status: Task["status"]) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bot className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">My Agentic Dashboard</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              <span className="text-sm text-slate-300">{tasks.filter((t) => t.status === "running").length} Active Tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Chat Interface */}
        <ChatInterface onTaskSubmit={addTask} />

        {/* Task Grid */}
        <TaskGrid tasks={tasks} onStatusUpdate={updateTaskStatus} />
      </div>
    </div>
  );
};
