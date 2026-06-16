import { useNavigate } from 'react-router-dom'
import { Heart, MessageSquare, Share2 } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import clsx from 'clsx'

const CommunityPostCard = ({
  post,
  liked,
  comments = [],
  onLike,
  onShare,
  preview = true,
  linkTo,
}) => {
  const navigate = useNavigate()
  const commentCount = comments.length || post.comments || 0
  const detailPath = linkTo === false ? null : (linkTo ?? `/community/post/${post.id}`)

  const openPost = () => {
    if (detailPath) navigate(detailPath)
  }

  const stop = (e) => e.stopPropagation()

  return (
    <article
      role={detailPath ? 'button' : undefined}
      tabIndex={detailPath ? 0 : undefined}
      onClick={detailPath ? openPost : undefined}
      onKeyDown={
        detailPath
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openPost()
              }
            }
          : undefined
      }
      className={clsx(
        'glass-panel rounded-xl overflow-hidden w-full transition-shadow hover:shadow-md',
        detailPath && 'cursor-pointer'
      )}
    >
      <div className="px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex items-start gap-3">
          <Avatar name={post.author} size="xs" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-sm text-slate-800">{post.author}</span>
                  <Badge variant={post.authorRole === 'Teacher' ? 'primary' : 'neutral'} size="sm">
                    {post.authorRole}
                  </Badge>
                </div>
                {post.dept && (
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
                    {post.dept}
                  </p>
                )}
              </div>
              <span className="text-[11px] text-slate-400 flex-shrink-0">{post.time}</span>
            </div>
            <p
              className={clsx(
                'text-sm text-slate-600 mt-2.5 leading-relaxed',
                preview && 'line-clamp-2'
              )}
            >
              {post.content}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 sm:px-5 py-2.5 border-t border-white/50 bg-white/10">
        <button
          type="button"
          onClick={(e) => {
            stop(e)
            onLike?.()
          }}
          className={clsx(
            'flex items-center gap-1.5 text-xs font-medium transition-colors',
            liked ? 'text-primary-600' : 'text-slate-500 hover:text-primary-600'
          )}
        >
          <Heart className={clsx('w-3.5 h-3.5', liked && 'fill-primary-500')} />
          {post.likes + (liked ? 1 : 0)}
        </button>
        <button
          type="button"
          onClick={(e) => {
            stop(e)
            if (detailPath) navigate(detailPath)
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {commentCount}
        </button>
        <button
          type="button"
          onClick={(e) => {
            stop(e)
            onShare?.()
          }}
          className="ml-auto p-1 text-slate-400 hover:text-primary-600 rounded-md transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  )
}

export default CommunityPostCard
