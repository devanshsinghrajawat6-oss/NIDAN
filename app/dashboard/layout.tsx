"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { 
  Leaf, LayoutDashboard, Users, FileText, Settings, 
  LogOut, Sun, Moon, Menu, AlertTriangle, ShieldCheck, 
  Scale, Activity, BarChart3, Database, X, ChevronRight,
  Bell, Search, BookOpen, CheckCircle2
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
      { name: "GCP Inspection",       href: "/dashboard/gcp-checklist",icon: ShieldCheck, roles: ["Admin","Investigator","Coordinator","Monitor","Regulator","Ethics Committee"] },
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
      <div className="flex h-screen items-center justify-center bg-[#faf9f5] dark:bg-[#0a111a]">
        <div className="flex flex-col items-center gap-4 bg-white dark:bg-[#121c2b] border border-stone-300 dark:border-stone-800 p-8 rounded-xl shadow-sm">
          <div className="h-12 w-12 rounded-lg bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center text-white shadow-xs">
            <BookOpen className="h-6 w-6 text-emerald-100" />
          </div>
          <div className="text-center">
            <p className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">NIDANA CTMS</p>
            <p className="text-stone-500 dark:text-stone-400 text-xs mt-0.5">Authenticating session…</p>
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
    <div className="flex h-screen bg-[#faf9f5] dark:bg-[#0a111a] text-stone-900 dark:text-stone-100 font-sans overflow-hidden transition-colors">
      
      {/* ── Paper Sidebar ───────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-[#f4f3ef] dark:bg-[#0f1723] border-r border-stone-300 dark:border-stone-800
        transition-transform duration-200 ease-in-out
        md:translate-x-0 md:static
        ${sidebarOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'}
      `}>
        {/* Logo Header */}
        <div className="h-16 flex items-center px-5 border-b border-stone-300 dark:border-stone-800 shrink-0 bg-white dark:bg-[#121c2b]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center text-white shadow-2xs">
              <BookOpen className="h-4 w-4 text-emerald-100" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base text-stone-950 dark:text-white tracking-wider">NIDANA</span>
              <span className="text-[9px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-widest -mt-1">AIIA Clinical Ledger</span>
            </div>
          </Link>
        </div>

        {/* Ledger Live Status Chip */}
        <div className="px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-700 dark:bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider flex-1">Ledger Active · EVM</span>
            <Database className="h-3.5 w-3.5 text-emerald-800 dark:text-emerald-400" />
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-4">
          {NAV_GROUPS.map((group) => {
            const visible = group.items.filter(i => i.roles.includes(userRole));
            if (visible.length === 0) return null;
            return (
              <div key={group.label}>
                <p className="px-3 mb-1.5 text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">{t(group.label)}</p>
                <div className="space-y-0.5">
                  {visible.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-emerald-800 dark:bg-emerald-700 text-white shadow-2xs"
                            : "text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-white"
                        }`}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-emerald-200" : "text-stone-400 dark:text-stone-500"}`} />
                        <span className="truncate">{t(item.name)}</span>
                        {isActive && <ChevronRight className="h-3 w-3 ml-auto text-emerald-300" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-3 border-t border-stone-300 dark:border-stone-800 bg-white dark:bg-[#121c2b] shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-stone-100 dark:hover:bg-[#182434] transition-colors cursor-pointer group">
            <div className="h-8 w-8 rounded bg-emerald-800 dark:bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 font-serif">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{userName}</p>
              <p className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold truncate">{userRole}</p>
            </div>
            <button 
              onClick={() => signOut()} 
              className="text-stone-400 hover:text-red-700 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Dashboard Workspace ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Paper Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-[#121c2b] border-b border-stone-300 dark:border-stone-800 shrink-0 shadow-2xs z-40">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 rounded-md text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#182434]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Input */}
            <div className="relative hidden md:flex items-center w-72">
              <Search className="absolute left-3 h-4 w-4 text-stone-400 dark:text-stone-500" />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-1.5 border border-stone-300 dark:border-stone-700 rounded-md bg-stone-50 dark:bg-[#182434] text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500 transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500"
                placeholder={t("Search studies, patients, MedDRA codes…")}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 relative">
            {/* Persona Tag */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs font-bold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              {userRole}
            </div>

            {/* Language Switcher */}
            <button 
              onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
              className="h-8 px-2.5 rounded-md bg-stone-100 dark:bg-[#182434] hover:bg-stone-200 dark:hover:bg-[#202e42] border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 transition-colors"
            >
              {lang === "EN" ? "हिन्दी" : "EN"}
            </button>

            {/* Theme Toggle (Light / Dark) */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 w-8 rounded-md bg-stone-100 dark:bg-[#182434] hover:bg-stone-200 dark:hover:bg-[#202e42] border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 transition-colors"
                title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              >
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-stone-700" />}
              </button>
            )}

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="relative h-8 w-8 rounded-md bg-stone-100 dark:bg-[#182434] hover:bg-stone-200 dark:hover:bg-[#202e42] border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors"
              >
                <Bell className="h-4 w-4" />
                {totalNotifs > 0 && (
                  <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center ${criticalCount > 0 ? 'bg-red-600' : 'bg-amber-600'}`}>
                    {totalNotifs}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#121c2b] border border-stone-300 dark:border-stone-800 rounded-xl shadow-md z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#182434]">
                    <span className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider">Regulatory Notifications</span>
                    <div className="flex items-center gap-2">
                      {totalNotifs > 0 && (
                        <button
                          onClick={() => {
                            fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) });
                            setNotificationList([]);
                          }}
                          className="text-[10px] text-emerald-800 dark:text-emerald-400 hover:underline font-bold"
                        >
                          Clear
                        </button>
                      )}
                      <button onClick={() => setShowNotifications(false)} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
                    {totalNotifs === 0 ? (
                      <div className="p-6 text-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-700 dark:text-emerald-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-200">All Systems Compliant</p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">No pending regulatory alerts</p>
                      </div>
                    ) : (
                      notificationList.map((notif: any, i) => (
                        <Link
                          key={notif._id || i}
                          href={notif.actionUrl || '/dashboard'}
                          onClick={() => setShowNotifications(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-[#182434] transition-colors"
                        >
                          <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notif.severity === 'critical' ? 'bg-red-600' : 'bg-amber-600'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold ${notif.severity === 'critical' ? 'text-red-700 dark:text-red-400' : 'text-amber-800 dark:text-amber-400'}`}>{notif.title}</p>
                            <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 truncate">{notif.message}</p>
                            <p className="text-[10px] text-stone-400 font-mono mt-1">{new Date(notif.createdAt || Date.now()).toLocaleTimeString()}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="h-8 w-8 rounded bg-emerald-800 dark:bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs font-serif"
              >
                {userInitials}
              </button>
              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#121c2b] border border-stone-300 dark:border-stone-800 rounded-xl shadow-md z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#182434]">
                    <p className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">{userName}</p>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold uppercase">{userRole}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/dashboard/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#182434]">
                      <Settings className="h-4 w-4 text-stone-400" /> System Settings
                    </Link>
                  </div>
                  <div className="border-t border-stone-200 dark:border-stone-800 py-1">
                    <button onClick={() => signOut()} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dashboard Content Container */}
        <main 
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#faf9f5] dark:bg-[#0a111a]"
          onClick={() => { setShowNotifications(false); setShowProfile(false); }}
        >
          {children}
        </main>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
