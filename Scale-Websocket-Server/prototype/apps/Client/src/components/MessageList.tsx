import { useRef, useEffect, useState } from 'react'
import type { Message } from '../types'
import Avatar from './Avatar'

type Props = {
  messages: Message[]
}

const QUICK_REACTIONS = ['😊', '👍', '🚀', '❤️']

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const formatDate = (d: Date) => {
  const today     = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString())     return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

const isGroupedWithPrev = (msg: Message, prev?: Message) =>
  !!prev &&
  prev.userId === msg.userId &&
  msg.timestamp.getTime() - prev.timestamp.getTime() < 5 * 60_000

// ── Component ─────────────────────────────────────────────────────────────────

const MessageList = ({ messages }: Props) => {
  const endRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  // Local reaction state (initialised from message data)
  const [reactions, setReactions] = useState<Record<string, { emoji: string; count: number }[]>>(
    () => Object.fromEntries(messages.map(m => [m.id, m.reactions ?? []]))
  )

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addReaction = (msgId: string, emoji: string) => {
    setReactions(prev => {
      const cur = prev[msgId] ?? []
      const idx = cur.findIndex(r => r.emoji === emoji)
      if (idx >= 0) {
        const updated = [...cur]
        updated[idx] = { emoji, count: updated[idx].count + 1 }
        return { ...prev, [msgId]: updated }
      }
      return { ...prev, [msgId]: [...cur, { emoji, count: 1 }] }
    })
  }

  if (messages.length === 0) {
    return <div className="flex-1" />
  }

  return (
    <div className="space-y-0.5">

      {/* Date separator */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm">
          {formatDate(messages[0].timestamp)}
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Messages */}
      {messages.map((msg, idx) => {
        const grouped      = isGroupedWithPrev(msg, messages[idx - 1])
        const msgReactions = reactions[msg.id] ?? []

        return (
          <div
            key={msg.id}
            className={`group relative flex gap-3 px-3 py-1 rounded-xl hover:bg-gray-50/80 transition-colors ${grouped ? 'pl-[60px]' : 'mt-3'}`}
            onMouseEnter={() => setHovered(msg.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Avatar — only for the first message in a group */}
            {!grouped && (
              <div className="mt-0.5">
                <Avatar code={msg.avatar} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Username + timestamp — only for the first message in a group */}
              {!grouped && (
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="font-extrabold text-gray-900 text-sm hover:underline cursor-pointer">
                    {msg.username}
                  </span>
                  <span className="text-gray-400 text-xs">{formatTime(msg.timestamp)}</span>
                </div>
              )}

              <p className="text-gray-800 text-sm leading-relaxed break-words">{msg.text}</p>

              {/* Reaction pills */}
              {msgReactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {msgReactions.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => addReaction(msg.id, r.emoji)}
                      className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full px-2.5 py-0.5 transition-all font-medium"
                    >
                      <span className="text-base leading-none">{r.emoji}</span>
                      <span className="text-blue-600">{r.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hover action toolbar */}
            {hovered === msg.id && (
              <div className="absolute right-3 -top-4 flex items-center gap-0.5 bg-white border border-gray-200 rounded-xl shadow-lg px-1.5 py-1 z-10">
                {QUICK_REACTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => addReaction(msg.id, emoji)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-lg transition-all leading-none"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}

                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* Reply */}
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all" title="Reply in thread">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>

                {/* More */}
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all" title="More actions">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Scroll anchor */}
      <div ref={endRef} />
    </div>
  )
}

export default MessageList
