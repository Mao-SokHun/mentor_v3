import { Link } from 'react-router-dom'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import { PageAmbient, PageSection, PageCard } from '@/components'
import Button from '@/components/ui/Button'
import { useTranslation } from '@/i18n'
import { fetchMyBookings } from '@/services/students/studentBookingService'
import { SHARED_ROUTES, STUDENT_ROUTES } from '@/constants/student/studentRoutes'

const StudentBookings = () => {
  const { t } = useTranslation()
  const bookings = fetchMyBookings()

  return (
    <PageAmbient variant="schedule" className="space-y-8">
      <PageSection
        title={t('student.myBookings')}
        subtitle={t('student.myBookingsSubtitle')}
      />

      {bookings.length === 0 ? (
        <PageCard className="text-center py-12">
          <p className="text-slate-600 font-medium">{t('student.noBookings')}</p>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">{t('student.noBookingsHint')}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link to={SHARED_ROUTES.home}>
              <Button variant="primary">{t('student.findTeachers')}</Button>
            </Link>
            <Link to={SHARED_ROUTES.schedule}>
              <Button variant="ghost">{t('student.browseSchedule')}</Button>
            </Link>
          </div>
        </PageCard>
      ) : (
        <ul className="space-y-3">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <PageCard className="!p-4 sm:!p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="font-bold text-slate-800">{booking.mentorName || t('student.mentorSession')}</p>
                    <p className="text-sm text-slate-600">{booking.topicLabel || booking.topic}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      {booking.sessionDate ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {booking.sessionDate}
                        </span>
                      ) : null}
                      {booking.sessionTime ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {booking.sessionTime}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <Link
                    to={STUDENT_ROUTES.sessionReview(booking.id)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 shrink-0"
                  >
                    {t('student.leaveReview')}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </PageCard>
            </li>
          ))}
        </ul>
      )}
    </PageAmbient>
  )
}

export default StudentBookings
