import clsx from 'clsx'
import EmptyState from '@/components/ui/EmptyState'
import MentorRowCard from './MentorRowCard'
import MentorScheduleCard from './MentorScheduleCard'
import { useTranslation } from '@/i18n'

const MentorList = ({
  mentors = [],
  scheduleItems = [],
  loading = false,
  variant = 'list',
  timeSlot,
  emptyTitle,
  emptyDescription,
  className,
}) => {
  const { t } = useTranslation()
  const resolvedTitle = emptyTitle ?? t('filters.noMentors')
  const resolvedDesc = emptyDescription ?? t('filters.noMentorsHint')

  if (loading) {
    const skeletonClass =
      variant === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'
        : 'flex flex-col gap-3 sm:gap-3.5'
    return (
      <div className={clsx(skeletonClass, className)}>
        {Array.from({ length: variant === 'grid' ? 8 : 3 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'animate-pulse rounded-2xl bg-slate-100 border border-slate-200/60',
              variant === 'grid' ? 'h-52' : 'h-[120px]'
            )}
          />
        ))}
      </div>
    )
  }

  const gridRows =
    scheduleItems.length > 0
      ? scheduleItems
      : mentors.map((mentor) => ({ postId: mentor.id, mentor, timeSlot }))

  if (!gridRows.length && !mentors.length) {
    return <EmptyState title={resolvedTitle} description={resolvedDesc} />
  }

  if (variant === 'grid') {
    return (
      <div
        className={clsx(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5',
          className
        )}
      >
        {gridRows.map((row) => (
          <MentorScheduleCard
            key={row.postId ?? row.mentor?.id}
            postId={row.postId}
            mentor={row.mentor}
            sessionDate={row.sessionDate}
            timeSlot={row.timeSlot ?? timeSlot}
            sessionTitle={row.title}
            provinceName={row.provinceName}
            sessionNotes={row.sessionNotes}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={clsx('flex flex-col gap-3 sm:gap-3.5', className)}>
      {mentors.map((mentor) => (
        <MentorRowCard key={mentor.id} mentor={mentor} />
      ))}
    </div>
  )
}

export default MentorList
