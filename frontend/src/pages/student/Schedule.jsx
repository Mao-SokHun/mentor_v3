import { useState } from 'react'
import { PageAmbient, PageSection, PaginationBar } from '@/components'
import { SearchFilter, MentorList } from '@/components'
import { useMentorFilters, usePublishedSchedules, useMentorFilterCatalog } from '@/hooks'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 16

const Schedule = () => {
  const { t } = useTranslation()
  const { filters, setFilter, reset } = useMentorFilters()
  const [page, setPage] = useState(1)
  const { options: filterOptions, skillsCatalog, provinces } = useMentorFilterCatalog()

  const { items, total, loading } = usePublishedSchedules(filters, provinces)

  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleReset = () => {
    reset()
    setPage(1)
  }

  const handleFilterChange = (key, value) => {
    setFilter(key, value)
    setPage(1)
  }

  return (
    <PageAmbient variant="schedule" className="space-y-8 sm:space-y-10">
      <SearchFilter
        variant="schedule"
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        showSearchButton
        onSearch={() => setPage(1)}
        className="bg-primary-50/70 border-primary-100/80"
        filterOptions={filterOptions}
        skillsCatalog={skillsCatalog}
      />

      <PageSection
        title={t('student.schedulePostsTitle')}
        subtitle={t('student.schedulePostsSubtitle', { count: total })}
      >
        <MentorList
          scheduleItems={paged}
          variant="grid"
          loading={loading}
          emptyDescription={t('student.schedulePostsEmpty')}
        />
      </PageSection>

      <PaginationBar page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </PageAmbient>
  )
}

export default Schedule
