import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { useAuth } from '@/hooks/use-auth'
import { isSuperAdmin } from '@/lib/rbac'
import { supabase } from '@/lib/supabase/client'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge, roleBadge } from '@/components/admin/StatusBadge'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

type UserRow = {
  id: string
  full_name: string | null
  email: string
  user_role: string
  status: string
}

export default function AdminUsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: data } = await supabase.from('user_profiles').select('*').limit(50)
      return data
    },
  })
  const { profile } = useAuth()
  const navigate = useNavigate()
  const superAdmin = isSuperAdmin(profile?.user_role)
  const users = (data ?? []) as UserRow[]

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
    ...(superAdmin ? [{
      key: 'actions',
      header: 'Actions',
      accessor: (row: UserRow) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/users/${row.id}`)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => {}}>
            Delete
          </Button>
        </div>
      ),
    }] : []),
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
        <div className="flex gap-2">
          {superAdmin && (
            <PermissionGuard permission="users.delete">
              <Button variant="destructive" onClick={() => navigate('/admin/users/new')}>
                Add User
              </Button>
            </PermissionGuard>
          )}
          <PermissionGuard permission="users.create">
            <Button onClick={() => navigate('/admin/users/new')}>Add User</Button>
          </PermissionGuard>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        emptyMessage="No users found"
        searchPlaceholder="Search by email or name..."
      />
    </div>
  )
}
