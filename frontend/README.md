# RokKru Frontend

A modern tutoring platform frontend built with React 18, Vite, and Tailwind CSS.

## Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool & dev server
- **Tailwind CSS** + **shadcn/ui** — Styling & component primitives
- **fetch API** — HTTP client (native, via `apiRequest()` wrapper)
- **React Router** — Client-side routing
- **Lucide React** — Icons
- **class-variance-authority (cva)** — Component variants
- **tailwind-merge** — Conflict-free class merging via `cn()`

## Quick Start

```bash
npm install
npm run dev
# ✓ Running on http://localhost:5173
```

## Folder Structure

```
src/
├── components/           # Reusable Components
│   ├── ui/               # 13 files — Avatar, Badge, Button, Input, Select, Modal, Toggle, etc.
│   ├── layout/           # 11 files — MainLayout, AdminLayout, AppLayout, AuthLayout, Navbar, Footer, SettingsMenu, etc.
│   ├── common/           # 43 files — FilterBar, TeacherCard, PageCard, SearchFilter, TeacherList, etc.
│   └── backgrounds/      # 13 files — AnimatedBackground, GalaxyBackground, AdminPanelBackground, etc.
│
├── pages/                # Route Pages (organized by role)
│   ├── auth/             # Login, CreateAccount, Landing, AdminLogin
│   ├── onboarding/       # ChooseCommunity, CompleteProfile
│   ├── student/          # Home, Schedule, Profile, Messages, Community, etc.
│   ├── teacher/          # TeacherHome, Analytics, EditProfile, Billing, etc.
│   ├── admin/            # AdminDashboard, UserManagement, Reports, etc.
│   ├── community/        # CommunityDetail, CreateCommunity
│   ├── legal/            # Contact, Help, Privacy, Terms + InApp variants
│   └── NotFound.jsx      # 404 page
│
├── hooks/                # 23 files — Custom Hooks & Context
│   ├── AuthContext.jsx   # Authentication (useAuth)
│   ├── useTeachers.js    # Teacher data fetching
│   ├── useTeacherFilters.js # Teacher filter state
│   ├── useAmbientPointer.js # Ambient pointer for glass effects
│   └── ...               # useFilterBar, useBookingForm, useChat, usePagination, etc.
│
├── services/             # 20 files — API Connection Layer
│   ├── api.js            # fetch wrapper + JWT auto-attach
│   ├── apiClient.js      # Base API client
│   ├── endpoints.js      # API endpoint constants
│   ├── authService.js    # /auth endpoints
│   ├── teacherService.js # /teachers endpoints
│   └── ...               # sessionService, communityService, filterService, etc.
│
├── constants/            # 14 files — Static Data & Config
│   ├── teacherFilters.js # Filter options
│   ├── mockData.js       # Demo data
│   ├── tokens.js         # Design tokens
│   ├── communities.js    # Community data
│   ├── env.js            # Environment config
│   └── ...               # filters, typography, legalContent, presets, etc.
│
├── lib/                  # 12 files — Utility Libraries & i18n
│   ├── utils.js          # cn() function (tailwind-merge + clsx)
│   ├── LanguageProvider.jsx  # i18n context
│   ├── localeEn.js       # English translations
│   ├── localeKm.js       # Khmer translations
│   └── ...               # localizeOptions, kmOptionLabels, entities, types, etc.
│
├── utils/                # 4 files — Helper Functions
│   ├── teacherSubscription.js
│   ├── filterTeachers.js
│   └── teacherQuery.js
│
├── assets/               # Static Assets (hero.png, vite.svg)
│
├── App.jsx               # Router & Route Config
├── main.jsx              # Entry Point
├── i18n.js               # i18n barrel exports
└── index.css             # Tailwind Global Styles
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Import Aliases

All imports use `@/` prefix pointing to `src/`:

```javascript
import { Button, Input, Modal } from '@/components/ui'
import { FilterBar, TeacherCard, PageCard } from '@/components/common'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/hooks'
import { teacherService, authService } from '@/services'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/LanguageProvider'
```

Configured in `jsconfig.json` (IDE) and `vite.config.js` (build).

## shadcn/ui

shadcn/ui is configured via `components.json`. Add new components:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
```

Components install to `src/components/ui/`.

## Background Animations

Background animations are used **ONLY** on:
- Login page
- Register (CreateAccount) page
- Home / Landing page

Student and Teacher pages do **NOT** use background animations.

## API Proxy

Vite proxies `/api` requests to the backend:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```
