import { Star } from 'lucide-react'
import clsx from 'clsx'

const starSizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }
const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }

const StarRating = ({ rating = 0, max = 5, size = 'sm', showValue, count }) => {
  const safeRating = Number(rating) || 0
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={clsx(
              starSizes[size],
              i < Math.floor(safeRating)
                ? 'fill-amber-400 text-amber-400'
                : i < safeRating
                ? 'fill-amber-200 text-amber-300'
                : 'fill-slate-100 text-slate-300'
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className={clsx('font-semibold text-slate-700', textSizes[size])}>
          {safeRating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className={clsx('text-slate-400', textSizes[size])}>({count})</span>
      )}
    </div>
  )
}

export default StarRating
