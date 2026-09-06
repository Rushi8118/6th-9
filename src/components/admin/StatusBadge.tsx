import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground',
        success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        destructive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

const statusDotVariants = cva(
  'h-1.5 w-1.5 rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-muted-foreground',
        success: 'bg-green-500',
        warning: 'bg-amber-500',
        destructive: 'bg-red-500',
        info: 'bg-blue-500',
        purple: 'bg-purple-500',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function StatusBadge({
  status,
  variant,
  className,
}: {
  status: string
  variant?: VariantProps<typeof statusBadgeVariants>['variant']
  className?: string
}) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      <span className={cn(statusDotVariants({ variant }))} />
      {status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  )
}

export function roleBadge(role: string) {
  const colorMap: Record<string, string> = {
    super_admin: 'destructive',
    admin: 'warning',
    manager: 'info',
    consultant: 'purple',
    editor: 'info',
    hr: 'purple',
    customer: 'default',
    user: 'default',
    viewer: 'default',
  }
  return (
    <StatusBadge
      status={role.replace(/_/g, ' ')}
      variant={(colorMap[role] || 'default') as any}
    />
  )
}
