import { useRef, useEffect } from 'react'

type Props = {
  value: string
  placeholder: string
  onChange: (text: string) => void
  onSend: () => void
}

const FORMATTING_BUTTONS = [
  { label: 'B',    title: 'Bold',          cls: 'font-black text-gray-700' },
  { label: 'I',    title: 'Italic',        cls: 'italic text-gray-600' },
  { label: 'S',    title: 'Strikethrough', cls: 'line-through text-gray-600' },
]

const MessageInput = ({ value, placeholder, onChange, onSend }: Props) => {
  const textRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow textarea height as the user types
  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto'
      textRef.current.style.height = `${Math.min(textRef.current.scrollHeight, 200)}px`
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="px-5 pb-5 pt-2 shrink-0">
      <div className="border border-gray-300 rounded-2xl shadow-sm hover:border-gray-400 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition-all bg-white overflow-hidden">

        {/* Formatting toolbar */}
        <div className="flex items-center gap-0.5 px-3 pt-2.5 pb-1 border-b border-gray-100">
          {FORMATTING_BUTTONS.map(({ label, title, cls }) => (
            <button
              key={title}
              title={title}
              className={`w-7 h-7 text-xs rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center ${cls}`}
            >
              {label}
            </button>
          ))}

          <div className="w-px h-4 bg-gray-200 mx-1" />

          {/* Link */}
          <button title="Link" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>

          {/* List */}
          <button title="List" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          </button>

          {/* Code */}
          <button title="Code block" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all text-xs font-mono font-bold">
            {'</>'}
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none outline-none bg-transparent leading-relaxed"
          style={{ minHeight: '44px', maxHeight: '200px' }}
        />

        {/* Bottom action bar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-0.5">

            {/* Emoji */}
            <button title="Emoji" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Attach */}
            <button title="Attach file" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            {/* Mention */}
            <button title="@mention" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </button>

            {/* Video */}
            <button title="Video call" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </button>
          </div>

          {/* Send button */}
          <button
            onClick={onSend}
            disabled={!value.trim()}
            className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all shadow-sm ${
              value.trim()
                ? 'bg-[#007a5a] hover:bg-[#148567] text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-gray-400 mt-1.5 px-1">
        <kbd className="font-mono bg-gray-100 border border-gray-200 rounded px-1">Enter</kbd> to send &nbsp;·&nbsp;
        <kbd className="font-mono bg-gray-100 border border-gray-200 rounded px-1">Shift + Enter</kbd> for new line
      </p>
    </div>
  )
}

export default MessageInput
