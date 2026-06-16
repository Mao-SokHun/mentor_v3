import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCommunityPostState } from '@/hooks'
import { useAuth } from '@/hooks'
import { COMMUNITY_FEED_POSTS } from '@/constants'
import { communitySubjectTabs } from '@/constants'
import {
  SubjectTabs,
  CommunityPostCard,
  PageAmbient,
  CommunityComposePrompt,
  CreatePostModal,
} from '@/components'
import { useTranslation } from '@/i18n'

const Community = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState('ALL POSTS')
  const [createOpen, setCreateOpen] = useState(false)
  const { likedIds, commentsByPost, toggleLike } = useCommunityPostState()

  useEffect(() => {
    if (location.state?.openCreatePost) {
      setCreateOpen(true)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const displayed =
    activeFilter === 'ALL POSTS'
      ? COMMUNITY_FEED_POSTS
      : COMMUNITY_FEED_POSTS.filter((p) => p.category === activeFilter)

  const handleCloseCreate = () => {
    setCreateOpen(false)
    if (location.pathname === '/community/create-post') {
      navigate('/community', { replace: true })
    }
  }

  return (
    <PageAmbient variant="community" className="space-y-6 sm:space-y-8">
      <section className="space-y-3 sm:space-y-3.5 w-full">
        <CommunityComposePrompt
          userName={user?.name || t('auth.student')}
          onClick={() => setCreateOpen(true)}
        />

        <div className="glass-panel rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5">
          <SubjectTabs spread tabs={communitySubjectTabs} active={activeFilter} onChange={setActiveFilter} />
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:gap-5 w-full">
        {displayed.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">{t('communityPost.emptyFeed')}</p>
        ) : (
          displayed.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              comments={commentsByPost[post.id] || []}
              liked={likedIds.includes(post.id)}
              onLike={() => toggleLike(post.id)}
            />
          ))
        )}
      </div>

      <CreatePostModal open={createOpen} onClose={handleCloseCreate} />
    </PageAmbient>
  )
}

export default Community
