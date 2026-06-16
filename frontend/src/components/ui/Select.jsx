import { useState, useRef, useEffect, useId, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from '@/i18n'

const normalizeOptions = (options) =>
  options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))

const MENU_GAP = 8

/**
 * Custom dropdown — portal menu (not clipped by glass panels).
 * @param {'auto'|'bottom'} placement — bottom keeps menu below trigger when possible
 */
const Select = ({
  label,
  labelClassName,
  value,
  onChange,
  options = [],
  placeholder,
  error,
  hint,
  disabled,
  className,
  id: idProp,
  size = 'md',
  menuMinWidth,
  menuMaxHeight = 280,
  placement = 'bottom',
}) => {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder ?? t('common.select')
  const autoId = useId()
  const id = idProp || autoId
  const listId = `${id}-listbox`
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState(null)
  const [openUp, setOpenUp] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const items = normalizeOptions(options)

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const width = Math.max(rect.width, menuMinWidth ?? 0)
    const rowHeight = 40
    const estimatedHeight = Math.min(items.length * rowHeight + 12, menuMaxHeight)
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP
    const spaceAbove = rect.top - MENU_GAP

    let flipUp = false
    if (placement === 'bottom') {
      flipUp = false
    } else {
      flipUp =
        spaceBelow < Math.min(estimatedHeight, 160) &&
        spaceAbove > spaceBelow + 40
    }

    const maxH = flipUp
      ? Math.min(menuMaxHeight, spaceAbove - MENU_GAP)
      : Math.min(menuMaxHeight, spaceBelow - MENU_GAP)

    setOpenUp(flipUp)
    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width,
      maxHeight: Math.max(120, maxH),
      zIndex: 9999,
      ...(flipUp
        ? { bottom: window.innerHeight - rect.top + MENU_GAP }
        : { top: rect.bottom + MENU_GAP }),
    })
  }, [items.length, menuMaxHeight, menuMinWidth, placement])

  useEffect(() => {
    if (!open) return
    updateMenuPosition()
    const onScrollOrResize = () => updateMenuPosition()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [open, updateMenuPosition])

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      const t = e.target
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = items.find((o) => o.value === value)

  const labelCls =
    labelClassName ||
    (size === 'sm'
      ? 'label-field text-slate-600 mb-2'
      : 'block text-sm font-medium text-slate-700 mb-1.5')

  const triggerCls = clsx(
    'glass-select-trigger w-full flex items-center justify-between gap-2 text-left transition-all duration-200',
    'border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-200/80 focus:border-primary-300',
    size === 'sm' ? 'px-2.5 py-1.5 text-xs rounded-lg' : 'px-4 py-2.5 text-sm rounded-xl',
    open && !openUp && 'ring-2 ring-primary-200/60 border-primary-300',
    error && 'border-red-400',
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className,
  )

  const menu = open && menuStyle && (
    <ul
      ref={menuRef}
      id={listId}
      role="listbox"
      style={menuStyle}
      className="glass-select-menu py-1.5"
    >
      {items.map((opt) => {
        const active = opt.value === value
        return (
          <li key={opt.value} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={clsx(
                'w-full px-3 py-2.5 text-sm text-left flex items-center justify-between gap-2 select-menu-item',
                active && 'select-menu-item--active'
              )}
            >
              <span className="whitespace-normal break-words leading-snug">{opt.label}</span>
              {active && <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />}
            </button>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="w-full relative" ref={rootRef}>
      {label && (
        <label htmlFor={id} className={labelCls}>
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        onClick={() => {
          if (!open) updateMenuPosition()
          setOpen((v) => !v)
        }}
        className={triggerCls}
      >
        <span
          className={clsx('truncate font-medium text-slate-900', !selected && 'text-slate-600')}
          title={selected?.label ?? resolvedPlaceholder}
        >
          {selected?.label ?? resolvedPlaceholder}
        </span>
        <ChevronDown
          className={clsx(
            'w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {menu && createPortal(menu, document.body)}

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export default Select
