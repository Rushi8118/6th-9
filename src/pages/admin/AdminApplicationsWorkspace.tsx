'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { subscribePostgresChanges } from '@/lib/supabase/realtime'
import { useAuth } from '@/hooks/use-auth'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Empty } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import {
  Archive, Briefcase, Calendar, Check, ChevronLeft, ChevronRight, ClipboardList,
  Download, FileText, Filter, MoreHorizontal, Printer, RefreshCw, Search, Send,
  Settings2, ShieldAlert, Trash2, UserRound, X, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AppRow = {
  id: string
  application_id: string | null
  user_id?: string
  user_profile_full_name: string | null
  user_profile_email: string | null
  application_type: string
  status: string
  priority: string
  created_at: string
  updated_at?: string
  submitted_at?: string | null
  country_id: string | null
  country_name?: string | null
  country_flag_emoji?: string | null
  assigned_consultant?: string | null
  assigned_officer_name?: string | null
  assigned_officer_email?: string | null
}

type DetailData = {
  application: AppRow & Record<string, any>
  documents: Array<Record<string, any>>
  activity: Array<Record<string, any>>
}

type Officer = { id: string; full_name: string | null; email: string }

const STATUSES = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn']
const TYPES = ['work', 'study', 'business', 'tourist', 'investor']
const PRIORITIES = ['urgent', 'high', 'normal', 'low']
const PAGE_SIZES = [15, 30, 50]
const statusVariant = (status: string) => status === 'approved' ? 'success' : status === 'rejected' ? 'destructive' : status === 'under_review' ? 'warning' : status === 'draft' ? 'default' : status === 'withdrawn' ? 'purple' : 'info'
const pretty = (value: unknown) => String(value ?? '').replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())
const dateText = (value?: string | null) => value ? new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : 'Not available'
const daysPending = (row: AppRow) => Math.max(0, Math.floor((Date.now() - new Date(row.created_at).getTime()) / 86400000))

function StatCard({ label, value, active, onClick, variant }: { label: string; value: number; active?: boolean; onClick: () => void; variant?: string }) {
  return <button type="button" onClick={onClick} className={cn('rounded-xl border px-4 py-3 text-center transition-colors hover:border-primary/50', active && 'border-primary bg-primary/5', variant === 'urgent' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-muted/50 border-border text-foreground')}>
    <p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground mt-0.5">{label}</p>
  </button>
}

export default function AdminApplicationsWorkspace() {
  const { hasPermission, isSuperAdmin } = useAuth()
  const queryClient = useQueryClient()
  const canRead = hasPermission('applications.read')
  const canUpdate = hasPermission('applications.update') || isSuperAdmin
  const canProcess = hasPermission('applications.process') || isSuperAdmin
  const canDelete = hasPermission('applications.delete') || isSuperAdmin
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [officerFilter, setOfficerFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [selected, setSelected] = useState<string[]>([])
  const [selectedApp, setSelectedApp] = useState<AppRow | null>(null)
  const [action, setAction] = useState<{ name: string; row?: AppRow; value?: string } | null>(null)
  const [reason, setReason] = useState('')
  const [visible, setVisible] = useState<Record<string, boolean>>({ country: true, officer: true, updated: true, sla: true })

  const syncUrl = useCallback(() => {
    const params = new URLSearchParams()
    const values: Record<string, string> = { q: search, status: statusFilter, type: typeFilter, country: countryFilter, priority: priorityFilter, officer: officerFilter, from: dateFrom, to: dateTo }
    Object.entries(values).forEach(([key, value]) => { if (value && value !== 'all') params.set(key, value) })
    window.history.replaceState(null, '', `${window.location.pathname}${params.toString() ? `?${params}` : ''}`)
  }, [search, statusFilter, typeFilter, countryFilter, priorityFilter, officerFilter, dateFrom, dateTo])
  useEffect(() => { syncUrl(); setPage(1) }, [syncUrl])

  const { data: rawData = [], isLoading, error, refetch } = useQuery<AppRow[]>({
    queryKey: ['admin-applications', page, pageSize],
    queryFn: async () => {
      const { data, error: queryError } = await supabase.rpc('get_all_applications', { p_page: page, p_page_size: pageSize })
      if (queryError) throw queryError
      return (typeof data === 'string' ? JSON.parse(data) : data ?? []) as AppRow[]
    }, enabled: canRead,
  })
  const { data: countries = [] } = useQuery<{ id: string; name: string }[]>({ queryKey: ['admin-countries'], queryFn: async () => { const { data, error: queryError } = await supabase.from('countries').select('id,name').order('name'); if (queryError) throw queryError; return data ?? [] } })
  const { data: officers = [] } = useQuery<Officer[]>({ queryKey: ['admin-application-officers'], queryFn: async () => { const { data, error: queryError } = await supabase.rpc('get_application_officers'); if (queryError) throw queryError; return (typeof data === 'string' ? JSON.parse(data) : data ?? []) as Officer[] } })
  const detailQuery = useQuery<DetailData>({ queryKey: ['admin-application-detail', selectedApp?.id], enabled: !!selectedApp && canRead, queryFn: async () => { const { data, error: queryError } = await supabase.rpc('get_application_management_data', { p_application_id: selectedApp!.id }); if (!queryError && data) return data as DetailData; if (queryError && !/schema cache|could not find the function|PGRST202/i.test(queryError.message)) throw queryError; toast.warning('Detailed application RPC is not deployed yet. Showing available summary data.'); return { application: selectedApp!, documents: [], activity: [] } } })

  useEffect(() => subscribePostgresChanges(supabase, 'admin-applications-workspace', { event: '*', schema: 'public', table: 'applications' }, () => { void refetch(); if (selectedApp) void detailQuery.refetch() }), [refetch, selectedApp, detailQuery])

  const filtered = useMemo(() => rawData.filter(row => {
    const q = search.toLowerCase()
    const matchesSearch = !q || [row.application_id, row.user_profile_full_name, row.user_profile_email, row.country_name, row.application_type].some(v => v?.toLowerCase().includes(q))
    return matchesSearch && (statusFilter === 'all' || row.status === statusFilter) && (typeFilter === 'all' || row.application_type === typeFilter) && (countryFilter === 'all' || row.country_id === countryFilter) && (priorityFilter === 'all' || row.priority === priorityFilter) && (officerFilter === 'all' || row.assigned_consultant === officerFilter) && (!dateFrom || row.created_at >= dateFrom) && (!dateTo || row.created_at <= `${dateTo}T23:59:59`)
  }), [rawData, search, statusFilter, typeFilter, countryFilter, priorityFilter, officerFilter, dateFrom, dateTo])
  const sorted = useMemo(() => [...filtered].sort((a, b) => { const av = String((a as any)[sortKey] ?? ''), bv = String((b as any)[sortKey] ?? ''); return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av) }), [filtered, sortKey, sortDir])
  const kpis = useMemo(() => Object.fromEntries(['total', ...STATUSES, 'urgent'].map(key => [key, key === 'total' ? rawData.length : key === 'urgent' ? rawData.filter(row => row.priority === 'urgent').length : rawData.filter(row => row.status === key).length])), [rawData])

  const runAction = async () => {
    if (!action) return
    const ids = action.row ? [action.row.id] : selected
    if (!ids.length) return
    const rpcAction = action.name === 'under_review' ? 'change_status' : action.name
    const rpcValue = action.name === 'under_review' ? 'under_review' : action.value
    if (['reject', 'return_for_corrections', 'request_documents', 'change_status', 'under_review', 'archive', 'delete'].includes(action.name) && !reason.trim()) { toast.error('A reason is required for this action.'); return }
    try {
      for (const id of ids) {
        const { error: mutationError } = await supabase.rpc('manage_application', { p_application_id: id, p_action: rpcAction, p_value: rpcValue ? (rpcAction === 'assign' ? { officer_id: rpcValue } : rpcAction === 'change_priority' ? { priority: rpcValue } : { status: rpcValue }) : {}, p_reason: reason.trim() || null })
        if (mutationError) throw mutationError
      }
      toast.success(`${pretty(action.name)} completed for ${ids.length} application${ids.length === 1 ? '' : 's'}.`)
      setAction(null); setReason(''); setSelected([]); await queryClient.invalidateQueries({ queryKey: ['admin-applications'] }); if (selectedApp) void detailQuery.refetch()
    } catch (err: any) { toast.error(err.message || 'Action failed.') }
  }

  const clearFilters = () => { setSearch(''); setStatusFilter('all'); setTypeFilter('all'); setCountryFilter('all'); setPriorityFilter('all'); setOfficerFilter('all'); setDateFrom(''); setDateTo('') }
  const exportRows = (rows: AppRow[]) => { const csv = [['Application ID', 'Applicant', 'Email', 'Type', 'Country', 'Status', 'Priority', 'Created', 'Updated'], ...rows.map(row => [row.application_id || row.id, row.user_profile_full_name || '', row.user_profile_email || '', row.application_type, row.country_name || '', row.status, row.priority, row.created_at, row.updated_at || ''])].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'applications.csv'; anchor.click(); URL.revokeObjectURL(url) }
  const sort = (key: string) => { setSortDir(sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'); setSortKey(key) }
  const toggleSelected = (id: string) => setSelected(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])
  const hasFilters = Boolean(search || statusFilter !== 'all' || typeFilter !== 'all' || countryFilter !== 'all' || priorityFilter !== 'all' || officerFilter !== 'all' || dateFrom || dateTo)

  if (!canRead) return <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-900"><ShieldAlert className="mx-auto mb-3 h-8 w-8" /><h1 className="font-semibold">Permission denied</h1><p className="mt-1 text-sm">You do not have permission to view applications.</p></div>

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Briefcase className="w-7 h-7" /> Applications</h1><p className="text-sm text-muted-foreground mt-1">Manage and track visa applications across all statuses</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => exportRows(selected.length ? sorted.filter(row => selected.includes(row.id)) : sorted)}><Download className="mr-1.5 h-4 w-4" />Export</Button><Button variant="outline" onClick={() => void refetch()} disabled={isLoading}><RefreshCw className={cn('mr-1.5 h-4 w-4', isLoading && 'animate-spin')} />Refresh</Button></div></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">{[['total', 'Total'], ['draft', 'Draft'], ['submitted', 'Submitted'], ['under_review', 'Under Review'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['urgent', 'Urgent']].map(([key, label]) => <StatCard key={key} label={label} value={Number(kpis[key] || 0)} active={statusFilter === key || (key === 'urgent' && priorityFilter === 'urgent')} variant={key === 'urgent' ? 'urgent' : undefined} onClick={() => key === 'urgent' ? setPriorityFilter(priorityFilter === 'urgent' ? 'all' : 'urgent') : setStatusFilter(key === 'total' || statusFilter === key ? 'all' : key)} />)}</div>
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"><Filter className="h-4 w-4" />Filters</h2>{hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs"><X className="mr-1 h-3 w-3" />Clear filters</Button>}</div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"><div className="relative xl:col-span-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search applications" placeholder="Name, email, ID, passport..." value={search} onChange={event => setSearch(event.target.value)} className="pl-9" /></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{STATUSES.map(value => <SelectItem key={value} value={value}>{pretty(value)}</SelectItem>)}</SelectContent></Select><Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem>{TYPES.map(value => <SelectItem key={value} value={value}>{pretty(value)}</SelectItem>)}</SelectContent></Select><Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{PRIORITIES.map(value => <SelectItem key={value} value={value}>{pretty(value)}</SelectItem>)}</SelectContent></Select><Select value={countryFilter} onValueChange={setCountryFilter}><SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger><SelectContent><SelectItem value="all">All countries</SelectItem>{countries.map(country => <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>)}</SelectContent></Select><Select value={officerFilter} onValueChange={setOfficerFilter}><SelectTrigger><SelectValue placeholder="Officer" /></SelectTrigger><SelectContent><SelectItem value="all">All officers</SelectItem>{officers.map(officer => <SelectItem key={officer.id} value={officer.id}>{officer.full_name || officer.email}</SelectItem>)}</SelectContent></Select><Input aria-label="Created from" type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} /><Input aria-label="Created to" type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} /></div></div>
    {selected.length > 0 && <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3"><span className="text-sm font-medium">{selected.length} selected</span><Select onValueChange={value => setAction({ name: 'change_status', value })}><SelectTrigger className="w-40"><SelectValue placeholder="Change status" /></SelectTrigger><SelectContent>{STATUSES.map(value => <SelectItem key={value} value={value}>{pretty(value)}</SelectItem>)}</SelectContent></Select><Select onValueChange={value => setAction({ name: 'change_priority', value })}><SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent>{PRIORITIES.map(value => <SelectItem key={value} value={value}>{pretty(value)}</SelectItem>)}</SelectContent></Select><Button variant="outline" size="sm" onClick={() => exportRows(sorted.filter(row => selected.includes(row.id)))}><Download className="mr-1 h-4 w-4" />Export selected</Button>{canDelete && <Button variant="destructive" size="sm" onClick={() => setAction({ name: 'delete' })}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>}</div>}
    <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{sorted.length} application{sorted.length === 1 ? '' : 's'} found{hasFilters && ' (filtered)'}</span><div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Columns</span>{Object.entries(visible).map(([key, value]) => <label key={key} className="flex items-center gap-1 text-xs"><Checkbox checked={value} onCheckedChange={checked => setVisible(current => ({ ...current, [key]: Boolean(checked) }))} />{pretty(key)}</label>)}<Select value={String(pageSize)} onValueChange={value => setPageSize(Number(value))}><SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger><SelectContent>{PAGE_SIZES.map(value => <SelectItem key={value} value={String(value)}>{value}/page</SelectItem>)}</SelectContent></Select></div></div>
    {isLoading ? <div className="flex justify-center py-20"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div> : error ? <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">Failed to load applications: {(error as Error).message}</div> : sorted.length === 0 ? <Empty title="No applications found" description="Applications will appear here once submitted." /> : <div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[1100px]"><thead><tr className="border-b border-border bg-muted/30"><th className="w-10 px-4 py-3"><Checkbox aria-label="Select all visible applications" checked={sorted.length > 0 && sorted.every(row => selected.includes(row.id))} onCheckedChange={checked => setSelected(checked ? sorted.map(row => row.id) : [])} /></th>{[['application_id', 'ID'], ['user_profile_full_name', 'Applicant'], ['application_type', 'Type'], ['country_name', 'Country'], ['status', 'Status'], ['priority', 'Priority'], ['assigned_officer_name', 'Officer'], ['created_at', 'Created'], ['updated_at', 'Updated'], ['sla', 'SLA']].map(([key, label]) => (key === 'country_name' && !visible.country) || (key === 'assigned_officer_name' && !visible.officer) || (key === 'updated_at' && !visible.updated) || (key === 'sla' && !visible.sla) ? null : <th key={key} className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/50" onClick={() => sort(key)}>{label}{sortKey === key && <span className="ml-1 text-primary">{sortDir === 'asc' ? '↑' : '↓'}</span>}</th>)}<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th></tr></thead><tbody className="divide-y divide-border">{sorted.map(row => <tr key={row.id} className="cursor-pointer hover:bg-muted/20" onClick={() => setSelectedApp(row)}><td className="px-4 py-3" onClick={event => event.stopPropagation()}><Checkbox checked={selected.includes(row.id)} onCheckedChange={() => toggleSelected(row.id)} aria-label={`Select ${row.application_id || row.id}`} /></td><td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.application_id || row.id.slice(0, 8)}</td><td className="px-4 py-3"><p className="text-sm font-medium">{row.user_profile_full_name || 'Unknown'}</p><p className="text-xs text-muted-foreground">{row.user_profile_email}</p></td><td className="px-4 py-3 text-sm capitalize">{pretty(row.application_type)}</td>{visible.country && <td className="px-4 py-3 text-sm">{row.country_flag_emoji} {row.country_name || 'Not set'}</td>}<td className="px-4 py-3"><StatusBadge status={row.status} variant={statusVariant(row.status)} /></td><td className="px-4 py-3"><span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', row.priority === 'urgent' ? 'bg-amber-100 text-amber-700' : row.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground')}>{pretty(row.priority)}</span></td>{visible.officer && <td className="px-4 py-3 text-sm">{row.assigned_officer_name || 'Unassigned'}</td>}<td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{dateText(row.created_at)}</td>{visible.updated && <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{dateText(row.updated_at || row.created_at)}</td>}{visible.sla && <td className="px-4 py-3 text-xs"><span className={cn(daysPending(row) > 14 && row.status !== 'approved' && row.status !== 'rejected' ? 'text-red-600 font-semibold' : 'text-muted-foreground')}>{daysPending(row)}d pending</span></td>}<td className="px-4 py-3 text-right" onClick={event => event.stopPropagation()}><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Application actions"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setSelectedApp(row)}><FileText className="h-4 w-4" />Open application</DropdownMenuItem>{canProcess && <DropdownMenuItem onClick={() => setAction({ name: 'under_review', row })}><Zap className="h-4 w-4" />Move to Under Review</DropdownMenuItem>}{canProcess && <DropdownMenuItem onClick={() => setAction({ name: 'approve', row })}><Check className="h-4 w-4" />Approve</DropdownMenuItem>}{canProcess && <DropdownMenuItem onClick={() => setAction({ name: 'reject', row })}><X className="h-4 w-4" />Reject</DropdownMenuItem>}{canUpdate && <DropdownMenuItem onClick={() => setAction({ name: 'archive', row })}><Archive className="h-4 w-4" />Archive</DropdownMenuItem>}{canDelete && <><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => setAction({ name: 'delete', row })}><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu></td></tr>)}</tbody></table></div>}
    <div className="flex items-center justify-between px-2"><span className="text-xs text-muted-foreground">Page {page}</span><div className="flex items-center gap-1"><Button variant="outline" size="sm" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1}><ChevronLeft className="h-3 w-3" /></Button><Button variant="outline" size="sm" onClick={() => setPage(current => current + 1)} disabled={sorted.length < pageSize}><ChevronRight className="h-3 w-3" /></Button></div></div>

    <Sheet open={!!selectedApp} onOpenChange={open => { if (!open) setSelectedApp(null) }}><SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl"><SheetHeader><SheetTitle>{selectedApp?.application_id || 'Application details'}</SheetTitle><SheetDescription>{selectedApp?.user_profile_full_name} · {selectedApp?.user_profile_email}</SheetDescription></SheetHeader>{detailQuery.isLoading ? <div className="flex justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin" /></div> : detailQuery.error ? <p className="p-4 text-sm text-destructive">{(detailQuery.error as Error).message}</p> : detailQuery.data && <ApplicationDetails detail={detailQuery.data} officers={officers} canUpdate={canUpdate} canProcess={canProcess} onAction={(name, value) => setAction({ name, row: selectedApp || undefined, value })} />}</SheetContent></Sheet>
    <Dialog open={!!action} onOpenChange={open => { if (!open) { setAction(null); setReason('') } }}><DialogContent><DialogHeader><DialogTitle>{pretty(action?.name || 'Action')}</DialogTitle><DialogDescription>{action?.row ? `This action will update ${action.row.application_id || 'the application'}.` : `This action will update ${selected.length} selected applications.`}</DialogDescription></DialogHeader>{['assign', 'change_priority', 'change_status'].includes(action?.name || '') && action?.name === 'assign' ? <Select value={action.value || ''} onValueChange={value => setAction(current => current ? ({ ...current, value }) : current)}><SelectTrigger><SelectValue placeholder="Choose officer" /></SelectTrigger><SelectContent>{officers.map(officer => <SelectItem key={officer.id} value={officer.id}>{officer.full_name || officer.email}</SelectItem>)}</SelectContent></Select> : action?.name === 'change_priority' ? <Select value={action.value || ''} onValueChange={value => setAction(current => current ? ({ ...current, value }) : current)}><SelectTrigger><SelectValue placeholder="Choose priority" /></SelectTrigger><SelectContent>{PRIORITIES.map(value => <SelectItem key={value} value={value}>{pretty(value)}</SelectItem>)}</SelectContent></Select> : <Textarea autoFocus value={reason} onChange={event => setReason(event.target.value)} placeholder={['approve'].includes(action?.name || '') ? 'Optional comment' : 'Reason or internal comment (required)'} />}</DialogContent><DialogFooter><Button variant="outline" onClick={() => setAction(null)}>Cancel</Button><Button variant={['reject', 'delete'].includes(action?.name || '') ? 'destructive' : 'default'} onClick={() => void runAction()} disabled={['assign', 'change_priority'].includes(action?.name || '') && !action?.value}>Confirm</Button></DialogFooter></Dialog>
  </div>
}

function ApplicationDetails({ detail, officers, canUpdate, canProcess, onAction }: { detail: DetailData; officers: Officer[]; canUpdate: boolean; canProcess: boolean; onAction: (name: string, value?: string) => void }) {
  const app = detail.application
  const info = app.personal_info || {}
  return <div className="px-4 pb-6"><div className="mb-5 flex flex-wrap gap-2"><StatusBadge status={app.status} variant={statusVariant(app.status)} /><span className="rounded-full bg-muted px-2 py-1 text-xs">{pretty(app.priority)} priority</span><span className="rounded-full bg-muted px-2 py-1 text-xs">{pretty(app.application_type)}</span></div><div className="mb-5 grid grid-cols-2 gap-3 text-sm"><Info label="Country" value={`${app.country?.flag_emoji || ''} ${app.country?.name || 'Not set'}`} /><Info label="Submitted" value={dateText(app.submitted_at)} /><Info label="Officer" value={app.assigned_officer?.full_name || 'Unassigned'} /><Info label="Updated" value={dateText(app.updated_at)} /></div><div className="mb-5 flex flex-wrap gap-2">{canProcess && <><Button size="sm" onClick={() => onAction('approve')}><Check className="mr-1 h-4 w-4" />Approve</Button><Button size="sm" variant="outline" onClick={() => onAction('request_documents')}><ClipboardList className="mr-1 h-4 w-4" />Request documents</Button><Button size="sm" variant="outline" onClick={() => onAction('reject')}><X className="mr-1 h-4 w-4" />Reject</Button></>}{canUpdate && <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm" variant="outline"><MoreHorizontal className="mr-1 h-4 w-4" />More</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={() => onAction('change_priority', 'high')}>Set high priority</DropdownMenuItem><DropdownMenuItem onClick={() => onAction('add_note')}>Add internal note</DropdownMenuItem><DropdownMenuItem onClick={() => onAction('duplicate')}>Duplicate application</DropdownMenuItem><DropdownMenuItem onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}</div><Tabs defaultValue="overview"><TabsList className="mb-4 w-full justify-start overflow-x-auto"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="personal">Personal</TabsTrigger><TabsTrigger value="application">Application</TabsTrigger><TabsTrigger value="documents">Documents</TabsTrigger><TabsTrigger value="history">History</TabsTrigger><TabsTrigger value="communication">Communication</TabsTrigger></TabsList><TabsContent value="overview" className="space-y-4"><Section title="Applicant profile"><div className="flex items-center gap-3"><div className="rounded-full bg-primary/10 p-3"><UserRound className="h-5 w-5 text-primary" /></div><div><p className="font-medium">{app.applicant?.full_name || app.user_profile_full_name || 'Unknown'}</p><p className="text-sm text-muted-foreground">{app.applicant?.email || app.user_profile_email}</p><p className="text-sm text-muted-foreground">{app.applicant?.phone || 'No phone provided'}</p></div></div></Section><Section title="Internal notes"><p className="whitespace-pre-wrap text-sm text-muted-foreground">{app.consultant_notes || 'No internal notes yet.'}</p></Section></TabsContent><TabsContent value="personal"><DataGrid data={{ 'Full name': info.full_name || app.applicant?.full_name, 'Date of birth': info.date_of_birth, Nationality: info.nationality || app.applicant?.nationality, Passport: info.passport_number, 'Contact': info.phone || app.applicant?.phone, Address: info.address }} /></TabsContent><TabsContent value="application"><DataGrid data={{ Category: app.visa_program?.name, 'Travel purpose': info.travel_purpose, 'Travel dates': info.travel_dates, Education: JSON.stringify(app.education_history || []), Employment: JSON.stringify(app.work_history || []), 'Visa history': info.visa_history }} /></TabsContent><TabsContent value="documents"><div className="space-y-2">{detail.documents.length ? detail.documents.map(document => <div key={document.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="text-sm font-medium">{document.name}</p><p className="text-xs text-muted-foreground">{document.file_type || 'File'} · {dateText(document.created_at)}</p></div><div className="flex items-center gap-2"><span className="text-xs">{document.status}</span><Button size="icon" variant="ghost" aria-label="Download document" onClick={() => void supabase.storage.from('documents').createSignedUrl(document.file_path, 300).then(({ data, error }) => error ? toast.error(error.message) : data?.signedUrl && window.open(data.signedUrl, '_blank'))}><Download className="h-4 w-4" /></Button></div></div>) : <Empty title="No documents" description="No documents have been uploaded for this application." />}</div></TabsContent><TabsContent value="history"><div className="space-y-3">{detail.activity.length ? detail.activity.map(item => <div key={item.id} className="border-l-2 border-primary/30 pl-3"><p className="text-sm font-medium">{pretty(item.action)}</p><p className="text-xs text-muted-foreground">{item.reason || 'No reason recorded'} · {dateText(item.created_at)}</p></div>) : <Empty title="No review history" description="Actions will appear here as the application is processed." />}</div></TabsContent><TabsContent value="communication"><Section title="Communication"><p className="mb-3 text-sm text-muted-foreground">Applicant messaging and email history can be connected to the messages and notifications tables.</p><Button size="sm" variant="outline" onClick={() => toast.info('Message composer is ready for the messaging integration.') }><Send className="mr-1 h-4 w-4" />Send message</Button></Section></TabsContent></Tabs></div>
}

function Info({ label, value }: { label: string; value: unknown }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{String(value || 'Not available')}</p></div> }
function DataGrid({ data }: { data: Record<string, unknown> }) { return <div className="grid gap-3 sm:grid-cols-2">{Object.entries(data).map(([label, value]) => <Info key={label} label={label} value={typeof value === 'object' ? JSON.stringify(value) : value} />)}</div> }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-xl border p-4"><h3 className="mb-3 text-sm font-semibold">{title}</h3>{children}</section> }
