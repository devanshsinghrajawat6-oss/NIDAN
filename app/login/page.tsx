"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock, Mail, Eye, EyeOff, UserSquare2, Scale, Activity,
  TrendingUp, ShieldCheck, CheckCircle2, ArrowRight, Database,
  Globe, BookOpen, ChevronRight
} from "lucide-react";
import { useLanguage } from "@/app/components/LanguageContext";
import Link from "next/link";

const roles = [
  { id: "Investigator",     title: "Lead Doctor",       subtitle: "Full Clinical Access",  icon: UserSquare2, prefix: "investigator@demo.com" },
  { id: "Ethics Committee", title: "Ethics Committee",  subtitle: "IEC & Approvals",       icon: Scale,       prefix: "ec@demo.com" },
  { id: "Pharmacovigilance",title: "Pharmacovigilance", subtitle: "Safety & AE Tracking",  icon: Activity,    prefix: "pv@demo.com" },
  { id: "Regulator",        title: "Leadership",        subtitle: "KPIs & Portfolio View", icon: TrendingUp,  prefix: "regulator@demo.com" },
  { id: "Admin",            title: "Administrator",     subtitle: "Full System Control",   icon: ShieldCheck, prefix: "admin@demo.com" },
];

const trustBadges = [
  { icon: Database, label: "Blockchain Secured" },
  { icon: Lock, label: "E2E Encrypted" },
  { icon: Globe, label: "ISO 27001 Hosted" },
];

export default function LoginPage() {
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();
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
    <div className="min-h-screen flex bg-[#faf9f5] text-stone-900 font-sans">

      {/* ── Left Paper Panel ────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[50%] bg-[#081c15] text-stone-100 relative flex-col justify-between p-12 border-r border-emerald-950">
        
        {/* Top Brand */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="h-9 w-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="h-5 w-5 text-emerald-100" />
            </div>
            <span className="font-serif font-bold text-2xl text-white tracking-wider">NIDANA</span>
          </Link>
          <p className="mt-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            All India Institute of Ayurveda — Clinical Trial Ledger
          </p>
        </div>

        {/* Center Paper Sheet Preview */}
        <div className="relative z-10 my-auto py-8">
          <div className="bg-[#0f2e22] border border-emerald-800 rounded-xl p-8 shadow-md">
            <h2 className="text-3xl font-serif font-bold text-white leading-tight mb-4">
              Paper-Grade Integrity,<br />
              <span className="text-emerald-300 font-sans font-extrabold text-2xl uppercase tracking-wide">
                Blockchain-Sealed
              </span>
            </h2>
            <p className="text-emerald-200/80 text-sm leading-relaxed mb-6">
              NIDANA provides an immutable audit trail for Ayurveda trials. Every CRF entry, dosha measurement, and herbal dosage is cryptographically anchored at entry.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emerald-800/80">
              {[
                { v: "14+", l: "Active Studies" },
                { v: "100%", l: "ALCOA+ Trace" },
                { v: "NPvCC", l: "GCP Hosted" },
              ].map((s) => (
                <div key={s.l} className="text-left">
                  <p className="text-xl font-serif font-bold text-white">{s.v}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="relative z-10 flex items-center gap-2 text-xs font-mono font-semibold text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          CTMS Ledger System Active · EVM Testnet
        </div>
      </div>

      {/* ── Right Form Panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-16 relative bg-[#faf9f5]">

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
          className="absolute top-6 right-6 h-8 px-3 rounded-md bg-white border border-stone-300 flex items-center justify-center text-xs font-bold text-stone-700 hover:bg-stone-50 transition-all shadow-2xs"
        >
          {lang === "EN" ? "हिन्दी" : "EN"}
        </button>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="h-8 w-8 rounded bg-emerald-800 flex items-center justify-center text-white">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="font-serif font-bold text-xl text-stone-900">NIDANA</span>
        </div>

        <div className="w-full max-w-md bg-white border border-stone-300 rounded-xl p-8 shadow-sm">

          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">{t("Welcome back")}</h1>
            <p className="text-stone-500 text-xs mt-1">{t("Sign in to NIDANA")}</p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2.5">Select Role Persona</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-md border text-left transition-all ${
                    selectedRole === role.id
                      ? "border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-2xs"
                      : "border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700"
                  }`}
                >
                  <role.icon className={`h-4 w-4 mb-1.5 ${selectedRole === role.id ? "text-emerald-800" : "text-stone-500"}`} />
                  <span className="text-[10px] font-semibold text-center leading-tight">{role.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">Username / Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 focus:border-emerald-700 rounded-md text-xs text-stone-900 font-medium focus:outline-none transition-all"
                  placeholder="Select a role or enter email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 focus:border-emerald-700 rounded-md text-xs text-stone-900 font-medium focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:opacity-70 text-white font-bold py-3 rounded-md text-xs transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>Authenticating…</>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-200" />
                  Sign In to Ledger
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Note */}
          <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-md text-stone-600 text-[11px] leading-relaxed">
            <span className="font-bold text-stone-900">Demo Note:</span> Click any role persona above to auto-fill. Password is <code className="bg-stone-200 text-stone-800 px-1 py-0.5 rounded font-mono">nidana2024</code>.
          </div>

          {/* Back Link */}
          <div className="mt-5 text-center">
            <Link href="/" className="text-xs text-stone-500 hover:text-stone-800 font-semibold transition-colors">
              ← Return to NIDANA Landing Page
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
