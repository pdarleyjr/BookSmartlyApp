import { useState, useRef } from "react";
import { MessageSquare, X, ChevronUp, ChevronDown, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ChatWindowProps = {
  isOpen: boolean;
  onToggle: () => void;
  height: number;
  onResize: (height: number) => void;
};

export function ChatWindow({ isOpen, onToggle, height, onResize }: ChatWindowProps) {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hello! I'm your AI assistant. How can I help you schedule your appointments today?", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState("");
  const dragStartY = useRef<number | null>(null);
  const startHeight = useRef<number>(height);
  
  const handleDragStart = (e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    startHeight.current = height;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (dragStartY.current === null) return;
      
      const deltaY = dragStartY.current - moveEvent.clientY;
      const newHeight = Math.max(200, Math.min(600, startHeight.current + deltaY));
      onResize(newHeight);
    };
    
    const handleMouseUp = () => {
      dragStartY.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: inputValue, isUser: true }]);
    setInputValue("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          text: "I'm a placeholder AI assistant. In the future, I'll help you manage your schedule more effectively!", 
          isUser: false 
        }
      ]);
    }, 1000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-coral text-white rounded-full p-3 shadow-lg"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }
  
  return (
    <div 
      className="fixed bottom-0 right-4 bg-white rounded-t-lg shadow-lg border overflow-hidden flex flex-col"
      style={{ width: '350px', height: `${height}px` }}
    >
      {/* Resize handle */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize bg-transparent hover:bg-muted"
        onMouseDown={handleDragStart}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-coral text-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        <div className="flex items-center">
          <button onClick={onToggle} className="p-1 rounded-full hover:bg-white/20">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={cn(
              "max-w-[80%] p-3 rounded-lg",
              message.isUser 
                ? "bg-coral text-white ml-auto rounded-br-none" 
                : "bg-muted rounded-bl-none"
            )}
          >
            {message.text}
          </div>
        ))}
      </div>
      
      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button 
          onClick={handleSendMessage} 
          size="icon" 
          className="bg-coral hover:bg-coral/90 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}