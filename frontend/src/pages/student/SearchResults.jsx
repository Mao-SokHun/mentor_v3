import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, BookOpen, Hash, FileText, ChevronRight, X } from 'lucide-react'
import Button from '../../components/ui/Button'
import { MentorRowCard, PageSection, TabBar, PageAmbient } from '@/components'
import { useMentors } from '@/hooks'
import { useCommunities } from '@/hooks/useCommunities'
import { filterCommunities, isApiEnabled } from '@/constants'
import { fetchPublishedSchedules } from '@/services/mentors/mentorService'
import { useTranslation } from '@/i18n'
import { mapPostsToSearchResults } from '@/utils/mentorDetailUtils'

const SearchResults = () => {
  const { lang } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState('all')
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(isApiEnabled())

  const q = searchParams.get('q') || query

  const { mentors, loading: mentorsLoading } = useMentors({ q, page: 1, pageSize: 50 })
  const { communities: rawCommunities, loading: communitiesLoading } = useCommunities({ q })

  useEffect(() => {
    if (!isApiEnabled()) {
      setPostsLoading(false)
      return
    }
    let cancelled = false
    setPostsLoading(true)
    fetchPublishedSchedules({ status: 'published', limit: 100 })
      .then((rows) => {
        if (!cancelled) setPosts(mapPostsToSearchResults(rows, lang))
      })
      .catch(() => {
        if (!cancelled) setPosts([])
      })
      .finally(() => {
        if (!cancelled) setPostsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [q, lang])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ q: query })
  }

  const communities = useMemo(
    () =>
      rawCommunities.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        members: c.members,
        posts: c.topics,
        category: c.category,
      })),
    [rawCommunities]
  )

  const matchesQuery = (text) => !q || String(text ?? '').toLowerCase().includes(q.toLowerCase())

  const filteredMentors = mentors.filter(
    (t) =>
      matchesQuery(t.name) ||
      matchesQuery(t.title) ||
      (t.subjects ?? []).some((s) => matchesQuery(s))
  )

  const filteredCommunities = communities.filter(
    (c) => matchesQuery(c.name) || matchesQuery(c.category)
  )

  const filteredPosts = posts.filter(
    (p) => matchesQuery(p.title) || matchesQuery(p.preview) || matchesQuery(p.author)
  )

  const totalResults = filteredMentors.length + filteredCommunities.length + filteredPosts.length

  const tabs = [
    { id: 'all', label: `All (${totalResults})` },
    { id: 'mentors', label: `Teachers (${filteredMentors.length})` },
    { id: 'communities', label: `Communities (${filteredCommunities.length})` },
    { id: 'posts', label: `Posts (${filteredPosts.length})` },
  ]

  return (
    <PageAmbient variant="search" className="space-y-5">
      <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-3 glass-panel px-4 py-3 focus-within:ring-2 focus-within:ring-primary-200/80 transition-all">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teachers, communities, topics..."
            className="flex-1 text-slate-700 text-sm outline-none placeholder-slate-400"
            autoFocus
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="primary">
          Search
        </Button>
      </form>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-slate-500 text-sm">
          {mentorsLoading || communitiesLoading || postsLoading ? (
            'Loading…'
          ) : totalResults === 0 ? (
            <>No results for &ldquo;{q}&rdquo;</>
          ) : (
            <>
              <strong className="text-slate-800">{totalResults} results</strong>
              {q && <> for &ldquo;{q}&rdquo;</>}
            </>
          )}
        </p>
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} className="max-w-full" />
      </div>

      <div className="space-y-6">
        {(activeTab === 'all' || activeTab === 'mentors') && filteredMentors.length > 0 && (
          <PageSection
            title={
              activeTab === 'all' ? (
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary-500" />
                  Teachers
                </span>
              ) : (
                'Teachers'
              )
            }
            action={
              activeTab === 'all' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('mentors')}
                  className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                >
                  See all <ChevronRight className="w-3 h-3" />
                </button>
              ) : null
            }
          >
            <div className="space-y-3">
              {filteredMentors.map((mentor) => (
                <MentorRowCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          </PageSection>
        )}

        {(activeTab === 'all' || activeTab === 'communities') && filteredCommunities.length > 0 && (
          <PageSection
            title={
              activeTab === 'all' ? (
                <span className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary-500" />
                  Communities
                </span>
              ) : (
                'Communities'
              )
            }
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredCommunities.map((c) => (
                <div
                  key={c.id}
                  className="glass-panel p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
                >
                  <span className="text-2xl">{c.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {c.members} members · {c.posts} posts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </PageSection>
        )}

        {(activeTab === 'all' || activeTab === 'posts') && filteredPosts.length > 0 && (
          <PageSection title="Posts">
            <div className="space-y-3">
              {filteredPosts.map((p) => (
                <div key={p.id} className="glass-panel p-4">
                  <p className="font-semibold text-slate-800 text-sm">{p.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{p.preview}</p>
                </div>
              ))}
            </div>
          </PageSection>
        )}
      </div>
    </PageAmbient>
  )
}

export default SearchResults
