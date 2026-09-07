import { Link } from 'react-router-dom'
import {
  Activity,
  Briefcase,
  Clock,
  Eye,
  Globe,
  LogIn,
  MessageSquare,
  RefreshCw,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdminAccessStats } from '@/hooks/useAdminAccessStats'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  color,
  bg,
}: {
  title: string
  value: string | number
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={`rounded-xl p-3 ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const access = useAdminAccessStats()
  const stats = access.data

  const core = useQuery({
    queryKey: ['admin-core-stats'],
    queryFn: async () => {
      const [apps, countries, consults] = await Promise.all([
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('countries').select('*', { count: 'exact', head: true }),
        supabase.from('consultations').select('*', { count: 'exact', head: true }),
      ])
      return {
        applications: apps.count || 0,
        countries: countries.count || 0,
        consultations: consults.count || 0,
      }
    },
  })

  if (access.isLoading && !stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Clock className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Website visitors, logins, and live activity in one place.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => {
            void access.refetch()
            void core.refetch()
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {access.isError && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not load access logs. Open the public website once to start collecting visits, then
          refresh. Optional: run <code>supabase/FIX_ACCESS_LOGS.sql</code> if selects are blocked.
        </div>
      )}

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Activity className="h-4 w-4" /> Website access
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Visitors today"
            value={stats?.visitorsToday ?? 0}
            hint="Unique browser sessions on public pages"
            icon={Eye}
            color="text-sky-600"
            bg="bg-sky-50"
          />
          <StatCard
            title="Page views today"
            value={stats?.pageViewsToday ?? 0}
            hint={`${stats?.pageViews7d ?? 0} views in last 7 days`}
            icon={Globe}
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
          <StatCard
            title="Logins today"
            value={stats?.loginsToday ?? 0}
            hint={`${stats?.loggedInUsers7d ?? 0} users logged in (7 days)`}
            icon={LogIn}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Registered users"
            value={stats?.totalUsers ?? 0}
            hint="All accounts in user_profiles"
            icon={Users}
            color="text-blue-600"
            bg="bg-blue-50"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Business totals
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title="Applications"
            value={core.data?.applications ?? 0}
            icon={Briefcase}
            color="text-green-600"
            bg="bg-green-50"
          />
          <StatCard
            title="Countries"
            value={core.data?.countries ?? 0}
            icon={Globe}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <StatCard
            title="Consultations"
            value={core.data?.consultations ?? 0}
            icon={MessageSquare}
            color="text-orange-600"
            bg="bg-orange-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent website activity</h2>
            <span className="text-xs text-muted-foreground">Live access log</span>
          </div>
          <div className="max-h-[500px] space-y-2 overflow-y-auto scroll-smooth scrollbar-thin">
            {(stats?.recentVisits || []).length === 0 && (stats?.recentApplications || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No visits yet. Open the public site (homepage, blog, guides) to generate logs.
              </p>
            ) : (
              <>
                {stats?.recentVisits.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 font-semibold uppercase ${
                          row.event_type === 'login'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.event_type === 'signup'
                              ? 'bg-violet-100 text-violet-800'
                              : row.event_type === 'application_submitted'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {row.event_type === 'application_submitted'
                          ? 'Application Submitted'
                          : row.event_type.replace('_', ' ')}
                      </span>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                      </span>
                      {row.device_type && (
                        <span className="text-muted-foreground">· {row.device_type}</span>
                      )}
                      {row.browser && <span className="text-muted-foreground">· {row.browser}</span>}
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                      {row.page_path || '—'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.user_email
                        ? `${row.user_name || 'User'} · ${row.user_email}`
                        : 'Guest visitor'}
                      {row.referrer ? ` · from ${row.referrer}` : ''}
                    </p>
                  </div>
                ))}
                {stats?.recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="rounded-xl border border-amber-200/70 bg-amber-50/20 px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold uppercase text-amber-800">
                        Application Submitted
                      </span>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                      {app.application_type
                        ? `${app.application_type.charAt(0).toUpperCase() + app.application_type.slice(1)} Application`
                        : 'Application Submitted'}
                      {app.application_id ? ` · ${app.application_id}` : ''}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {app.user_email
                        ? `${app.user_name || 'User'} · ${app.user_email}`
                        : 'Guest applicant'}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent login users</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/users">All users</Link>
            </Button>
          </div>
          <div className="max-h-[500px] space-y-2 overflow-y-auto scroll-smooth scrollbar-thin">
            {(stats?.recentLogins || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No logins recorded in the last 7 days yet.
              </p>
            ) : (
              stats?.recentLogins.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.full_name || 'Unnamed user'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Role: {user.user_role}
                      {user.last_login_at
                        ? ` · ${formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })}`
                        : ''}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                    logged in
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Top public pages (7 days)</h2>
        {(stats?.topPages || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No page data yet.</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {stats?.topPages.map((page) => (
              <div
                key={page.path}
                className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2"
              >
                <span className="truncate text-sm text-foreground">{page.path}</span>
                <span className="ml-3 shrink-0 text-sm font-semibold text-muted-foreground">
                  {page.views}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Button asChild variant="outline">
            <Link to="/admin/users">Users</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/blog">Blog AI</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/realtime">Live metrics</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/sessions">Sessions</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
