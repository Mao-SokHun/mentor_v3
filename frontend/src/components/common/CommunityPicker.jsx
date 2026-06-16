import { useMemo, useState, useEffect, useCallback } from 'react'
import { Check, Search } from 'lucide-react'
import clsx from 'clsx'
import SearchableSelect from '@/components/ui/SearchableSelect'
import { useTranslation } from '@/i18n'
import { findCommunityById, filterCommunities } from '@/constants'
import { useCommunities } from '@/hooks/useCommunities'

/**
 * Major / subject community picker.
 * @param {'default'|'sheet'} variant — sheet = compact grid for create-post modal
 */
const CommunityPicker = ({
  value,
  onChange,
  onSelect,
  mode = 'select',
  className,
  fill = false,
  maxHeight,
  compact = false,
  variant = 'default',
  browseOpen: browseOpenProp,
  onBrowseOpenChange,
}) => {
  const { t, labelFor } = useTranslation()
  const [tab, setTab] = useState('major')
  const [searchQuery, setSearchQuery] = useState('')
  const [internalBrowseOpen, setInternalBrowseOpen] = useState(true)
  const isSheet = variant === 'sheet'
  const browseOpen = browseOpenProp ?? internalBrowseOpen

  const setBrowseOpen = useCallback(
    (open) => {
      onBrowseOpenChange?.(open)
      if (browseOpenProp === undefined) setInternalBrowseOpen(open)
    },
    [browseOpenProp, onBrowseOpenChange]
  )

  const { communities: majorCommunities, loading: majorLoading } = useCommunities({ type: 'major' })
  const { communities: subjectCommunities, loading: subjectLoading } = useCommunities({
    type: 'subject',
  })
  const baseList = tab === 'major' ? majorCommunities : subjectCommunities
  const listLoading = tab === 'major' ? majorLoading : subjectLoading

  const filteredList = useMemo(() => {
    const q = searchQuery?.trim().toLowerCase()
    if (!q) return baseList
    return baseList.filter(
      (c) =>
        filterCommunities([c], searchQuery).length > 0 ||
        labelFor(c.label).toLowerCase().includes(q)
    )
  }, [baseList, searchQuery, labelFor])

  const communityOptions = useMemo(() => {
    const opts = baseList.map((c) => ({
      value: c.id,
      label: `${c.short} · ${c.name}`,
    }))
    if (value && !opts.some((o) => o.value === value)) {
      const c = findCommunityById(value)
      if (c) opts.unshift({ value: c.id, label: `${c.short} · ${c.name}` })
    }
    return opts
  }, [baseList, value])

  const selectedCommunity = useMemo(() => findCommunityById(value) ?? null, [value])

  useEffect(() => {
    if (!value) setBrowseOpen(true)
  }, [value, setBrowseOpen])

  useEffect(() => {
    setSearchQuery('')
  }, [tab])

  const handlePick = (id) => {
    onChange?.(id)
    if (isSheet) setBrowseOpen(false)
    if (mode === 'navigate') onSelect?.(id)
  }

  const scrollClass = fill
    ? 'flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-hide'
    : clsx(
        'overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-hide',
        maxHeight ?? (isSheet ? 'max-h-[min(14rem,32vh)]' : 'max-h-[min(28rem,52vh)]')
      )

  const tabs = [
    { id: 'major', label: t('communityPost.tabMajors') },
    { id: 'subject', label: t('communityPost.tabSubjects') },
  ]

  const searchPlaceholder =
    tab === 'major' ? t('communityPost.searchMajors') : t('communityPost.searchSubjects')

  const renderListItem = (c) => {
    const isSelected = value === c.id
    const useCompactCard = isSheet || compact

    return (
      <button
        key={c.id}
        type="button"
        onClick={() => handlePick(c.id)}
        className={clsx(
          'relative w-full min-w-0 rounded-xl text-left border transition-all duration-200 outline-none',
          useCompactCard ? 'p-2.5 sm:p-3' : 'p-4 rounded-2xl',
          'hover:border-primary-200 hover:bg-white hover:shadow-sm',
          isSelected
            ? 'border-primary-300 bg-primary-50/90 shadow-sm ring-1 ring-primary-100/80'
            : 'border-slate-200/90 bg-white'
        )}
      >
        <div className={clsx('flex items-center gap-2.5 min-w-0', isSelected && 'pr-4')}>
          <div
            className={clsx(
              'rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br shadow-sm',
              useCompactCard ? 'w-9 h-9 text-[9px]' : 'w-12 h-12 text-xs',
              c.badgeGradient
            )}
          >
            {c.short}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={clsx(
                'font-semibold text-slate-800 leading-snug line-clamp-2',
                useCompactCard ? 'text-[11px] sm:text-xs' : 'text-sm'
              )}
            >
              {c.name}
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">{labelFor(c.label)}</p>
          </div>
        </div>
        {isSelected && (
          <Check
            className={clsx(
              'absolute text-primary-500',
              useCompactCard ? 'top-2 right-2 w-3.5 h-3.5' : 'top-3 right-3 w-5 h-5'
            )}
            strokeWidth={2.5}
          />
        )}
      </button>
    )
  }

  const displayList = isSheet ? filteredList : baseList
  const showBrowse = !isSheet || browseOpen || !selectedCommunity

  return (
    <div className={clsx('flex flex-col min-w-0 min-h-0', className)}>
      {isSheet && selectedCommunity && !browseOpen && (
        <div className="flex-1 flex flex-col justify-center py-2">
          <div className="rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50/50 to-white p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary-600 mb-3">
              {t('communityPost.selectedCommunity')}
            </p>
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  'w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br shadow-sm',
                  selectedCommunity.badgeGradient
                )}
              >
                {selectedCommunity.short}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 leading-snug">{selectedCommunity.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{labelFor(selectedCommunity.label)}</p>
              </div>
              <span className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
              </span>
            </div>
          </div>
        </div>
      )}

      {showBrowse && (
        <>
          <div className={clsx('flex-shrink-0 min-w-0', isSheet ? 'space-y-2 mb-2' : 'space-y-3 mb-3')}>
            <div
              className={clsx(
                'inline-flex p-0.5 rounded-lg w-full',
                isSheet
                  ? 'bg-primary-50/60 border border-primary-100/70'
                  : 'bg-slate-100/90 border border-slate-200/70 sm:w-auto'
              )}
            >
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={clsx(
                    'flex-1 rounded-md font-semibold transition-all duration-200 outline-none',
                    isSheet ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm rounded-lg',
                    tab === item.id
                      ? 'bg-white text-primary-700 shadow-sm'
                      : isSheet
                        ? 'text-primary-600/70 hover:text-primary-800'
                        : 'text-slate-600 hover:text-slate-800'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {isSheet ? (
              <div className="glass-select-trigger w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl border shadow-sm focus-within:ring-2 focus-within:ring-primary-200/80 focus-within:border-primary-300">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 min-w-0 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-xs font-medium"
                />
              </div>
            ) : (
              <SearchableSelect
                size="sm"
                placement="bottom"
                showAllOnOpen
                value={value ?? ''}
                onChange={handlePick}
                options={communityOptions}
                placeholder={searchPlaceholder}
                menuMinWidth={280}
                menuMaxHeight={280}
                className="!py-2"
              />
            )}

            {!isSheet && (
              <p className="text-xs text-slate-500">
                {t('communityPost.communityCount', { count: baseList.length })}
                {mode === 'select' && ` · ${t('communityPost.tapToSelect')}`}
              </p>
            )}
          </div>

          {!isSheet && selectedCommunity && (
            <div className="flex-shrink-0 mb-3 rounded-xl border border-primary-200/70 bg-primary-50/50 px-3 py-2.5 flex items-center gap-3">
              <div
                className={clsx(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br flex-shrink-0',
                  selectedCommunity.badgeGradient
                )}
              >
                {selectedCommunity.short}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-primary-700">{t('communityPost.selectedCommunity')}</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{selectedCommunity.name}</p>
              </div>
              <Check className="w-5 h-5 text-primary-500 flex-shrink-0" />
            </div>
          )}

          <div className={scrollClass}>
            {displayList.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8 px-2">
                {t('communityPost.noCommunitiesMatch')}
              </p>
            ) : (
              <div className="grid w-full min-w-0 pb-1 gap-2 grid-cols-1 sm:grid-cols-3">
                {displayList.map(renderListItem)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default CommunityPicker
