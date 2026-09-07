import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useApplications } from '@/hooks/useApplications'
import { useDocuments } from '@/hooks/useDocuments'
import { useAppointments } from '@/hooks/useAppointments'
import { useChat } from '@/hooks/useChat'
import UserAvatar from '@/components/UserAvatar'
import { FlagIcon } from '@/components/flag-icon'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  FileText,
  Calendar,
  MessageSquare,
  ChevronRight,
  Plus,
  Clock,
  ArrowRight,
} from 'lucide-react'

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  onClick,
}: {
  title: string
  value: string | number
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="desk-panel desk-stat-rail rounded-2xl p-5 text-left hover:border-[var(--desk-gold)]/40 transition w-full min-h-[7.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desk-gold)]"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--desk-muted)]">{title}</p>
          <p className="mt-2 desk-display text-2xl sm:text-3xl font-semibold text-[var(--desk-navy)] break-words leading-tight">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-[var(--desk-muted)]">{hint}</p>}
        </div>
        <div className="rounded-xl p-3 bg-[var(--desk-gold)]/15 text-[var(--desk-gold)] shrink-0">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </button>
  )
}

export default function DashboardHome() {
  const { user, profile } = useAuth()
  const { applications, isLoading: appsLoading } = useApplications()
  const { documents, isLoading: docsLoading } = useDocuments()
  const { appointments, isLoading: apptsLoading } = useAppointments()
  const { messages, isLoading: chatLoading } = useChat()
  const navigate = useNavigate()

  if (!user) return null

  const pendingDocsCount = documents.filter((d) => d.status === 'Missing' || d.status === 'Rejected').length
  const upcomingAppts = appointments
    .filter((a) => a.status === 'Scheduled' && new Date(a.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  const nextApptStr =
    upcomingAppts.length > 0
      ? `${new Date(upcomingAppts[0].scheduled_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })} · ${new Date(upcomingAppts[0].scheduled_at).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      : 'None scheduled'

  const unreadMessagesCount = messages.filter((m) => m.receiver_id === user.id && !m.is_read).length
  const firstName =
    profile?.first_name || (profile?.full_name ? profile.full_name.split(' ')[0] : null) || 'Applicant'

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-800 border-emerald-600/25'
      case 'rejected':
        return 'bg-red-500/10 text-red-800 border-red-600/25'
      case 'under_review':
        return 'bg-[var(--desk-gold)]/15 text-[#8a6a1a] border-[var(--desk-gold)]/35'
      case 'submitted':
        return 'bg-[var(--desk-navy)]/8 text-[var(--desk-navy)] border-[var(--desk-navy)]/15'
      default:
        return 'bg-[var(--desk-ivory)] text-[var(--desk-muted)] border-[var(--desk-line)]'
    }
  }

  const recentActivities = []
  if (applications[0]) {
    recentActivities.push({
      title: `Application started: ${applications[0].countries?.name || 'Visa Program'}`,
      description: `Status: ${applications[0].status.replaceAll('_', ' ')}`,
      time: new Date(applications[0].created_at),
      icon: Briefcase,
    })
  }
  if (appointments[0]) {
    recentActivities.push({
      title: `Meeting booked: ${appointments[0].appointment_type}`,
      description: `Status: ${appointments[0].status}`,
      time: new Date(appointments[0].created_at),
      icon: Calendar,
    })
  }
  if (documents[0]) {
    recentActivities.push({
      title: `Document filed: ${documents[0].name}`,
      description: `Status: ${documents[0].status}`,
      time: new Date(documents[0].created_at),
      icon: FileText,
    })
  }
  const sortedActivities = recentActivities
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="desk-panel relative overflow-hidden rounded-2xl p-5 sm:p-6">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,var(--desk-navy)_0%,#2a3555_60%,#334066_100%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 85%, rgba(196,154,43,0.45), transparent 32%), radial-gradient(circle at 90% 15%, rgba(255,248,231,0.12), transparent 30%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar
              imageUrl={profile?.profile_photo_url}
              fullName={profile?.full_name || user.email}
              size="md"
              className="ring-2 ring-[var(--desk-gold)]/45"
            />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--desk-gold-soft)] font-semibold">
                Applicant command center
              </p>
              <h2 className="desk-display text-xl sm:text-2xl font-semibold text-[#FFF8E7] truncate">
                Welcome back, {firstName}
              </h2>
              <p className="text-sm text-[#FFF8E7]/80 mt-1">
                Track pathways, documents, and officer updates in one premium desk.
              </p>
            </div>
          </div>
          <Button asChild className="rounded-full bg-[var(--desk-gold)] text-[var(--desk-navy)] hover:bg-[var(--desk-gold)]/90 font-bold btn-glow shrink-0">
            <Link to="/countries">
              Explore programs
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <section aria-label="Dashboard statistics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Applications"
          value={appsLoading ? '…' : applications.length}
          hint="Active files"
          icon={Briefcase}
          onClick={() => navigate('/dashboard/applications')}
        />
        <StatCard
          title="Documents due"
          value={docsLoading ? '…' : pendingDocsCount}
          hint="Need attention"
          icon={FileText}
          onClick={() => navigate('/dashboard/documents')}
        />
        <StatCard
          title="Next session"
          value={apptsLoading ? '…' : nextApptStr}
          hint="Consultation"
          icon={Calendar}
          onClick={() => navigate('/dashboard/appointments')}
        />
        <StatCard
          title="Unread chat"
          value={chatLoading ? '…' : unreadMessagesCount}
          hint="Officer messages"
          icon={MessageSquare}
          onClick={() => navigate('/dashboard/chat')}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          <section className="desk-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="desk-display text-base font-semibold text-[var(--desk-navy)]">Pathway progress</h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/dashboard/applications')} className="text-[var(--desk-gold)]">
                View all
                <ChevronRight className="h-3.5 w-3.5 ml-0.5" aria-hidden="true" />
              </Button>
            </div>

            {applications.length === 0 ? (
              <div className="py-10 text-center rounded-xl border border-dashed border-[var(--desk-line)] bg-[var(--desk-ivory)]/50 px-3">
                <Briefcase className="h-9 w-9 text-[var(--desk-muted)]/50 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm text-[var(--desk-muted)] font-medium">No active applications yet</p>
                <Button type="button" variant="link" onClick={() => navigate('/countries')} className="text-[var(--desk-gold)]">
                  Browse destination programs
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {applications.slice(0, 3).map((app) => (
                  <li key={app.id}>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/applications')}
                      className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--desk-line)] bg-[var(--desk-ivory)]/40 p-3.5 text-left hover:border-[var(--desk-gold)]/40 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span aria-hidden="true">
                          {app.countries?.name ? (
                            <FlagIcon country={app.countries.name} className="text-2xl" />
                          ) : (
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--desk-gold)]/15 text-[var(--desk-gold)]">
                              <Briefcase className="h-4 w-4" />
                            </span>
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--desk-navy)] truncate">
                            {app.countries?.name || 'Destination'}
                          </p>
                          <p className="text-xs text-[var(--desk-muted)] truncate">
                            {app.visa_programs?.name || 'Visa Program'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold border rounded-md px-2.5 py-1 shrink-0 ${getStatusStyle(app.status)}`}>
                        {app.status.replaceAll('_', ' ')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="desk-panel rounded-2xl p-5">
            <h3 className="desk-display text-base font-semibold text-[var(--desk-navy)] mb-4">Quick actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Upload document', href: '/dashboard/documents', icon: FileText },
                { label: 'Book session', href: '/dashboard/appointments', icon: Plus },
                { label: 'Message officer', href: '/dashboard/chat', icon: MessageSquare },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.label}
                    type="button"
                    variant="outline"
                    onClick={() => navigate(action.href)}
                    className="h-auto min-h-[5rem] rounded-xl flex flex-col items-start justify-center gap-2 p-4 border-[var(--desk-line)] hover:border-[var(--desk-gold)]/40 hover:bg-[var(--desk-gold)]/5"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--desk-gold)]/15 text-[var(--desk-gold)]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-[var(--desk-navy)]">{action.label}</span>
                  </Button>
                )
              })}
            </div>
          </section>
        </div>

        <section className="lg:col-span-4 desk-panel rounded-2xl p-5 space-y-4 self-start">
          <h3 className="desk-display text-base font-semibold text-[var(--desk-navy)]">Recent activity</h3>
          {sortedActivities.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <Clock className="h-8 w-8 text-[var(--desk-muted)]/40 mb-2" aria-hidden="true" />
              <p className="text-sm text-[var(--desk-muted)] font-medium">No recent logs yet</p>
            </div>
          ) : (
            <ol className="space-y-3">
              {sortedActivities.map((act, idx) => {
                const Icon = act.icon
                return (
                  <li key={`${act.title}-${idx}`} className="flex gap-3 rounded-xl border border-[var(--desk-line)] bg-[var(--desk-ivory)]/40 p-3">
                    <span className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-[var(--desk-gold)]/15 text-[var(--desk-gold)]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-sm font-semibold text-[var(--desk-navy)] leading-snug">{act.title}</h4>
                      <p className="text-xs text-[var(--desk-muted)]">{act.description}</p>
                      <time className="text-[11px] text-[var(--desk-muted)] block" dateTime={act.time.toISOString()}>
                        {act.time.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}
