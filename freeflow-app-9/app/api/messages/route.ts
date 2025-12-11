import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('API-Messages');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// ============================================================================
// TYPES
// ============================================================================

type ChatType = 'direct' | 'group' | 'channel';
type MessageType = 'text' | 'image' | 'file' | 'voice' | 'video' | 'location' | 'contact';
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
type MemberRole = 'owner' | 'admin' | 'member';

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  type: MessageType;
  status: MessageStatus;
  reply_to_id: string | null;
  thread_id: string | null;
  is_edited: boolean;
  edited_at: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  metadata: Record<string, unknown>;
}

interface Chat {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  type: ChatType;
  creator_id: string;
  is_archived: boolean;
  last_message_at: string | null;
  created_at: string;
}

interface ChatMember {
  id: string;
  chat_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  last_read_at: string | null;
  is_muted: boolean;
}

// ============================================================================
// DEMO DATA (for unauthenticated users)
// ============================================================================

function getDemoMessages(): Partial<Message>[] {
  return [
    {
      id: 'demo-msg-1',
      chat_id: 'demo-chat-1',
      sender_id: 'demo-user-2',
      text: 'Hey! I reviewed the latest designs and they look amazing! 🎨',
      type: 'text',
      status: 'read',
      is_edited: false,
      is_pinned: false,
      is_deleted: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'demo-msg-2',
      chat_id: 'demo-chat-1',
      sender_id: 'demo-user-1',
      text: 'Thanks! I made some adjustments based on your feedback. Check out the updated mockups.',
      type: 'text',
      status: 'read',
      is_edited: false,
      is_pinned: false,
      is_deleted: false,
      created_at: new Date(Date.now() - 3000000).toISOString(),
    },
    {
      id: 'demo-msg-3',
      chat_id: 'demo-chat-1',
      sender_id: 'demo-user-2',
      text: 'Perfect! Can we schedule a call to discuss the implementation timeline?',
      type: 'text',
      status: 'delivered',
      is_edited: false,
      is_pinned: false,
      is_deleted: false,
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ];
}

function getDemoChats(): Partial<Chat>[] {
  return [
    {
      id: 'demo-chat-1',
      name: 'Project Falcon Team',
      description: 'Design and development discussions',
      type: 'group',
      is_archived: false,
      last_message_at: new Date(Date.now() - 1800000).toISOString(),
      created_at: new Date(Date.now() - 604800000).toISOString(),
    },
    {
      id: 'demo-chat-2',
      name: 'Sarah Johnson',
      type: 'direct',
      is_archived: false,
      last_message_at: new Date(Date.now() - 7200000).toISOString(),
      created_at: new Date(Date.now() - 2592000000).toISOString(),
    },
    {
      id: 'demo-chat-3',
      name: 'General Announcements',
      description: 'Company-wide announcements',
      type: 'channel',
      is_archived: false,
      last_message_at: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 7776000000).toISOString(),
    },
  ];
}

// ============================================================================
// GET - Retrieve messages and chats
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    // Query parameters
    const chatId = searchParams.get('chatId');
    const type = searchParams.get('type'); // 'chats' | 'messages'
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // For pagination - get messages before this ID
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Demo mode for unauthenticated users
    if (!session?.user?.id) {
      if (type === 'chats' || !chatId) {
        let demoChats = getDemoChats();
        if (search) {
          demoChats = demoChats.filter(c =>
            c.name?.toLowerCase().includes(search.toLowerCase())
          );
        }
        return NextResponse.json({
          success: true,
          demo: true,
          chats: demoChats,
          total: demoChats.length,
          unreadCount: 3,
        });
      } else {
        let demoMessages = getDemoMessages();
        if (search) {
          demoMessages = demoMessages.filter(m =>
            m.text?.toLowerCase().includes(search.toLowerCase())
          );
        }
        return NextResponse.json({
          success: true,
          demo: true,
          messages: demoMessages,
          total: demoMessages.length,
          unreadCount: 1,
        });
      }
    }

    const supabase = getSupabaseClient();
    const userId = session.user.id;

    // Get chats
    if (type === 'chats' || !chatId) {
      return await getChats(supabase, userId, search, limit);
    }

    // Get messages for a specific chat
    return await getMessages(supabase, userId, chatId, limit, before, search);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Messages GET error', { error: errorMessage });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

async function getChats(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  search: string | null,
  limit: number
): Promise<NextResponse> {
  // Get chats where user is a member
  let query = supabase
    .from('chat_members')
    .select(`
      chat_id,
      role,
      last_read_at,
      is_muted,
      chats (
        id,
        name,
        description,
        avatar_url,
        type,
        creator_id,
        is_archived,
        last_message_at,
        created_at,
        metadata
      )
    `)
    .eq('user_id', userId)
    .is('left_at', null)
    .order('last_read_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  const { data: memberships, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // Extract chat data
  let chats = memberships?.map(m => ({
    ...m.chats,
    role: m.role,
    lastReadAt: m.last_read_at,
    isMuted: m.is_muted,
  })).filter(c => c.id) || [];

  // Apply search filter
  if (search) {
    chats = chats.filter(c =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Get unread count for each chat
  const chatsWithUnread = await Promise.all(
    chats.map(async (chat) => {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('chat_id', chat.id)
        .eq('is_deleted', false)
        .gt('created_at', chat.lastReadAt || '1970-01-01');

      return {
        ...chat,
        unreadCount: count || 0,
      };
    })
  );

  // Calculate total unread
  const totalUnread = chatsWithUnread.reduce((sum, c) => sum + c.unreadCount, 0);

  return NextResponse.json({
    success: true,
    chats: chatsWithUnread,
    total: chatsWithUnread.length,
    unreadCount: totalUnread,
  });
}

async function getMessages(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  chatId: string,
  limit: number,
  before: string | null,
  search: string | null
): Promise<NextResponse> {
  // Verify user is a member of this chat
  const { data: membership } = await supabase
    .from('chat_members')
    .select('id, role')
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .is('left_at', null)
    .single();

  if (!membership) {
    return NextResponse.json(
      { success: false, error: 'Access denied to this chat' },
      { status: 403 }
    );
  }

  // Build messages query
  let query = supabase
    .from('messages')
    .select(`
      *,
      message_reactions (
        id,
        emoji,
        user_id
      ),
      message_attachments (
        id,
        name,
        url,
        type,
        mime_type,
        size_bytes,
        thumbnail_url
      ),
      message_mentions (
        id,
        mentioned_user_id
      )
    `)
    .eq('chat_id', chatId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  // Pagination - get messages before a certain message
  if (before) {
    const { data: beforeMessage } = await supabase
      .from('messages')
      .select('created_at')
      .eq('id', before)
      .single();

    if (beforeMessage) {
      query = query.lt('created_at', beforeMessage.created_at);
    }
  }

  // Search
  if (search) {
    query = query.ilike('text', `%${search}%`);
  }

  const { data: messages, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // Get unread count
  const { data: memberData } = await supabase
    .from('chat_members')
    .select('last_read_at')
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .single();

  const { count: unreadCount } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('chat_id', chatId)
    .eq('is_deleted', false)
    .gt('created_at', memberData?.last_read_at || '1970-01-01');

  // Update last read time
  await supabase
    .from('chat_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('chat_id', chatId)
    .eq('user_id', userId);

  return NextResponse.json({
    success: true,
    messages: messages?.reverse() || [], // Return in chronological order
    total: messages?.length || 0,
    unreadCount: unreadCount || 0,
    hasMore: messages?.length === limit,
  });
}

// ============================================================================
// POST - Message and chat operations
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { action, ...data } = body;

    // Demo mode
    if (!session?.user?.id) {
      return handleDemoAction(action, data);
    }

    const supabase = getSupabaseClient();
    const userId = session.user.id;

    switch (action) {
      case 'send':
        return await handleSendMessage(supabase, userId, data);
      case 'edit':
        return await handleEditMessage(supabase, userId, data);
      case 'delete':
        return await handleDeleteMessage(supabase, userId, data);
      case 'react':
        return await handleReaction(supabase, userId, data);
      case 'mark-read':
        return await handleMarkRead(supabase, userId, data);
      case 'pin':
        return await handlePinMessage(supabase, userId, data);
      case 'create-chat':
        return await handleCreateChat(supabase, userId, data);
      case 'add-members':
        return await handleAddMembers(supabase, userId, data);
      case 'remove-member':
        return await handleRemoveMember(supabase, userId, data);
      case 'leave-chat':
        return await handleLeaveChat(supabase, userId, data);
      case 'archive-chat':
        return await handleArchiveChat(supabase, userId, data);
      case 'update-chat':
        return await handleUpdateChat(supabase, userId, data);
      case 'typing':
        return await handleTypingIndicator(supabase, userId, data);
      case 'search':
        return await handleSearch(supabase, userId, data);
      case 'ai-assist':
        return await handleAIAssist(data);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Messages POST error', { error: errorMessage });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// ============================================================================
// DEMO ACTION HANDLER
// ============================================================================

function handleDemoAction(action: string, data: Record<string, unknown>): NextResponse {
  switch (action) {
    case 'send':
      return NextResponse.json({
        success: true,
        demo: true,
        action: 'send',
        message: {
          id: `demo-msg-${Date.now()}`,
          chat_id: data.chatId,
          text: data.text || data.content,
          type: 'text',
          status: 'sent',
          created_at: new Date().toISOString(),
        },
        message_text: 'Demo: Message would be sent',
      });

    case 'create-chat':
      return NextResponse.json({
        success: true,
        demo: true,
        action: 'create-chat',
        chat: {
          id: `demo-chat-${Date.now()}`,
          name: data.name,
          type: data.type || 'group',
          created_at: new Date().toISOString(),
        },
        message_text: 'Demo: Chat would be created',
      });

    case 'ai-assist':
      return NextResponse.json({
        success: true,
        demo: true,
        action: 'ai-assist',
        result: {
          suggestions: [
            { text: 'Sure, I can schedule that for you!', confidence: 0.92 },
            { text: 'Let me check my calendar and get back to you.', confidence: 0.88 },
          ],
          sentiment: 'positive',
        },
      });

    default:
      return NextResponse.json({
        success: true,
        demo: true,
        action,
        message_text: `Demo: Action "${action}" would be performed`,
      });
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleSendMessage(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: {
    chatId: string;
    text?: string;
    content?: string;
    type?: MessageType;
    replyToId?: string;
    attachments?: Array<{ name: string; url: string; type: string; size: number; mimeType: string }>;
    mentions?: string[];
  }
): Promise<NextResponse> {
  const messageText = data.text || data.content || '';

  // Verify user can send to this chat
  const { data: membership } = await supabase
    .from('chat_members')
    .select('id')
    .eq('chat_id', data.chatId)
    .eq('user_id', userId)
    .is('left_at', null)
    .single();

  if (!membership) {
    return NextResponse.json(
      { success: false, error: 'Not a member of this chat' },
      { status: 403 }
    );
  }

  // Create message
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      chat_id: data.chatId,
      sender_id: userId,
      text: messageText,
      type: data.type || 'text',
      reply_to_id: data.replyToId || null,
      status: 'sent',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Add attachments
  if (data.attachments && data.attachments.length > 0) {
    const attachmentRecords = data.attachments.map(att => ({
      message_id: message.id,
      name: att.name,
      url: att.url,
      type: att.type as 'image' | 'video' | 'audio' | 'document' | 'other',
      mime_type: att.mimeType,
      size_bytes: att.size,
    }));

    await supabase.from('message_attachments').insert(attachmentRecords);
  }

  // Add mentions
  if (data.mentions && data.mentions.length > 0) {
    const mentionRecords = data.mentions.map(mentionedUserId => ({
      message_id: message.id,
      mentioned_user_id: mentionedUserId,
    }));

    await supabase.from('message_mentions').insert(mentionRecords);
  }

  // Update chat's last_message_at
  await supabase
    .from('chats')
    .update({ last_message_at: message.created_at })
    .eq('id', data.chatId);

  return NextResponse.json({
    success: true,
    action: 'send',
    message,
    delivered: true,
    timestamp: message.created_at,
  });
}

async function handleEditMessage(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: { messageId: string; text?: string; content?: string }
): Promise<NextResponse> {
  const newText = data.text || data.content;

  if (!newText) {
    return NextResponse.json(
      { success: false, error: 'New text is required' },
      { status: 400 }
    );
  }

  // Verify user owns this message
  const { data: message } = await supabase
    .from('messages')
    .select('id, sender_id')
    .eq('id', data.messageId)
    .single();

  if (!message || message.sender_id !== userId) {
    return NextResponse.json(
      { success: false, error: 'Cannot edit this message' },
      { status: 403 }
    );
  }

  const { data: updated, error } = await supabase
    .from('messages')
    .update({
      text: newText,
      is_edited: true,
      edited_at: new Date().toISOString(),
    })
    .eq('id', data.messageId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return NextResponse.json({
    success: true,
    action: 'edit',
    message: updated,
  });
}

async function handleDeleteMessage(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: { messageId: string }
): Promise<NextResponse> {
  // Verify user owns this message or is admin
  const { data: message } = await supabase
    .from('messages')
    .select('id, sender_id, chat_id')
    .eq('id', data.messageId)
    .single();

  if (!message) {
    return NextResponse.json(
      { success: false, error: 'Message not found' },
      { status: 404 }
    );
  }

  // Check if user is sender or admin
  const isOwner = message.sender_id === userId;

  if (!isOwner) {
    const { data: membership } = await supabase
      .from('chat_members')
      .select('role')
      .eq('chat_id', message.chat_id)
      .eq('user_id', userId)
      .single();

    if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete this message' },
        { status: 403 }
      );
    }
  }

  // Soft delete
  const { error } = await supabase
    .from('messages')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', data.messageId);

  if (error) {
    throw new Error(error.message);
  }

  return NextResponse.json({
    success: true,
    action: 'delete',
    messageId: data.messageId,
  });
}

async function handleReaction(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: { messageId: string; emoji: string; remove?: boolean }
): Promise<NextResponse> {
  if (data.remove) {
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', data.messageId)
      .eq('user_id', userId)
      .eq('emoji', data.emoji);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      action: 'react',
      removed: true,
      emoji: data.emoji,
    });
  }

  const { data: reaction, error } = await supabase
    .from('message_reactions')
    .upsert({
      message_id: data.messageId,
      user_id: userId,
      emoji: data.emoji,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return NextResponse.json({
    success: true,
    action: 'react',
    reaction,
  });
}

async function handleMarkRead(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: { chatId: string; messageIds?: string[] }
): Promise<NextResponse> {
  // Update member's last read time
  await supabase
    .from('chat_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('chat_id', data.chatId)
    .eq('user_id', userId);

  // If specific message IDs provided, create read receipts
  if (data.messageIds && data.messageIds.length > 0) {
    const receipts = data.messageIds.map(messageId => ({
      message_id: messageId,
      user_id: userId,
    }));

    await supabase
      .from('message_read_receipts')
      .upsert(receipts, { onConflict: 'message_id,user_id' });
  }

  return NextResponse.json({
    success: true,
    action: 'mark-read',
    chatId: data.chatId,
    markedCount: data.messageIds?.length || 0,
  });
}

async function handlePinMessage(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: { messageId: string; pin: boolean }
): Promise<NextResponse> {
  const { error } = await supabase
    .from('messages')
    .update({
      is_pinned: data.pin,
      pinned_at: data.pin ? new Date().toISOString() : null,
      pinned_by: data.pin ? userId : null,
    })
    .eq('id', data.messageId);

  if (error) {
    throw new Error(error.message);
  }

  return NextResponse.json({
    success: true,
    action: 'pin',
    messageId: data.messageId,
    pinned: data.pin,
  });
}

async function handleCreateChat(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: {
    name: string;
    type?: ChatType;
    description?: string;
    members?: string[];
  }
): Promise<NextResponse> {
  // Create chat
  const { data: chat, error } = await supabase
    .from('chats')
    .insert({
      name: data.name,
      type: data.type || 'group',
      description: data.description || null,
      creator_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Add creator as owner
  await supabase.from('chat_members').insert({
    chat_id: chat.id,
    user_id: userId,
    role: 'owner',
  });

  // Add other members
  if (data.members && data.members.length > 0) {
    const memberRecords = data.members
      .filter(memberId => memberId !== userId)
      .map(memberId => ({
        chat_id: chat.id,
        user_id: memberId,
        role: 'member' as MemberRole,
      }));

    if (memberRecords.length > 0) {
      await supabase.from('chat_members').insert(memberRecords);
    }
  }

  return NextResponse.json({
    success: true,
    action: 'create-chat',
    chat,
  });
}

async function handleAddMembers(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: { chatId: string; userIds: string[] }
): Promise<NextResponse> {
  // Verify user has permission to add members
  const { data: membership } = await supabase
    .from('chat_members')
    .select('role')
    .eq('chat_id', data.chatId)
    .eq('user_id', userId)
    .single();

  if (!membership || membership.role === 'member') {
    return NextResponse.json(
      { success: false, error: 'Permission denied' },
      { status: 403 }
    );
  }

  const memberRecords = data.userIds.map(memberId => ({
    chat_id: data.chatId,
    user_id: memberId,
    role: 'member' as MemberRole,
  }));

  const { error } = await supabase
    .from('chat_members')
    .upsert(memberRecords, { onConflict: 'chat_id,user_id' });

  if (error) {
    throw new Error(error.message);
  }

  return NextResponse.json({
    success: true,
    action: 'add-members',
    addedCount: data.userIds.length,
  });
}

async function handleRemoveMember(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: { chatId: string; memberId: string }
): Promise<NextResponse> {
  // Verify user has permission
  const { data: membership } = await supabase
    .from('chat_members')
    .select('role')
    .eq('chat_id', data.chatId)
    .eq('user_id', userId)
    .single();

  if (!membership || membership.role === 'member') {
    return NextResponse.json(
      { success: false, error: 'Permission denied' },
      { status: 403 }
    );
  }

  // Soft remove by setting left_at
  const { error } = await supabase
    .from('chat_members')
    .update({ left_at: new Date().toISOString() })
    .eq('chat_id', data.chatId)
    .eq('user_id', data.memberId);

  if (error) {
    throw new Error(error.message);
  }

  return NextResponse.json({
    success: true,
    action: 'remove-member',
    memberId: data.memberId,
  });
}

async function handleLeaveChat(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: { chatId: string }
): Promise<NextResponse> {
  const { error } = await supabase
    .from('chat_members')
    .update({ left_at: new Date().toISOString() })
    .eq('chat_id', data.chatId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return NextResponse.json({
    success: true,
    action: 'leave-chat',
    chatId: data.chatId,
  });
}

async function handleArchiveChat(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: { chatId: string; archive: boolean }
): Promise<NextResponse> {
  // Update user's chat settings
  await supabase
    .from('chat_settings')
    .upsert({
      chat_id: data.chatId,
      user_id: userId,
      is_archived: data.archive,
    }, { onConflict: 'chat_id,user_id' });

  return NextResponse.json({
    success: true,
    action: 'archive-chat',
    chatId: data.chatId,
    archived: data.archive,
  });
}

async function handleUpdateChat(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: { chatId: string; name?: string; description?: string; avatarUrl?: string }
): Promise<NextResponse> {
  // Verify user has permission
  const { data: membership } = await supabase
    .from('chat_members')
    .select('role')
    .eq('chat_id', data.chatId)
    .eq('user_id', userId)
    .single();

  if (!membership || membership.role === 'member') {
    return NextResponse.json(
      { success: false, error: 'Permission denied' },
      { status: 403 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (data.name) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.avatarUrl) updates.avatar_url = data.avatarUrl;

  const { data: chat, error } = await supabase
    .from('chats')
    .update(updates)
    .eq('id', data.chatId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return NextResponse.json({
    success: true,
    action: 'update-chat',
    chat,
  });
}

async function handleTypingIndicator(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: { chatId: string; typing: boolean }
): Promise<NextResponse> {
  if (data.typing) {
    await supabase
      .from('typing_indicators')
      .upsert({
        chat_id: data.chatId,
        user_id: userId,
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10000).toISOString(),
      }, { onConflict: 'chat_id,user_id' });
  } else {
    await supabase
      .from('typing_indicators')
      .delete()
      .eq('chat_id', data.chatId)
      .eq('user_id', userId);
  }

  return NextResponse.json({
    success: true,
    action: 'typing',
    typing: data.typing,
  });
}

async function handleSearch(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  data: { query: string; chatId?: string; limit?: number }
): Promise<NextResponse> {
  let query = supabase
    .from('messages')
    .select(`
      *,
      chats!inner (
        id,
        name,
        type
      )
    `)
    .ilike('text', `%${data.query}%`)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(data.limit || 20);

  if (data.chatId) {
    query = query.eq('chat_id', data.chatId);
  }

  const { data: messages, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return NextResponse.json({
    success: true,
    action: 'search',
    query: data.query,
    results: messages || [],
    total: messages?.length || 0,
  });
}

async function handleAIAssist(data: {
  type: 'suggest' | 'translate' | 'summarize' | 'compose';
  text?: string;
  context?: string;
  targetLanguage?: string;
  prompt?: string;
}): Promise<NextResponse> {
  const assistanceType = data.type || 'suggest';
  let result: Record<string, unknown> = {};

  switch (assistanceType) {
    case 'suggest':
      result = {
        suggestions: [
          { text: 'Sure, I can schedule a call for tomorrow at 2 PM. Does that work for you?', tone: 'professional', confidence: 0.92 },
          { text: 'Absolutely! Let me check my calendar and get back to you.', tone: 'friendly', confidence: 0.88 },
          { text: "I'd be happy to discuss this. How about a quick 30-minute call?", tone: 'casual', confidence: 0.85 },
        ],
        context: 'Client is requesting a meeting',
        sentiment: 'positive',
      };
      break;

    case 'translate':
      result = {
        original: data.text,
        translated: data.text, // Would use actual translation API
        targetLanguage: data.targetLanguage || 'es',
        confidence: 0.95,
      };
      break;

    case 'summarize':
      result = {
        summary: 'Discussion about project timeline and next steps.',
        keyPoints: ['Timeline review', 'Resource allocation', 'Milestone planning'],
        actionItems: ['Schedule follow-up call', 'Send updated proposal'],
        sentiment: 'positive',
        urgency: 'medium',
      };
      break;

    case 'compose':
      result = {
        composedMessage: data.prompt
          ? `Based on your request: "${data.prompt}", here's a suggested response: I appreciate your feedback and would be happy to schedule a call. I have availability tomorrow from 2-4 PM EST.`
          : 'Please provide a prompt for AI composition',
        tone: 'professional',
        confidence: 0.89,
      };
      break;
  }

  return NextResponse.json({
    success: true,
    action: 'ai-assist',
    assistanceType,
    result,
  });
}
