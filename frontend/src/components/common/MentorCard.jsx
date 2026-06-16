import { Link } from 'react-router-dom'
import { MapPin, Users, BookOpen, CheckCircle } from 'lucide-react'
import clsx from 'clsx'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import StarRating from '@/components/ui/StarRating'

const MentorCard = ({ mentor, className }) => {
  const {
    id,
    name,
    title,
    subjects = [],
    rating = 0,
    reviewCount = 0,
    students = 0,
    location,
    verified,
    online,
    avatarUrl,
  } = mentor

  return (
    <Link
      to={`/mentor/${id}`}
      className={clsx(
        'group glass-panel p-5 rounded-2xl hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <Avatar src={avatarUrl} name={name} size="lg" online={online} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-800 truncate group-hover:text-primary-700 transition-colors">
              {name}
            </h3>
            {verified && <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />}
          </div>
          {title && <p className="text-sm text-slate-500 truncate mt-0.5">{title}</p>}
          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={rating} size="sm" showValue count={reviewCount} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {subjects.slice(0, 3).map((s) => (
          <Badge key={s} variant="primary" size="sm">{s}</Badge>
        ))}
        {subjects.length > 3 && (
          <Badge variant="neutral" size="sm">+{subjects.length - 3}</Badge>
        )}
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        {location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> {students} students
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" /> {subjects.length} subjects
        </span>
      </div>
    </Link>
  )
}

export default MentorCard
