import type { Channel, DMUser, Message } from '../types'
import Avatar from './Avatar'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

type Props = {
  activeChannel?: Channel
  activeDM?: DMUser
  messages: Message[]
  inputText: string
  onInputChange: (text: string) => void
  onSend: () => void
}

const STATUS_DOT: Record<string, string> = {
  online:  'bg-green-400',
  away:    'bg-yellow-400',
  offline: 'bg-gray-400',
}

// ── Sub-component: Channel / DM intro banner ──────────────────────────────────

const IntroBanner = ({ activeChannel, activeDM }: Pick<Props, 'activeChannel' | 'activeDM'>) => (
  <div className="mb-8 pb-6 border-b border-gray-100">
    {activeChannel ? (
      <>
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-100 to-blue-100 flex items-center justify-center text-2xl font-black text-gray-600 mb-4 shadow-sm">
          #
        </div>
        <h3 className="text-2xl font-black text-gray-900">Welcome to #{activeChannel.name}!</h3>
        <p className="text-gray-500 text-sm mt-1 max-w-lg">
          {activeChannel.description}. This is the very beginning of the{' '}
          <strong>#{activeChannel.name}</strong> channel.
        </p>
      </>
    ) : activeDM ? (
      <>
        <Avatar code={activeDM.avatar} size="lg" />
        <h3 className="text-2xl font-black text-gray-900 mt-4">{activeDM.name}</h3>
        <p className="text-gray-500 text-sm mt-1">
          This is the beginning of your direct message history with{' '}
          <strong>{activeDM.name}</strong>.
        </p>
      </>
    ) : null}
  </div>
)

// ── Sub-component: Header ─────────────────────────────────────────────────────

const ChatHeader = ({ activeChannel, activeDM }: Pick<Props, 'activeChannel' | 'activeDM'>) => (
  <header className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white shadow-sm shrink-0">
    <div className="flex items-center gap-3">
      {activeChannel && (
        <>
          <span className="text-2xl font-light text-gray-400">#</span>
          <div>
            <h2 className="font-extrabold text-gray-900 text-base leading-tight">{activeChannel.name}</h2>
            <p className="text-gray-400 text-xs mt-0.5">{activeChannel.description}</p>
          </div>
        </>
      )}

      {activeDM && (
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Avatar code={activeDM.avatar} />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${STATUS_DOT[activeDM.status]}`} />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 text-base leading-tight">{activeDM.name}</h2>
            <p className="text-gray-400 text-xs mt-0.5 capitalize">{activeDM.status}</p>
          </div>
        </div>
      )}
    </div>

    {/* Action icons */}
    <div className="flex items-center gap-1">
      {/* Members */}
      <button className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all" title="Members">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Search */}
      <button className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all" title="Search">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Notifications */}
      <button className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all" title="Notifications">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>
    </div>
  </header>
)

// ── Main component ─────────────────────────────────────────────────────────────

const ChatArea = ({ activeChannel, activeDM, messages, inputText, onInputChange, onSend }: Props) => {
  const placeholder = activeChannel
    ? `Message #${activeChannel.name}`
    : `Message ${activeDM?.name ?? ''}`

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <ChatHeader activeChannel={activeChannel} activeDM={activeDM} />

      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <IntroBanner activeChannel={activeChannel} activeDM={activeDM} />
        <MessageList messages={messages} />
      </div>

      <MessageInput
        value={inputText}
        placeholder={placeholder}
        onChange={onInputChange}
        onSend={onSend}
      />
    </div>
  )
}

export default ChatArea
