import { useState } from 'react'
import type { Channel, DMUser } from '../types'
import { AVATAR_COLORS } from '../data'
import Avatar from './Avatar'

type Props = {
  channels: Channel[]
  dmUsers: DMUser[]
  activeChannelId: string
  onSelectChannel: (id: string) => void
}

const STATUS_DOT: Record<string, string> = {
  online:  'bg-green-400',
  away:    'bg-yellow-400',
  offline: 'bg-gray-500',
}

// ── Small helper: collapse/expand caret ──────────────────────────────────────

const Caret = ({ open }: { open: boolean }) => (
  <svg
    className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
)

// ── Small helper: unread badge ────────────────────────────────────────────────

const UnreadBadge = ({ count }: { count: number }) => (
  <span className="bg-white text-[#3f0e40] text-xs font-extrabold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
    {count}
  </span>
)

// ── Main component ────────────────────────────────────────────────────────────

const Sidebar = ({ channels, dmUsers, activeChannelId, onSelectChannel }: Props) => {
  const [channelsOpen, setChannelsOpen] = useState(true)
  const [dmsOpen, setDmsOpen]           = useState(true)

  return (
    <aside className="w-64 shrink-0 bg-[#3f0e40] flex flex-col h-full select-none">

      {/* ── Workspace header ── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-purple-900/60">
        <div>
          <h1 className="text-white font-extrabold text-lg leading-tight tracking-tight">Acme Corp</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
            <span className="text-purple-300 text-xs font-medium">You</span>
          </div>
        </div>
        <button className="text-purple-300 hover:text-white p-1 rounded hover:bg-white/10 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      {/* ── Search bar ── */}
      <div className="px-3 py-2.5">
        <button className="w-full flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-md px-3 py-1.5 text-purple-200 hover:text-white text-sm transition-all">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="flex-1 text-left text-xs">Search Acme Corp</span>
          <span className="text-xs text-purple-400 bg-white/10 px-1.5 py-0.5 rounded font-mono">⌘K</span>
        </button>
      </div>

      {/* ── Scrollable nav ── */}
      <nav className="flex-1 overflow-y-auto py-1">

        {/* Channels */}
        <section className="mb-1">
          <div className="flex items-center px-3 py-1 group">
            <button
              onClick={() => setChannelsOpen(!channelsOpen)}
              className="flex items-center gap-1 flex-1 text-left text-purple-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Caret open={channelsOpen} />
              Channels
            </button>
            <button className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-purple-400 hover:text-white hover:bg-white/10 rounded transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {channelsOpen && (
            <ul className="mt-0.5">
              {channels.map(ch => {
                const isActive = activeChannelId === `channel-${ch.id}`
                return (
                  <li key={ch.id}>
                    <button
                      onClick={() => onSelectChannel(`channel-${ch.id}`)}
                      className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm transition-all ${
                        isActive
                          ? 'bg-white/20 text-white font-semibold'
                          : ch.unread
                          ? 'text-white hover:bg-white/10 font-semibold'
                          : 'text-purple-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className={`text-base leading-none ${isActive || ch.unread ? 'text-white' : 'text-purple-400'}`}>#</span>
                      <span className="flex-1 text-left truncate">{ch.name}</span>
                      {!!ch.unread && ch.unread > 0 && !isActive && <UnreadBadge count={ch.unread} />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Direct Messages */}
        <section className="mt-2">
          <div className="flex items-center px-3 py-1 group">
            <button
              onClick={() => setDmsOpen(!dmsOpen)}
              className="flex items-center gap-1 flex-1 text-left text-purple-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Caret open={dmsOpen} />
              Direct Messages
            </button>
            <button className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-purple-400 hover:text-white hover:bg-white/10 rounded transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {dmsOpen && (
            <ul className="mt-0.5">
              {dmUsers.map(user => {
                const isActive = activeChannelId === `dm-${user.id}`
                return (
                  <li key={user.id}>
                    <button
                      onClick={() => onSelectChannel(`dm-${user.id}`)}
                      className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-sm transition-all ${
                        isActive
                          ? 'bg-white/20 text-white font-semibold'
                          : user.unread
                          ? 'text-white hover:bg-white/10 font-semibold'
                          : 'text-purple-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {/* Avatar with status dot */}
                      <div className="relative shrink-0">
                        <div className={`w-6 h-6 rounded-sm bg-linear-to-br ${AVATAR_COLORS[user.avatar] ?? 'from-gray-400 to-gray-600'} flex items-center justify-center text-white text-xs font-bold`}>
                          {user.name.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#3f0e40] ${STATUS_DOT[user.status]}`} />
                      </div>

                      <span className="flex-1 text-left truncate">{user.name}</span>
                      {!!user.unread && user.unread > 0 && !isActive && <UnreadBadge count={user.unread} />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </nav>

      {/* ── Current user profile ── */}
      <div className="border-t border-purple-900/60 p-3 flex items-center gap-2.5">
        <div className="relative shrink-0">
          <Avatar code="YO" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#3f0e40] bg-green-400 shadow-sm shadow-green-400/50" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold leading-tight truncate">You</p>
          <p className="text-purple-400 text-xs">Active now</p>
        </div>
        <button className="p-1.5 text-purple-400 hover:text-white hover:bg-white/10 rounded transition-all" title="Settings">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
