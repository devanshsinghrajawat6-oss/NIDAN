"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/app/components/LanguageContext";
import { 
  Settings, User, Shield, Bell, Key, Database, CheckCircle2, 
  AlertTriangle, Copy, Trash2, Plus, Eye, EyeOff, Lock, RefreshCw, 
  Server, Globe, Smartphone, Laptop, Download, LogOut, Sparkles, ShieldCheck
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "apikeys" | "system">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Profile Form State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    organization: "All India Institute of Ayurveda (AIIA)",
    department: "Clinical Research & Pharmacovigilance",
    phone: "+91 98765 43210",
    bio: ""
  });

  // Security Form State
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    mfaEnabled: false,
    sessionTimeout: 15,
    encryptionStatus: "AES-256-GCM Active"
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    saeAlerts: true,
    complianceAlerts: true,
    protocolDeviations: true,
    eConsentSignoffs: true,
    regulatoryDeadlines: true,
    digestFrequency: "Instant"
  });

  // API Keys State
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({
    name: "",
    scopes: ["read:trials"],
    expirationDays: 30
  });
  const [generatedRawToken, setGeneratedRawToken] = useState<string | null>(null);

  // System & Blockchain State
  const [blockchainNode, setBlockchainNode] = useState("Hyperledger Fabric v2.5 (Primary)");
  const [dataExporting, setDataExporting] = useState(false);

  // Live Security Scan State
  const [scanning, setScanning] = useState(false);
  const [securityScanResult, setSecurityScanResult] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleRunSecurityAudit = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/security/verify');
      const json = await res.json();
      if (json.success && json.data) {
        setSecurityScanResult(json.data);
        showToastMsg(`Security audit complete! Integrity score: ${json.data.integrityScore}%`);
      } else {
        showToastMsg(json.error || "Security audit failed", "error");
      }
    } catch (err: any) {
      showToastMsg(err.message || "Failed to execute security audit", "error");
    } finally {
      setScanning(false);
    }
  };

  const showToastMsg = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      const json = await res.json();

      if (json.success && json.data) {
        if (json.data.profile) {
          setProfile(prev => ({
            ...prev,
            ...json.data.profile,
            email: json.data.profile.email || session?.user?.email || "",
            name: json.data.profile.name || session?.user?.name || "",
            role: json.data.profile.role || (session?.user as any)?.role || "Investigator"
          }));
        }
        if (json.data.security) {
          setSecurity(prev => ({ ...prev, ...json.data.security }));
        }
        if (json.data.notifications) {
          setNotifications(prev => ({ ...prev, ...json.data.notifications }));
        }
        if (json.data.apiKeys) {
          setApiKeys(json.data.apiKeys);
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Profile Save Handler ──────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_profile",
          name: profile.name,
          organization: profile.organization,
          department: profile.department,
          phone: profile.phone,
          bio: profile.bio
        })
      });
      const json = await res.json();
      if (json.success) {
        showToastMsg("Profile updated successfully!");
        if (updateSession) updateSession();
      } else {
        showToastMsg(json.error || "Failed to update profile", "error");
      }
    } catch (err: any) {
      showToastMsg(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Security & Password Handler ─────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      showToastMsg("New passwords do not match", "error");
      return;
    }
    if (security.newPassword.length < 8) {
      showToastMsg("Password must be at least 8 characters long", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          currentPassword: security.currentPassword,
          newPassword: security.newPassword
        })
      });
      const json = await res.json();
      if (json.success) {
        showToastMsg("Password updated successfully!");
        setSecurity(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        showToastMsg(json.error || "Failed to change password", "error");
      }
    } catch (err: any) {
      showToastMsg(err.message || "Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSecuritySettings = async (updates: Partial<typeof security>) => {
    const updated = { ...security, ...updates };
    setSecurity(updated);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_security",
          mfaEnabled: updated.mfaEnabled,
          sessionTimeout: updated.sessionTimeout
        })
      });
      const json = await res.json();
      if (json.success) {
        showToastMsg("Security preferences updated!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── Notifications Save Handler ─────────────────────────────────────────
  const handleToggleNotification = async (key: keyof typeof notifications, value: any) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_notifications",
          preferences: updated
        })
      });
      const json = await res.json();
      if (json.success) {
        showToastMsg("Notification preferences saved!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── API Key Handlers ────────────────────────────────────────────────────
  const handleGenerateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyForm.name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_api_key",
          name: newKeyForm.name,
          scopes: newKeyForm.scopes,
          expirationDays: newKeyForm.expirationDays
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setApiKeys(prev => [json.data, ...prev]);
        setGeneratedRawToken(json.data.rawToken);
        setShowNewKeyModal(false);
        setNewKeyForm({ name: "", scopes: ["read:trials"], expirationDays: 30 });
        showToastMsg("API key generated successfully!");
      } else {
        showToastMsg(json.error || "Failed to generate API key", "error");
      }
    } catch (err: any) {
      showToastMsg(err.message || "Error generating key", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Applications using it will lose access immediately.")) return;

    try {
      const res = await fetch(`/api/settings?keyId=${keyId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setApiKeys(prev => prev.filter(k => k.keyId !== keyId));
        showToastMsg("API Key revoked!");
      } else {
        showToastMsg(json.error || "Failed to revoke key", "error");
      }
    } catch (err: any) {
      showToastMsg(err.message || "Error revoking key", "error");
    }
  };

  const handleExportData = () => {
    setDataExporting(true);
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ profile, notifications, sessionUser: session?.user }, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `nidana_user_data_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setDataExporting(false);
      showToastMsg("Personal data package generated and downloaded!");
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin mb-3" />
        <p className="text-slate-500 text-sm font-medium">Loading preferences & security configurations…</p>
      </div>
    );
  }

  const userInitials = (profile.name || "Nidana User").substring(0, 2).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 transition-all animate-bounce ${
          toast.type === "success" 
            ? "bg-emerald-900 text-emerald-100 border-emerald-700" 
            : "bg-red-900 text-red-100 border-red-700"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 text-red-400" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0d1117] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20 shrink-0">
            {userInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {profile.name || "User Settings"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {profile.role || "Investigator"}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              {profile.email} · {profile.organization}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Security Status: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Compliant (ALCOA+)</strong></span>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-3 space-y-1.5">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm space-y-1">
            
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === "profile"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200/60 dark:border-emerald-900/50"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <User className={`h-4 w-4 ${activeTab === "profile" ? "text-emerald-600 dark:text-emerald-400" : "opacity-60"}`} />
              <span>Profile & Details</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === "security"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200/60 dark:border-emerald-900/50"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Shield className={`h-4 w-4 ${activeTab === "security" ? "text-emerald-600 dark:text-emerald-400" : "opacity-60"}`} />
              <span>Security & Access</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === "notifications"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200/60 dark:border-emerald-900/50"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Bell className={`h-4 w-4 ${activeTab === "notifications" ? "text-emerald-600 dark:text-emerald-400" : "opacity-60"}`} />
              <span>Notifications & Alerts</span>
            </button>

            <button
              onClick={() => setActiveTab("apikeys")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === "apikeys"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200/60 dark:border-emerald-900/50"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Key className={`h-4 w-4 ${activeTab === "apikeys" ? "text-emerald-600 dark:text-emerald-400" : "opacity-60"}`} />
              <span>API Keys & Tokens</span>
            </button>

            <button
              onClick={() => setActiveTab("system")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === "system"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200/60 dark:border-emerald-900/50"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Database className={`h-4 w-4 ${activeTab === "system" ? "text-emerald-600 dark:text-emerald-400" : "opacity-60"}`} />
              <span>System & Blockchain</span>
            </button>

          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-9 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-500" />
                  Personal Information
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Manage your identity, organizational metadata, and contact info.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                    value={profile.email}
                    readOnly
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assigned Role</label>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>{profile.role}</span>
                    <span className="ml-auto text-[10px] text-slate-400 font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">System Granted</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Phone</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Institution / Organization</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={profile.organization}
                    onChange={e => setProfile({ ...profile, organization: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department / Division</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={profile.department}
                    onChange={e => setProfile({ ...profile, department: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Professional Bio / Notes</label>
                <textarea
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={profile.bio}
                  onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Describe your research focus or regulatory jurisdiction..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-8">
              
              {/* Password Section */}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-emerald-500" />
                    Change Account Password
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Ensure your account uses a strong, unique password.</p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        className="w-full p-2.5 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        value={security.currentPassword}
                        onChange={e => setSecurity({ ...security, currentPassword: e.target.value })}
                        required
                      />
                      <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-3 text-slate-400">
                        {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        className="w-full p-2.5 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        value={security.newPassword}
                        onChange={e => setSecurity({ ...security, newPassword: e.target.value })}
                        required
                      />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-3 text-slate-400">
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      value={security.confirmPassword}
                      onChange={e => setSecurity({ ...security, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Update Password
                  </button>
                </div>
              </form>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* MFA & Session Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Multi-Factor Authentication & Session Controls</h3>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Two-Factor Authentication (2FA)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Require an authenticator code (TOTP) during login for enhanced regulatory compliance.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={security.mfaEnabled}
                      onChange={e => handleUpdateSecuritySettings({ mfaEnabled: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-focus:ring-emerald-800 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Session Inactivity Timeout</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Automatically lock session after a period of user inactivity (FDA 21 CFR Part 11 requirement).</p>
                  </div>
                  <select
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                    value={security.sessionTimeout}
                    onChange={e => handleUpdateSecuritySettings({ sessionTimeout: parseInt(e.target.value) })}
                  >
                    <option value={15}>15 minutes (Strict)</option>
                    <option value={30}>30 minutes (Standard)</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Encryption Status */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Data-at-Rest Encryption Engine</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">All patient PII and audit hashes are protected with hardware-accelerated AES-256-GCM encryption.</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                  Active
                </span>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Real-Time Security Audit Scanner */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Live System Security & Hash Integrity Scan
                      </h4>
                      <p className="text-[11px] text-slate-400">Scan database records and verify cryptographic SHA-256 hashes against blockchain logs.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRunSecurityAudit}
                    disabled={scanning}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 shrink-0"
                  >
                    {scanning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {scanning ? "Auditing System…" : "Run Security Audit"}
                  </button>
                </div>

                {/* Audit Results Panel */}
                {securityScanResult && (
                  <div className="pt-4 border-t border-slate-800 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Integrity Score</p>
                        <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{securityScanResult.integrityScore}%</p>
                      </div>
                      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scanned Records</p>
                        <p className="text-xl font-extrabold text-white mt-0.5">{securityScanResult.totalRecordsScanned}</p>
                      </div>
                      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tampered Records</p>
                        <p className={`text-xl font-extrabold mt-0.5 ${securityScanResult.tamperedRecords === 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {securityScanResult.tamperedRecords}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Blockchain Anchors</p>
                        <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{securityScanResult.blockchainAnchorsVerified}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Audit Verification Checks</p>
                      <div className="space-y-1.5">
                        {securityScanResult.checks?.map((check: any) => (
                          <div key={check.id} className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-xl border border-slate-800/80 text-xs">
                            <div className="flex items-center gap-2">
                              {check.status === "PASS" ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                              )}
                              <span className="font-semibold text-slate-200">{check.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 truncate max-w-[220px]">{check.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-emerald-500" />
                  Notification & Regulatory Alert Preferences
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Customize real-time alerts for clinical events, SAE deadlines, and compliance triggers.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Serious Adverse Event (SAE) Instant Alerts</p>
                    <p className="text-[11px] text-slate-500">Immediate notifications for critical safety reports requiring 24-hour IEC reporting.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.saeAlerts}
                      onChange={e => handleToggleNotification("saeAlerts", e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Compliance Score Drop Alerts (&lt; 80%)</p>
                    <p className="text-[11px] text-slate-500">Alerts when GCP-Ayurveda audit scores fall below critical threshold.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.complianceAlerts}
                      onChange={e => handleToggleNotification("complianceAlerts", e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Protocol Deviations & Violations</p>
                    <p className="text-[11px] text-slate-500">Notify when site monitors log major or minor protocol deviations.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.protocolDeviations}
                      onChange={e => handleToggleNotification("protocolDeviations", e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">e-Consent Sign-off Confirmations</p>
                    <p className="text-[11px] text-slate-500">Notifications when patients complete multilingual digital consent forms.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.eConsentSignoffs}
                      onChange={e => handleToggleNotification("eConsentSignoffs", e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">IEC Renewal & Regulatory Deadlines</p>
                    <p className="text-[11px] text-slate-500">Reminders 30 days prior to Ethics Committee approval expiry.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.regulatoryDeadlines}
                      onChange={e => handleToggleNotification("regulatoryDeadlines", e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Email Digest Frequency</p>
                  <p className="text-[11px] text-slate-500">Choose how often non-urgent clinical summaries are emailed to you.</p>
                </div>
                <select
                  className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                  value={notifications.digestFrequency}
                  onChange={e => handleToggleNotification("digestFrequency", e.target.value)}
                >
                  <option value="Instant">Instant Push</option>
                  <option value="Daily">Daily Summary</option>
                  <option value="Weekly">Weekly Digest</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: API KEYS */}
          {activeTab === "apikeys" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Key className="h-5 w-5 text-emerald-500" />
                    Developer API Keys & Tokens
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Manage secure API access keys for integrations with CDSCO, ICMR, or external EHRs.</p>
                </div>
                <button
                  onClick={() => setShowNewKeyModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                >
                  <Plus className="h-4 w-4" /> Generate New Key
                </button>
              </div>

              {/* Newly Generated Secret Banner */}
              {generatedRawToken && (
                <div className="p-4 bg-emerald-950 text-emerald-100 rounded-2xl border border-emerald-700 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      Save Your Raw API Secret Key (Shown Only Once)
                    </span>
                    <button onClick={() => setGeneratedRawToken(null)} className="text-xs text-emerald-400 hover:underline">
                      Dismiss
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl font-mono text-xs text-emerald-300 select-all border border-emerald-800">
                    <span className="truncate flex-1">{generatedRawToken}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedRawToken);
                        showToastMsg("Copied to clipboard!");
                      }}
                      className="p-1 hover:bg-emerald-800 rounded text-white"
                      title="Copy Token"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-emerald-300/80">Make sure to copy this key now. You will not be able to see it again!</p>
                </div>
              )}

              {/* Active API Keys List */}
              <div className="space-y-3">
                {apiKeys.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <Key className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Active API Keys</p>
                    <p className="text-[11px] text-slate-400 mt-1">Generate a key above to authorize external FHIR/HL7 clinical integrations.</p>
                  </div>
                ) : (
                  apiKeys.map((key) => (
                    <div key={key.keyId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{key.name}</span>
                          <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                            {key.keyId}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-500 mt-1">{key.maskedToken}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {key.scopes?.map((s: string) => (
                            <span key={s} className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-[10px] text-slate-400">
                          Created: {new Date(key.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleRevokeApiKey(key.keyId)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                          title="Revoke Key"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Generate Key Modal */}
              {showNewKeyModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in">
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Key className="h-5 w-5 text-emerald-500" />
                      Generate API Key
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Key Name / Client App</label>
                      <input
                        type="text"
                        placeholder="e.g. CDSCO Inspection Gateway"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        value={newKeyForm.name}
                        onChange={e => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Scopes / Access Level</label>
                      <select
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                        value={newKeyForm.scopes[0]}
                        onChange={e => setNewKeyForm({ ...newKeyForm, scopes: [e.target.value] })}
                      >
                        <option value="read:trials">Read-Only (Trials & KPIs)</option>
                        <option value="write:clinical">Full Clinical Write Access</option>
                        <option value="export:regulatory">Regulatory Export Scopes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiration Duration</label>
                      <select
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                        value={newKeyForm.expirationDays}
                        onChange={e => setNewKeyForm({ ...newKeyForm, expirationDays: parseInt(e.target.value) })}
                      >
                        <option value={30}>30 Days</option>
                        <option value={90}>90 Days</option>
                        <option value={365}>1 Year</option>
                        <option value={0}>Never Expire</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewKeyModal(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateApiKey}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        Create Key
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: SYSTEM & BLOCKCHAIN */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-500" />
                  System & Blockchain Preferences
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Configure network node defaults, language preferences, and personal data exports.</p>
              </div>

              {/* Blockchain Node Selector */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Blockchain Consensus Node</p>
                    <p className="text-[11px] text-slate-500">Selected target network for committing cryptographic trial hashes.</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold">
                    Connected (12ms)
                  </span>
                </div>
                <select
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                  value={blockchainNode}
                  onChange={e => {
                    setBlockchainNode(e.target.value);
                    showToastMsg(`Switched network node to ${e.target.value}`);
                  }}
                >
                  <option value="Hyperledger Fabric v2.5 (Primary)">Hyperledger Fabric v2.5 (Primary Permissioned Network)</option>
                  <option value="Ethereum Sepolia Testnet">Ethereum Sepolia Testnet (EVM Anchor)</option>
                  <option value="Hardhat Local Node (Dev)">Hardhat Local Sandbox (Development)</option>
                </select>
              </div>

              {/* Interface Preferences */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Default Language</p>
                    <p className="text-[11px] text-slate-500">Toggle interface localization</p>
                  </div>
                  <button
                    onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm"
                  >
                    {lang === "EN" ? "English (EN)" : "हिंदी (HI)"}
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Theme Mode</p>
                    <p className="text-[11px] text-slate-500">Light / Dark UI aesthetics</p>
                  </div>
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm capitalize"
                  >
                    {theme || "system"}
                  </button>
                </div>
              </div>

              {/* Data Compliance & Portability */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Digital Personal Data Protection (DPDP) Export</p>
                  <p className="text-[11px] text-slate-500">Download a full JSON package of all personal logs and audit references linked to your account.</p>
                </div>
                <button
                  onClick={handleExportData}
                  disabled={dataExporting}
                  className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
                >
                  {dataExporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Export Data
                </button>
              </div>

              {/* System Specs */}
              <div className="p-4 bg-slate-100 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Framework & Engine</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Next.js 15 (App Router)</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Cryptographic Standard</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">SHA-256 + AES-256-GCM</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Compliance Standard</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">GCP-Ayurveda / 21 CFR Part 11</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
