import { ChatAssistant } from "../components/ChatAssistant";
import { Layout } from "../components/layout/Layout";

export default function ChatPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">BookSmartly AI Assistant</h1>
        <p className="text-center mb-8 text-muted-foreground max-w-2xl mx-auto">
          Ask our AI assistant about scheduling appointments, managing your calendar, 
          or any other questions you have about BookSmartly.
        </p>
        <ChatAssistant />
      </div>
    </Layout>
  );
}