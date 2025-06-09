import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Task } from "../types/Task";
import { Bot, Clock, AlertTriangle, CheckCircle, XCircle, Play, Pause, ChevronDown, ChevronUp } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onStatusUpdate: (taskId: string, status: Task["status"]) => void;
  isCollapsed?: boolean;
  isExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusUpdate, isCollapsed = true, isExpanded = false, onExpandChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Update local state when external expansion state changes
  React.useEffect(() => {
    setIsOpen(isExpanded);
  }, [isExpanded]);

  // Notify parent of expansion changes
  const handleExpandChange = (expanded: boolean) => {
    setIsOpen(expanded);
    onExpandChange?.(expanded);
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "running":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "needs_input":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "paused":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "running":
        return <Play className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "error":
        return <XCircle className="h-3 w-3" />;
      case "needs_input":
        return <AlertTriangle className="h-3 w-3" />;
      case "paused":
        return <Pause className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    return `${minutes}m ago`;
  };

  // Collapsed chip/bubble design
  if (isCollapsed && !isOpen) {
    return (
      <div className="inline-flex items-center gap-2 bg-slate-800/70 hover:bg-slate-700/70 border border-slate-600/50 rounded-full px-4 py-2 transition-all duration-200 cursor-pointer group" onClick={() => handleExpandChange(true)}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${task.status === "running" ? "bg-blue-400" : task.status === "error" ? "bg-red-400" : task.status === "needs_input" ? "bg-amber-400" : task.status === "paused" ? "bg-slate-400" : "bg-green-400"}`} />
          <span className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">{task.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">{task.progress}%</div>
          <div className="w-8 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-300" style={{ width: `${task.progress}%` }} />
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Bot className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{task.agent}</span>
          </div>
          <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-300 transition-colors" />
        </div>
      </div>
    );
  }

  // Expanded card design
  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-200 w-full">
      <Collapsible open={isOpen} onOpenChange={handleExpandChange}>
        <div className="p-6">
          {/* Header - Always Visible */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left group">
                <h4 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors truncate">{task.name}</h4>
                {isCollapsed ? isOpen ? <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" /> : null}
              </CollapsibleTrigger>
              <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                <Bot className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{task.agent}</span>
              </div>
            </div>
            <Badge className={`${getStatusColor(task.status)} flex items-center gap-1 flex-shrink-0`}>
              {getStatusIcon(task.status)}
              {task.status.replace("_", " ")}
            </Badge>
          </div>

          {/* Collapsible Content */}
          <CollapsibleContent className="space-y-4">
            {/* Description */}
            <p className="text-sm text-slate-300 break-words">{task.streamingMessage || task.message || task.description}</p>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="text-slate-300">{task.progress}%</span>
              </div>
              <Progress value={task.progress} className="h-2 bg-slate-700 [&>div]:bg-white" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>Started {formatTime(task.startTime)}</span>
              </div>

              {task.status === "needs_input" && (
                <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex-shrink-0" onClick={() => onStatusUpdate(task.id, "running")}>
                  Provide Input
                </Button>
              )}

              {task.status === "error" && (
                <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 flex-shrink-0" onClick={() => onStatusUpdate(task.id, "running")}>
                  Retry
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </Card>
  );
};
