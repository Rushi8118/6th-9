import React, { useEffect, useState, useMemo } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/usePermissions";
import {
  LayoutDashboard, Users, Briefcase, FileText, Settings,
  LogOut, Activity, Shield, Zap, Mail, MonitorSmartphone, ShieldAlert,
  ChevronLeft, ChevronRight, Menu, X, FolderOpen, Flame, Globe,
  Bell, Search, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminErrorBoundary } from "@/components/AdminErrorBoundary";
import { ROLE_COLORS } from "@/lib/rbac";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { SearchBar } from "@/components/admin/SearchBar";
import type { PermissionSlug } from "@/lib/rbac";

type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: PermissionSlug;
  requiredPermissions?: PermissionSlug[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const ALL_NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard",       path: "/admin",              icon: LayoutDashboard },
      { label: "Live Metrics",    path: "/admin/realtime",     icon: Activity, requiredPermission: "analytics.realtime" },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Users",           path: "/admin/users",        icon: Users, requiredPermission: "users.read" },
      { label: "Roles & Permissions", path: "/admin/roles",    icon: Shield, requiredPermission: "roles.read" },
      { label: "Applications",    path: "/admin/applications", icon: Briefcase, requiredPermission: "applications.read" },
      { label: "Urgent Openings", path: "/admin/urgent-requirements", icon: Flame },
      { label: "Countries & Eligibility", path: "/admin/countries", icon: Globe },
      { label: "Blog Posts",      path: "/admin/blog",         icon: FileText, requiredPermission: "blogs.read" },
    ],
  },
  {
    label: "Security & Logs",
    items: [
      { label: "Sessions",        path: "/admin/sessions",     icon: MonitorSmartphone },
      { label: "Audit Logs",      path: "/admin/audit",        icon: ShieldAlert, requiredPermission: "audit.read" },
    ],
  },
  {
    label: "Automation",
    items: [
      { label: "Automations",     path: "/admin/automations",  icon: Zap },
      { label: "Email Templates", path: "/admin/email-templates", icon: Mail },
    ],
  },
  {
    label: "System",
    items: [
      { label: "File Manager",    path: "/admin/files",        icon: FolderOpen },
      { label: "Settings",        path: "/admin/settings",     icon: Settings, requiredPermission: "settings.read" },
    ],
  },
];

function useFilteredNavGroups(): NavGroup[] {
  const { can } = usePermissions();
  return useMemo(() => {
    return ALL_NAV_GROUPS
      .map(group => ({
        ...group,
        items: group.items.filter(item => {
          if (item.requiredPermission) return can(item.requiredPermission);
          if (item.requiredPermissions) return item.requiredPermissions.some(p => can(p));
          return true;
        }),
      }))
      .filter(group => group.items.length > 0);
  }, [can]);
}

function Breadcrumbs() {
  const location = useLocation();
  const path = location.pathname.replace('/admin', '').split('/').filter(Boolean);
  if (path.length === 0) return null;
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
      <Link to="/admin" className="hover:text-foreground transition-colors">Admin</Link>
      {path.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span>/</span>
          <span className="text-foreground font-medium capitalize">
            {seg.replace(/-/g, ' ')}
          </span>
        </span>
      ))}
    </nav>
  );
}

const AdminLayout: React.FC = () => {
  const { isAdmin, canAccessAdmin, isLoading, signOut, profile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileWaitExpired, setProfileWaitExpired] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const navGroups = useFilteredNavGroups();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    if (!user || profile) {
      setProfileWaitExpired(false);
      return;
    }
    const timer = window.setTimeout(() => setProfileWaitExpired(true), 2500);
    return () => window.clearTimeout(timer);
  }, [user, profile]);

  const waitingForProfile = Boolean(user) && !profile && !profileWaitExpired;
  if (isLoading || waitingForProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !canAccessAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md text-center">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground mb-6">You don't have permission to access this area.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" asChild><Link to="/dashboard">Dashboard</Link></Button>
            <Button asChild><Link to="/">Home</Link></Button>
          </div>
        </Card>
      </div>
    );
  }

  const isActive = (path: string) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  const roleSlug = (profile?.user_role ?? 'admin') as keyof typeof ROLE_COLORS;

  const sidebarWidth = collapsed ? 'w-[64px]' : 'w-64';

  const SidebarContent = () => (
    <div className="h-full flex flex-col min-h-0">
      {/* Brand */}
      <div className={`shrink-0 flex items-center gap-3 p-4 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate">Siddhivinayak Overseas</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden lg:flex p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground ml-auto"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Profile */}
      {!collapsed && profile && (
        <div className="shrink-0 mx-3 mt-3 p-3 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
              {profile.full_name?.charAt(0) ?? profile.email?.charAt(0) ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{profile.email}</p>
              <Badge variant="secondary" className="mt-0.5 text-[10px] capitalize">
                {profile.user_role.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
        </div>
      )}

        {/* Navigation */}
        <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-2 space-y-1 scroll-smooth scrollbar-thin">
        {navGroups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 p-2 border-t border-border">
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen bg-card border-r border-border transition-all duration-200 shrink-0 overflow-hidden ${sidebarWidth}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col overflow-hidden transition-transform duration-200 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 h-14 border-b border-border bg-card/80 backdrop-blur-lg flex items-center gap-3 px-4 lg:px-6">
          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden md:block flex-1">
            <Breadcrumbs />
          </div>

          {/* Global search */}
          <div className="w-full max-w-sm hidden sm:block">
            <SearchBar
              value=""
              onChange={() => {}}
              placeholder="Search..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
            </Button>
            {profile && (
              <div className="hidden sm:flex items-center gap-2 ml-1 pl-3 border-l border-border">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {profile.full_name?.charAt(0) ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{profile.email}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 min-h-0 p-4 lg:p-8 overflow-y-auto scroll-smooth scrollbar-thin">
          <AdminErrorBoundary key={location.pathname}>
            <Outlet />
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
