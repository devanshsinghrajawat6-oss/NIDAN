import { Settings, User, Bell, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col mb-4">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Settings className="h-6 w-6 text-brand-600" />
          Settings & Preferences
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account settings, notifications, and security preferences.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 rounded-lg text-sm font-medium transition-colors text-left">
            <User className="h-4 w-4" /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 rounded-lg text-sm font-medium transition-colors text-left">
            <Shield className="h-4 w-4" /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 rounded-lg text-sm font-medium transition-colors text-left">
            <Bell className="h-4 w-4" /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 rounded-lg text-sm font-medium transition-colors text-left">
            <Key className="h-4 w-4" /> API Keys
          </button>
        </div>

        <div className="md:col-span-3 bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value="Demo Administrator" readOnly />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
                <input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value="Admin" readOnly />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" value="admin@nidana.aiia.gov.in" readOnly />
            </div>
            <button className="mt-4 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
