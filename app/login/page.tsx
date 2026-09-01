"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Leaf, Lock, Mail, Eye, EyeOff, UserSquare2, Scale, Activity, 
  TrendingUp, ShieldCheck, CheckCircle2, ArrowRight, Database, Globe
} from "lucide-react";

const roles = [
  { id: "Investigator",       title: "Lead Doctor",        subtitle: "Full Clinical Access",   icon: UserSquare2, color: "from-blue-500 to-blue-700",     prefix: "investigator@demo.com" },
  { id: "Ethics Committee",   title: "Ethics Committee",   subtitle: "IEC & Approvals",        icon: Scale,        color: "from-emerald-500 to-emerald-700", prefix: "ec@demo.com" },
  { id: "Pharmacovigilance",  title: "Pharmacovigilance",  subtitle: "Safety & AE Tracking",   icon: Activity,    color: "from-orange-500 to-orange-700",   prefix: "pv@demo.com" },
  { id: "Regulator",          title: "Leadership",         subtitle: "KPIs & Portfolio View",  icon: TrendingUp,   color: "from-purple-500 to-purple-700",   prefix: "regulator@demo.com" },
  { id: "Admin",              title: "Administrator",      subtitle: "Full System Control",    icon: ShieldCheck,  color: "from-slate-600 to-slate-800",     prefix: "admin@demo.com" },
];

const complianceItems = [
  { label: "CTRI Registration Tracking", icon: "📋" },
  { label: "GCP-ASU Compliant Workflow", icon: "✅" },
  { label: "ALCOA+ Audit Trail",         icon: "🔗" },
  { label: "MedDRA / WHODrug Coded",     icon: "⚕️" },
  { label: "HL7 FHIR R4 Ready",          icon: "🌐" },
  { label: "DPDP Act 2023 Aligned",      icon: "🔒" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const handleRoleSelect = (role: typeof roles[0]) => {
    setSelectedRole(role.id);
    setEmail(role.prefix);
    setPassword("nidana2024");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* ── Left Panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex-col justify-between p-12 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/3 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl" />

        {/* Header */}
        <div className="relative z-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading text-2xl font-bold text-white tracking-tight">NIDANA</span>
          </div>
          <p className="text-emerald-400/80 text-sm font-medium">All India Institute of Ayurveda — Clinical Trial Management System</p>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="mb-10 animate-fade-in-up delay-100">
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Research With<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
                Precision & Trust
              </span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              India's first blockchain-secured CTMS for Ayurveda clinical research — purpose-built for AIIA's growing multi-centre portfolio and NPvCC responsibilities.
            </p>
          </div>

          {/* Compliance grid */}
          <div className="grid grid-cols-2 gap-3 animate-fade-in-up delay-200">
            {complianceItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs font-semibold text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex items-center gap-6 animate-fade-in delay-300">
          {[
            { v: "14+", l: "Active Studies" },
            { v: "98%", l: "Compliance" },
            { v: "NPvCC", l: "Hosted" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-2xl font-extrabold text-white">{s.v}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{s.l}</p>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-emerald-400/70">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Blockchain Active
          </div>
        </div>
      </div>

      {/* ── Right Panel — Login Form ────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-[#f8fafc] dark:bg-[#0a0a0a] p-6 sm:p-10 relative">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="font-heading text-xl font-bold text-slate-900 dark:text-white">NIDANA</span>
        </div>

        <div className="w-full max-w-md animate-scale-in">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to your secure CTMS portal</p>
          </div>

          {/* Role selector */}
          <div className="mb-7">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Select your role</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all duration-200 text-left ${
                    selectedRole === role.id
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-lg shadow-emerald-500/10 scale-[1.02]"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
                  }`}
                >
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${role.color} text-white flex items-center justify-center mb-2 shadow-md`}>
                    <role.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 text-center leading-tight">{role.title}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-0.5 leading-tight hidden sm:block">{role.subtitle}</span>
                  {selectedRole === role.id && (
                    <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border border-red-400 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Username / Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="Select a role or enter email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mt-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Sign In Securely
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo tip */}
          <div className="mt-6 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">i</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="text-slate-800 dark:text-slate-200">Demo mode:</strong> Click any role above to auto-fill credentials. 
              Password is <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-emerald-700 dark:text-emerald-400">nidana2024</code>
            </p>
          </div>

          {/* Compliance note */}
          <div className="mt-5 flex items-center justify-center gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><Database className="h-3 w-3" /> Blockchain Secured</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> E2E Encrypted</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> ISO 27001 Hosted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
