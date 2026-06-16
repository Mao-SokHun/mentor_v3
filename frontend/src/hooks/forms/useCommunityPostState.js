import { useCallback, useState } from 'react'
import { COMMUNITY_INITIAL_COMMENTS } from '@/constants'

const LIKES_KEY = 'rokkru_community_likes'
const COMMENTS_KEY = 'rokkru_community_comments'

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export function useCommunityPostState() {
  const [likedIds, setLikedIds] = useState(() => readJson(LIKES_KEY, []))
  const [commentsByPost, setCommentsByPost] = useState(() =>
    readJson(COMMENTS_KEY, COMMUNITY_INITIAL_COMMENTS)
  )

  const toggleLike = useCallback((id) => {
    setLikedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      writeJson(LIKES_KEY, next)
      return next
    })
  }, [])

  const addComment = useCallback((postId, text, author = 'Student') => {
    setCommentsByPost((prev) => {
      const next = {
        ...prev,
        [postId]: [
          ...(prev[postId] || []),
          { id: `c-${Date.now()}`, author, time: 'Just now', content: text },
        ],
      }
      writeJson(COMMENTS_KEY, next)
      return next
    })
  }, [])

  return { likedIds, commentsByPost, toggleLike, addComment }
}

export default useCommunityPostState
