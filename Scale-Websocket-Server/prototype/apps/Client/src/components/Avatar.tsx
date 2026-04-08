import { AVATAR_COLORS } from '../data'

type AvatarSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-14 h-14 text-2xl',
}

const radiusClasses: Record<AvatarSize, string> = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-2xl',
}

type Props = {
  code: string
  size?: AvatarSize
}

const Avatar = ({ code, size = 'md' }: Props) => {
  const gradient = AVATAR_COLORS[code] ?? 'from-gray-400 to-gray-600'

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${radiusClasses[size]}
        bg-linear-to-br ${gradient}
        flex items-center justify-center
        text-white font-extrabold shrink-0
      `}
    >
      {code.slice(0, 2)}
    </div>
  )
}

export default Avatar
