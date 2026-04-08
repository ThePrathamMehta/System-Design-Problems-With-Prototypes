import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'

export type Message = {
  id: string
  userId: string
  username: string
  avatar: string
  text: string
  timestamp: Date
  reactions?: { emoji: string; count: number }[]
}

export type Channel = {
  id: string
  name: string
  description: string
  unread?: number
}

export type DMUser = {
  id: string
  name: string
  avatar: string
  status: 'online' | 'away' | 'offline'
  unread?: number
}

export const AVATAR_COLORS: Record<string, string> = {
  AJ: 'from-pink-500 to-rose-500',
  BS: 'from-blue-500 to-cyan-500',
  CW: 'from-green-500 to-emerald-500',
  DB: 'from-orange-500 to-amber-500',
  YO: 'from-indigo-500 to-purple-600',
}

export const CHANNELS: Channel[] = [
  { id: '1', name: 'general', description: 'Company-wide announcements and activity', unread: 0 },
  { id: '2', name: 'random', description: 'Non-work banter and fun stuff', unread: 3 },
  { id: '3', name: 'engineering', description: 'Technical discussions and code reviews' },
  { id: '4', name: 'design', description: 'Design team updates', unread: 1 },
  { id: '5', name: 'marketing', description: 'Marketing campaigns and metrics' },
]

export const DM_USERS: DMUser[] = [
  { id: 'u1', name: 'Alice Johnson', avatar: 'AJ', status: 'online', unread: 2 },
  { id: 'u2', name: 'Bob Smith', avatar: 'BS', status: 'away' },
  { id: 'u3', name: 'Carol White', avatar: 'CW', status: 'online' },
  { id: 'u4', name: 'Dave Brown', avatar: 'DB', status: 'offline' },
]

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'channel-1': [
    { id: 'm1', userId: 'u1', username: 'Alice Johnson', avatar: 'AJ', text: 'Good morning team! 👋 Hope everyone is having a great day.', timestamp: new Date(Date.now() - 3600000 * 3) },
    { id: 'm2', userId: 'u2', username: 'Bob Smith', avatar: 'BS', text: 'Morning Alice! Ready for the sprint review later today?', timestamp: new Date(Date.now() - 3600000 * 2.5) },
    { id: 'm3', userId: 'u2', username: 'Bob Smith', avatar: 'BS', text: 'I\'ve been polishing the demo since last night, should be solid 💪', timestamp: new Date(Date.now() - 3600000 * 2.4) },
    { id: 'm4', userId: 'u3', username: 'Carol White', avatar: 'CW', text: 'Absolutely! I\'ve prepared the slides and the live demo environment is set up 🚀', timestamp: new Date(Date.now() - 3600000 * 2), reactions: [{ emoji: '🚀', count: 3 }, { emoji: '❤️', count: 2 }] },
    { id: 'm5', userId: 'u1', username: 'Alice Johnson', avatar: 'AJ', text: 'Perfect. Let\'s sync 15 mins before to run through the plan quickly.', timestamp: new Date(Date.now() - 3600000 * 1.5) },
    { id: 'm6', userId: 'u4', username: 'Dave Brown', avatar: 'DB', text: 'I\'ll join a bit late — just wrapping up a hotfix. Save the good stuff for me 😄', timestamp: new Date(Date.now() - 3600000), reactions: [{ emoji: '😄', count: 4 }] },
  ],
  'channel-2': [
    { id: 'r1', userId: 'u3', username: 'Carol White', avatar: 'CW', text: 'Anyone watching the game tonight? 🏀', timestamp: new Date(Date.now() - 7200000) },
    { id: 'r2', userId: 'u2', username: 'Bob Smith', avatar: 'BS', text: 'Of course!! Already have snacks ready 🍿', timestamp: new Date(Date.now() - 7100000), reactions: [{ emoji: '🍿', count: 5 }] },
    { id: 'r3', userId: 'u4', username: 'Dave Brown', avatar: 'DB', text: 'Will join the watch party remotely. Discord stream?', timestamp: new Date(Date.now() - 7000000) },
  ],
  'channel-3': [
    { id: 'e1', userId: 'u1', username: 'Alice Johnson', avatar: 'AJ', text: 'PR #247 is ready for review. Adds WebSocket support with Redis pub/sub for horizontal scaling.', timestamp: new Date(Date.now() - 5400000) },
    { id: 'e2', userId: 'u4', username: 'Dave Brown', avatar: 'DB', text: 'Looking at it now. The connection pooling looks great. Left a few minor comments.', timestamp: new Date(Date.now() - 5000000) },
    { id: 'e3', userId: 'u1', username: 'Alice Johnson', avatar: 'AJ', text: 'Thanks! Addressing them now. Should be ready to merge after CI passes.', timestamp: new Date(Date.now() - 4500000), reactions: [{ emoji: '👍', count: 2 }] },
  ],
  'dm-u1': [
    { id: 'd1', userId: 'u1', username: 'Alice Johnson', avatar: 'AJ', text: 'Hey! Do you have a moment to review my PR? It\'s a pretty big one 🙈', timestamp: new Date(Date.now() - 1800000) },
    { id: 'd2', userId: 'me', username: 'You', avatar: 'YO', text: 'Sure! Give me 5 minutes, just finishing up a quick fix.', timestamp: new Date(Date.now() - 1700000) },
    { id: 'd3', userId: 'u1', username: 'Alice Johnson', avatar: 'AJ', text: 'No rush at all! Here\'s the link: github.com/acme/pr/247 👍', timestamp: new Date(Date.now() - 1600000) },
    { id: 'd4', userId: 'me', username: 'You', avatar: 'YO', text: 'Left some comments. Overall looks really clean! Just a few nits.', timestamp: new Date(Date.now() - 900000), reactions: [{ emoji: '🙏', count: 1 }] },
  ],
  'dm-u3': [
    { id: 'c1', userId: 'u3', username: 'Carol White', avatar: 'CW', text: 'Hey, can you share the Figma link for the new dashboard? Can\'t find it in the design channel.', timestamp: new Date(Date.now() - 3600000) },
    { id: 'c2', userId: 'me', username: 'You', avatar: 'YO', text: 'Sure, one sec! Let me grab it.', timestamp: new Date(Date.now() - 3550000) },
    { id: 'c3', userId: 'me', username: 'You', avatar: 'YO', text: 'figma.com/file/abc123/Dashboard-v2 — password is in 1Password under "Design Assets"', timestamp: new Date(Date.now() - 3500000) },
    { id: 'c4', userId: 'u3', username: 'Carol White', avatar: 'CW', text: 'Perfect, got it! Thanks so much 🙌', timestamp: new Date(Date.now() - 3400000), reactions: [{ emoji: '🙌', count: 1 }] },
  ],
}

const App = () => {
  const [activeChannelId, setActiveChannelId] = useState<string>('channel-1')
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES)
  const [inputText, setInputText] = useState('')

  const activeChannel = CHANNELS.find(c => `channel-${c.id}` === activeChannelId)
  const activeDM = DM_USERS.find(u => `dm-${u.id}` === activeChannelId)

  const handleSend = () => {
    if (!inputText.trim()) return
    const newMsg: Message = {
      id: Date.now().toString(),
      userId: 'me',
      username: 'You',
      avatar: 'YO',
      text: inputText.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
    }))
    setInputText('')
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-gray-100">
      <Sidebar
        channels={CHANNELS}
        dmUsers={DM_USERS}
        activeChannelId={activeChannelId}
        onSelectChannel={setActiveChannelId}
      />
      <ChatArea
        activeChannel={activeChannel}
        activeDM={activeDM}
        messages={messages[activeChannelId] || []}
        inputText={inputText}
        onInputChange={setInputText}
        onSend={handleSend}
      />
    </div>
  )
}

export default App