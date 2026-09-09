/**
 * Enterprise Role-Based Access Control (RBAC)
 * Roles, permissions, hierarchy, and access helpers
 */

export type RoleSlug =
  | 'customer'
  | 'hr'
  | 'visa_officer'
  | 'counselor'
  | 'accountant'
  | 'marketing'
  | 'admin'
  | 'super_admin'
  // Legacy compat
  | 'user'
  | 'viewer'
  | 'editor'
  | 'consultant'
  | 'manager'
  | 'superadmin'

export type PermissionSlug = keyof typeof PERMISSION_LABELS

export type RoleDefinition = {
  slug: RoleSlug
  name: string
  description: string
  isSystem: boolean
  level: number
}

export type PermissionGroup = {
  module: string
  label: string
  permissions: PermissionSlug[]
}

export const ROLES: RoleDefinition[] = [
  { slug: 'customer',     name: 'Customer',     description: 'Own profile, applications, documents, payments',         isSystem: true, level: 0 },
  { slug: 'hr',           name: 'HR',           description: 'Manage applicants, jobs, interviews, candidate history', isSystem: true, level: 1 },
  { slug: 'visa_officer', name: 'Visa Officer', description: 'Process applications, verify documents',                isSystem: true, level: 2 },
  { slug: 'counselor',    name: 'Counselor',    description: 'Create leads, contact clients, manage follow-ups',      isSystem: true, level: 3 },
  { slug: 'accountant',   name: 'Accountant',   description: 'Payments, invoices, transactions, refunds',             isSystem: true, level: 4 },
  { slug: 'marketing',    name: 'Marketing',    description: 'Blogs, SEO, landing pages, campaigns',                  isSystem: true, level: 5 },
  { slug: 'admin',        name: 'Admin',        description: 'Manage applications, customers, CRM, reports',          isSystem: true, level: 6 },
  { slug: 'super_admin',  name: 'Super Admin',  description: 'Full control over everything',                          isSystem: true, level: 7 },
]

export const PERMISSION_LABELS: Record<string, string> = {
  // Users
  'users.read':      'View Users',
  'users.create':    'Create Users',
  'users.update':    'Update Users',
  'users.delete':    'Delete Users',
  // Roles & Permissions
  'roles.read':      'View Roles',
  'roles.create':    'Create Roles',
  'roles.update':    'Update Roles',
  'roles.delete':    'Delete Roles',
  'permissions.read':'View Permissions',
  'permissions.assign':'Assign Permissions',
  'permissions.manage':'Manage Permissions',
  // CRM
  'crm.read':        'View CRM',
  'crm.create':      'Create CRM Entries',
  'crm.update':      'Update CRM Entries',
  'crm.delete':      'Delete CRM Entries',
  // Applications
  'applications.read':   'View Applications',
  'applications.create': 'Create Applications',
  'applications.update': 'Update Applications',
  'applications.delete': 'Delete Applications',
  'applications.process':'Process Applications',
  // Countries
  'countries.read':   'View Countries',
  'countries.create': 'Create Countries',
  'countries.update': 'Update Countries',
  'countries.delete': 'Delete Countries',
  // Jobs
  'jobs.read':        'View Jobs',
  'jobs.create':      'Create Jobs',
  'jobs.update':      'Update Jobs',
  'jobs.delete':      'Delete Jobs',
  // Blogs
  'blogs.read':       'View Blogs',
  'blogs.create':     'Create Blogs',
  'blogs.update':     'Update Blogs',
  'blogs.delete':     'Delete Blogs',
  'blogs.publish':    'Publish Blogs',
  // Reports
  'reports.read':     'View Reports',
  'reports.create':   'Create Reports',
  'reports.export':   'Export Reports',
  // Analytics
  'analytics.view':    'View Analytics',
  'analytics.realtime':'View Realtime',
  // Settings
  'settings.read':    'View Settings',
  'settings.update':  'Update Settings',
  'settings.manage':  'Manage Settings',
  // Finance
  'finance.read':     'View Finance',
  'finance.create':   'Create Transactions',
  'finance.update':   'Update Finance',
  'finance.delete':   'Delete Finance',
  'finance.refund':   'Process Refunds',
  // Notifications
  'notifications.read':   'View Notifications',
  'notifications.create': 'Create Notifications',
  'notifications.manage': 'Manage Notifications',
  // Audit
  'audit.read':       'View Audit Logs',
  'audit.export':     'Export Audit Logs',
  // Documents
  'documents.read':   'View Documents',
  'documents.create': 'Upload Documents',
  'documents.update': 'Update Documents',
  'documents.delete': 'Delete Documents',
  'documents.verify': 'Verify Documents',
  // Appointments
  'appointments.read':   'View Appointments',
  'appointments.create': 'Create Appointments',
  'appointments.update': 'Update Appointments',
  'appointments.delete': 'Delete Appointments',
  // Leads / Customers
  'leads.read':       'View Leads',
  'leads.create':     'Create Leads',
  'leads.update':     'Update Leads',
  'leads.delete':     'Delete Leads',
  'customers.read':   'View Customers',
  'customers.create': 'Create Customers',
  'customers.update': 'Update Customers',
  'customers.delete': 'Delete Customers',
  // Staff
  'staff.read':       'View Staff',
  'staff.assign':     'Assign Staff',
  // Campaigns
  'campaigns.read':   'View Campaigns',
  'campaigns.create': 'Create Campaigns',
  'campaigns.update': 'Update Campaigns',
  'campaigns.delete': 'Delete Campaigns',
  // SEO
  'seo.read':         'View SEO Data',
  'seo.update':       'Update SEO',
  // Landing Pages
  'landing_pages.read':   'View Landing Pages',
  'landing_pages.create': 'Create Landing Pages',
  'landing_pages.update': 'Update Landing Pages',
  'landing_pages.delete': 'Delete Landing Pages',
  // Social Media
  'social_media.read':   'View Social Media',
  'social_media.create': 'Create Social Posts',
  'social_media.update': 'Update Social Posts',
  'social_media.delete': 'Delete Social Posts',
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    module: 'users',
    label: 'Users',
    permissions: ['users.read','users.create','users.update','users.delete'],
  },
  {
    module: 'roles',
    label: 'Roles & Permissions',
    permissions: ['roles.read','roles.create','roles.update','roles.delete','permissions.read','permissions.assign','permissions.manage'],
  },
  {
    module: 'crm',
    label: 'CRM',
    permissions: ['crm.read','crm.create','crm.update','crm.delete'],
  },
  {
    module: 'applications',
    label: 'Applications',
    permissions: ['applications.read','applications.create','applications.update','applications.delete','applications.process'],
  },
  {
    module: 'countries',
    label: 'Countries',
    permissions: ['countries.read','countries.create','countries.update','countries.delete'],
  },
  {
    module: 'jobs',
    label: 'Jobs',
    permissions: ['jobs.read','jobs.create','jobs.update','jobs.delete'],
  },
  {
    module: 'blogs',
    label: 'Blogs',
    permissions: ['blogs.read','blogs.create','blogs.update','blogs.delete','blogs.publish'],
  },
  {
    module: 'reports',
    label: 'Reports',
    permissions: ['reports.read','reports.create','reports.export'],
  },
  {
    module: 'analytics',
    label: 'Analytics',
    permissions: ['analytics.view','analytics.realtime'],
  },
  {
    module: 'settings',
    label: 'Settings',
    permissions: ['settings.read','settings.update','settings.manage'],
  },
  {
    module: 'finance',
    label: 'Finance',
    permissions: ['finance.read','finance.create','finance.update','finance.delete','finance.refund'],
  },
  {
    module: 'notifications',
    label: 'Notifications',
    permissions: ['notifications.read','notifications.create','notifications.manage'],
  },
  {
    module: 'audit',
    label: 'Audit',
    permissions: ['audit.read','audit.export'],
  },
  {
    module: 'documents',
    label: 'Documents',
    permissions: ['documents.read','documents.create','documents.update','documents.delete','documents.verify'],
  },
  {
    module: 'appointments',
    label: 'Appointments',
    permissions: ['appointments.read','appointments.create','appointments.update','appointments.delete'],
  },
  {
    module: 'leads',
    label: 'Leads',
    permissions: ['leads.read','leads.create','leads.update','leads.delete'],
  },
  {
    module: 'customers',
    label: 'Customers',
    permissions: ['customers.read','customers.create','customers.update','customers.delete'],
  },
  {
    module: 'staff',
    label: 'Staff',
    permissions: ['staff.read','staff.assign'],
  },
  {
    module: 'marketing',
    label: 'Marketing',
    permissions: ['campaigns.read','campaigns.create','campaigns.update','campaigns.delete','seo.read','seo.update','landing_pages.read','landing_pages.create','landing_pages.update','landing_pages.delete','social_media.read','social_media.create','social_media.update','social_media.delete'],
  },
]

/** Static permission matrix per role (for offline checks / fallback) */
export const ROLE_PERMISSIONS: Record<RoleSlug, PermissionSlug[]> = {
  customer: [
    'applications.read','applications.create',
    'documents.read','documents.create',
    'finance.read','finance.create',
    'notifications.read',
    'appointments.read','appointments.create',
  ],
  hr: [
    'applications.read','applications.update',
    'jobs.read','jobs.create','jobs.update','jobs.delete',
    'blogs.read',
    'documents.read','documents.create','documents.update',
    'appointments.read','appointments.create','appointments.update',
    'leads.read','customers.read',
    'notifications.read','notifications.create',
  ],
  visa_officer: [
    'applications.read','applications.update','applications.process',
    'documents.read','documents.create','documents.update','documents.verify',
    'customers.read',
    'notifications.read','notifications.create',
  ],
  counselor: [
    'crm.read','crm.create','crm.update',
    'leads.read','leads.create','leads.update',
    'customers.read',
    'appointments.read','appointments.create','appointments.update',
    'documents.read','documents.create',
    'notifications.read','notifications.create',
    'applications.read',
  ],
  accountant: [
    'finance.read','finance.create','finance.update','finance.refund',
    'reports.read','reports.export',
    'customers.read',
    'notifications.read',
  ],
  marketing: [
    'blogs.read','blogs.create','blogs.update','blogs.delete','blogs.publish',
    'seo.read','seo.update',
    'landing_pages.read','landing_pages.create','landing_pages.update','landing_pages.delete',
    'campaigns.read','campaigns.create','campaigns.update','campaigns.delete',
    'social_media.read','social_media.create','social_media.update','social_media.delete',
    'analytics.view',
    'notifications.read',
  ],
  admin: [
    'users.read','users.create','users.update',
    'roles.read',
    'crm.read','crm.create','crm.update','crm.delete',
    'applications.read','applications.create','applications.update','applications.process',
    'countries.read','countries.update',
    'blogs.read','blogs.create','blogs.update',
    'reports.read','reports.create','reports.export',
    'analytics.view',
    'notifications.read','notifications.create','notifications.manage',
    'documents.read','documents.create','documents.update','documents.verify',
    'appointments.read','appointments.create','appointments.update',
    'leads.read','leads.create','leads.update',
    'customers.read','customers.create','customers.update',
    'staff.read','staff.assign',
  ],
  super_admin: [
    'users.read','users.create','users.update','users.delete',
    'roles.read','roles.create','roles.update','roles.delete',
    'permissions.read','permissions.assign','permissions.manage',
    'crm.read','crm.create','crm.update','crm.delete',
    'applications.read','applications.create','applications.update','applications.delete','applications.process',
    'countries.read','countries.create','countries.update','countries.delete',
    'jobs.read','jobs.create','jobs.update','jobs.delete',
    'blogs.read','blogs.create','blogs.update','blogs.delete','blogs.publish',
    'reports.read','reports.create','reports.export',
    'analytics.view','analytics.realtime',
    'settings.read','settings.update','settings.manage',
    'finance.read','finance.create','finance.update','finance.delete','finance.refund',
    'notifications.read','notifications.create','notifications.manage',
    'audit.read','audit.export',
    'documents.read','documents.create','documents.update','documents.delete','documents.verify',
    'appointments.read','appointments.create','appointments.update','appointments.delete',
    'leads.read','leads.create','leads.update','leads.delete',
    'customers.read','customers.create','customers.update','customers.delete',
    'staff.read','staff.assign',
    'campaigns.read','campaigns.create','campaigns.update','campaigns.delete',
    'seo.read','seo.update',
    'landing_pages.read','landing_pages.create','landing_pages.update','landing_pages.delete',
    'social_media.read','social_media.create','social_media.update','social_media.delete',
  ],
  // Legacy role mappings (backward compat)
  user:        [],
  viewer:      ['users.read','applications.read','countries.read','analytics.view'],
  editor:      ['users.read','applications.read','applications.edit','countries.read','countries.edit','analytics.view','email_templates.view','email_templates.edit'],
  consultant:  ['users.read','applications.read','applications.edit','applications.export','countries.read','countries.edit','analytics.view','email_templates.view','audit.view'],
  manager:     ['users.read','users.create','users.edit','users.export','roles.view','applications.read','applications.edit','applications.delete','applications.export','countries.read','countries.edit','countries.delete','sessions.view','audit.view','audit.export','automations.view','automations.create','automations.edit','email_templates.view','email_templates.edit','email_templates.send','analytics.view','analytics.realtime','settings.view'],
  superadmin:  [
    'users.read','users.create','users.edit','users.delete','users.export',
    'roles.view','roles.assign','roles.manage',
    'applications.read','applications.edit','applications.delete','applications.export',
    'countries.read','countries.edit','countries.delete',
    'sessions.view','sessions.terminate',
    'audit.view','audit.export',
    'automations.view','automations.create','automations.edit','automations.delete',
    'email_templates.view','email_templates.edit','email_templates.send',
    'analytics.view','analytics.realtime',
    'settings.view','settings.edit',
  ],
}

export const ROLE_HIERARCHY: Record<RoleSlug, number> = {
  customer: 0,
  hr: 1,
  visa_officer: 2,
  counselor: 3,
  accountant: 4,
  marketing: 5,
  admin: 6,
  super_admin: 7,
  // Legacy
  user: 0,
  viewer: 1,
  editor: 2,
  consultant: 3,
  manager: 4,
  superadmin: 7,
}

export const ROLE_COLORS: Record<string, string> = {
  customer:     'bg-gray-100 text-gray-700',
  hr:           'bg-blue-100 text-blue-700',
  visa_officer: 'bg-teal-100 text-teal-700',
  counselor:    'bg-violet-100 text-violet-700',
  accountant:   'bg-green-100 text-green-700',
  marketing:    'bg-pink-100 text-pink-700',
  admin:        'bg-amber-100 text-amber-800',
  super_admin:  'bg-red-100 text-red-700',
  // Legacy
  user:         'bg-gray-100 text-gray-700',
  viewer:       'bg-slate-100 text-slate-700',
  editor:       'bg-blue-100 text-blue-700',
  consultant:   'bg-teal-100 text-teal-700',
  manager:      'bg-violet-100 text-violet-700',
  superadmin:   'bg-red-100 text-red-700',
}

export function normalizeRoleSlug(role: string | null | undefined): RoleSlug {
  const r = (role || 'customer').toLowerCase().replace(/[^a-z_]/g, '')
  if (r === 'super_admin' || r === 'superadmin') return 'super_admin'
  if (r === 'admin')      return 'admin'
  if (r === 'hr')         return 'hr'
  if (r === 'visa_officer') return 'visa_officer'
  if (r === 'counselor' || r === 'consultant') return 'counselor'
  if (r === 'accountant') return 'accountant'
  if (r === 'marketing')  return 'marketing'
  if (r === 'manager')    return 'manager'
  if (r === 'editor')     return 'editor'
  if (r === 'viewer')     return 'viewer'
  return 'customer'
}

export function isSuperAdmin(role: string | null | undefined): boolean {
  const slug = normalizeRoleSlug(role)
  return slug === 'super_admin' || slug === 'superadmin' as any
}

export function isAdminOrAbove(role: string | null | undefined): boolean {
  return ROLE_HIERARCHY[normalizeRoleSlug(role)] >= ROLE_HIERARCHY['admin']
}

export function isStaffOrAbove(role: string | null | undefined): boolean {
  const level = ROLE_HIERARCHY[normalizeRoleSlug(role)]
  return level >= ROLE_HIERARCHY['counselor'] || level >= ROLE_HIERARCHY['hr']
}

/** End-user (non-staff) role slugs used by access-log filters. */
const END_USER_ROLE_SLUGS = new Set<RoleSlug>(['customer', 'user', 'viewer'])

/** Super-admin / admin role slugs (including legacy aliases). */
const ADMIN_TIER_ROLE_SLUGS = new Set<RoleSlug>(['admin', 'super_admin', 'superadmin' as RoleSlug])

/**
 * Internal staff roles for access-log filtering.
 * Derived from ROLE_HIERARCHY so new non-admin internal roles automatically count as Staff.
 */
export function getStaffRoleSlugs(): RoleSlug[] {
  return (Object.keys(ROLE_HIERARCHY) as RoleSlug[]).filter(
    (slug) => !END_USER_ROLE_SLUGS.has(slug) && !ADMIN_TIER_ROLE_SLUGS.has(slug),
  )
}

export function getEndUserRoleSlugs(): RoleSlug[] {
  return (Object.keys(ROLE_HIERARCHY) as RoleSlug[]).filter((slug) =>
    END_USER_ROLE_SLUGS.has(slug),
  )
}

export function getSuperAdminRoleSlugs(): string[] {
  return ['super_admin', 'superadmin']
}

export function getAdministratorRoleSlugs(): string[] {
  return ['admin']
}

/** Map a stored user_role into an access-log role filter bucket. */
export function getAccessLogRoleGroup(
  role: string | null | undefined,
  userId: string | null | undefined,
): 'super_admin' | 'admin' | 'staff' | 'user' | 'guest' {
  if (!userId) return 'guest'
  const slug = normalizeRoleSlug(role)
  if (slug === 'super_admin' || (slug as string) === 'superadmin') return 'super_admin'
  if (slug === 'admin') return 'admin'
  if (END_USER_ROLE_SLUGS.has(slug)) return 'user'
  return 'staff'
}

export function canAccessAdmin(role: string | null | undefined): boolean {
  const slug = normalizeRoleSlug(role)
  return slug === 'admin' || slug === 'super_admin'
    || slug === 'manager' || slug === 'superadmin' as any
}

export function hasPermission(permissions: string[], required: PermissionSlug): boolean {
  return permissions.includes(required)
}

export function hasAnyPermission(permissions: string[], required: PermissionSlug[]): boolean {
  return required.some(p => permissions.includes(p))
}

export function hasAllPermissions(permissions: string[], required: PermissionSlug[]): boolean {
  return required.every(p => permissions.includes(p))
}

export function getPermissionsForRole(role: RoleSlug): PermissionSlug[] {
  return ROLE_PERMISSIONS[role] ?? []
}

export function getRoleBySlug(slug: string): RoleDefinition | undefined {
  return ROLES.find(r => r.slug === slug)
}

export function getPermissionModule(key: string): string {
  return key.split('.')[0] ?? ''
}
