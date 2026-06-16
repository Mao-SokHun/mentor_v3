import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { brand } from '@/constants'

const RokkruLogo = ({ to = '/', className, size = 'md', showText = true }) => {
  const sizes = {
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-base' },
    md: { box: 'w-9 h-9', icon: 'w-4 h-4', text: 'text-lg' },
    lg: { box: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-lg' },
  }
  const s = sizes[size] || sizes.md

  const content = (
    <>
      <div className={clsx(s.box, 'rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0')}>
        <Sparkles className={clsx(s.icon, 'text-white')} />
      </div>
      {showText && (
        <span className={clsx('font-bold text-primary-600 capitalize', s.text)}>{brand.name}</span>
      )}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={clsx('flex items-center gap-2', className)}>
        {content}
      </Link>
    )
  }

  return <div className={clsx('flex items-center gap-2', className)}>{content}</div>
}

export default RokkruLogo
