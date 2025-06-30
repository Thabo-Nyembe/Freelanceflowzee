import { Chat } from '../components/Chat';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">AI Chat</h1>
        <Chat />
      </div>
    </div>
  );
} 