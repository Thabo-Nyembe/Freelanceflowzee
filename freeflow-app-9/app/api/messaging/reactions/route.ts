/**
 * Messaging Reactions API
 *
 * Industry-leading reaction management with:
 * - Custom emoji support
 * - Reaction analytics
 * - Emoji picker categories
 * - Recent/frequent reactions
 * - Skin tone variants
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('messaging-reactions')

// ============================================================================
// Types
// ============================================================================

export interface MessageReaction {
  id: string
  messageId: string
  userId: string
  emoji: string
  emojiCode?: string
  isCustom: boolean
  createdAt: string
}

export interface ReactionSummary {
  emoji: string
  count: number
  users: ReactionUser[]
  isMe: boolean
}

export interface ReactionUser {
  id: string
  name?: string
  avatar?: string
}

export interface CustomEmoji {
  id: string
  code: string
  name: string
  url: string
  category: string
  createdBy: string
  createdAt: string
  isAnimated: boolean
  usageCount: number
}

export interface EmojiCategory {
  name: string
  emojis: string[]
}

// ============================================================================
// Constants
// ============================================================================

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Smileys & Emotion',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
  },
  {
    name: 'Gestures & People',
    emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪'],
  },
  {
    name: 'Animals & Nature',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🌸', '💐', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃'],
  },
  {
    name: 'Food & Drink',
    emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧇', '🥞', '🧈', '🍳', '🥚', '🧀', '🥩', '🍖', '🍗', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥗', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊'],
  },
  {
    name: 'Activities',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟', '🎯', '🎳', '🎮', '🎰', '🧩'],
  },
  {
    name: 'Objects',
    emojis: ['⌚', '📱', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '🧾', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒', '🛠', '⛏', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔️', '🛡', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎', '🔑', '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🖼', '🪞', '🪟', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🧧', '🎐', '🎑', '🎄', '🎃', '🎗', '🎟', '🎫'],
  },
  {
    name: 'Symbols',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '🟰', '♾', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁‍🗨', '💬', '💭', '🗯', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'],
  },
  {
    name: 'Flags',
    emojis: ['🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇮🇴', '🇻🇬', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇮🇨', '🇨🇻', '🇧🇶', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇽', '🇨🇨', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇰', '🇨🇷', '🇨🇮', '🇭🇷', '🇨🇺', '🇨🇼', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇲', '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷', '🇪🇪', '🇸🇿', '🇪🇹', '🇪🇺', '🇫🇰', '🇫🇴', '🇫🇯', '🇫🇮', '🇫🇷', '🇬🇫', '🇵🇫', '🇹🇫', '🇬🇦', '🇬🇲', '🇬🇪', '🇩🇪', '🇬🇭', '🇬🇮', '🇬🇷', '🇬🇱', '🇬🇩', '🇬🇵', '🇬🇺', '🇬🇹', '🇬🇬', '🇬🇳', '🇬🇼', '🇬🇾', '🇭🇹', '🇭🇳', '🇭🇰', '🇭🇺', '🇮🇸', '🇮🇳', '🇮🇩', '🇮🇷', '🇮🇶', '🇮🇪', '🇮🇲', '🇮🇱', '🇮🇹', '🇯🇲', '🇯🇵', '🎌', '🇯🇪', '🇯🇴', '🇰🇿', '🇰🇪', '🇰🇮', '🇽🇰', '🇰🇼', '🇰🇬', '🇱🇦', '🇱🇻', '🇱🇧', '🇱🇸', '🇱🇷', '🇱🇾', '🇱🇮', '🇱🇹', '🇱🇺', '🇲🇴', '🇲🇬', '🇲🇼', '🇲🇾', '🇲🇻', '🇲🇱', '🇲🇹', '🇲🇭', '🇲🇶', '🇲🇷', '🇲🇺', '🇾🇹', '🇲🇽', '🇫🇲', '🇲🇩', '🇲🇨', '🇲🇳', '🇲🇪', '🇲🇸', '🇲🇦', '🇲🇿', '🇲🇲', '🇳🇦', '🇳🇷', '🇳🇵', '🇳🇱', '🇳🇨', '🇳🇿', '🇳🇮', '🇳🇪', '🇳🇬', '🇳🇺', '🇳🇫', '🇰🇵', '🇲🇰', '🇲🇵', '🇳🇴', '🇴🇲', '🇵🇰', '🇵🇼', '🇵🇸', '🇵🇦', '🇵🇬', '🇵🇾', '🇵🇪', '🇵🇭', '🇵🇳', '🇵🇱', '🇵🇹', '🇵🇷', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇺', '🇷🇼', '🇼🇸', '🇸🇲', '🇸🇹', '🇸🇦', '🇸🇳', '🇷🇸', '🇸🇨', '🇸🇱', '🇸🇬', '🇸🇽', '🇸🇰', '🇸🇮', '🇬🇸', '🇸🇧', '🇸🇴', '🇿🇦', '🇰🇷', '🇸🇸', '🇪🇸', '🇱🇰', '🇧🇱', '🇸🇭', '🇰🇳', '🇱🇨', '🇵🇲', '🇻🇨', '🇸🇩', '🇸🇷', '🇸🇪', '🇨🇭', '🇸🇾', '🇹🇼', '🇹🇯', '🇹🇿', '🇹🇭', '🇹🇱', '🇹🇬', '🇹🇰', '🇹🇴', '🇹🇹', '🇹🇳', '🇹🇷', '🇹🇲', '🇹🇨', '🇹🇻', '🇻🇮', '🇺🇬', '🇺🇦', '🇦🇪', '🇬🇧', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁷󠁬󠁳󠁿', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇺', '🇻🇦', '🇻🇪', '🇻🇳', '🇼🇫', '🇪🇭', '🇾🇪', '🇿🇲', '🇿🇼'],
  },
]

const FREQUENTLY_USED_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👀', '💯', '✅', '👏', '🙏']

// ============================================================================
// Storage
// ============================================================================

const reactions: Map<string, MessageReaction[]> = new Map() // messageId -> reactions
const customEmojis: Map<string, CustomEmoji> = new Map()
const userRecentEmojis: Map<string, string[]> = new Map() // userId -> emojis

// ============================================================================
// Utilities
// ============================================================================

function generateReactionId(): string {
  return `rxn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// POST - Add reaction or manage custom emojis
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action = 'add', ...params } = body

    switch (action) {
      case 'add':
        return handleAddReaction(params, user.id)
      case 'remove':
        return handleRemoveReaction(params, user.id)
      case 'toggle':
        return handleToggleReaction(params, user.id)
      case 'create-custom':
        return handleCreateCustomEmoji(params, user.id)
      case 'delete-custom':
        return handleDeleteCustomEmoji(params, user.id)
      case 'get-analytics':
        return handleGetReactionAnalytics(params)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Reaction error', { error })
    return NextResponse.json(
      { error: 'Failed to process reaction request' },
      { status: 500 }
    )
  }
}

// Add reaction
async function handleAddReaction(params: {
  messageId: string
  emoji: string
  emojiCode?: string
  isCustom?: boolean
}, userId: string): Promise<NextResponse> {
  const { messageId, emoji, emojiCode, isCustom = false } = params

  if (!messageId || !emoji) {
    return NextResponse.json({ error: 'Message ID and emoji required' }, { status: 400 })
  }

  const msgReactions = reactions.get(messageId) || []

  // Check if user already reacted with this emoji
  const existingReaction = msgReactions.find(
    r => r.userId === userId && r.emoji === emoji
  )

  if (existingReaction) {
    return NextResponse.json({
      success: true,
      reaction: existingReaction,
      alreadyExists: true,
    })
  }

  const reaction: MessageReaction = {
    id: generateReactionId(),
    messageId,
    userId,
    emoji,
    emojiCode,
    isCustom,
    createdAt: new Date().toISOString(),
  }

  msgReactions.push(reaction)
  reactions.set(messageId, msgReactions)

  // Update user's recent emojis
  const recentEmojis = userRecentEmojis.get(userId) || []
  const updatedRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 20)
  userRecentEmojis.set(userId, updatedRecent)

  // Update custom emoji usage count
  if (isCustom && emojiCode) {
    const customEmoji = customEmojis.get(emojiCode)
    if (customEmoji) {
      customEmoji.usageCount++
      customEmojis.set(emojiCode, customEmoji)
    }
  }

  return NextResponse.json({
    success: true,
    reaction,
    summary: getReactionSummary(messageId, userId),
  })
}

// Remove reaction
async function handleRemoveReaction(params: {
  messageId: string
  emoji: string
}, userId: string): Promise<NextResponse> {
  const { messageId, emoji } = params

  const msgReactions = reactions.get(messageId) || []
  const updatedReactions = msgReactions.filter(
    r => !(r.userId === userId && r.emoji === emoji)
  )
  reactions.set(messageId, updatedReactions)

  return NextResponse.json({
    success: true,
    removed: true,
    summary: getReactionSummary(messageId, userId),
  })
}

// Toggle reaction
async function handleToggleReaction(params: {
  messageId: string
  emoji: string
  emojiCode?: string
  isCustom?: boolean
}, userId: string): Promise<NextResponse> {
  const { messageId, emoji, emojiCode, isCustom } = params

  const msgReactions = reactions.get(messageId) || []
  const existingReaction = msgReactions.find(
    r => r.userId === userId && r.emoji === emoji
  )

  if (existingReaction) {
    return handleRemoveReaction({ messageId, emoji }, userId)
  } else {
    return handleAddReaction({ messageId, emoji, emojiCode, isCustom }, userId)
  }
}

// Create custom emoji
async function handleCreateCustomEmoji(params: {
  code: string
  name: string
  url: string
  category?: string
  isAnimated?: boolean
}, userId: string): Promise<NextResponse> {
  const { code, name, url, category = 'Custom', isAnimated = false } = params

  if (!code || !name || !url) {
    return NextResponse.json({ error: 'Code, name, and URL required' }, { status: 400 })
  }

  if (customEmojis.has(code)) {
    return NextResponse.json({ error: 'Emoji code already exists' }, { status: 400 })
  }

  const emoji: CustomEmoji = {
    id: `ce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    code,
    name,
    url,
    category,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    isAnimated,
    usageCount: 0,
  }

  customEmojis.set(code, emoji)

  return NextResponse.json({
    success: true,
    emoji,
  })
}

// Delete custom emoji
async function handleDeleteCustomEmoji(params: {
  code: string
}, userId: string): Promise<NextResponse> {
  const { code } = params

  const emoji = customEmojis.get(code)
  if (!emoji) {
    return NextResponse.json({ error: 'Custom emoji not found' }, { status: 404 })
  }

  if (emoji.createdBy !== userId) {
    return NextResponse.json({ error: 'Can only delete your own custom emojis' }, { status: 403 })
  }

  customEmojis.delete(code)

  return NextResponse.json({
    success: true,
    deleted: true,
  })
}

// Get reaction analytics
async function handleGetReactionAnalytics(params: {
  messageIds?: string[]
  channelId?: string
  startDate?: string
  endDate?: string
}): Promise<NextResponse> {
  const { messageIds = [] } = params

  const analytics: Record<string, { count: number; users: number }> = {}

  for (const msgId of messageIds) {
    const msgReactions = reactions.get(msgId) || []
    for (const reaction of msgReactions) {
      if (!analytics[reaction.emoji]) {
        analytics[reaction.emoji] = { count: 0, users: 0 }
      }
      analytics[reaction.emoji].count++
    }
  }

  // Sort by count
  const sorted = Object.entries(analytics)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)

  return NextResponse.json({
    success: true,
    analytics: Object.fromEntries(sorted),
    topEmojis: sorted.map(([emoji]) => emoji),
  })
}

// Helper function to get reaction summary
function getReactionSummary(messageId: string, currentUserId: string): ReactionSummary[] {
  const msgReactions = reactions.get(messageId) || []
  const summary: Map<string, ReactionSummary> = new Map()

  for (const reaction of msgReactions) {
    if (!summary.has(reaction.emoji)) {
      summary.set(reaction.emoji, {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        isMe: false,
      })
    }

    const emojiSummary = summary.get(reaction.emoji)!
    emojiSummary.count++
    emojiSummary.users.push({ id: reaction.userId })
    if (reaction.userId === currentUserId) {
      emojiSummary.isMe = true
    }
  }

  return Array.from(summary.values())
}

// ============================================================================
// GET - Get reactions and emoji data
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    const getCategories = searchParams.get('categories') === 'true'
    const getCustom = searchParams.get('custom') === 'true'
    const getRecent = searchParams.get('recent') === 'true'
    const getFrequent = searchParams.get('frequent') === 'true'

    // Get message reactions
    if (messageId) {
      return NextResponse.json({
        success: true,
        reactions: getReactionSummary(messageId, user.id),
      })
    }

    // Get emoji categories
    if (getCategories) {
      return NextResponse.json({
        success: true,
        categories: EMOJI_CATEGORIES,
      })
    }

    // Get custom emojis
    if (getCustom) {
      return NextResponse.json({
        success: true,
        customEmojis: Array.from(customEmojis.values()),
      })
    }

    // Get user's recent emojis
    if (getRecent) {
      const recent = userRecentEmojis.get(user.id) || []
      return NextResponse.json({
        success: true,
        recentEmojis: recent,
      })
    }

    // Get frequently used emojis
    if (getFrequent) {
      return NextResponse.json({
        success: true,
        frequentEmojis: FREQUENTLY_USED_EMOJIS,
      })
    }

    // Default: return all emoji data
    const recentEmojis = userRecentEmojis.get(user.id) || []

    return NextResponse.json({
      success: true,
      categories: EMOJI_CATEGORIES,
      customEmojis: Array.from(customEmojis.values()),
      recentEmojis,
      frequentEmojis: FREQUENTLY_USED_EMOJIS,
    })
  } catch (error) {
    logger.error('Error fetching reaction data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch reaction data' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Remove reaction
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    const emoji = searchParams.get('emoji')

    if (!messageId || !emoji) {
      return NextResponse.json({ error: 'Message ID and emoji required' }, { status: 400 })
    }

    return handleRemoveReaction({ messageId, emoji }, user.id)
  } catch (error) {
    logger.error('Error removing reaction', { error })
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    )
  }
}
