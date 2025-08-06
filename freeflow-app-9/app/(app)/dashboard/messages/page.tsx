'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, Search, Filter, MessageSquare } from 'lucide-react'

interface Message {
  id: number
  text: string
  sender: string
  timestamp: string
}

interface Chat {
  id: number
  name: string
  lastMessage: string
  unread: number
  avatar: string
}

const mockChats: Chat[] = [
  { id: 1, name: 'John Doe', lastMessage: 'Thanks for the project update!', unread: 2, avatar: 'JD' },
  { id: 2, name: 'Sarah Johnson', lastMessage: 'Can we schedule a call?', unread: 0, avatar: 'SJ' },
  { id: 3, name: 'Mike Wilson', lastMessage: 'The design looks great!', unread: 1, avatar: 'MW' },
]

const mockMessages: Message[] = [
  { id: 1, text: 'Hi there! How are you doing?', sender: 'John Doe', timestamp: '10:30 AM' },
  { id: 2, text: 'I\'m doing well, thanks for asking!', sender: 'You', timestamp: '10:32 AM' },
  { id: 3, text: 'Thanks for the project update!', sender: 'John Doe', timestamp: '10:35 AM' },
]

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const filteredChats = mockChats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      // Add message to chat
      const _message: Message = {
        id: mockMessages.length + 1,
        text: newMessage,
        sender: 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      // In a real app, this would send the message to the backend
      console.log('Sending message:', newMessage)
      setNewMessage('')
      
      // Show success feedback
      alert('Message sent successfully!')
    }
  }

  return (
    <div className="h-full flex">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r bg-background" data-testid="chat-list">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Messages
              </span>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredChats.length === 0 && (
                <div 
                  className="p-4 text-center text-muted-foreground"
                  data-testid="empty-chat-list"
                >
                  No conversations found
                </div>
              )}
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  data-testid={`chat-item-${chat.id}`}
                  className={`p-3 cursor-pointer hover:bg-accent transition-colors ${ 
                    selectedChat?.id === chat.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {chat.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{chat.name}</p>
                        {chat.unread > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="border-b p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {selectedChat.avatar}
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedChat.name}</h3>
                    <p className="text-sm text-muted-foreground">Active now</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => alert('Starting video call...')}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => alert('Starting voice call...')}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => alert('Chat settings...')}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto" data-testid="chat-messages">
              <div className="space-y-4">
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        message.sender === 'You'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'You' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  data-testid="message-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage()
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  data-testid="send-button"
                  onClick={handleSendMessage}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}