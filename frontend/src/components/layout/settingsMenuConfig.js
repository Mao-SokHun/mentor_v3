import { Users, User, CreditCard, Settings, HelpCircle, CalendarCheck } from 'lucide-react'
import { STUDENT_ROUTES } from '@/constants/student/studentRoutes'

/** Shared settings dropdown menus — student / mentor / admin */
export const SETTINGS_MENUS = {
  student: {
    titleKey: 'settings.title',
    subtitleKey: 'settings.studentSubtitle',
    items: [
      { labelKey: 'settings.myProfile', href: '/profile', icon: Users },
      { labelKey: 'settings.myBookings', href: STUDENT_ROUTES.bookings, icon: CalendarCheck },
      { labelKey: 'settings.editProfile', href: '/student/edit-profile', icon: User },
    ],
  },
  mentor: {
    titleKey: 'settings.title',
    subtitleKey: 'settings.mentorSubtitle',
    items: [
      { labelKey: 'settings.myProfile', href: '/mentor/my-profile', icon: Users },
      { labelKey: 'settings.editProfile', href: '/mentor/edit-profile', icon: User },
      { labelKey: 'settings.billing', href: '/mentor/billing', icon: CreditCard },
    ],
  },
  admin: {
    titleKey: 'settings.title',
    subtitleKey: 'settings.adminSubtitle',
    items: [
      { labelKey: 'settings.adminSettings', href: '/admin/settings', icon: Settings },
      { labelKey: 'settings.adminBilling', href: '/admin/billing', icon: CreditCard },
      { labelKey: 'settings.helpCenter', href: '/admin/help', icon: HelpCircle },
    ],
  },
}
