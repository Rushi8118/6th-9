import React, { useId, useState } from 'react'
import { useApplications, Application } from '@/hooks/useApplications'
import { useCountries, useVisaPrograms } from '@/hooks/use-countries'
import {
  Briefcase,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FlagIcon } from '@/components/flag-icon'

export default function ApplicationsPage() {
  const { applications, isLoading, createApplication, createLoading, createError } = useApplications()
  const { countries, isLoading: countriesLoading } = useCountries()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Completed' | 'Rejected'>('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedCountryId, setSelectedCountryId] = useState('')
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [applicationType, setApplicationType] = useState<Application['application_type']>('study')
  const { programs, isLoading: programsLoading } = useVisaPrograms({ countryId: selectedCountryId || undefined })

  const formId = useId()
  const countryFieldId = `${formId}-country`
  const programFieldId = `${formId}-program`
  const typeFieldId = `${formId}-type`
  const searchFieldId = `${formId}-search`

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const handleStartApplication = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const country = countries.find((item) => item.id === selectedCountryId)
    if (!country || !selectedProgramId) return

    createApplication({
      visa_program_id: selectedProgramId,
      country_id: country.id,
      application_type: applicationType,
      status: 'submitted',
      priority: 'normal',
      personal_info: {},
      education_history: [],
      work_history: [],
      document_checklist: {},
      submitted_at: new Date().toISOString(),
    })
  }

  const filtered = applications.filter((app) => {
    const countryName = app.countries?.name || ''
    const visaName = app.visa_programs?.name || ''
    const matchesSearch =
      countryName.toLowerCase().includes(search.toLowerCase()) ||
      visaName.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (activeTab === 'All') return true
    if (activeTab === 'Active') {
      return ['draft', 'submitted', 'under_review'].includes(app.status)
    }
    if (activeTab === 'Completed') return app.status === 'approved'
    if (activeTab === 'Rejected') return app.status === 'rejected'

    return true
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'submitted':
        return { label: 'Submitted', color: 'bg-blue-600/15 text-blue-800 border-blue-600/30' }
      case 'under_review':
        return { label: 'In Review', color: 'bg-[var(--ud-copper)]/20 text-[#8a3d14] border-[var(--ud-copper)]/40' }
      case 'approved':
        return { label: 'Approved', color: 'bg-emerald-600/15 text-emerald-800 border-emerald-600/30' }
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-600/15 text-red-800 border-red-600/30' }
      case 'withdrawn':
        return { label: 'Withdrawn', color: 'bg-gray-500/15 text-gray-800 border-gray-500/30' }
      default:
        return { label: 'Draft', color: 'bg-amber-500/15 text-amber-900 border-amber-500/30' }
    }
  }

  const getTimelineSteps = (app: Application) => {
    return [
      { key: 'draft', label: 'File Draft', description: 'Application initialized by applicant.', done: true },
      {
        key: 'submitted',
        label: 'Submitted',
        description: 'Visa folder forwarded to case officer.',
        done: ['submitted', 'under_review', 'approved'].includes(app.status),
      },
      {
        key: 'under_review',
        label: 'Under Review',
        description: 'Documents verification under MEA guidelines.',
        done: ['under_review', 'approved'].includes(app.status),
      },
      {
        key: 'approved',
        label: 'Decision Released',
        description: app.status === 'rejected' ? 'Application was rejected.' : 'Visa successfully approved!',
        done: ['approved', 'rejected'].includes(app.status),
        failed: app.status === 'rejected',
      },
    ]
  }

  const selectClass =
    'h-11 w-full rounded-xl border border-border/60 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ud-copper)] focus-visible:ring-offset-2'

  return (
    <div className="space-y-4 sm:space-y-6">
      <form
        onSubmit={handleStartApplication}
        className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-sm"
        aria-labelledby="start-application-heading"
      >
        <div className="mb-4">
          <h2 id="start-application-heading" className="ud-display text-lg font-bold text-foreground">
            Start an application
          </h2>
          <p className="mt-1 text-sm text-foreground/70">
            Choose a destination and visa program to submit your application.
          </p>
        </div>
        {createError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-900"
          >
            Application could not be submitted: {(createError as Error).message}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label htmlFor={countryFieldId} className="text-xs font-semibold text-foreground/80">
              Country
            </label>
            <select
              id={countryFieldId}
              value={selectedCountryId}
              onChange={(event) => {
                setSelectedCountryId(event.target.value)
                setSelectedProgramId('')
              }}
              disabled={countriesLoading}
              required
              className={selectClass}
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={programFieldId} className="text-xs font-semibold text-foreground/80">
              Visa program
            </label>
            <select
              id={programFieldId}
              value={selectedProgramId}
              onChange={(event) => setSelectedProgramId(event.target.value)}
              disabled={!selectedCountryId || programsLoading}
              required
              className={selectClass}
            >
              <option value="">Select visa program</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={typeFieldId} className="text-xs font-semibold text-foreground/80">
              Application type
            </label>
            <select
              id={typeFieldId}
              value={applicationType}
              onChange={(event) => setApplicationType(event.target.value as Application['application_type'])}
              className={selectClass}
            >
              <option value="study">Study</option>
              <option value="work">Work</option>
              <option value="business">Business</option>
              <option value="tourist">Tourist</option>
              <option value="investor">Investor</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              className="h-11 w-full"
              disabled={createLoading || !selectedCountryId || !selectedProgramId}
            >
              {createLoading ? 'Submitting…' : 'Submit application'}
            </Button>
          </div>
        </div>
      </form>

      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-between sm:items-center bg-card border border-border/60 p-3 sm:p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor={searchFieldId} className="sr-only">
            Search applications by country or program
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50 pointer-events-none" aria-hidden="true" />
          <Input
            id={searchFieldId}
            type="search"
            placeholder="Search by country or program…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 border-border/60 bg-[var(--ud-canvas)]/20 focus-visible:ring-[var(--ud-copper)]"
          />
        </div>

        <div
          role="tablist"
          aria-label="Filter applications by status"
          className="flex bg-[var(--ud-canvas)]/60 p-1 rounded-xl border border-border/40 w-full sm:w-auto overflow-x-auto scrollbar-thin gap-0.5"
        >
          {(['All', 'Active', 'Completed', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none min-h-10 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ud-copper)] focus-visible:ring-offset-2 ${
                activeTab === tab
                  ? 'bg-[var(--ud-ink)] text-[var(--ud-canvas)] shadow-sm'
                  : 'text-foreground/70 hover:text-[var(--ud-ink)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      {isLoading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading applications">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-card border border-border/30 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 sm:py-20 text-center bg-card rounded-2xl border border-border/60 shadow-sm px-4">
          <Briefcase className="h-14 w-14 sm:h-16 sm:w-16 text-foreground/25 mx-auto mb-4" aria-hidden="true" />
          <h3 className="ud-display text-base font-bold text-[var(--ud-ink)]">No applications found</h3>
          <p className="text-sm text-foreground/65 mt-1.5 max-w-xs mx-auto">
            Try adjusting your search criteria or explore our programs catalog.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm" aria-label="Applications">
              <thead className="bg-[var(--ud-canvas)]/70 border-b border-border/50">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold text-[var(--ud-ink)]">
                    Destination
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-[var(--ud-ink)]">
                    Program
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-[var(--ud-ink)]">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-[var(--ud-ink)]">
                    Applied
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-[var(--ud-ink)] text-right">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((app) => {
                  const config = getStatusConfig(app.status)
                  const expanded = expandedId === app.id
                  const panelId = `app-panel-${app.id}`

                  return (
                    <React.Fragment key={app.id}>
                      <tr className="hover:bg-[var(--ud-canvas)]/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span aria-hidden="true">
                              {app.countries?.name ? (
                                <FlagIcon country={app.countries.name} className="text-xl" />
                              ) : (
                                '✈️'
                              )}
                            </span>
                            <div>
                              <p className="font-semibold text-[var(--ud-ink)]">
                                {app.countries?.name || 'Destination'}
                              </p>
                              {app.application_id && (
                                <p className="text-xs text-foreground/60 font-mono">{app.application_id}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground/80">
                          {app.visa_programs?.name || 'Visa Program'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex text-xs font-bold border rounded-full px-2.5 py-1 ${config.color}`}>
                            {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground/70 whitespace-nowrap">
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9"
                            aria-expanded={expanded}
                            aria-controls={panelId}
                            onClick={() => toggleExpand(app.id)}
                          >
                            {expanded ? 'Hide' : 'View'}
                            {expanded ? (
                              <ChevronUp className="h-4 w-4 ml-1" aria-hidden="true" />
                            ) : (
                              <ChevronDown className="h-4 w-4 ml-1" aria-hidden="true" />
                            )}
                          </Button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr>
                          <td colSpan={5} className="px-4 py-4 bg-[var(--ud-canvas)]/20" id={panelId}>
                            <ApplicationDetails app={app} steps={getTimelineSteps(app)} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="md:hidden space-y-3 sm:space-y-4" role="list" aria-label="Applications">
            {filtered.map((app) => {
              const config = getStatusConfig(app.status)
              const expanded = expandedId === app.id
              const panelId = `app-card-panel-${app.id}`
              const steps = getTimelineSteps(app)

              return (
                <article
                  key={app.id}
                  role="listitem"
                  className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(app.id)}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    className="w-full p-4 sm:p-5 flex flex-col gap-3 text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ud-copper)] focus-visible:ring-inset"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-3xl shrink-0" aria-hidden="true">
                          {app.countries?.name ? (
                            <FlagIcon country={app.countries.name} className="text-2xl" />
                          ) : (
                            '✈️'
                          )}
                        </span>
                        <div className="leading-tight space-y-1 min-w-0">
                          <h3 className="ud-display text-sm sm:text-base font-bold text-[var(--ud-ink)] truncate">
                            {app.countries?.name || 'Destination'}
                          </h3>
                          <p className="text-xs text-foreground/65 font-medium truncate">
                            {app.visa_programs?.name || 'Visa Program'}
                          </p>
                          {app.application_id && (
                            <p className="text-[11px] text-foreground/55 font-mono">{app.application_id}</p>
                          )}
                        </div>
                      </div>
                      <span className="p-2 rounded-full text-foreground/60 shrink-0" aria-hidden="true">
                        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-bold border rounded-full px-3 py-1 ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-foreground/60">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </button>

                  {expanded && (
                    <div
                      id={panelId}
                      className="border-t border-border/40 bg-[var(--ud-canvas)]/20 p-4 sm:p-5 space-y-5"
                    >
                      <ApplicationDetails app={app} steps={steps} />
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function ApplicationDetails({
  app,
  steps,
}: {
  app: Application
  steps: Array<{
    key: string
    label: string
    description: string
    done: boolean
    failed?: boolean
  }>
}) {
  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm text-foreground/70">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--ud-copper)] shrink-0" aria-hidden="true" />
          <div>
            <dt className="sr-only">Applied date</dt>
            <dd>
              Applied:{' '}
              <strong className="text-[var(--ud-ink)] font-semibold">
                {new Date(app.created_at).toLocaleDateString()}
              </strong>
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-[var(--ud-copper)] shrink-0" aria-hidden="true" />
          <div>
            <dt className="sr-only">Case officer</dt>
            <dd>
              Case Officer:{' '}
              <strong className="text-[var(--ud-ink)] font-semibold">
                {app.assigned_consultant ? 'Officer Assigned' : 'Siddhivinayak Desk'}
              </strong>
            </dd>
          </div>
        </div>
        {app.estimated_completion && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--ud-copper)] shrink-0" aria-hidden="true" />
            <div>
              <dt className="sr-only">Estimated completion</dt>
              <dd>
                Est. Completion:{' '}
                <strong className="text-[var(--ud-ink)] font-mono font-semibold">
                  {new Date(app.estimated_completion).toLocaleDateString()}
                </strong>
              </dd>
            </div>
          </div>
        )}
      </dl>

      <div className="space-y-3">
        <h4 className="ud-display text-sm font-bold text-[var(--ud-ink)]">Immigration Status</h4>
        <ol className="relative pl-6 border-l-2 border-border/70 space-y-5 py-1 ml-2">
          {steps.map((step) => {
            const done = step.done
            const failed = step.failed

            return (
              <li key={step.key} className="relative space-y-0.5">
                <span
                  className={`absolute -left-[31px] top-0 p-0.5 rounded-full border border-card bg-card shrink-0 ${
                    failed ? 'text-red-600' : done ? 'text-emerald-600' : 'text-foreground/30'
                  }`}
                  aria-hidden="true"
                >
                  {failed ? (
                    <XCircle className="h-4 w-4" />
                  ) : done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </span>
                <p
                  className={`text-sm font-bold ${
                    failed ? 'text-red-700' : done ? 'text-[var(--ud-ink)]' : 'text-foreground/55'
                  }`}
                >
                  {step.label}
                  <span className="sr-only">
                    {failed ? ' — failed' : done ? ' — completed' : ' — pending'}
                  </span>
                </p>
                <p className="text-xs text-foreground/65">{step.description}</p>
              </li>
            )
          })}
        </ol>
      </div>

      {app.consultant_notes && (
        <aside className="bg-[var(--ud-copper)]/10 border border-[var(--ud-copper)]/25 p-4 rounded-xl text-sm space-y-1">
          <strong className="text-[var(--ud-ink)] font-bold">Advisory Notes</strong>
          <p className="text-foreground/75 leading-normal italic">&ldquo;{app.consultant_notes}&rdquo;</p>
        </aside>
      )}
    </div>
  )
}
