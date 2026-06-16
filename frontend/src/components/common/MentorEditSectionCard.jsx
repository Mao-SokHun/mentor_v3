import clsx from 'clsx'
import MentorProfileSectionHeader from './MentorProfileSectionHeader'

/**
 * Solid white section card for mentor Edit Profile — consistent padding, border, shadow.
 */
const MentorEditSectionCard = ({
  icon: Icon,
  title,
  action,
  hint,
  children,
  className,
  bodyClassName,
  overflowVisible = false,
}) => (
  <section
    className={clsx(
      'rounded-xl border border-slate-200 bg-white shadow-sm',
      overflowVisible && 'overflow-visible',
      className
    )}
  >
    <div className={clsx('p-4', bodyClassName)}>
      {title && Icon ? (
        <MentorProfileSectionHeader icon={Icon} title={title} action={action} />
      ) : null}
      {hint ? (
        <p className="text-xs text-slate-500 -mt-1 mb-3 leading-relaxed">{hint}</p>
      ) : null}
      {children}
    </div>
  </section>
)

export default MentorEditSectionCard
