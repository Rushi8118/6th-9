import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge, roleBadge } from '@/components/admin/StatusBadge'
import { useNavigate } from 'react-router-dom'

type UserRow = {
  id: string
  full_name: string | null
  email: string
  user_role: string
  status: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const { hasPermission } = useAuth()
  const navigate = useNavigate()

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('user_profiles').select('*').limit(50)
      setUsers(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const columns = [
    {
      key: 'full_name',
      header: 'User',
      accessor: (row: UserRow) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              {(row.full_name || row.email || '?')[0].toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-foreground">{row.full_name || 'Unnamed'}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (row: UserRow) => row.email,
      sortable: true,
      className: 'text-muted-foreground',
    },
    {
      key: 'user_role',
      header: 'Role',
      accessor: (row: UserRow) => roleBadge(row.user_role),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row: UserRow) => (
        <StatusBadge
          status={row.status}
          variant={row.status === 'active' ? 'success' : row.status === 'suspended' ? 'destructive' : 'default'}
        />
      ),
      sortable: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6" /> Users
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage user accounts</p>
        </div>
        <PermissionGuard permission="users.create">
          <Button onClick={() => navigate('/admin/users/new')}>Add User</Button>
        </PermissionGuard>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found"
        searchPlaceholder="Search by email or name..."
      />
    </div>
  )
}
