import clsx from 'clsx'
import { TEXT } from '@/constants'

/**
 * @param {{
 *   title?: string,
 *   subtitle?: string,
 *   action?: import('react').ReactNode,
 *   className?: string,
 *   children?: import('react').ReactNode,
 * }} props
 */
const PageSection = ({ title, subtitle, action, className, children }) => (
  <section className={clsx('space-y-7 sm:space-y-8', className)}>
    {(title || subtitle || action) && (
      <div className="flex items-start justify-between gap-4 flex-wrap pt-2 sm:pt-3 pb-3 sm:pb-4">
        <div className="space-y-2">
          {title && <h2 className={TEXT.sectionTitle}>{title}</h2>}
          {subtitle && <p className={TEXT.sectionSubtitle}>{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
)

export default PageSection
