import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useApplications } from '@/hooks/useApplications'
import { useDocuments } from '@/hooks/useDocuments'
import { useAppointments } from '@/hooks/useAppointments'
import { useChat } from '@/hooks/useChat'
import UserAvatar from '@/components/UserAvatar'
import {
  Briefcase,
  FileText,
  Calendar,
  MessageSquare,
  ChevronRight,
  Plus,
  Clock,
  ArrowRight,
  Compass,
} from 'lucide-react'
import { FlagIcon } from '@/components/flag-icon'

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ud-copper)] focus-visible:ring-offset-2'

export default function DashboardHome() {
  const { user, profile } = useAuth()
  const { applications, isLoading: appsLoading } = useApplications()
  const { documents, isLoading: docsLoading } = useDocuments()
  const { appointments, isLoading: apptsLoading } = useAppointments()
  const { messages, isLoading: chatLoading } = useChat()
  const navigate = useNavigate()

  if (!user) return null

  const totalAppsCount = applications.length
  const pendingDocsCount = documents.filter((d) => d.status === 'Missing' || d.status === 'Rejected').length

  const upcomingAppts = appointments
    .filter((a) => a.status === 'Scheduled' && new Date(a.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  const nextApptStr =
    upcomingAppts.length > 0
      ? new Date(upcomingAppts[0].scheduled_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }) +
        ' · ' +
        new Date(upcomingAppts[0].scheduled_at).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'None scheduled'

  const unreadMessagesCount = messages.filter((m) => m.receiver_id === user.id && !m.is_read).length

  const firstName =
    profile?.first_name ||
    (profile?.full_name ? profile.full_name.split(' ')[0] : null) ||
    'Applicant'

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-600/10 text-emerald-800 border-emerald-600/25'
      case 'rejected':
        return 'bg-red-600/10 text-red-800 border-red-600/25'
      case 'under_review':
        return 'bg-[#C49A2B]/15 text-[#8a6a1a] border-[#C49A2B]/35'
      case 'submitted':
        return 'bg-[#1A2340]/8 text-[#1A2340] border-[#1A2340]/15'
      default:
        return 'bg-[var(--ud-canvas)] text-[var(--ud-muted)] border-[var(--ud-line)]'
    }
  }

  const recentActivities = []
  if (applications.length > 0) {
    recentActivities.push({
      title: `Application started: ${applications[0].countries?.name || 'Visa Program'}`,
      description: `Status: ${applications[0].status.replaceAll('_', ' ')}`,
      time: new Date(applications[0].created_at),
      icon: Briefcase,
      tint: 'text-[#1A2340] bg-[#1A2340]/8',
    })
  }
  if (appointments.length > 0) {
    recentActivities.push({
      title: `Meeting booked: ${appointments[0].appointment_type}`,
      description: `Status: ${appointments[0].status}`,
      time: new Date(appointments[0].created_at),
      icon: Calendar,
      tint: 'text-[#1A2340] bg-[#C49A2B]/15',
    })
  }
  if (documents.length > 0) {
    recentActivities.push({
      title: `Document filed: ${documents[0].name}`,
      description: `Status: ${documents[0].status}`,
      time: new Date(documents[0].created_at),
      icon: FileText,
      tint: 'text-[#8a6a1a] bg-[#C49A2B]/12',
    })
  }

  const sortedActivities = recentActivities
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 5)

  const metrics = [
    {
      title: 'Applications',
      value: appsLoading ? '…' : totalAppsCount,
      hint: 'Active files',
      href: '/dashboard/applications',
      accent: '#1A2340',
      icon: Briefcase,
      span: 'min-[520px]:col-span-1 lg:col-span-1',
    },
    {
      title: 'Documents due',
      value: docsLoading ? '…' : pendingDocsCount,
      hint: 'Need attention',
      href: '/dashboard/documents',
      accent: '#C49A2B',
      icon: FileText,
      span: 'min-[520px]:col-span-1 lg:col-span-1',
    },
    {
      title: 'Next session',
      value: apptsLoading ? '…' : nextApptStr,
      hint: 'Consultation',
      href: '/dashboard/appointments',
      accent: '#2a3555',
      icon: Calendar,
      span: 'min-[520px]:col-span-2 lg:col-span-1',
    },
    {
      title: 'Unread chat',
      value: chatLoading ? '…' : unreadMessagesCount,
      hint: 'Officer messages',
      href: '/dashboard/chat',
      accent: '#C49A2B',
      icon: MessageSquare,
      span: 'min-[520px]:col-span-2 lg:col-span-1',
    },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Asymmetric welcome + compass strip */}
      <section
        className="ud-welcome ud-rise relative overflow-hidden rounded-2xl sm:rounded-[1.35rem]"
        aria-labelledby="dashboard-welcome"
      >
        <div className="ud-welcome-mesh absolute inset-0 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 sm:p-6 md:p-8">
          <div className="lg:col-span-8 flex items-start gap-4 min-w-0">
            <UserAvatar
              imageUrl={profile?.profile_photo_url}
              fullName={profile?.full_name || user.email}
              size="lg"
              className="ring-2 ring-[var(--ud-copper-soft)]/50 shrink-0"
            />
            <div className="min-w-0 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#E8B84B] font-semibold">
                Your visa command center
              </p>
              <h2 id="dashboard-welcome" className="ud-display text-2xl sm:text-3xl md:text-[2.15rem] font-semibold leading-[1.15] text-[#FFF8E7]">
                Good to see you, {firstName}
              </h2>
              <p className="text-sm text-[#FFF8E7]/85 max-w-xl leading-relaxed">
                Track pathways, clear documents, and stay synced with your case officer — all in one desk.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 flex lg:flex-col lg:items-end justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C49A2B]/35 bg-[#C49A2B]/15 px-3 py-2 text-xs font-semibold text-[#E8B84B]">
              <Compass className="h-4 w-4" aria-hidden="true" />
              <time dateTime={new Date().toISOString().slice(0, 10)}>
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            </div>
            <button
              type="button"
              onClick={() => navigate('/countries')}
              className={`inline-flex items-center gap-2 rounded-full bg-[#C49A2B] hover:bg-[#C49A2B]/90 text-[#1A2340] text-sm font-bold px-4 py-2.5 min-h-11 transition btn-glow ${focusRing} focus-visible:ring-offset-[#1A2340]`}
            >
              Explore programs
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Bento metrics */}
      <section
        aria-label="Dashboard statistics"
        className="ud-rise ud-rise-2 grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {metrics.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.title}
              type="button"
              onClick={() => navigate(card.href)}
              aria-label={`${card.title}: ${card.value}. Open related page.`}
              style={{ ['--ud-accent' as string]: card.accent }}
              className={`ud-panel ud-stat ${card.span} rounded-xl p-4 sm:p-5 text-left min-h-[7.25rem] flex flex-col justify-between gap-3 hover:border-[var(--ud-accent)]/40 transition ${focusRing}`}
            >
              <div className="flex items-start justify-between gap-2 pl-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--ud-muted)]">
                    {card.title}
                  </p>
                  <p className="text-xs text-[var(--ud-muted)] mt-0.5">{card.hint}</p>
                </div>
                <span
                  className="p-2 rounded-lg shrink-0"
                  style={{ background: `${card.accent}18`, color: card.accent }}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="ud-display text-xl sm:text-2xl font-semibold text-[var(--ud-text)] pl-2 break-words leading-tight">
                {card.value}
              </p>
            </button>
          )
        })}
      </section>

      <div className="ud-rise ud-rise-3 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        <div className="lg:col-span-7 xl:col-span-8 space-y-4 sm:space-y-5">
          <section className="ud-panel rounded-xl p-4 sm:p-5 space-y-4" aria-labelledby="pathway-heading">
            <div className="flex items-center justify-between gap-2">
              <h3 id="pathway-heading" className="ud-display text-lg font-semibold text-[var(--ud-text)]">
                Pathway progress
              </h3>
              <button
                type="button"
                onClick={() => navigate('/dashboard/applications')}
                className={`text-xs font-bold text-[var(--ud-copper)] hover:underline inline-flex items-center rounded-md px-1 ${focusRing}`}
              >
                View all
                <ChevronRight className="h-3.5 w-3.5 ml-0.5" aria-hidden="true" />
              </button>
            </div>

            {applications.length === 0 ? (
              <div className="py-9 text-center rounded-xl border border-dashed border-[var(--ud-line)] bg-[var(--ud-canvas)]/60 px-3">
                <Briefcase className="h-9 w-9 text-[var(--ud-muted)]/50 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm text-[var(--ud-muted)] font-semibold">No active applications yet</p>
                <button
                  type="button"
                  onClick={() => navigate('/countries')}
                  className={`mt-3 text-sm font-bold text-[var(--ud-copper)] hover:underline inline-flex items-center ${focusRing}`}
                >
                  Browse destination programs
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {applications.slice(0, 3).map((app) => (
                  <li key={app.id}>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/applications')}
                      aria-label={`${app.countries?.name || 'Destination'} — ${app.visa_programs?.name || 'Visa Program'}, status ${app.status.replaceAll('_', ' ')}`}
                      className={`w-full flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--ud-canvas)]/70 border border-[var(--ud-line)] hover:border-[var(--ud-sea)]/50 transition text-left ${focusRing}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span aria-hidden="true">
                          {app.countries?.name ? (
                            <FlagIcon country={app.countries.name} className="text-2xl shrink-0" />
                          ) : (
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ud-ink)]/10 text-[var(--ud-ink)]">
                              <Compass className="h-4 w-4" />
                            </span>
                          )}
                        </span>
                        <div className="leading-tight space-y-0.5 min-w-0">
                          <h4 className="text-sm font-bold text-[var(--ud-text)] truncate">
                            {app.countries?.name || 'Destination'}
                          </h4>
                          <p className="text-xs text-[var(--ud-muted)] truncate">
                            {app.visa_programs?.name || 'Visa Program'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-bold border rounded-md px-2.5 py-1 shrink-0 ${getStatusStyle(
                          app.status,
                        )}`}
                      >
                        {app.status.replaceAll('_', ' ')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="ud-panel rounded-xl p-4 sm:p-5" aria-labelledby="quick-utils-heading">
            <h3 id="quick-utils-heading" className="ud-display text-lg font-semibold text-[var(--ud-text)] mb-4">
              Quick moves
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Upload document', href: '/dashboard/documents', icon: FileText, tone: '#C49A2B' },
                { label: 'Book session', href: '/dashboard/appointments', icon: Plus, tone: '#1A2340' },
                { label: 'Message officer', href: '/dashboard/chat', icon: MessageSquare, tone: '#C49A2B' },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.href)}
                    className={`group min-h-[5.25rem] rounded-xl border border-[var(--ud-line)] bg-[var(--ud-canvas)]/50 hover:bg-white px-3 py-4 flex flex-col items-start justify-center gap-2 text-left transition ${focusRing}`}
                  >
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: `${action.tone}18`, color: action.tone }}
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold text-[var(--ud-text)] group-hover:text-[var(--ud-ink)]">
                      {action.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        <section
          className="lg:col-span-5 xl:col-span-4 ud-panel rounded-xl p-4 sm:p-5 space-y-4 lg:sticky lg:top-2 self-start"
          aria-labelledby="activity-heading"
        >
          <h3 id="activity-heading" className="ud-display text-lg font-semibold text-[var(--ud-text)]">
            Recent activity
          </h3>

          {sortedActivities.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <Clock className="h-8 w-8 text-[var(--ud-muted)]/40 mb-2" aria-hidden="true" />
              <p className="text-sm text-[var(--ud-muted)] font-semibold">No recent logs yet</p>
            </div>
          ) : (
            <ol className="space-y-3">
              {sortedActivities.map((act, idx) => {
                const Icon = act.icon
                return (
                  <li
                    key={`${act.title}-${idx}`}
                    className="flex gap-3 rounded-xl border border-[var(--ud-line)] bg-[var(--ud-canvas)]/50 p-3"
                  >
                    <span
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${act.tint}`}
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-sm font-bold text-[var(--ud-text)] leading-snug">{act.title}</h4>
                      <p className="text-xs text-[var(--ud-muted)]">{act.description}</p>
                      <time className="text-[11px] text-[var(--ud-muted)]/90 block" dateTime={act.time.toISOString()}>
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
