import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Users } from 'lucide-react'
import Button from '../../components/ui/Button'
import { PageCard, RokkruLogo } from '@/components'
import { filterCommunities } from '@/constants'
import { useCommunities } from '@/hooks/useCommunities'
import clsx from 'clsx'

const ChooseCommunity = () => {
  const [joined, setJoined] = useState([])
  const [tab, setTab] = useState('major')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { communities: majorCommunities, loading: majorLoading } = useCommunities({ type: 'major' })
  const { communities: subjectCommunities, loading: subjectLoading } = useCommunities({
    type: 'subject',
  })

  const list = useMemo(() => {
    const base = tab === 'major' ? majorCommunities : subjectCommunities
    return filterCommunities(base, search)
  }, [tab, search, majorCommunities, subjectCommunities])

  const loading = tab === 'major' ? majorLoading : subjectLoading

  const toggle = (id) =>
    setJoined((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="flex justify-center mb-8">
          <RokkruLogo to="/" size="md" />
        </div>

        <PageCard padding={false} className="shadow-md overflow-hidden glass-panel">
          <div className="p-6 border-b border-white/50 text-center">
            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Choose your communities</h2>
            <p className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto">
              Join major and subject groups that match what you study and teach on RokKru
            </p>
          </div>

          <div className="px-6 pt-4 flex flex-wrap items-center gap-2 border-b border-white/40 pb-3">
            {[
              { id: 'major', label: 'Majors' },
              { id: 'subject', label: 'Subjects' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-bold',
                  tab === t.id ? 'bg-primary-500 text-white' : 'text-slate-600 hover:bg-white/50'
                )}
              >
                {t.label}
              </button>
            ))}
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="ml-auto flex-1 min-w-[7rem] text-xs glass-input rounded-lg px-3 py-2"
            />
          </div>

          <div className="p-6 space-y-3 max-h-[28rem] overflow-y-auto">
            {loading && (
              <p className="text-sm text-slate-500 text-center py-6">Loading communities…</p>
            )}
            {!loading && list.map((c) => {
              const isJoined = joined.includes(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className={clsx(
                    'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200',
                    isJoined
                      ? 'border-primary-300 bg-primary-50/80'
                      : 'border-white/60 bg-white/40 hover:border-primary-200 hover:bg-white/60'
                  )}
                >
                  <div
                    className={clsx(
                      'w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-bold bg-gradient-to-br flex-shrink-0',
                      c.badgeGradient
                    )}
                  >
                    {c.short}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-400">{c.members.toLocaleString()} members</span>
                      <span className="text-slate-200">·</span>
                      <span className="text-xs font-medium text-primary-600">{c.category}</span>
                      <span className="text-xs text-slate-400 capitalize">({c.type})</span>
                    </div>
                  </div>
                  <div
                    className={clsx(
                      'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                      isJoined ? 'bg-primary-500 text-white' : 'bg-white/80 border-2 border-slate-200'
                    )}
                  >
                    {isJoined && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              )
            })}
            {!loading && list.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">
                {search ? 'No communities match your search.' : 'No communities available yet.'}
              </p>
            )}
          </div>

          <div className="p-6 border-t border-white/50 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-slate-500">
              {joined.length} communit{joined.length !== 1 ? 'ies' : 'y'} selected
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="md" type="button" onClick={() => navigate('/home')}>
                Skip
              </Button>
              <Button
                variant="primary"
                size="md"
                type="button"
                onClick={() => navigate('/home')}
                disabled={joined.length === 0}
              >
                Join & Continue
              </Button>
            </div>
          </div>
        </PageCard>
      </div>
    </div>
  )
}

export default ChooseCommunity
