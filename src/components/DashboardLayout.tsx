import React, { useMemo, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/usePermissions'
import UserAvatar from './UserAvatar'
import NotificationBell from './NotificationBell'
import UserProfileDropdown from './UserProfileDropdown'
import { AdminErrorBoundary } from './AdminErrorBoundary'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Shield,
  MoreHorizontal,
} from 'lucide-react'

type NavItem = {
  label: string
  shortLabel: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

const PRIMARY_MOBILE_PATHS = [
  '/dashboard',
  '/dashboard/applications',
  '/dashboard/documents',
  '/dashboard/appointments',
  '/dashboard/chat',
] as const

const navFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ud-copper)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ud-ink)]'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut, canAccessAdmin } = useAuth()
  const { can } = usePermissions()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const navigationItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { label: 'Overview', shortLabel: 'Home', path: '/dashboard', icon: LayoutDashboard },
    ]

    if (can('applications.read')) {
      items.push({ label: 'Applications', shortLabel: 'Apps', path: '/dashboard/applications', icon: Briefcase })
    }

    if (can('documents.read')) {
      items.push({ label: 'Documents', shortLabel: 'Docs', path: '/dashboard/documents', icon: FileText })
    }

    if (can('appointments.read')) {
      items.push({ label: 'Appointments', shortLabel: 'Appts', path: '/dashboard/appointments', icon: Calendar })
    }

    items.push(
      { label: 'Officer Chat', shortLabel: 'Chat', path: '/dashboard/chat', icon: MessageSquare },
      { label: 'Notifications', shortLabel: 'Alerts', path: '/dashboard/notifications', icon: Bell },
      { label: 'Profile Settings', shortLabel: 'Profile', path: '/dashboard/profile', icon: Settings },
    )

    if (canAccessAdmin) {
      items.push({ label: 'Admin Panel', shortLabel: 'Admin', path: '/admin', icon: Shield })
    }

    return items
  }, [can, canAccessAdmin])

  const isItemActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  const activeItem =
    navigationItems.find((item) => isItemActive(item.path)) || navigationItems[0]

  const mobilePrimary = navigationItems
    .filter((item) => (PRIMARY_MOBILE_PATHS as readonly string[]).includes(item.path))
    .slice(0, 4)

  const mobileMoreItems = navigationItems.filter(
    (item) => !mobilePrimary.some((primary) => primary.path === item.path),
  )

  const moreIsActive = mobileMoreItems.some((item) => isItemActive(item.path))

  const handleLogout = async () => {
    setMoreOpen(false)
    await signOut()
    navigate('/')
  }

  const goTo = (path: string) => {
    setMoreOpen(false)
    navigate(path)
  }

  if (!user) return null

  return (
    <div className="user-dashboard h-dvh w-full flex flex-col md:flex-row overflow-hidden">
      <a href="#dashboard-main" className="skip-to-content">
        Skip to main content
      </a>

      <aside
        className={`ud-rail hidden md:flex flex-col h-dvh text-[#FFF8E7] transition-[width] duration-300 relative shrink-0 overflow-hidden ${
          collapsed ? 'w-20' : 'w-[17rem]'
        }`}
        aria-label="Dashboard sidebar"
      >
        <div className="h-[4.25rem] shrink-0 flex items-center px-4 border-b border-white/10 justify-between">
          <Link
            to="/"
            className={`flex items-center gap-2.5 group overflow-hidden rounded-lg ${navFocus}`}
            aria-label="Siddhivinayak home"
          >
            <span
              className="h-9 w-9 rounded-lg bg-[var(--ud-copper)]/20 flex items-center justify-center ring-1 ring-[var(--ud-copper)]/40"
              aria-hidden="true"
            >
              <Globe2 className="h-4.5 w-4.5 text-[var(--ud-copper-soft)]" />
            </span>
            {!collapsed && (
              <span className="ud-display font-semibold text-[0.95rem] tracking-tight text-[#FFF8E7] truncate group-hover:text-[var(--ud-copper-soft)] transition-colors">
                Siddhivinayak
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className={`absolute top-[1.15rem] -right-3 h-7 w-7 rounded-md bg-[var(--ud-copper)] text-white border border-[var(--ud-ink)] flex items-center justify-center hover:brightness-110 transition ${navFocus} focus-visible:ring-offset-[var(--ud-canvas)]`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>

        {!collapsed && (
          <div className="shrink-0 mx-3 mt-3 mb-1 rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="flex items-center gap-3">
              <UserAvatar
                imageUrl={profile?.profile_photo_url}
                fullName={profile?.full_name || user.email}
                size="sm"
              />
              <div className="overflow-hidden flex-1 leading-tight">
                <p className="text-xs font-semibold text-[#FFF8E7] truncate">
                  {profile?.full_name || 'Applicant'}
                </p>
                <p className="text-[11px] text-[#FFF8E7]/70 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto" aria-label="Primary">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isItemActive(item.path)

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-11 rounded-lg text-[0.8rem] font-semibold transition relative group ${navFocus} ${
                  active
                    ? 'ud-rail-active'
                    : 'text-[#d8d2c4] hover:text-[#FFF8E7] hover:bg-white/10'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-[#1A2340]' : 'text-[var(--ud-copper-soft)]'}`}
                  aria-hidden="true"
                />
                {!collapsed && <span>{item.label}</span>}
                {collapsed && <span className="sr-only">{item.label}</span>}
                {collapsed && (
                  <span
                    className="absolute left-full ml-3 px-2 py-1 bg-[var(--ud-ink)] text-[#f4faf9] border border-white/15 text-[11px] rounded-md opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition z-50 pointer-events-none whitespace-nowrap"
                    aria-hidden="true"
                  >
                    {item.label}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="shrink-0 p-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-11 rounded-lg text-[0.8rem] font-semibold text-[#f0b4a4] hover:text-[#ffd4c8] hover:bg-red-500/10 transition ${navFocus} ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            {!collapsed && <span>Logout</span>}
            {collapsed && <span className="sr-only">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-dvh min-w-0 overflow-hidden pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <header className="ud-topbar h-14 sm:h-[4.25rem] shrink-0 px-3 sm:px-5 md:px-7 flex items-center justify-between z-40">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className={`flex md:hidden h-10 w-10 rounded-lg bg-[var(--ud-ink)] items-center justify-center shrink-0 ${navFocus} focus-visible:ring-offset-[var(--ud-canvas)]`}
              aria-label="Siddhivinayak home"
            >
              <Globe2 className="h-4 w-4 text-[var(--ud-copper-soft)]" aria-hidden="true" />
            </Link>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--ud-muted)] font-semibold hidden sm:block">
                Applicant desk
              </p>
              <h1 className="ud-display text-base sm:text-lg font-semibold text-[var(--ud-text)] truncate leading-tight">
                {activeItem.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <NotificationBell />
            <UserProfileDropdown />
          </div>
        </header>

        <main
          id="dashboard-main"
          tabIndex={-1}
          className="flex-1 min-h-0 p-3 sm:p-5 md:p-7 overflow-y-auto max-w-6xl w-full mx-auto outline-none"
        >
          <AdminErrorBoundary key={location.pathname}>{children}</AdminErrorBoundary>
        </main>
      </div>

      <nav
        className="ud-mobile-nav md:hidden fixed bottom-0 inset-x-0 z-40 px-1 pt-1"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        aria-label="Mobile primary"
      >
        <div className="flex items-stretch justify-around min-h-14">
          {mobilePrimary.map((item) => {
            const Icon = item.icon
            const active = isItemActive(item.path)

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => goTo(item.path)}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
                className={`flex flex-1 flex-col items-center justify-center gap-1 min-h-12 py-1.5 px-1 rounded-lg transition ${navFocus} ${
                  active ? 'text-[var(--ud-copper-soft)]' : 'text-[#c8c2b4] hover:text-[#FFF8E7]'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-semibold leading-none">{item.shortLabel}</span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="More navigation options"
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            aria-controls="dashboard-more-sheet"
            className={`flex flex-1 flex-col items-center justify-center gap-1 min-h-12 py-1.5 px-1 rounded-lg transition ${navFocus} ${
              moreIsActive || moreOpen
                ? 'text-[var(--ud-copper-soft)]'
                : 'text-[#c8c2b4] hover:text-[#FFF8E7]'
            }`}
          >
            <MoreHorizontal className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-semibold leading-none">More</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          id="dashboard-more-sheet"
          side="bottom"
          className="rounded-t-2xl bg-[var(--ud-ink)] text-[#FFF8E7] border-[var(--ud-copper)]/30 pb-[max(1.5rem,env(safe-area-inset-bottom))] [&_[data-slot=sheet-close]]:text-[#FFF8E7] [&_[data-slot=sheet-close]]:hover:bg-white/10"
        >
          <SheetHeader className="text-left pb-2">
            <SheetTitle className="ud-display text-[#FFF8E7]">More</SheetTitle>
            <SheetDescription className="text-[#c8c2b4]">
              Additional dashboard destinations
            </SheetDescription>
          </SheetHeader>
          <nav className="mt-2 space-y-1" aria-label="More dashboard links">
            {mobileMoreItems.map((item) => {
              const Icon = item.icon
              const active = isItemActive(item.path)

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => goTo(item.path)}
                  aria-current={active ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 min-h-12 rounded-lg text-sm font-semibold transition ${navFocus} ${
                    active
                      ? 'bg-[var(--ud-copper)] text-[#1A2340]'
                      : 'text-[#FFF8E7]/85 hover:bg-white/10'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${active ? 'text-[#1A2340]' : 'text-[var(--ud-copper-soft)]'}`}
                    aria-hidden="true"
                  />
                  {item.label}
                </button>
              )
            })}
            <button
              type="button"
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3.5 min-h-12 rounded-lg text-sm font-semibold text-[#f0b4a4] hover:bg-red-500/10 transition ${navFocus}`}
            >
              <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
              Logout
            </button>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
