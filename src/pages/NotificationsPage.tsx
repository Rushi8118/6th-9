import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications, type Notification } from '@/hooks/useNotifications'
import {
  Bell,
  Clipboard,
  CalendarRange,
  Landmark,
  Info,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'

const TABS = ['All', 'Unread', 'Applications', 'Documents', 'Appointments', 'Chat'] as const
type Tab = (typeof TABS)[number]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ud-copper)] focus-visible:ring-offset-2'

function notificationIcon(type: Notification['type']) {
  switch (type) {
    case 'application_update':
      return <Clipboard className="h-5 w-5 text-[var(--ud-copper)]" aria-hidden="true" />
    case 'consultation_reminder':
      return <CalendarRange className="h-5 w-5 text-[var(--ud-sea)]" aria-hidden="true" />
    case 'payment_due':
      return <Landmark className="h-5 w-5 text-red-700" aria-hidden="true" />
    case 'document_request':
      return <Clipboard className="h-5 w-5 text-[var(--ud-copper)]" aria-hidden="true" />
    case 'promotion':
      return <Info className="h-5 w-5 text-[var(--ud-ink-soft)]" aria-hidden="true" />
    default:
      return <Bell className="h-5 w-5 text-[var(--ud-ink)]" aria-hidden="true" />
  }
}

function matchesTab(notif: Notification, tab: Tab): boolean {
  if (tab === 'Unread') return !notif.is_read
  if (tab === 'Applications') return notif.type === 'application_update'
  if (tab === 'Documents') return notif.type === 'document_request'
  if (tab === 'Appointments') return notif.type === 'consultation_reminder'
  if (tab === 'Chat') return notif.type === 'general'
  return true
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
    isError,
    refetch,
  } = useNotifications()
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const navigate = useNavigate()

  const filtered = useMemo(
    () => notifications.filter((notif) => matchesTab(notif, activeTab)),
    [notifications, activeTab],
  )

  const handleItemClick = (notif: Notification) => {
    if (!notif.is_read) markAsRead(notif.id)
    if (notif.action_url) navigate(notif.action_url)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <span className="shrink-0 rounded-xl bg-[var(--ud-copper)]/10 p-2.5 text-[var(--ud-copper)]" aria-hidden="true">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-sm font-bold text-foreground">Notifications</h1>
            <p className="mt-0.5 text-xs text-foreground/65">
              {unreadCount > 0 ? (
                <>
                  You have <strong className="text-[var(--ud-copper)]">{unreadCount}</strong> unread
                </>
              ) : (
                'You are all caught up'
              )}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={() => markAllAsRead()}
            className="gap-1.5 rounded-xl bg-[var(--ud-ink)] text-[var(--ud-canvas)] hover:bg-[var(--ud-ink)]/90"
            size="sm"
          >
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            Mark all as read
          </Button>
        )}
      </header>

      <div className="relative">
        <div
          role="tablist"
          aria-label="Filter notifications"
          className="flex gap-1 overflow-x-auto rounded-xl border border-border/30 bg-[var(--ud-canvas)]/50 p-1 [scrollbar-width:thin] mask-fade-x"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`min-h-10 min-w-[4.75rem] flex-1 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition ${focusRing} ${
                activeTab === tab
                  ? 'bg-[var(--ud-ink)] text-[var(--ud-canvas)] shadow-sm'
                  : 'text-foreground/65 hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-xl bg-gradient-to-l from-[var(--ud-canvas)] to-transparent sm:hidden"
          aria-hidden="true"
        />
      </div>

      {isError ? (
        <div className="rounded-2xl border border-border/50 bg-card px-6 py-12 text-center shadow-sm" role="alert">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-600/80" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">Could not load notifications</p>
          <p className="mt-1 text-xs text-foreground/65">Check your connection and try again.</p>
          <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading notifications">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl border border-border/20 bg-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card py-16 text-center shadow-sm">
          <Bell className="mx-auto mb-2 h-12 w-12 text-foreground/25" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground/70">No notifications here</p>
          <p className="mt-1 text-xs text-foreground/55">Nothing matches this filter yet.</p>
        </div>
      ) : (
        <ul className="space-y-3" aria-label={`${activeTab} notifications`}>
          {filtered.map((notif) => (
            <li key={notif.id}>
              <button
                type="button"
                onClick={() => handleItemClick(notif)}
                className={`flex w-full items-start justify-between gap-4 rounded-xl border border-border/50 bg-card p-4 text-left transition hover:border-[var(--ud-copper)]/35 hover:shadow-sm ${focusRing} ${
                  !notif.is_read ? 'border-l-2 border-l-[var(--ud-copper)] bg-[var(--ud-copper)]/5' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span className="shrink-0 rounded-xl bg-[var(--ud-ink)]/5 p-2.5">
                    {notificationIcon(notif.type)}
                  </span>
                  <div className="space-y-1.5 min-w-0">
                    <h2
                      className={`text-sm text-foreground ${!notif.is_read ? 'font-bold' : 'font-semibold'}`}
                    >
                      {notif.title}
                      {!notif.is_read && <span className="sr-only"> (unread)</span>}
                    </h2>
                    {notif.message && (
                      <p className="max-w-xl text-xs leading-normal text-foreground/65">{notif.message}</p>
                    )}
                    <span className="block text-[11px] text-foreground/55">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      {notif.action_label ? ` · ${notif.action_label}` : ''}
                    </span>
                  </div>
                </div>
                {!notif.is_read && (
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--ud-copper)]" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
