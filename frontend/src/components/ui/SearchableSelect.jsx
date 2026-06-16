import { useState, useRef, useEffect, useId, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from '@/i18n'
import FieldLabel from './FieldLabel'

const normalizeOptions = (options) =>
  options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))

const MENU_GAP = 8

const matchesQuery = (label, optionValue, query) => {
  const q = query.trim()
  if (!q) return false
  const qLower = q.toLowerCase()
  const labelLower = label.toLowerCase()
  const valueLower = optionValue.toLowerCase()
  return (
    label.startsWith(q) ||
    valueLower.startsWith(qLower) ||
    labelLower.includes(qLower) ||
    valueLower.includes(qLower)
  )
}

/**
 * Combobox — type to filter options (starts-with). Does not list all items until user types.
 */
const SearchableSelect = ({
  label,
  labelClassName,
  value,
  onChange,
  options = [],
  pinnedOptions = [],
  placeholder,
  searchPlaceholder,
  error,
  hint,
  disabled,
  className,
  id: idProp,
  size = 'md',
  menuMinWidth,
  menuMaxHeight = 240,
  placement = 'bottom',
  /** When true, opening the menu lists all options (scrollable) without typing first */
  showAllOnOpen = false,
  /** When true, allow Enter or "Use …" to save a value not in the list */
  allowCustom = false,
  required = false,
  optional = false,
  optionalLabel,
}) => {
  const { t } = useTranslation()
  const resolvedOptionalLabel = optionalLabel ?? t('auth.optional')
  const resolvedPlaceholder = placeholder ?? t('common.select')
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? (allowCustom && placeholder ? placeholder : t('common.typeToSearch'))
  const autoId = useId()
  const id = idProp || autoId
  const listId = `${id}-listbox`
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuStyle, setMenuStyle] = useState(null)
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const menuRef = useRef(null)

  const items = normalizeOptions(options)
  const pinned = normalizeOptions(pinnedOptions)
  const selected = items.find((o) => o.value === value)

  const filtered = useMemo(() => {
    if (!query.trim()) return showAllOnOpen ? items : []
    return items.filter((o) => matchesQuery(o.label, o.value, query))
  }, [items, query, showAllOnOpen])

  const trimmedQuery = query.trim()

  const findExactMatch = useCallback(
    (text) => {
      const q = text.trim().toLowerCase()
      if (!q) return null
      return items.find(
        (o) => o.value.toLowerCase() === q || o.label.toLowerCase() === q
      )
    },
    [items]
  )

  const showCustomOption =
    allowCustom && Boolean(trimmedQuery) && !findExactMatch(trimmedQuery)

  const updateMenuPosition = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const width = Math.max(rect.width, menuMinWidth ?? 0)
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP
    const maxH = Math.min(menuMaxHeight, spaceBelow - MENU_GAP)

    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width,
      maxHeight: Math.max(80, maxH),
      zIndex: 9999,
      top: rect.bottom + MENU_GAP,
    })
  }, [menuMaxHeight, menuMinWidth, placement])

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
  }, [open, updateMenuPosition, filtered.length])

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      const target = e.target
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
      setQuery('')
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleFocus = () => {
    if (disabled) return
    setOpen(true)
    setQuery(selected?.label ?? (allowCustom ? value ?? '' : ''))
    requestAnimationFrame(() => inputRef.current?.select())
  }

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setOpen(false)
    setQuery('')
  }

  const commitQuery = () => {
    if (!trimmedQuery) return
    const match = findExactMatch(trimmedQuery)
    handleSelect(match ? match.value : trimmedQuery)
  }

  const handleInputKeyDown = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (findExactMatch(trimmedQuery)) {
      handleSelect(findExactMatch(trimmedQuery).value)
      return
    }
    if (allowCustom && trimmedQuery) {
      handleSelect(trimmedQuery)
      return
    }
    if (filtered[0]) handleSelect(filtered[0].value)
  }

  const inputCls = clsx(
    'glass-select-trigger w-full flex items-center justify-between gap-2 text-left transition-all duration-200',
    'border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-200/80 focus:border-primary-300',
    size === 'sm' ? 'px-2.5 py-1.5 text-xs rounded-lg' : 'px-4 py-3 text-base rounded-xl',
    open && 'ring-2 ring-primary-200/60 border-primary-300',
    error && 'border-red-400',
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className
  )

  const closedDisplay = value
    ? (selected?.label ?? (allowCustom ? value : ''))
    : ''

  const labelCls =
    labelClassName ||
    (size === 'sm'
      ? 'label-field text-slate-600 mb-2'
      : 'block text-base font-medium text-slate-700 mb-2')

  const showPlaceholderOverlay = !open && !value
  const showMenu = open && menuStyle
  const menu = showMenu && (
    <ul
      ref={menuRef}
      id={listId}
      role="listbox"
      style={menuStyle}
      className="glass-select-menu py-1.5 overflow-y-auto"
    >
      {!query.trim() && !showAllOnOpen ? (
        <>
          {pinned.map((opt) => {
            const active = opt.value === value
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt.value)}
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
          <li className="px-3 py-2.5 text-xs text-slate-400">{resolvedSearchPlaceholder}</li>
        </>
      ) : filtered.length === 0 && !showCustomOption ? (
        <li className="px-3 py-2.5 text-xs text-slate-400">{t('common.noResults')}</li>
      ) : (
        <>
          {filtered.map((opt) => {
            const active = opt.value === value
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt.value)}
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
          {showCustomOption && (
            <li role="presentation">
              <button
                type="button"
                role="option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={commitQuery}
                className="w-full px-3 py-2.5 text-sm text-left select-menu-item text-primary-700 font-medium border-t border-slate-100/80"
              >
                {t('common.useCustomOption', { value: trimmedQuery })}
              </button>
            </li>
          )}
        </>
      )}
    </ul>
  )

  return (
    <div className="w-full relative" ref={rootRef}>
      <FieldLabel
        htmlFor={id}
        label={label}
        required={required}
        optional={optional}
        optionalText={resolvedOptionalLabel}
        className={labelClassName}
      />
      <div className={clsx(inputCls, 'relative')}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          value={open ? query : closedDisplay}
          placeholder={open && !query ? resolvedPlaceholder : undefined}
          onFocus={handleFocus}
          onKeyDown={handleInputKeyDown}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!open) setOpen(true)
          }}
          className={clsx(
            'flex-1 min-w-0 bg-transparent outline-none font-medium',
            showPlaceholderOverlay
              ? 'text-transparent caret-slate-700'
              : 'text-slate-900 placeholder:text-slate-400 placeholder:font-normal'
          )}
        />
        {showPlaceholderOverlay && (
          <span
            className={clsx(
              'absolute inset-y-0 left-3 right-8 flex items-center pointer-events-none text-slate-400 font-normal truncate',
              size === 'sm' ? 'text-sm' : 'text-sm'
            )}
          >
            {resolvedPlaceholder}
          </span>
        )}
        <ChevronDown
          className={clsx(
            'w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 pointer-events-none',
            open && 'rotate-180'
          )}
        />
      </div>

      {menu && createPortal(menu, document.body)}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {hint && !error && <p className="mt-2 text-sm text-slate-400">{hint}</p>}
    </div>
  )
}

export default SearchableSelect
