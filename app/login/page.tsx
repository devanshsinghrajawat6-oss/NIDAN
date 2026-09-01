"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Lock, Mail, Eye, EyeOff, UserSquare2, Scale, Activity, TrendingUp, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const roles = [
    { id: "Investigator", title: "Lead Doctor", subtitle: "Full Clinical Access", icon: UserSquare2, color: "bg-blue-600", prefix: "investigator@demo.com" },
    { id: "Ethics Committee", title: "Ethics Committee", subtitle: "IEC & Approvals", icon: Scale, color: "bg-emerald-600", prefix: "ec@demo.com" },
    { id: "Pharmacovigilance", title: "Pharmacovigilance", subtitle: "Safety & AE Tracking", icon: Activity, color: "bg-orange-600", prefix: "pv@demo.com" },
    { id: "Regulator", title: "Leadership", subtitle: "KPIs & Overview", icon: TrendingUp, color: "bg-purple-600", prefix: "regulator@demo.com" },
    { id: "Admin", title: "Administrator", subtitle: "Full System Control", icon: ShieldCheck, color: "bg-slate-700", prefix: "admin@demo.com" },
  ];

  const handleRoleSelect = (role: any) => {
    setSelectedRole(role.id);
    setEmail(role.prefix);
    setPassword("nidana2024");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-4 sm:py-6">
      
      {/* Network Status */}
      <div className="mb-4 flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 shadow-sm">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
        Quorum Blockchain Active
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl shadow-blue-900/5 p-6 sm:p-8 border border-slate-100">
        
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Select Your Role</h1>
          <p className="text-slate-500 mt-1 text-sm">Choose your organizational role to auto-fill credentials</p>
        </div>

        {/* Roles Grid (Single row on Desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => handleRoleSelect(role)}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all ${
                selectedRole === role.id 
                  ? "border-blue-500 bg-blue-50/50 shadow-md scale-[1.02]" 
                  : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className={`h-10 w-10 rounded-full ${role.color} text-white flex items-center justify-center mb-2 shadow-inner shrink-0`}>
                <role.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-xs sm:text-sm text-center leading-tight">{role.title}</h3>
              <p className="text-[10px] text-slate-500 mt-1 hidden sm:block text-center">{role.subtitle}</p>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="Enter username or email"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Sign In Securely
              </>
            )}
          </button>
        </form>

        {/* Demo Tip */}
        <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 max-w-lg mx-auto">
          <div className="h-5 w-5 rounded-full border border-slate-400 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
            <span className="text-[10px] font-bold">i</span>
          </div>
          <p className="text-xs text-slate-600 leading-tight">
            <strong>Demo:</strong> Select a role above to auto-fill credentials. Password is <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">nidana2024</code>.
          </p>
        </div>

      </div>
    </div>
  );
}
