"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { 
  Leaf, LayoutDashboard, Users, FileText, Settings, 
  LogOut, Sun, Moon, Menu, AlertTriangle, ShieldCheck, Scale, Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/app/components/LanguageContext";

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
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) setNotificationList(json.data);
      })
      .catch(() => {});
  }, []);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Leaf className="h-8 w-8 text-brand-600 animate-bounce" />
          <p className="text-foreground/50 text-sm font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role || "Investigator";
  
  const allNavItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "Investigator", "Coordinator", "Monitor", "Pharmacovigilance", "Regulator", "Ethics Committee"] },
    { name: "Portfolio KPIs", href: "/dashboard/kpis", icon: Activity, roles: ["Admin", "Investigator", "Pharmacovigilance", "Regulator", "Ethics Committee"] },
    { name: "Study Portfolio", href: "/dashboard/trials", icon: FileText, roles: ["Admin", "Investigator", "Coordinator", "Monitor", "Regulator", "Ethics Committee"] },
    { name: "Milestones", href: "/dashboard/milestones", icon: Scale, roles: ["Admin", "Investigator", "Coordinator", "Monitor", "Ethics Committee"] },
    { name: "Patients", href: "/dashboard/patients", icon: Users, roles: ["Admin", "Investigator", "Coordinator", "Monitor"] },
    { name: "e-Consent Hub", href: "/dashboard/consent", icon: ShieldCheck, roles: ["Admin", "Investigator", "Coordinator", "Ethics Committee", "Regulator"] },
    { name: "Safety & NPvCC", href: "/dashboard/safety", icon: AlertTriangle, roles: ["Admin", "Pharmacovigilance", "Regulator", "Investigator", "Ethics Committee"] },
    { name: "Advanced Analytics", href: "/dashboard/analytics", icon: Activity, roles: ["Admin", "Investigator", "Pharmacovigilance", "Regulator"] },
    { name: "Export Centre (CDISC/FHIR)", href: "/dashboard/export", icon: FileText, roles: ["Admin", "Investigator", "Regulator", "Pharmacovigilance"] },
    { name: "Audit Trail (ALCOA+)", href: "/dashboard/audit", icon: ShieldCheck, roles: ["Admin", "Regulator", "Ethics Committee"] },
    { name: "Blockchain Ledger", href: "/dashboard/ledger", icon: ShieldCheck, roles: ["Admin", "Regulator", "Ethics Committee", "Investigator"] },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["Admin", "Investigator", "Coordinator", "Monitor", "Pharmacovigilance", "Regulator", "Ethics Committee"] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 md:translate-x-0 md:static md:block flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-brand-600" />
            <span className="font-heading font-bold text-xl uppercase tracking-wider text-slate-800 dark:text-slate-200">AIIA CTMS</span>
          </Link>
        </div>
        
        <div className="p-4 shrink-0 border-b border-border/50">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                BLOCKCHAIN
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500">Live EVM</span>
            </div>
            <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">ALCOA+ Audit & e-Consent</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? "bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-semibold" 
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-brand-600 dark:text-brand-400" : "opacity-70"}`} />
                <span className="text-xs">{t(item.name)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center justify-between bg-card hover:bg-muted/50 rounded-xl p-2 cursor-pointer transition-colors border border-transparent hover:border-border">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-brand-800 text-white flex items-center justify-center font-bold text-sm">
                {(session?.user as any)?.name?.substring(0,2)?.toUpperCase() || "AI"}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{(session?.user as any)?.name || "AIIA User"}</p>
                <p className="text-[10px] text-foreground/60">{userRole}</p>
              </div>
            </div>
            <button onClick={() => signOut()} className="text-red-500 hover:text-red-600 p-1" title="Sign Out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-[#0a0a0a]">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-white dark:bg-[#111111] z-40 shrink-0">
          <button 
            className="md:hidden p-2 rounded-md hover:bg-muted"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex-1 max-w-xl hidden md:flex items-center">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-full bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
                placeholder={t("Search studies, patients, MedDRA codes...")}
              />
            </div>
          </div>
          
          <div className="flex-1 md:hidden" />
          
          <div className="flex items-center gap-3 sm:gap-5 relative">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-xs font-bold border border-brand-100 dark:border-brand-800/50">
              <ShieldCheck className="h-3.5 w-3.5" />
              {userRole}
            </div>
            
            <button 
              onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors w-6"
            >
              {lang === "EN" ? "हि" : "EN"}
            </button>
            
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="relative text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-1"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationList.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {notificationList.length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-sm">Regulatory Alerts ({notificationList.length})</span>
                    <button 
                      onClick={() => {
                        fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) });
                        setNotificationList([]);
                      }}
                      className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notificationList.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No active alerts. All studies compliant.</div>
                    ) : (
                      notificationList.map((notif: any, i) => (
                        <Link
                          key={notif._id || i}
                          href={notif.actionUrl || '/dashboard'}
                          onClick={() => setShowNotifications(false)}
                          className="block px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <p className={`text-xs font-bold ${notif.severity === 'critical' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt || Date.now()).toLocaleTimeString()}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ml-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {(session?.user as any)?.name?.substring(0,2)?.toUpperCase() || "DE"}
              </button>
              
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-sm">{(session?.user as any)?.name || "demo"}</p>
                    <p className="text-xs text-slate-500">{userRole}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/dashboard/settings" onClick={() => setShowProfile(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      Edit Profile
                    </Link>
                    <Link href="/dashboard/settings" onClick={() => setShowProfile(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      Security Settings
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                    <button onClick={() => signOut()} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" onClick={() => { setShowNotifications(false); setShowProfile(false); }}>
          {children}
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
