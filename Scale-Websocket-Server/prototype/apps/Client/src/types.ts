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
