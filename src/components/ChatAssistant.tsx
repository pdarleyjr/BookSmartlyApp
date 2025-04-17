import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SendIcon, BotIcon, Loader2 } from "lucide-react";
import { sendChat, handleFunctionCall } from "../services/ChatService";
import { useAuth } from "../hooks/use-auth";
import { cn } from "../lib/utils";
import type { ChatCompletionMessageParam } from "openai/resources";

// Internal message type for UI display
type DisplayMessage = {
  role: "system" | "user" | "assistant" | "function";
  content: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  name?: string;
};

export function ChatAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DisplayMessage[]>([
    { 
      role: "system", 
      content: "You are BookSmartly Assistant, a helpful AI assistant for the BookSmartly appointment management application. Help users with scheduling appointments, checking their calendar, and answering questions about the application. Always be polite, concise, and helpful."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Convert our internal message format to OpenAI's format
  const convertToOpenAIMessages = (msgs: DisplayMessage[]): ChatCompletionMessageParam[] => {
    return msgs.map(msg => {
      if (msg.role === "system") {
        return { role: "system", content: msg.content };
      } else if (msg.role === "user") {
        return { role: "user", content: msg.content };
      } else if (msg.role === "assistant") {
        if (msg.function_call) {
          return { 
            role: "assistant", 
            content: msg.content,
            function_call: msg.function_call
          };
        }
        return { role: "assistant", content: msg.content };
      } else if (msg.role === "function" && msg.name) {
        return { 
          role: "function", 
          content: msg.content,
          name: msg.name 
        };
      }
      // Fallback
      return { role: "user", content: msg.content };
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: DisplayMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Convert messages to OpenAI format
      const openAIMessages = convertToOpenAIMessages([...messages, userMessage]);
      
      // Send message to OpenAI
      const assistantResponse = await sendChat(openAIMessages);
      
      // Convert OpenAI response to our format
      const displayResponse: DisplayMessage = {
        role: "assistant",
        content: assistantResponse.content || "",
        function_call: assistantResponse.function_call
      };
      
      setMessages(prev => [...prev, displayResponse]);

      // If function call is present, execute it
      if (assistantResponse.function_call) {
        const functionResult = await handleFunctionCall(assistantResponse);
        
        // Add function result as a message
        const functionMessage: DisplayMessage = {
          role: "function",
          name: functionResult.name,
          content: JSON.stringify(functionResult.result)
        };
        setMessages(prev => [...prev, functionMessage]);

        // Get final response from assistant after function call
        const allMessages = convertToOpenAIMessages([...messages, userMessage, displayResponse, functionMessage]);
        const finalResponse = await sendChat(allMessages);
        
        // Convert final response to our format
        const finalDisplayResponse: DisplayMessage = {
          role: "assistant",
          content: finalResponse.content || "",
          function_call: finalResponse.function_call
        };
        
        setMessages(prev => [...prev, finalDisplayResponse]);
      }
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again later."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BotIcon className="h-5 w-5" />
          BookSmartly Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.slice(1).map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 max-w-[80%]",
              message.role === "user" ? "ml-auto" : "mr-auto"
            )}
          >
            {message.role !== "user" && message.role !== "function" && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">BS</AvatarFallback>
                <AvatarImage src="/logo.png" alt="BookSmartly" />
              </Avatar>
            )}
            
            <div
              className={cn(
                "rounded-lg p-3",
                message.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : message.role === "function"
                  ? "hidden"
                  : "bg-muted"
              )}
            >
              {message.content}
            </div>
            
            {message.role === "user" && (
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">BS</AvatarFallback>
              <AvatarImage src="/logo.png" alt="BookSmartly" />
            </Avatar>
            <div className="rounded-lg p-3 bg-muted flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full items-center space-x-2">
          <Textarea
            placeholder="Ask me anything about BookSmartly..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-h-[60px] max-h-[120px]"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}