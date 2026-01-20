'use client'

import { useState } from 'react'
import ChannelList, { Channel } from '@/components/messaging/channel-list'
import ChatWindow, { Message, ChannelInfo } from '@/components/messaging/chat-window'
import { Card } from '@/components/ui/card'

// Mock Data
const MOCK_CHANNELS: Channel[] = [
    {
        id: 'general',
        name: 'general',
        type: 'public',
        description: 'General discussion for the team',
        unreadCount: 0,
        memberCount: 12,
        lastMessage: {
            content: 'Hey everyone, check out the new dashboard!',
            userName: 'Sarah Chen',
            timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 mins ago
        }
    },
    {
        id: 'design',
        name: 'design',
        type: 'public',
        description: 'Design team discussions and feedback',
        unreadCount: 3,
        mentionCount: 1,
        memberCount: 5,
        lastMessage: {
            content: 'I uploaded the new icons to the drive.',
            userName: 'Mike Ross',
            timestamp: new Date(Date.now() - 1000 * 60 * 30)
        }
    },
    {
        id: 'marketing',
        name: 'marketing',
        type: 'public',
        description: 'Marketing strategies and campaigns',
        unreadCount: 0,
        memberCount: 8,
        lastMessage: {
            content: 'Meeting moved to 3pm.',
            userName: 'Alex Lee',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
        }
    },
    {
        id: 'project-alpha',
        name: 'project-alpha',
        type: 'private',
        description: 'Private channel for Project Alpha',
        unreadCount: 0,
        memberCount: 4,
        isPinned: true
    }
]

const MOCK_DMS: Channel[] = [
    {
        id: 'dm-1',
        name: 'Sarah Chen',
        type: 'direct',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        isPinned: true,
        members: [{ id: 'u1', name: 'Sarah Chen', isOnline: true }]
    },
    {
        id: 'dm-2',
        name: 'Mike Ross',
        type: 'direct',
        avatar: 'https://i.pravatar.cc/150?u=mike',
        members: [{ id: 'u2', name: 'Mike Ross', isOnline: false }]
    },
    {
        id: 'dm-3',
        name: 'Alex Lee',
        type: 'direct',
        avatar: 'https://i.pravatar.cc/150?u=alex',
        members: [{ id: 'u3', name: 'Alex Lee', isOnline: true }]
    }
]

const INITIAL_MESSAGES: Record<string, Message[]> = {
    'general': [
        {
            id: 'm1',
            userId: 'u2',
            userName: 'Mike Ross',
            userAvatar: 'https://i.pravatar.cc/150?u=mike',
            content: 'Has anyone seen the latest deploy?',
            type: 'text',
            createdAt: new Date(Date.now() - 1000 * 60 * 60)
        },
        {
            id: 'm2',
            userId: 'current-user',
            userName: 'You',
            content: 'Yes, looking good! The new payment features are working perfectly.',
            type: 'text',
            createdAt: new Date(Date.now() - 1000 * 60 * 55),
            deliveryStatus: 'read'
        },
        {
            id: 'm3',
            userId: 'u1',
            userName: 'Sarah Chen',
            userAvatar: 'https://i.pravatar.cc/150?u=sarah',
            content: 'Hey everyone, check out the new dashboard!',
            type: 'text',
            createdAt: new Date(Date.now() - 1000 * 60 * 5),
            reactions: [{ emoji: '🔥', count: 2, users: ['u2', 'current-user'], hasReacted: true }]
        }
    ],
    'design': [
        {
            id: 'm4',
            userId: 'u2',
            userName: 'Mike Ross',
            userAvatar: 'https://i.pravatar.cc/150?u=mike',
            content: 'I uploaded the new icons to the drive.',
            type: 'text',
            createdAt: new Date(Date.now() - 1000 * 60 * 30),
            attachments: [{
                id: 'a1',
                type: 'image',
                url: 'https://placehold.co/600x400/png',
                name: 'icons-preview.png',
                size: 1024 * 500,
                mimeType: 'image/png',
                thumbnail: 'https://placehold.co/100x100/png'
            }]
        }
    ]
}

export default function MessagesPage() {
    const [currentChannelId, setCurrentChannelId] = useState<string>('general')
    const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES)
    const currentUser = { id: 'current-user', name: 'You' }

    // Get current channel info
    const currentChannel = [...MOCK_CHANNELS, ...MOCK_DMS].find(c => c.id === currentChannelId)

    // Convert Channel to ChannelInfo for ChatWindow
    const channelInfo: ChannelInfo = currentChannel ? {
        id: currentChannel.id,
        name: currentChannel.name,
        type: currentChannel.type as any, // Cast to any to avoid strict type mismatch with voice
        description: currentChannel.description,
        memberCount: currentChannel.memberCount || 2,
        avatar: currentChannel.avatar,
        isOnline: currentChannel.members?.[0]?.isOnline,
        lastSeen: new Date()
    } : {
        id: 'unknown',
        name: 'Select a channel',
        type: 'public',
        memberCount: 0
    }

    const handleSendMessage = (content: string, attachments?: File[]) => {
        const newMessage: Message = {
            id: `m-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            content,
            type: 'text', // In a real app, handle attachments here
            createdAt: new Date(),
            deliveryStatus: 'sent',
            // Mock attachment handling locally
            attachments: attachments ? attachments.map((f, i) => ({
                id: `a-${Date.now()}-${i}`,
                type: f.type.startsWith('image/') ? 'image' : 'file',
                url: URL.createObjectURL(f),
                name: f.name,
                size: f.size,
                mimeType: f.type,
            })) : undefined
        }

        setMessages(prev => ({
            ...prev,
            [currentChannelId]: [...(prev[currentChannelId] || []), newMessage]
        }))
    }

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-4 p-4 overflow-hidden">
            {/* Channel List Sidebar */}
            <Card className="w-80 flex-shrink-0 flex flex-col overflow-hidden bg-card/50 backdrop-blur-sm border-border/50">
                <ChannelList
                    channels={MOCK_CHANNELS}
                    directMessages={MOCK_DMS}
                    currentChannelId={currentChannelId}
                    currentUserId={currentUser.id}
                    onChannelSelect={setCurrentChannelId}
                    // Mock empty handlers for UI interactivity
                    onChannelAction={(action, id) => console.log('Action:', action, id)}
                    onCreateChannel={() => console.log('Create Channel')}
                    onCreateDM={() => console.log('Create DM')}
                    onSearch={(q) => console.log('Search:', q)}
                />
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col overflow-hidden bg-card/50 backdrop-blur-sm border-border/50">
                <ChatWindow
                    channel={channelInfo}
                    messages={messages[currentChannelId] || []}
                    currentUserId={currentUser.id}
                    currentUserName={currentUser.name}
                    onSendMessage={handleSendMessage}
                    // Mock empty handlers for UI interactivity
                    onReactToMessage={(id, emoji) => console.log('React:', id, emoji)}
                    onCall={(type) => console.log('Call:', type)}
                    onShowInfo={() => console.log('Show Info')}
                />
            </Card>
        </div>
    )
}
