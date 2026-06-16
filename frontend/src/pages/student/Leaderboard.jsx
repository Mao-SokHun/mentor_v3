import { useState } from 'react'
import { Trophy, Medal, Star, TrendingUp, Users, Flame, Crown } from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { PageScaffold, PageCard, TabBar, PageAmbient } from '@/components'
import clsx from 'clsx'

const periods = ['This Week', 'This Month', 'All Time']
const categories = ['Top Students', 'Top Teachers', 'Most Active']

const students = []

const badgeConfig = {
  Diamond: { color: 'from-cyan-400 to-blue-500', textColor: 'text-cyan-600', bg: 'bg-cyan-50' },
  Platinum: { color: 'from-slate-300 to-slate-500', textColor: 'text-slate-600', bg: 'bg-slate-100' },
  Gold: { color: 'from-amber-400 to-yellow-500', textColor: 'text-amber-600', bg: 'bg-amber-50' },
  Silver: { color: 'from-slate-200 to-slate-400', textColor: 'text-slate-500', bg: 'bg-slate-50' },
  Bronze: { color: 'from-orange-300 to-amber-600', textColor: 'text-orange-600', bg: 'bg-orange-50' },
}

const rankIcons = {
  1: { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  2: { icon: Medal, color: 'text-slate-400', bg: 'bg-slate-100' },
  3: { icon: Medal, color: 'text-amber-600', bg: 'bg-orange-100' },
}

const Leaderboard = () => {
  const [period, setPeriod] = useState('This Month')
  const [category, setCategory] = useState('Top Students')

  const top3 = students.slice(0, 3)
  const rest = students.slice(3)
  const currentUserRank = null

  if (students.length === 0) {
    return (
      <PageAmbient variant="leaderboard" className="space-y-8">
        <div className="text-center py-16">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600">No leaderboard data yet</p>
          <p className="text-sm text-slate-400 mt-1">Rankings will appear when sessions are recorded.</p>
        </div>
      </PageAmbient>
    )
  }

  return (
    <PageAmbient variant="leaderboard" className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-7 h-7 text-amber-500" />
          <h1 className="text-3xl font-extrabold text-slate-800">Leaderboard</h1>
        </div>
        <p className="text-slate-500">Top learners ranked by sessions, hours, and consistency</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-all', period === p ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700')}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-all', category === c ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700')}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Podium — top 3 */}
      <div className="flex items-end justify-center gap-4 py-4">
        {/* 2nd */}
        <div className="flex flex-col items-center gap-3 mb-0">
          <Avatar name={top3[1].name} size="lg" />
          <div className="text-center">
            <p className="text-sm font-bold text-slate-800">{top3[1].name}</p>
            <p className="text-xs text-slate-400">{top3[1].points.toLocaleString()} pts</p>
          </div>
          <div className="w-24 h-20 bg-gradient-to-t from-slate-200 to-slate-300 rounded-t-2xl flex flex-col items-center justify-center gap-1 shadow-soft">
            <Medal className="w-6 h-6 text-slate-400" />
            <span className="text-2xl font-black text-slate-500">2</span>
          </div>
        </div>

        {/* 1st */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar name={top3[0].name} size="xl" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Crown className="w-6 h-6 text-yellow-500 fill-yellow-400" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-800">{top3[0].name}</p>
            <p className="text-xs text-primary-600 font-semibold">{top3[0].points.toLocaleString()} pts</p>
          </div>
          <div className="w-24 h-28 bg-gradient-to-t from-amber-400 to-yellow-300 rounded-t-2xl flex flex-col items-center justify-center gap-1 shadow-md">
            <Trophy className="w-7 h-7 text-yellow-700" />
            <span className="text-3xl font-black text-yellow-700">1</span>
          </div>
        </div>

        {/* 3rd */}
        <div className="flex flex-col items-center gap-3 mb-0">
          <Avatar name={top3[2].name} size="lg" />
          <div className="text-center">
            <p className="text-sm font-bold text-slate-800">{top3[2].name}</p>
            <p className="text-xs text-slate-400">{top3[2].points.toLocaleString()} pts</p>
          </div>
          <div className="w-24 h-14 bg-gradient-to-t from-orange-300 to-amber-400 rounded-t-2xl flex flex-col items-center justify-center gap-1 shadow-soft">
            <Medal className="w-5 h-5 text-orange-700" />
            <span className="text-xl font-black text-orange-700">3</span>
          </div>
        </div>
      </div>

      {/* My rank banner */}
      {currentUserRank && (
        <div className="bg-gradient-to-r from-primary-400 to-primary-500 rounded-2xl p-4 text-white flex items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg">
              #{currentUserRank.rank}
            </div>
            <div>
              <p className="font-semibold">Your Current Rank</p>
              <p className="text-primary-200 text-xs">{currentUserRank.points.toLocaleString()} points · {currentUserRank.sessions} sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-300" />
            <span className="text-sm font-semibold">{currentUserRank.streak} day streak</span>
          </div>
        </div>
      )}

      {/* Full ranking table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            Full Rankings
          </h2>
        </div>
        <div className="divide-y divide-slate-50">
          {students.map((student) => {
            const isMe = student.name === 'Alex Johnson'
            const rankIcon = rankIcons[student.rank]
            const badge = badgeConfig[student.badge]
            return (
              <div
                key={student.rank}
                className={clsx(
                  'flex items-center gap-4 px-5 py-4 transition-colors',
                  isMe ? 'bg-primary-50 border-l-4 border-l-primary-400' : 'hover:bg-slate-50'
                )}
              >
                {/* Rank */}
                <div className="w-10 flex-shrink-0">
                  {rankIcon ? (
                    <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', rankIcon.bg)}>
                      <rankIcon.icon className={clsx('w-5 h-5', rankIcon.color)} />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-500">#{student.rank}</span>
                    </div>
                  )}
                </div>

                {/* Avatar + name */}
                <Avatar name={student.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={clsx('font-semibold text-sm', isMe ? 'text-primary-700' : 'text-slate-800')}>
                      {student.name} {isMe && <span className="text-xs font-normal text-primary-500">(you)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {student.subjects.map((s) => (
                      <span key={s} className="text-xs text-slate-400">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Badge */}
                <div className={clsx('hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', badge.bg, badge.textColor)}>
                  <Star className="w-3 h-3" />
                  {student.badge}
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-right">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{student.sessions}</p>
                    <p className="text-xs text-slate-400">sessions</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{student.hours}h</p>
                    <p className="text-xs text-slate-400">learned</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <p className="text-sm font-bold text-slate-800">{student.streak}</p>
                    </div>
                    <p className="text-xs text-slate-400">day streak</p>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right flex-shrink-0">
                  <p className={clsx('text-base font-black', isMe ? 'text-primary-600' : 'text-slate-800')}>{student.points.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">points</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* How points work */}
      <div className="bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl p-6 border border-primary-100">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          How points are earned
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { action: 'Complete a session', points: '+100 pts' },
            { action: 'Daily login streak', points: '+10 pts/day' },
            { action: 'Leave a review', points: '+25 pts' },
            { action: 'Join a community', points: '+50 pts' },
          ].map((item) => (
            <div key={item.action} className="bg-white rounded-xl p-3 border border-primary-100">
              <p className="text-xs font-semibold text-primary-600">{item.points}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.action}</p>
            </div>
          ))}
        </div>
      </div>
    </PageAmbient>
  )
}

export default Leaderboard
