import {
  LayoutDashboard, Users, BookOpen,
  BarChart2, HelpCircle, Mail,
  FileText, Lock,
} from 'lucide-react'

/** Sidebar navigation — Billing & Settings live in profile dropdown only */
export const ADMIN_NAV_GROUPS = [
  {
    labelKey: 'admin.main',
    items: [
      { icon: LayoutDashboard, labelKey: 'admin.dashboard', href: '/admin' },
      { icon: Users, labelKey: 'admin.userManagement', href: '/admin/users' },
      { icon: BookOpen, labelKey: 'admin.content', href: '/admin/content' },
      { icon: BarChart2, labelKey: 'admin.reports', href: '/admin/reports' },
    ],
  },
  {
    labelKey: 'admin.support',
    items: [
      { icon: HelpCircle, labelKey: 'admin.helpCenter', href: '/admin/help' },
      { icon: Mail, labelKey: 'admin.contact', href: '/admin/contact' },
      { icon: FileText, labelKey: 'admin.termsOfService', href: '/admin/terms' },
      { icon: Lock, labelKey: 'admin.privacyPolicy', href: '/admin/privacy' },
    ],
  },
]

export const ADMIN_PAGE_TITLE_KEYS = {
  '/admin': 'admin.dashboard',
  '/admin/users': 'admin.userManagement',
  '/admin/mentors': 'admin.mentors',
  '/admin/sessions': 'admin.sessions',
  '/admin/content': 'admin.content',
  '/admin/catalog': 'admin.catalog',
  '/admin/reports': 'admin.reports',
  '/admin/roles': 'admin.roles',
  '/admin/billing': 'admin.billing',
  '/admin/settings': 'admin.settings',
  '/admin/help': 'admin.helpCenter',
  '/admin/contact': 'admin.contact',
  '/admin/terms': 'admin.termsOfService',
  '/admin/privacy': 'admin.privacyPolicy',
}

export function getAdminPageTitleKey(pathname) {
  return ADMIN_PAGE_TITLE_KEYS[pathname] ?? 'admin.dashboard'
}

export function isAdminNavActive(pathname, href) {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(`${href}/`)
}
