import clsx from 'clsx'
import { RotateCcw } from 'lucide-react'
import Select from '../ui/Select'
import CatalogSearchSelect from './CatalogSearchSelect'
import LocationFilterField from './LocationFilterField'
import { useTranslation } from '@/i18n'

/** Generic filter row (dropdown fields + reset). Used by SearchFilter. */
const FilterBar = ({
  fields = [],
  onReset,
  className,
  children,
  embedded = false,
  standalone = false,
}) => {
  const { t } = useTranslation()
  const compact = embedded || standalone

  return (
    <div
      className={clsx(
        standalone &&
          'rounded-xl border border-white/50 bg-white/45 backdrop-blur-md shadow-sm p-2.5 sm:p-3 overflow-visible',
        className
      )}
    >
      <div
        className={clsx(
          'flex flex-wrap items-end',
          compact ? 'gap-2 sm:gap-2.5' : 'gap-3 sm:gap-4'
        )}
      >
        {fields.map((field) => (
          <div key={field.id} className={clsx('flex-1', field.minWidth ?? 'min-w-[132px]')}>
            {field.type === 'location' ? (
              <LocationFilterField
                label={field.label}
                value={field.value}
                onChange={field.onChange}
                options={field.options}
                pinnedOptions={field.pinnedOptions}
                disabled={field.disabled}
                detail={field.detail}
                onDetailChange={field.onDetailChange}
                menuMinWidth={field.menuMinWidth ?? 240}
                menuMaxHeight={260}
                labelClassName="block text-[11px] font-semibold text-slate-600 mb-0.5"
              />
            ) : (
              <>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">{field.label}</label>
                {field.searchable ? (
                  <CatalogSearchSelect
                    size="sm"
                    placement="bottom"
                    value={field.value}
                    onChange={field.onChange}
                    options={field.options}
                    pinnedOptions={field.pinnedOptions}
                    disabled={field.disabled}
                    menuMinWidth={field.menuMinWidth ?? 240}
                    menuMaxHeight={260}
                  />
                ) : (
                  <Select
                    size="sm"
                    placement="bottom"
                    value={field.value}
                    onChange={field.onChange}
                    options={field.options}
                    disabled={field.disabled}
                    menuMinWidth={field.menuMinWidth ?? 240}
                    menuMaxHeight={260}
                  />
                )}
              </>
            )}
          </div>
        ))}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 text-xs font-semibold text-slate-700 rounded-lg border border-white/60 bg-white/40 hover:text-primary-700 hover:bg-white/60 transition-colors whitespace-nowrap py-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('filters.reset')}
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

export default FilterBar
