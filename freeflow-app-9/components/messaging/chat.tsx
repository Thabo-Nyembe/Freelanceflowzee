// import React, { useState, useEffect } from 'react'
import { useSupabase } from '../../__mocks__/supabase-provider'
import { Card, CardContent } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: number
  content: string
  senderId: number
  timestamp: string
}

interface Chat {
  id: number
  name: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  avatar: string
}

const Chat = () => {
  const { supabase } = useSupabase()
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [chats] = useState<Chat[]>([
    {
      id: 1,
      name: 'John Doe',
      lastMessage: 'Hey, how are you?',
      lastMessageTime: '10:30 AM',
      unreadCount: 2,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    },
    {
      id: 2,
      name: 'Jane Smith',
      lastMessage: 'The project looks great!',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'
    }
  ])

  useEffect(() => {
    if (selectedChat) {
      // In a real app, we would fetch messages from the database
      setMessages([
        {
          id: 1,
          content: 'Hey there!',
          senderId: selectedChat.id,
          timestamp: '10:30 AM'
        },
        {
          id: 2,
          content: 'Hi! How can I help you?',
          senderId: 0, // current user
          timestamp: '10:31 AM'
        }
      ])
    }
  }, [selectedChat])

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat)
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const message: Message = {
        id: messages.length + 1,
        content: newMessage,
        senderId: 0, // current user
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    // Handle typing indicator
    setIsTyping(true)
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    const timeout = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
    setTypingTimeout(timeout)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Chat List */}
      <div className="w-1/3 border-r">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <Input
            data-testid="chat-search"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="mb-4"
          />
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div data-testid="chat-list" data-filter={searchQuery} className="space-y-2">
              {filteredChats.map(chat => (
                <Card
                  key={chat.id}
                  data-testid={`chat-item-${chat.id}`}
                  className={`cursor-pointer hover:bg-accent ${
                    selectedChat?.id === chat.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <CardContent className="p-4 flex items-center space-x-4">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{chat.name}</h3>
                        <span className="text-sm text-gray-500">{chat.lastMessageTime}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                        {chat.unreadCount}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Chat Messages */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-4">
              <img
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-10 h-10 rounded-full"
              />
              <h2 className="text-xl font-semibold">{selectedChat.name}</h2>
            </div>
          </div>
          <ScrollArea data-testid="chat-messages" className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderId === 0
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent'
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="text-xs opacity-70">{message.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            {isTyping && (
              <div data-testid="typing-indicator" className="text-sm text-gray-500 mb-2">
                Typing...
              </div>
            )}
            <div className="flex space-x-2">
              <Input
                data-testid="message-input"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleMessageChange}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <Button data-testid="send-button" onClick={handleSendMessage}>
                Send
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a chat to start messaging
        </div>
      )}
    </div>
  )
}

export default Chat 