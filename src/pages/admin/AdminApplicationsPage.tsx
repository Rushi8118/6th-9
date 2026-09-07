import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { Briefcase, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Empty } from '@/components/ui/empty'
import { Loader2 } from 'lucide-react'

type AppRow = {
  id: string
  application_id?: string
  user_profiles?: { full_name: string | null; email: string } | null
  application_type: string
  status: string
  created_at: string
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'purple'> = {
  draft: 'default',
  submitted: 'info',
  under_review: 'warning',
  approved: 'success',
  rejected: 'destructive',
  withdrawn: 'purple',
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AppRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadApplications = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, user_profiles!left(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      setApplications((data ?? []) as unknown as AppRow[])
    } catch {
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadApplications() }, [loadApplications])

  const columns = [
    {
      key: 'application_id',
      header: 'ID',
      accessor: (row: AppRow) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.application_id || row.id.slice(0, 8)}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'applicant',
      header: 'Applicant',
      accessor: (row: AppRow) => (
        <span className="text-foreground">
          {row.user_profiles?.full_name || row.user_profiles?.email || 'Unknown'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'application_type',
      header: 'Type',
      accessor: (row: AppRow) => (
        <span className="capitalize">{row.application_type}</span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row: AppRow) => (
        <StatusBadge
          status={row.status}
          variant={STATUS_VARIANT[row.status] ?? 'default'}
        />
      ),
      sortable: true,
    },
    {
      key: 'created_at',
      header: 'Created',
      accessor: (row: AppRow) => new Date(row.created_at).toLocaleDateString(),
      sortable: true,
      className: 'text-muted-foreground',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-6 h-6" /> Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage visa applications</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={loadApplications} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Filter className="w-4 h-4 mr-1" />}
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : applications.length === 0 ? (
        <Empty title="No applications found" description="Applications will appear here once submitted." />
      ) : (
        <DataTable
          columns={columns}
          data={applications}
          loading={false}
          emptyMessage="No applications found"
          searchPlaceholder="Search by applicant or type..."
        />
      )}
    </div>
  )
}
