"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { 
  Leaf, LayoutDashboard, Users, FileText, Settings, 
  LogOut, Sun, Moon, Menu, AlertTriangle, ShieldCheck, 
  Scale, Activity, BarChart3, Database, X, ChevronRight,
  Bell, Search
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/app/components/LanguageContext";

const NAV_GROUPS = [
  {
    label: "Portfolio",
    items: [
      { name: "Overview",       href: "/dashboard",             icon: LayoutDashboard, roles: ["Admin","Investigator","Coordinator","Monitor","Pharmacovigilance","Regulator","Ethics Committee"] },
      { name: "Portfolio KPIs", href: "/dashboard/kpis",        icon: BarChart3,       roles: ["Admin","Investigator","Pharmacovigilance","Regulator","Ethics Committee"] },
      { name: "Study Portfolio",href: "/dashboard/trials",       icon: FileText,        roles: ["Admin","Investigator","Coordinator","Monitor","Regulator","Ethics Committee"] },
      { name: "Milestones",     href: "/dashboard/milestones",  icon: Scale,           roles: ["Admin","Investigator","Coordinator","Monitor","Ethics Committee"] },
      { name: "Patients",       href: "/dashboard/patients",    icon: Users,           roles: ["Admin","Investigator","Coordinator","Monitor"] },
    ]
  },
  {
    label: "Compliance & Safety",
    items: [
      { name: "Herb Traceability",    href: "/dashboard/traceability",icon: Leaf,        roles: ["Admin","Investigator","Coordinator","Monitor","Pharmacovigilance","Regulator","Ethics Committee"] },
      { name: "e-Consent Hub",        href: "/dashboard/consent",   icon: ShieldCheck,  roles: ["Admin","Investigator","Coordinator","Ethics Committee","Regulator"] },
      { name: "Safety & NPvCC",       href: "/dashboard/safety",    icon: AlertTriangle,roles: ["Admin","Pharmacovigilance","Regulator","Investigator","Ethics Committee"] },
      { name: "Audit Trail (ALCOA+)", href: "/dashboard/audit",     icon: ShieldCheck,  roles: ["Admin","Regulator","Ethics Committee"] },
      { name: "Blockchain Ledger",    href: "/dashboard/ledger",    icon: Database,     roles: ["Admin","Regulator","Ethics Committee","Investigator"] },
    ]
  },
  {
    label: "Data & Analytics",
    items: [
      { name: "Advanced Analytics",      href: "/dashboard/analytics", icon: Activity, roles: ["Admin","Investigator","Pharmacovigilance","Regulator"] },
      { name: "Export Centre",           href: "/dashboard/export",    icon: FileText, roles: ["Admin","Investigator","Regulator","Pharmacovigilance"] },
    ]
  },
  {
    label: "System",
    items: [
      { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["Admin","Investigator","Coordinator","Monitor","Pharmacovigilance","Regulator","Ethics Committee"] },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notificationList, setNotificationList] = useState<any[]>([]);

  const { lang, setLang, t } = useLanguage();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(json => { if (json.success && json.data) setNotificationList(json.data); })
      .catch(() => {});
  }, []);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] dark:bg-[#020617]">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
              <Leaf className="h-7 w-7 text-white" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">NIDANA CTMS</p>
            <p className="text-slate-400 text-xs mt-1">Authenticating securely…</p>
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role || "Investigator";
  const userName = (session?.user as any)?.name || "AIIA User";
  const userInitials = userName.substring(0, 2).toUpperCase();

  const criticalCount = notificationList.filter(n => n.severity === 'critical').length;
  const totalNotifs = notificationList.length;

  return (
    <div className="flex h-screen bg-[#f0f4f8] dark:bg-[#020617] overflow-hidden">
      
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-white dark:bg-[#0d1117] border-r border-slate-200 dark:border-slate-800/80
        transition-transform duration-300 ease-in-out shadow-xl shadow-slate-200/50 dark:shadow-black/30
        md:translate-x-0 md:static md:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">NIDANA</span>
            </div>
          </Link>
        </div>

        {/* Blockchain status chip */}
        <div className="px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex-1">Blockchain Live · EVM</span>
            <Database className="h-3 w-3 text-emerald-600/60 dark:text-emerald-400/60" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-5">
          {NAV_GROUPS.map((group) => {
            const visible = group.items.filter(i => i.roles.includes(userRole));
            if (visible.length === 0) return null;
            return (
              <div key={group.label}>
                <p className="px-3 mb-1.5 text-[9px] font-extrabold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{t(group.label)}</p>
                <div className="space-y-0.5">
                  {visible.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-150 ${
                          isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full" />
                        )}
                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "opacity-60"}`} />
                        <span className="text-xs truncate">{t(item.name)}</span>
                        {isActive && <ChevronRight className="h-3 w-3 ml-auto text-emerald-500 dark:text-emerald-400" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-emerald-500/20">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{userName}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">{userRole}</p>
            </div>
            <button 
              onClick={() => signOut()} 
              className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-[#0d1117] border-b border-slate-200 dark:border-slate-800/80 z-40 shrink-0 shadow-sm shadow-slate-100 dark:shadow-black/20">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
            {/* Search */}
            <div className="relative hidden md:flex items-center w-72">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder={t("Search studies, patients, MedDRA codes…")}
              />
              <kbd className="absolute right-3 text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 relative">
            {/* Role badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-[11px] font-bold border border-emerald-100 dark:border-emerald-900/50">
              <ShieldCheck className="h-3 w-3" />
              {userRole}
            </div>

            {/* Lang toggle */}
            <button 
              onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {lang === "EN" ? "हि" : "EN"}
            </button>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="relative h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="h-4.5 w-4.5" />
                {totalNotifs > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center ${criticalCount > 0 ? 'bg-red-500' : 'bg-amber-500'}`}>
                    {totalNotifs}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 z-50 overflow-hidden animate-fade-in-down">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Regulatory Alerts</span>
                    <div className="flex items-center gap-2">
                      {totalNotifs > 0 && (
                        <button
                          onClick={() => {
                            fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) });
                            setNotificationList([]);
                          }}
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                        >
                          Clear all
                        </button>
                      )}
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 p-0.5">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                    {totalNotifs === 0 ? (
                      <div className="p-6 text-center">
                        <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All Clear</p>
                        <p className="text-xs text-slate-400 mt-1">No active alerts</p>
                      </div>
                    ) : (
                      notificationList.map((notif: any, i) => (
                        <Link
                          key={notif._id || i}
                          href={notif.actionUrl || '/dashboard'}
                          onClick={() => setShowNotifications(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${notif.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold ${notif.severity === 'critical' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>{notif.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt || Date.now()).toLocaleTimeString()}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {userInitials}
              </button>
              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in-down">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{userName}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{userRole}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/dashboard/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      <Settings className="h-4 w-4 opacity-60" /> Profile Settings
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                    <button onClick={() => signOut()} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main 
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          onClick={() => { setShowNotifications(false); setShowProfile(false); }}
        >
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
