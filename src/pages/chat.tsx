import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/route-components";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, RefreshCw, Calendar, CreditCard, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendChat, handleFunctionCall } from "@/services/ChatService";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Message = {
  id: string;
  role: "user" | "assistant" | "system" | "function";
  content: string;
  timestamp: Date;
  functionCall?: {
    name: string;
    arguments: Record<string, any>;
  };
  functionResult?: any;
};

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    "Show me my upcoming appointments",
    "Create a new appointment for tomorrow at 2pm",
    "Show me my analytics for this month",
    "Help me understand how billing works",
    "What features are available in BookSmartly?"
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();
  const navigate = useNavigate();
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "👋 Hi there! I'm your BookSmartly AI assistant. I can help you manage appointments, answer questions about the system, and provide insights about your data. How can I help you today?",
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Convert our messages to OpenAI format
      const chatMessages = messages
        .filter(msg => msg.role !== "function") // Filter out function messages for display only
        .concat(userMessage)
        .map(msg => ({
          role: msg.role,
          content: msg.content,
          ...(msg.functionCall ? { function_call: msg.functionCall } : {})
        }));
      
      // Add function results as function messages
      messages.forEach(msg => {
        if (msg.functionResult) {
          chatMessages.push({
            role: "function",
            name: msg.functionCall?.name || "",
            content: JSON.stringify(msg.functionResult)
          });
        }
      });
      
      // Send to OpenAI
      const response = await sendChat(chatMessages);
      
      // Handle function calls
      if (response.function_call) {
        // Add assistant message with function call
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: response.content || "I'll help you with that.",
          timestamp: new Date(),
          functionCall: {
            name: response.function_call.name,
            arguments: JSON.parse(response.function_call.arguments)
          }
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Execute function
        try {
          const { name, result } = await handleFunctionCall(response);
          
          // Update the assistant message with function result
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, functionResult: result }
                : msg
            )
          );
          
          // Add a new message with the function result in natural language
          let resultMessage = "I've processed your request.";
          
          switch (name) {
            case "createAppointment":
              resultMessage = `✅ I've scheduled a new appointment: "${result.title}" on ${format(new Date(result.startTime), "MMMM d, yyyy 'at' h:mm a")}`;
              break;
            case "cancelAppointment":
              resultMessage = "✅ The appointment has been cancelled successfully.";
              break;
            case "rescheduleAppointment":
              resultMessage = `✅ I've rescheduled the appointment to ${format(new Date(result.startTime), "MMMM d, yyyy 'at' h:mm a")}`;
              break;
            case "getFinancialAnalytics":
              resultMessage = `📊 Here's your financial summary:\n\nTotal Revenue: $${result.totalRevenue.toFixed(2)}\n\nTop Performers:\n${result.byUser.slice(0, 3).map((u: any) => `- ${u.name}: $${u.revenue.toFixed(2)}`).join('\n')}\n\nTime Period: ${result.period.startDate} to ${result.period.endDate}`;
              break;
            case "getAppInfo":
              resultMessage = `📱 BookSmartly v${result.version}\n\nFeatures:\n${result.features.slice(0, 5).map((f: string) => `- ${f}`).join('\n')}`;
              break;
            default:
              resultMessage = `I've completed the "${name}" operation successfully.`;
          }
          
          const functionResponseMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: resultMessage,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, functionResponseMessage]);
        } catch (error) {
          console.error("Function execution error:", error);
          
          const errorMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: "I'm sorry, I encountered an error while processing your request. Please try again.",
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, errorMessage]);
        }
      } else {
        // Regular text response
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: response.content || "I'm not sure how to respond to that.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
  };
  
  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "👋 Chat cleared! How can I help you today?",
        timestamp: new Date()
      }
    ]);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="chat">Chat Assistant</TabsTrigger>
            <TabsTrigger value="help">Help & Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="w-full">
            <div className="flex flex-col h-[calc(100vh-16rem)]">
              <div className="flex-1 overflow-y-auto mb-4 pr-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start gap-3 mb-4",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role !== "user" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-primary text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={cn(
                        "rounded-lg p-3 max-w-[80%]",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {message.functionCall && (
                        <div className="mt-2 text-xs">
                          <Badge variant="outline" className="mb-1">
                            Function: {message.functionCall.name}
                          </Badge>
                          {message.functionResult ? (
                            <Badge className="bg-green-500 ml-2">Completed</Badge>
                          ) : (
                            <Badge className="bg-yellow-500 ml-2">Processing...</Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs opacity-50 mt-1">
                        {format(message.timestamp, "h:mm a")}
                      </div>
                    </div>
                    
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-primary text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  onClick={clearChat}
                  variant="outline"
                  size="icon"
                  title="Clear chat"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="help" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    About the AI Assistant
                  </CardTitle>
                  <CardDescription>
                    How the AI assistant can help you with BookSmartly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    The AI assistant is integrated with BookSmartly to help you manage appointments,
                    access analytics, and navigate the system more efficiently.
                  </p>
                  
                  <h3 className="font-medium mb-2">Capabilities:</h3>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Create, reschedule, and cancel appointments</li>
                    <li>Get financial analytics and insights</li>
                    <li>Answer questions about BookSmartly features</li>
                    <li>Provide guidance on using the system</li>
                    <li>Help troubleshoot common issues</li>
                  </ul>
                  
                  <h3 className="font-medium mb-2">Limitations:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Cannot access data outside of BookSmartly</li>
                    <li>May not have information about very recent updates</li>
                    <li>Cannot modify system settings or user permissions</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Example Prompts</CardTitle>
                  <CardDescription>
                    Try these examples to see what the AI can do
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="flex items-center gap-2 font-medium mb-2">
                      <Calendar className="h-4 w-4" />
                      Appointment Management
                    </h3>
                    <div className="space-y-2">
                      {[
                        "Show me my appointments for this week",
                        "Create a new appointment with John Smith tomorrow at 2pm",
                        "Reschedule my 3pm appointment to 4pm",
                        "Cancel my appointment with Jane Doe"
                      ].map((prompt, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => handleSuggestedPrompt(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="flex items-center gap-2 font-medium mb-2">
                      <BarChart2 className="h-4 w-4" />
                      Analytics & Insights
                    </h3>
                    <div className="space-y-2">
                      {[
                        "Show me my revenue for this month",
                        "What are my busiest days of the week?",
                        "Compare this month's performance to last month",
                        "Which services generate the most revenue?"
                      ].map((prompt, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => handleSuggestedPrompt(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="flex items-center gap-2 font-medium mb-2">
                      <CreditCard className="h-4 w-4" />
                      Billing & Payments
                    </h3>
                    <div className="space-y-2">
                      {[
                        "Show me unbilled appointments",
                        "How do I create an invoice?",
                        "Explain how Square integration works",
                        "What payment methods do you support?"
                      ].map((prompt, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => handleSuggestedPrompt(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedChatPage = () => (
  <ProtectedRoute Component={ChatPage} />
);

export default ProtectedChatPage;