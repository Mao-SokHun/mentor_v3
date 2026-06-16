import { useState } from 'react'

export const useReviewForm = () => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const reset = () => { setRating(0); setComment('') }

  return { rating, setRating, comment, setComment, submitting, setSubmitting, reset }
}

export default useReviewForm
