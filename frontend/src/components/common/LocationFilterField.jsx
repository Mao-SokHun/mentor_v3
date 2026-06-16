import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import clsx from 'clsx'
import SearchableSelect from '../ui/SearchableSelect'
import { useTranslation } from '@/i18n'

const LocationFilterField = ({
  label,
  labelClassName,
  value,
  onChange,
  options,
  pinnedOptions,
  disabled,
  detail = {},
  onDetailChange,
  size = 'sm',
  className,
  selectClassName,
  menuMinWidth = 240,
  menuMaxHeight = 260,
}) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(
    Boolean(detail.district || detail.commune || detail.village)
  )

  const inputClass = clsx(
    'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800',
    'placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent'
  )

  return (
    <div className={className}>
      {label && (
        <label className={labelClassName ?? 'block text-[11px] font-semibold text-slate-600 mb-0.5'}>
          {label}
        </label>
      )}
      <div className="flex gap-1.5 items-stretch">
        <div className="flex-1 min-w-0">
          <SearchableSelect
            size={size}
            placement="bottom"
            showAllOnOpen
            value={value}
            onChange={onChange}
            options={options}
            pinnedOptions={pinnedOptions}
            disabled={disabled}
            menuMinWidth={menuMinWidth}
            menuMaxHeight={menuMaxHeight}
            className={selectClassName}
          />
        </div>
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          aria-label={t('filters.addLocationDetail')}
          title={t('filters.addLocationDetail')}
          className={clsx(
            'shrink-0 flex items-center justify-center rounded-lg border border-white/60 bg-white/40',
            'text-slate-700 hover:text-primary-700 hover:bg-white/60 transition-colors',
            size === 'sm' ? 'w-8 self-end mb-0 h-8' : 'w-10 h-10',
            expanded && 'text-primary-700 bg-white/60 border-primary-200'
          )}
        >
          {expanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
      {expanded && (
        <div className="mt-2 space-y-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {t('filters.locationDistrictLabel')}
            </label>
            <input
              type="text"
              value={detail.district ?? ''}
              onChange={(e) => onDetailChange?.('locationDistrict', e.target.value)}
              placeholder={t('filters.locationDistrictPlaceholder')}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {t('filters.locationCommuneLabel')}
            </label>
            <input
              type="text"
              value={detail.commune ?? ''}
              onChange={(e) => onDetailChange?.('locationCommune', e.target.value)}
              placeholder={t('filters.locationCommunePlaceholder')}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {t('filters.locationVillageLabel')}
            </label>
            <input
              type="text"
              value={detail.village ?? ''}
              onChange={(e) => onDetailChange?.('locationVillage', e.target.value)}
              placeholder={t('filters.locationVillagePlaceholder')}
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationFilterField
