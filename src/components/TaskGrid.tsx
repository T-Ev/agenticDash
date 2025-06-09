import React, { useState } from "react";
import { TaskCard } from "./TaskCard";
import { Task } from "../types/Task";

interface TaskGridProps {
  tasks: Task[];
  onStatusUpdate: (taskId: string, status: Task["status"]) => void;
}

export const TaskGrid: React.FC<TaskGridProps> = ({ tasks, onStatusUpdate }) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const getTasksByStatus = (status: Task["status"]) => tasks.filter((task) => task.status === status);

  const runningTasks = getTasksByStatus("running");
  const needsInputTasks = getTasksByStatus("needs_input");
  const errorTasks = getTasksByStatus("error");
  const completedTasks = getTasksByStatus("completed");
  const pausedTasks = getTasksByStatus("paused");

  // Combine active tasks (non-completed) and reverse order
  const activeTasks = [...runningTasks, ...needsInputTasks, ...errorTasks, ...pausedTasks].sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  // Reverse order of completed tasks
  const sortedCompletedTasks = [...completedTasks].sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  const handleCardExpand = (index: number, isExpanded: boolean) => {
    const rowIndex = Math.floor(index / 3); // Assuming 3 cards per row
    const newExpandedRows = new Set(expandedRows);

    if (isExpanded) {
      newExpandedRows.add(rowIndex);
    } else {
      newExpandedRows.delete(rowIndex);
    }

    setExpandedRows(newExpandedRows);
  };

  const isRowExpanded = (index: number) => {
    const rowIndex = Math.floor(index / 3); // Assuming 3 cards per row
    return expandedRows.has(rowIndex);
  };

  return (
    <div className="space-y-8">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{runningTasks.length}</div>
          <div className="text-sm text-blue-300">Running</div>
        </div>
        <div className="bg-gradient-to-r from-amber-600/20 to-amber-500/20 border border-amber-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-400">{needsInputTasks.length}</div>
          <div className="text-sm text-amber-300">Needs Input</div>
        </div>
        <div className="bg-gradient-to-r from-red-600/20 to-red-500/20 border border-red-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{errorTasks.length}</div>
          <div className="text-sm text-red-300">Errors</div>
        </div>
        <div className="bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{completedTasks.length}</div>
          <div className="text-sm text-green-300">Completed</div>
        </div>
      </div>

      {/* Active Tasks Section */}
      {activeTasks.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Active Tasks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onStatusUpdate={onStatusUpdate} isCollapsed={true} isExpanded={isRowExpanded(index)} onExpandChange={(expanded) => handleCardExpand(index, expanded)} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks Section */}
      {sortedCompletedTasks.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Completed Tasks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCompletedTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onStatusUpdate={onStatusUpdate} isCollapsed={true} isExpanded={isRowExpanded(index)} onExpandChange={(expanded) => handleCardExpand(index, expanded)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
