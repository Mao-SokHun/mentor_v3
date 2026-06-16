import { useMemo } from 'react'
import { DEFAULT_FILTER_OPTION_SET } from '@/constants'
import { useTranslation } from './LanguageProvider.jsx'

/** Map string or { value, label } arrays to select options */
export function localizeOptionList(options, labelFor) {
  return (options ?? []).map((item) => {
    if (item && typeof item === 'object' && 'value' in item) {
      const label =
        item.label != null && item.label !== item.value ? item.label : labelFor(item.value)
      return { value: item.value, label }
    }
    return { value: item, label: labelFor(item) }
  })
}

export function localizeOptionSet(optionSet, labelFor) {
  return {
    majors: localizeOptionList(optionSet.majors ?? [], labelFor),
    subjects: localizeOptionList(optionSet.subjects ?? [], labelFor),
    locations: localizeOptionList(optionSet.locations ?? [], labelFor),
    sorts: localizeOptionList(optionSet.sorts ?? [], labelFor),
    types: localizeOptionList(optionSet.types ?? [], labelFor),
    times: localizeOptionList(optionSet.times ?? [], labelFor),
  }
}

export function useLocalizedFilterOptions(optionSet = DEFAULT_FILTER_OPTION_SET) {
  const { labelFor } = useTranslation()
  return useMemo(() => localizeOptionSet(optionSet, labelFor), [optionSet, labelFor])
}
