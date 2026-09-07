import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/usePermissions'
import UserAvatar from './UserAvatar'
import NotificationBell from './NotificationBell'
import UserProfileDropdown from './UserProfileDropdown'
import { AdminErrorBoundary } from './AdminErrorBoundary'
import { Badge } from '@/components/ui/badge'
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
  Menu,
  Globe2,
  Shield,
} from 'lucide-react'

type NavItem = {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

type NavGroup = {
  label: string
  items: NavItem[]
}

function DashboardBreadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.replace('/dashboard', '').split('/').filter(Boolean)

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[var(--desk-muted)]" aria-label="Breadcrumb">
      <Link to="/dashboard" className="hover:text-[var(--desk-navy)] transition-colors font-medium">
        Dashboard
      </Link>
      {segments.map((seg, i) => (
        <span key={`${seg}-${i}`} className="flex items-center gap-1.5">
          <span aria-hidden="true">/</span>
          <span className="text-[var(--desk-navy)] font-medium capitalize">{seg.replace(/-/g, ' ')}</span>
        </span>
      ))}
    </nav>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut, canAccessAdmin } = useAuth()
  const { can } = usePermissions()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navGroups = useMemo<NavGroup[]>(() => {
    const workspace: NavItem[] = [{ label: 'Overview', path: '/dashboard', icon: LayoutDashboard }]

    if (can('applications.read')) {
      workspace.push({ label: 'Applications', path: '/dashboard/applications', icon: Briefcase })
    }
    if (can('documents.read')) {
      workspace.push({ label: 'Documents', path: '/dashboard/documents', icon: FileText })
    }
    if (can('appointments.read')) {
      workspace.push({ label: 'Appointments', path: '/dashboard/appointments', icon: Calendar })
    }

    const support: NavItem[] = [
      { label: 'Officer Chat', path: '/dashboard/chat', icon: MessageSquare },
      { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    ]

    const account: NavItem[] = [{ label: 'Profile Settings', path: '/dashboard/profile', icon: Settings }]

    if (canAccessAdmin) {
      account.push({ label: 'Admin Panel', path: '/admin', icon: Shield })
    }

    return [
      { label: 'Workspace', items: workspace },
      { label: 'Support', items: support },
      { label: 'Account', items: account },
    ].filter((group) => group.items.length > 0)
  }, [can, canAccessAdmin])

  const isActive = (path: string) =>
    path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path)

  const activeLabel =
    navGroups.flatMap((g) => g.items).find((item) => isActive(item.path))?.label || 'Overview'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!user) return null

  const sidebarWidth = collapsed ? 'w-[64px]' : 'w-64'

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="h-full flex flex-col min-h-0">
      <div className={`shrink-0 flex items-center gap-3 p-4 border-b border-[var(--desk-line)] ${collapsed ? 'justify-center' : ''}`}>
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--desk-gold)]/15 text-[var(--desk-gold)] ring-1 ring-[var(--desk-gold)]/30 shrink-0"
          aria-label="Siddhivinayak home"
        >
          <Globe2 className="w-4.5 h-4.5" aria-hidden="true" />
        </Link>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="desk-display text-sm font-semibold text-[var(--desk-navy)] truncate">Siddhivinayak</h1>
            <p className="text-[10px] text-[var(--desk-muted)] uppercase tracking-[0.14em]">Applicant Desk</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex p-1.5 rounded-md hover:bg-[var(--desk-gold)]/10 text-[var(--desk-muted)]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="shrink-0 mx-3 mt-3 p-3 rounded-xl bg-[var(--desk-ivory)]/80 border border-[var(--desk-line)]">
          <div className="flex items-center gap-2.5">
            <UserAvatar
              imageUrl={profile?.profile_photo_url}
              fullName={profile?.full_name || user.email}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--desk-navy)] truncate">
                {profile?.full_name || 'Applicant'}
              </p>
              <p className="text-[10px] text-[var(--desk-muted)] truncate">{user.email}</p>
              <Badge className="mt-1 text-[10px] capitalize bg-[var(--desk-gold)]/15 text-[#8a6a1a] border border-[var(--desk-gold)]/25 hover:bg-[var(--desk-gold)]/15">
                {profile?.user_role?.replace(/_/g, ' ') || 'applicant'}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-2 space-y-4" aria-label="Dashboard">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-[var(--desk-muted)] uppercase tracking-[0.14em] px-3 mb-2">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2.5 min-h-10 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'desk-nav-active'
                        : 'text-[var(--desk-muted)] hover:bg-[var(--desk-gold)]/10 hover:text-[var(--desk-navy)]'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {collapsed && <span className="sr-only">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 p-2 border-t border-[var(--desk-line)]">
        <button
          type="button"
          onClick={handleSignOut}
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex items-center gap-2 w-full px-3 py-2.5 min-h-10 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          {!collapsed && 'Sign Out'}
          {collapsed && <span className="sr-only">Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="premium-desk h-dvh w-full flex overflow-hidden">
      <a href="#dashboard-main" className="skip-to-content">
        Skip to main content
      </a>

      <aside
        className={`desk-sidebar hidden lg:flex flex-col h-dvh border-r transition-all duration-200 shrink-0 overflow-hidden ${sidebarWidth}`}
        aria-label="Dashboard sidebar"
      >
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[var(--desk-navy)]/40 lg:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`desk-sidebar fixed inset-y-0 left-0 z-50 h-dvh w-64 border-r flex flex-col overflow-hidden transition-transform duration-200 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!mobileOpen}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </aside>

      <div className="flex-1 flex flex-col h-dvh min-w-0 overflow-hidden">
        <header className="desk-topbar shrink-0 h-14 border-b flex items-center gap-3 px-3 sm:px-4 lg:px-6 z-30">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-[var(--desk-gold)]/10 text-[var(--desk-muted)]"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="hidden md:block">
              <DashboardBreadcrumbs />
            </div>
            <h1 className="md:hidden desk-display text-sm font-semibold text-[var(--desk-navy)] truncate">
              {activeLabel}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <NotificationBell />
            <div className="hidden sm:block">
              <UserProfileDropdown />
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/profile')}
              className="sm:hidden p-1 rounded-full border border-[var(--desk-gold)]/30 hover:bg-[var(--desk-gold)]/10"
              aria-label="Open profile settings"
            >
              <UserAvatar
                imageUrl={profile?.profile_photo_url}
                fullName={profile?.full_name || user.email}
                size="sm"
              />
            </button>
          </div>
        </header>

        <main
          id="dashboard-main"
          tabIndex={-1}
          className="flex-1 min-h-0 p-4 lg:p-8 overflow-y-auto outline-none"
        >
          <div className="mx-auto w-full max-w-6xl">
            <AdminErrorBoundary key={location.pathname}>{children}</AdminErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
