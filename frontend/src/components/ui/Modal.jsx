import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import clsx from 'clsx'

/**
 * Modal / Dialog overlay
 * Props:
 *   open        boolean
 *   onClose     () => void
 *   title       string
 *   description string
 *   size        'sm' | 'md' | 'lg' | 'xl'  (default 'md')
 *   children    ReactNode  — modal body
 *   footer      ReactNode  — rendered below body (e.g. action buttons)
 *   closeOnBackdrop  boolean (default true)
 */
const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

const Modal = ({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnBackdrop = true,
  className,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={clsx(
          'modal-panel rounded-2xl w-full',
          sizes[size] || sizes.md,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-start justify-between p-5 border-b border-slate-100">
            <div>
              {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}
              {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 ml-3 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        {children && <div className="p-5">{children}</div>}

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 p-5 pt-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default Modal
