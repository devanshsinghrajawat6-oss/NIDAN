import Link from "next/link";
import { 
  ArrowRight, Leaf, ShieldCheck, Activity, BrainCircuit, 
  Database, FileText, Users, CheckCircle2, Globe, Lock,
  BarChart3, Zap, Award
} from "lucide-react";

export default function LandingPage() {
  const stats = [
    { value: "14+", label: "Active Studies" },
    { value: "1,248", label: "Patients Enrolled" },
    { value: "98%", label: "Compliance Score" },
    { value: "NPvCC", label: "Host Institution" },
  ];

  const complianceBadges = [
    { label: "CTRI Registered" },
    { label: "GCP-ASU Compliant" },
    { label: "ICMR Guidelines" },
    { label: "CDISC / SDTM" },
    { label: "HL7 FHIR R4" },
    { label: "DPDP Act 2023" },
  ];

  const features = [
    {
      icon: ShieldCheck,
      color: "from-emerald-500 to-emerald-700",
      title: "Blockchain Audit Trail",
      description: "ALCOA+-compliant immutable records for every data entry, consent form, and safety event — backed by EVM-based smart contracts."
    },
    {
      icon: Activity,
      color: "from-blue-500 to-blue-700",
      title: "Real-time KPI Monitoring",
      description: "Live enrolment tracking, protocol deviation alerts, CTRI registration timelines, and ethics committee approvals — all in one view."
    },
    {
      icon: BrainCircuit,
      color: "from-purple-500 to-purple-700",
      title: "Advanced Analytics",
      description: "MedDRA-coded safety signal disproportionality (PRR analysis), ALCOA+ radar, multi-site telemetry, and DSMB-ready reports."
    },
    {
      icon: Database,
      color: "from-rose-500 to-rose-700",
      title: "NPvCC Integration",
      description: "Integrated pharmacovigilance module for AE/SAE capture, routing, and regulatory timeline tracking aligned with AIIA's NPvCC mandate."
    },
    {
      icon: FileText,
      color: "from-amber-500 to-amber-700",
      title: "CDISC / FHIR Export",
      description: "One-click export of submission-ready SDTM/ADaM datasets with Define-XML, and HL7 FHIR R4 bundles for ABDM interoperability."
    },
    {
      icon: Lock,
      color: "from-slate-600 to-slate-800",
      title: "Role-Based Access",
      description: "7 distinct role profiles — PI, Coordinator, Monitor, Ethics Committee, Pharmacovigilance, Regulator, Admin — each with tailored dashboards."
    },
  ];

  const roles = [
    { icon: "🩺", title: "Principal Investigator", desc: "Full clinical dashboard, patient data, trial management" },
    { icon: "🛡️", title: "Ethics Committee", desc: "IEC approvals, consent tracking, protocol review" },
    { icon: "⚗️", title: "Pharmacovigilance", desc: "AE/SAE capture, MedDRA coding, signal monitoring" },
    { icon: "📊", title: "Institutional Leadership", desc: "KPI overview, compliance scores, strategic analytics" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#020617]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Leaf className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-slate-900 dark:text-white">NIDANA</span>
            <span className="hidden sm:block text-xs font-medium text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">Ayurveda CTMS</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</Link>
            <Link href="#compliance" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Compliance</Link>
            <Link href="#roles" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Roles</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link 
              href="/dashboard"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center gap-2"
            >
              Access Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="relative pt-20 pb-28 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 via-white to-white dark:from-emerald-950/20 dark:via-[#020617] dark:to-[#020617] -z-10" />
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[700px] h-[700px] bg-emerald-300/20 dark:bg-emerald-900/15 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-blue-300/15 dark:bg-blue-900/10 rounded-full blur-3xl -z-10" />

          <div className="container mx-auto px-6 flex flex-col items-center text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-sm font-semibold mb-8 border border-emerald-200 dark:border-emerald-800/60 shadow-sm animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              AIIA · National Pharmacovigilance Coordination Centre
            </div>

            <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl text-slate-900 dark:text-white animate-fade-in-up delay-100">
              The Clinical Research Platform for{" "}
              <span className="gradient-text">Modern Ayurveda</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mb-10 leading-relaxed animate-fade-in-up delay-200">
              A real-time, blockchain-secured Clinical Trial Management System built for AIIA — covering study lifecycle tracking, pharmacovigilance, CDISC data standards, and FHIR interoperability.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300">
              <Link 
                href="/dashboard"
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 rounded-2xl text-base font-bold transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 flex items-center gap-2.5 w-full sm:w-auto justify-center"
              >
                Access Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/login"
                className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-2xl text-base font-semibold transition-all w-full sm:w-auto justify-center flex items-center gap-2 text-slate-700 dark:text-slate-300 shadow-sm"
              >
                <Lock className="h-4 w-4" /> Sign In Securely
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-3xl animate-fade-in-up delay-400">
              {stats.map((s) => (
                <div key={s.label} className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-center shadow-sm card-hover">
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Compliance Badges ─────────────────────────────────────── */}
        <section id="compliance" className="py-10 bg-slate-50 dark:bg-slate-950/50 border-y border-slate-100 dark:border-slate-800/60">
          <div className="container mx-auto px-6">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-widest mb-6">Built for India's Clinical Research Regulatory Framework</p>
            <div className="flex flex-wrap justify-center gap-3">
              {complianceBadges.map((b) => (
                <div key={b.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────── */}
        <section id="features" className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-bold mb-4 border border-blue-100 dark:border-blue-900">
                <Zap className="h-3 w-3" /> PLATFORM CAPABILITIES
              </div>
              <h2 className="font-heading text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">Everything You Need for Compliant Research</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Purpose-built for Ayurveda and ASU medicine clinical trials with all mandatory regulatory touchpoints baked in.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((f, i) => (
                <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-7 rounded-2xl shadow-sm card-hover group">
                  <div className={`h-12 w-12 bg-gradient-to-br ${f.color} text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Role-Specific Dashboards ──────────────────────────────── */}
        <section id="roles" className="py-24 bg-slate-50 dark:bg-slate-950/50 border-y border-slate-100 dark:border-slate-800/60">
          <div className="container mx-auto px-6">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-xs font-bold mb-4 border border-purple-100 dark:border-purple-900">
                <Users className="h-3 w-3" /> ROLE-BASED ACCESS
              </div>
              <h2 className="font-heading text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">Tailored Views for Every Stakeholder</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Each role sees exactly what they need — no more, no less. Strict access controls aligned with GCP-ASU and DPDP Act 2023.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              {roles.map((r, i) => (
                <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center card-hover">
                  <div className="text-4xl mb-4">{r.icon}</div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">{r.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-12 text-center shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
              <Award className="h-12 w-12 text-emerald-200 mx-auto mb-6" />
              <h2 className="font-heading text-3xl font-extrabold text-white mb-4">Ready to Transform AIIA's Research Operations?</h2>
              <p className="text-emerald-100 mb-8 text-base">Experience a fully integrated CTMS built to the highest clinical research standards — from CTRI registration to CDISC export.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard" className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-3.5 rounded-xl font-bold transition-all text-sm shadow-lg flex items-center gap-2 justify-center">
                  Launch Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold transition-all text-sm flex items-center gap-2 justify-center">
                  <Globe className="h-4 w-4" /> Explore Roles
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-slate-900 dark:text-white">NIDANA</span>
            <span className="text-slate-400 text-xs">Ayurveda CTMS</span>
          </div>
          <p className="text-slate-400 text-xs text-center">
            © {new Date().getFullYear()} NIDANA — All India Institute of Ayurveda (AIIA). All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>GCP-ASU Compliant</span>
            <span>·</span>
            <span>ISO/IEC 27001</span>
            <span>·</span>
            <span>CERT-In Hosted</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
