import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Star, CheckCircle, ThumbsUp, ThumbsDown, ChevronLeft, Sparkles } from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import clsx from 'clsx'
import StandalonePageShell from '../../components/layout/StandalonePageShell'
import { getBookingById } from '@/services/students/studentBookingService'
import { submitSessionReview } from '@/services/students/studentReviewService'
import { SHARED_ROUTES, STUDENT_ROUTES } from '@/constants/student/studentRoutes'

const aspects = [
  { id: 'explanation', label: 'Clarity of Explanation' },
  { id: 'pace', label: 'Pace & Timing' },
  { id: 'patience', label: 'Patience & Support' },
  { id: 'knowledge', label: 'Subject Knowledge' },
  { id: 'materials', label: 'Materials & Examples' },
]

const tags = {
  positive: ['Very clear ✨', 'Patient teacher 💪', 'Great examples 📐', 'Answered all my questions', 'Would recommend', 'Helped me understand', 'Flexible with pace', 'Encouraging'],
  negative: ['Too fast', 'Not enough examples', 'Hard to follow', 'Connection issues', 'Started late', 'Needs improvement'],
}

const quickReviews = []

const SessionReview = () => {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const booking = useMemo(() => getBookingById(sessionId), [sessionId])
  const mentor = {
    name: booking?.mentorName ?? '',
    title: '',
    subject: booking?.topicLabel ?? booking?.topic ?? '',
    date: booking?.sessionDate ?? '',
    duration: booking?.durationMinutes ? `${booking.durationMinutes} min` : '',
  }
  const [overall, setOverall] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [aspectRatings, setAspectRatings] = useState({})
  const [selectedTags, setSelectedTags] = useState([])
  const [reviewText, setReviewText] = useState('')
  const [wouldBook, setWouldBook] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const toggleTag = (tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  const canSubmit = overall > 0 && reviewText.length >= 20

  const submit = async () => {
    if (!canSubmit || !sessionId) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitSessionReview(sessionId, {
        overall,
        aspectRatings,
        tags: selectedTags,
        reviewText,
        wouldBookAgain: wouldBook,
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err?.message || 'Could not submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <StandalonePageShell variant="ambient" className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-panel rounded-3xl p-10 max-w-md w-full text-center">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <Star className="w-10 h-10 text-amber-400 fill-amber-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Review Submitted!</h2>
          <p className="text-slate-500 text-sm mb-2">Thank you for your feedback.</p>
          <p className="text-slate-400 text-xs mb-6">Your review helps other students find the best teachers on RokKru.</p>

          <div className="flex items-center justify-center gap-1 mb-6">
            {Array.from({ length: overall }).map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
            ))}
          </div>

          <div className="bg-primary-50 rounded-2xl p-4 text-sm text-primary-700 mb-6">
            🎉 You earned <strong>+50 RokKru points</strong> for leaving a review!
          </div>

          <div className="flex gap-3">
            <Link to={STUDENT_ROUTES.bookings} className="flex-1">
              <Button variant="ghost" className="w-full">My Bookings</Button>
            </Link>
            <Link to={SHARED_ROUTES.home} className="flex-1">
              <Button variant="primary" className="w-full">Find Another Teacher</Button>
            </Link>
          </div>
        </div>
      </StandalonePageShell>
    )
  }

  return (
    <StandalonePageShell variant="ambient" className="py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Back */}
        <Link to={STUDENT_ROUTES.bookings} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" />Back to My Bookings
        </Link>

        {/* Teacher card */}
        <div className="glass-panel rounded-2xl p-5 mb-5 flex items-center gap-4">
          <Avatar name={mentor.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800">{mentor.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{mentor.title}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="primary" size="sm">{mentor.subject}</Badge>
              <span className="text-xs text-slate-400">{mentor.date}</span>
              <span className="text-xs text-slate-400">· {mentor.duration}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Completed</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-7">
          <div>
            <h1 className="text-xl font-black text-slate-800 mb-0.5">Rate your session</h1>
            <p className="text-slate-400 text-sm">Your honest feedback helps teachers improve and helps other students.</p>
          </div>

          {/* Overall rating */}
          <div>
            <p className="font-semibold text-slate-700 mb-3">Overall rating <span className="text-red-400">*</span></p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onMouseEnter={() => setHoveredStar(s)} onMouseLeave={() => setHoveredStar(0)} onClick={() => setOverall(s)}
                  className="transition-transform hover:scale-125">
                  <Star className={clsx('w-10 h-10 transition-colors', (hoveredStar || overall) >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                </button>
              ))}
              {overall > 0 && (
                <span className="ml-2 text-sm font-semibold text-slate-600">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][overall]}
                </span>
              )}
            </div>
          </div>

          {/* Aspect ratings */}
          <div>
            <p className="font-semibold text-slate-700 mb-3">Rate specific aspects</p>
            <div className="space-y-3">
              {aspects.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-600 w-44">{a.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setAspectRatings(prev => ({ ...prev, [a.id]: s }))}
                        className="transition-transform hover:scale-110">
                        <Star className={clsx('w-5 h-5 transition-colors', (aspectRatings[a.id] || 0) >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="font-semibold text-slate-700 mb-3">What stood out? (optional)</p>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {tags.positive.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={clsx('px-3 py-1.5 rounded-full text-xs font-medium border transition-all', selectedTags.includes(tag) ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.negative.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={clsx('px-3 py-1.5 rounded-full text-xs font-medium border transition-all', selectedTags.includes(tag) ? 'bg-red-100 text-red-600 border-red-300' : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Written review */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-slate-700">Written review <span className="text-red-400">*</span></p>
              <span className="text-xs text-slate-400">{reviewText.length}/500</span>
            </div>
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
              {quickReviews.map((q, i) => (
                <button key={i} onClick={() => setReviewText(q)}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl text-xs font-medium hover:bg-primary-100 transition-colors whitespace-nowrap">
                  <Sparkles className="w-3 h-3" />Quick fill
                </button>
              ))}
            </div>
            <textarea
              rows={4}
              value={reviewText}
              onChange={e => setReviewText(e.target.value.slice(0, 500))}
              placeholder="Tell others about your experience. What did you learn? Was the teacher clear and helpful? (min 20 characters)"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-primary-300 transition-colors resize-none"
            />
            {reviewText.length > 0 && reviewText.length < 20 && (
              <p className="text-xs text-red-400 mt-1">{20 - reviewText.length} more characters needed</p>
            )}
          </div>

          {/* Would book again */}
          <div>
            <p className="font-semibold text-slate-700 mb-3">Would you book this teacher again?</p>
            <div className="flex gap-3">
              <button onClick={() => setWouldBook(true)}
                className={clsx('flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-semibold transition-all',
                  wouldBook === true ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
                <ThumbsUp className="w-4 h-4" />Yes, definitely!
              </button>
              <button onClick={() => setWouldBook(false)}
                className={clsx('flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-semibold transition-all',
                  wouldBook === false ? 'border-red-300 bg-red-50 text-red-500' : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
                <ThumbsDown className="w-4 h-4" />Not really
              </button>
            </div>
          </div>

          {submitError ? <p className="text-sm text-red-500">{submitError}</p> : null}
          <Button variant="primary" className="w-full" onClick={submit} disabled={!canSubmit || submitting}>
            <Star className="w-4 h-4" />{submitting ? 'Submitting…' : 'Submit Review'}
          </Button>
        </div>
      </div>
    </StandalonePageShell>
  )
}

export default SessionReview
