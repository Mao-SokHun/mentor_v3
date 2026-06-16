import { Link } from 'react-router-dom'
import {
  PageAmbient,
  PageSection,
  SearchFilter,
  MentorList,
} from '@/components'
import SearchableSelect from '@/components/ui/SearchableSelect'
import { useMentorFilters, useMentors, useMentorFilterCatalog } from '@/hooks'
import { useTranslation, localizeOptionList } from '@/i18n'
import { TEXT, FILTER_ALL } from '@/constants'

const Home = () => {
  const { t, labelFor } = useTranslation()
  const { filters, setFilter, reset } = useMentorFilters()
  const { mentors, total, loading } = useMentors(filters)
  const { options: filterOptions, skillsCatalog } = useMentorFilterCatalog()

  const sortOptions = localizeOptionList(
    filterOptions.sorts.filter((o) => o.value !== FILTER_ALL.sort),
    labelFor
  )

  return (
    <PageAmbient variant="home" className="space-y-8 sm:space-y-10">
      <SearchFilter
        variant="home"
        filters={filters}
        onFilterChange={setFilter}
        onReset={reset}
        filterOptions={filterOptions}
        skillsCatalog={skillsCatalog}
      />

      <PageSection
        title={t('student.topMentors')}
        subtitle={t('student.topMentorsSubtitle', { count: total })}
        action={
          <div className="flex items-center gap-2 min-w-[200px]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
              {t('filters.sortBy')}:
            </span>
            <SearchableSelect
              size="sm"
              placement="bottom-end"
              showAllOnOpen
              value={filters.sort}
              onChange={(v) => setFilter('sort', v)}
              options={sortOptions}
              menuMinWidth={220}
              className="flex-1 min-w-[160px]"
            />
          </div>
        }
      >
        <MentorList
          mentors={mentors}
          loading={loading}
          variant="list"
          emptyDescription={t('student.emptyHint')}
        />
      </PageSection>

      <div className="text-center pt-2">
        <Link to="/schedule" className={TEXT.link}>
          {t('student.browseSchedule')}
        </Link>
      </div>
    </PageAmbient>
  )
}

export default Home
