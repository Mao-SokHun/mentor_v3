import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Users, MessageSquare, Plus, Bell, BellOff, ChevronLeft, Trophy,
  Calendar, Hash,
} from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import {
  PageCard,
  TabBar,
  CommunityPostCard,
  CommunityPostComposer,
  PageAmbient,
} from '@/components'
import { useCommunities } from '@/hooks/useCommunities'
import clsx from 'clsx'

const posts = []
const initialComments = {}
const members = []
const events = []

const DEFAULT_COMMUNITY = {
  id: '',
  name: 'Community',
  description: '',
  icon: '📘',
  members: 0,
  posts: 0,
  online: 0,
  category: '',
  joined: false,
  color: 'from-primary-400 to-primary-500',
  rules: [],
}

const CommunityDetail = () => {
  const { id } = useParams()
  const { communities, loading } = useCommunities()
  const community = useMemo(() => {
    const found = communities.find((c) => String(c.id) === String(id))
    if (!found) return { ...DEFAULT_COMMUNITY, id: id ?? '' }
    return {
      id: found.id,
      name: found.name,
      description: found.description ?? '',
      icon: found.icon ?? '📘',
      members: found.members ?? 0,
      posts: found.topics ?? 0,
      online: 0,
      category: found.category ?? '',
      joined: false,
      color: found.badgeGradient ? `bg-gradient-to-br ${found.badgeGradient}` : DEFAULT_COMMUNITY.color,
      rules: [],
    }
  }, [communities, id])

  const [tab, setTab] = useState('posts')
  const [joined, setJoined] = useState(community.joined)
  const [notified, setNotified] = useState(true)
  const [postText, setPostText] = useState('')
  const [likedPosts, setLikedPosts] = useState({})
  const [commentsByPost, setCommentsByPost] = useState(initialComments)

  const toggleLike = (postId) => setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }))

  if (loading) {
    return (
      <PageAmbient variant="community">
        <p className="text-sm text-slate-500 text-center py-16">Loading community…</p>
      </PageAmbient>
    )
  }

  return (
    <PageAmbient variant="community">
      <PageCard padding={false} className={clsx('overflow-hidden border-0 bg-gradient-to-br text-white mb-6', community.color)}>
        <div className="p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none z-[1]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-20 -translate-y-20" />
          </div>
          <Link to="/community" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs mb-4 transition-colors relative z-10">
            <ChevronLeft className="w-3.5 h-3.5" />Back to communities
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <span className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl backdrop-blur-sm">{community.icon}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black">{community.name}</h1>
                  {community.category ? <Badge variant="info" size="sm">{community.category}</Badge> : null}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 mt-1">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" />{community.members.toLocaleString()} members</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{community.posts} posts</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setNotified(!notified)} className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                {notified ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              <Button variant={joined ? 'secondary' : 'primary'} size="sm" onClick={() => setJoined(!joined)}
                className={joined ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' : ''}>
                {joined ? 'Joined ✓' : <><Plus className="w-4 h-4" />Join</>}
              </Button>
            </div>
          </div>
          {community.description ? (
            <p className="text-white/70 text-sm mt-4 max-w-xl relative">{community.description}</p>
          ) : null}
        </div>
      </PageCard>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <TabBar tabs={[{ id: 'posts', label: 'Posts' }, { id: 'resources', label: 'Resources' }, { id: 'members', label: 'Members' }, { id: 'events', label: 'Events' }]} active={tab} onChange={setTab} />

          {tab === 'posts' && (
            <div className="space-y-4">
              {joined && (
                <CommunityPostComposer userName="You" value={postText} onChange={setPostText} onPost={() => setPostText('')} />
              )}
              {posts.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No posts in this community yet.</p>
              ) : (
                posts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    comments={commentsByPost[post.id] || []}
                    liked={likedPosts[post.id]}
                    onLike={() => toggleLike(post.id)}
                    onShare={() => {}}
                    linkTo={false}
                  />
                ))
              )}
            </div>
          )}

          {tab === 'resources' && (
            <PageCard>
              <p className="text-sm text-slate-500 text-center py-8">No resources shared yet.</p>
            </PageCard>
          )}

          {tab === 'members' && (
            <PageCard>
              {members.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No members to display.</p>
              ) : (
                <div className="space-y-3">
                  {members.map((m) => (
                    <div key={m.name} className="flex items-center gap-3">
                      <Avatar name={m.name} size="sm" />
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.role} · {m.tag}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PageCard>
          )}

          {tab === 'events' && (
            <PageCard>
              {events.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No upcoming events.</p>
              ) : (
                events.map((e) => (
                  <div key={e.title} className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
                    <Calendar className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{e.title}</p>
                      <p className="text-xs text-slate-400">{e.date} · {e.time}</p>
                    </div>
                  </div>
                ))
              )}
            </PageCard>
          )}
        </div>

        <div className="space-y-4">
          <PageCard>
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2"><Hash className="w-4 h-4 text-primary-500" />Community rules</h3>
            {community.rules.length === 0 ? (
              <p className="text-xs text-slate-500">No rules posted yet.</p>
            ) : (
              <ol className="space-y-2">
                {community.rules.map((rule, i) => (
                  <li key={rule} className="text-xs text-slate-600 flex gap-2"><span className="font-bold text-primary-500">{i + 1}.</span>{rule}</li>
                ))}
              </ol>
            )}
          </PageCard>

          <PageCard>
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" />Top contributors</h3>
            <p className="text-xs text-slate-500">No contributors yet.</p>
          </PageCard>
        </div>
      </div>
    </PageAmbient>
  )
}

export default CommunityDetail
