
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot } from 'lucide-react';

interface ChatInterfaceProps {
  onTaskSubmit: (taskName: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onTaskSubmit }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onTaskSubmit(input.trim());
      setInput('');
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Task Command Center</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a new task for your AI agents..."
            className="flex-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
          />
          <Button 
            type="submit" 
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            <Send className="h-4 w-4 mr-2" />
            Deploy
          </Button>
        </form>
        
        <p className="text-sm text-slate-400 mt-3">
          Type your task description and press Deploy to assign it to an available AI agent.
        </p>
      </div>
    </Card>
  );
};
