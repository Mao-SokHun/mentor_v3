import SearchableSelect from '@/components/ui/SearchableSelect'
import { useTranslation } from '@/i18n'

/**
 * Skill / sub-skill catalog picker.
 * - Click → scrollable list (showAllOnOpen)
 * - Type → filter list (SearchableSelect)
 * - Must pick an option from the list (allowCustom=false) — no free-text majors/subjects
 */
const CatalogSearchSelect = ({ placeholder, searchPlaceholder, ...props }) => {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder ?? t('filters.selectOrSearch')
  const resolvedSearchPlaceholder = searchPlaceholder ?? t('filters.selectOrSearch')

  return (
    <SearchableSelect
      showAllOnOpen
      allowCustom={false}
      placeholder={resolvedPlaceholder}
      searchPlaceholder={resolvedSearchPlaceholder}
      {...props}
    />
  )
}

export default CatalogSearchSelect
