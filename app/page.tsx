"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, ShieldCheck, Database, FileText, Users,
  Lock, CheckCircle2, X, ChevronDown, Zap, Activity,
  Globe, Menu, FileCheck, Layers, BookOpen, Clock, Key
} from "lucide-react";

// ── Animated Counter ────────────────────────────────────────────────────
function AnimatedCounter({ end, suffix = "", duration = 1800 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = end / (duration / 16);
      const timer = setInterval(() => {
        start = Math.min(start + step, end);
        setCount(Math.floor(start));
        if (start >= end) clearInterval(timer);
      }, 16);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const features = [
  {
    icon: ShieldCheck,
    title: "Immutable Provenance",
    desc: "Every data entry is hashed and chained at the point of capture. Edits never silently overwrite history.",
    tag: "ALCOA+ Verified",
    category: "Ledger Security",
  },
  {
    icon: FileCheck,
    title: "ALCOA+ Compliance",
    desc: "Attributable, Legible, Contemporaneous, Original, and Accurate data capture enforced directly at point of entry.",
    tag: "GCP-ASU",
    category: "Regulatory",
  },
  {
    icon: Layers,
    title: "Ayurveda EDC Engine",
    desc: "Purpose-built domain models for Dosha assessments, Dravya/herbal dosing, and Panchakarma protocol logs.",
    tag: "AIIA Portfolio",
    category: "Domain Specific",
  },
  {
    icon: FileText,
    title: "CDISC & FHIR Export",
    desc: "One-click export to CDISC SDTM v1.7 and HL7 FHIR R4 standard data packages ready for regulatory submission.",
    tag: "SDTM / FHIR",
    category: "Interoperability",
  },
  {
    icon: Users,
    title: "Multi-Site Trial Management",
    desc: "Seamless investigator workflows across AIIA network centers with ABHA ID integration and digital e-Consent.",
    tag: "CTRI Ready",
    category: "Operations",
  },
  {
    icon: Lock,
    title: "DPDP Act 2023 Security",
    desc: "Enterprise privacy by design with pseudonymized participant tokens, access controls, and data residency in India.",
    tag: "India Sovereign",
    category: "Data Privacy",
  },
];

const complianceBadges = [
  "ALCOA+ Enforced", "GCP-ASU Compliant", "CDISC SDTM v1.7",
  "HL7 FHIR R4", "DPDP Act 2023", "MedDRA Coded", "CTRI Integrated", "NPvCC Hosted",
];

const stats = [
  { value: 14, suffix: "+", label: "Active Clinical Trials" },
  { value: 1248, suffix: "", label: "Enrolled Participants" },
  { value: 100, suffix: "%", label: "ALCOA+ Audit Traceability" },
  { value: 4200, suffix: "+", label: "On-Chain Ledger Hashes" },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailSubmitted(true);
    setTimeout(() => {
      setShowEmailModal(false);
      setEmailSubmitted(false);
      setEmail("");
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">

      {/* ── Paper Navigation Bar ───────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? "bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs" : "bg-transparent border-b border-stone-200/60"}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-lg bg-emerald-800 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-5 h-5 text-emerald-100" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wider text-emerald-950 font-serif">NIDANA</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest -mt-1">AIIA Clinical Trial Ledger</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Features", href: "#features" },
              { label: "Standards", href: "#compliance" },
              { label: "Ledger Process", href: "#process" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 rounded-md text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all uppercase tracking-wider"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEmailModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
            >
              Get Updates
            </button>
            <Link
              href="/login"
              className="px-4 py-2 rounded-md text-xs font-bold text-stone-700 border border-stone-300 hover:bg-stone-100 transition-all hidden sm:flex"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-md shadow-xs transition-all"
            >
              Open CTMS <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              className="md:hidden p-2 rounded-md text-stone-600 hover:bg-stone-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-b border-stone-200 px-5 py-4 flex flex-col gap-2 shadow-md">
            {["Features", "Compliance", "Process"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-100"
              >
                {item}
              </a>
            ))}
            <div className="border-t border-stone-200 pt-3 mt-1 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-md text-sm font-semibold text-stone-800 border border-stone-300 text-center">Sign In</Link>
              <button onClick={() => { setShowEmailModal(true); setMenuOpen(false); }} className="px-4 py-2 text-sm font-semibold text-stone-600 text-left">Get Updates</button>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section (Paper Document & Ledger Card) ────────────────────── */}
      <section className="pt-28 pb-16 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Institution Badge Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900 text-xs font-semibold tracking-wide mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              All India Institute of Ayurveda (AIIA) Portfolio
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.1] mb-6">
              India's Blockchain-Secured Clinical Trial Ledger for Ayurveda
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed mb-8 max-w-2xl">
              NIDANA replaces unverified spreadsheets with an immutable paper-like clinical ledger. Every patient entry, Dosha assessment, and herbal dosage is cryptographically hashed at the moment of entry for full ALCOA+ compliance.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold rounded-md shadow-xs transition-all w-full sm:w-auto"
              >
                Launch Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-sm font-bold rounded-md shadow-xs transition-all w-full sm:w-auto"
              >
                Access Trial Ledger <Lock className="w-4 h-4 text-stone-500" />
              </Link>
            </div>

            {/* Key Assurance Indicators */}
            <div className="mt-10 pt-8 border-t border-stone-200/80 grid grid-cols-3 gap-6 w-full max-w-xl text-left">
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Storage Standard</p>
                <p className="text-sm font-semibold text-stone-900">CDISC SDTM v1.7</p>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Integrity</p>
                <p className="text-sm font-semibold text-stone-900">ALCOA+ Verified</p>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Regulatory</p>
                <p className="text-sm font-semibold text-stone-900">GCP-ASU Ready</p>
              </div>
            </div>

          </div>

          {/* Right Hero Column: Real Material Paper Trial Ledger Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-stone-300 rounded-xl p-6 shadow-md relative overflow-hidden">
              
              {/* Paper Document Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Live Clinical Entry Sheet</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-mono text-[10px] font-bold">
                  SEALED ON-CHAIN
                </span>
              </div>

              {/* Patient Record Fields */}
              <div className="space-y-3 font-mono text-xs">
                
                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded flex justify-between items-center">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-sans">Trial ID</span>
                    <span className="font-bold text-stone-800">CTRI/2026/04/0182</span>
                  </div>
                  <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-sans font-semibold">Phase II</span>
                </div>

                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-stone-400 text-[10px] uppercase font-sans">Ayurvedic Protocol Assessment</span>
                    <span className="text-emerald-700 font-sans font-bold text-[10px]">AIIA Center 01</span>
                  </div>
                  <p className="font-sans font-semibold text-stone-800 text-xs">
                    Ashwagandha (Withania somnifera) 500mg BD · Vata-Pitta Balance Audit
                  </p>
                </div>

                {/* Audit Hashes */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 font-sans">Attributable Investigator:</span>
                    <span className="font-semibold text-stone-800">Dr. S. Sharma (REG-8492)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 font-sans">Timestamp (Contemporaneous):</span>
                    <span className="text-stone-800 font-mono">2026-09-26 22:38:14 UTC</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 font-sans">SHA-256 Record Hash:</span>
                    <span className="text-emerald-800 font-mono font-bold truncate max-w-[160px]">0x9f82a7e4b3c...1e40</span>
                  </div>
                </div>

                {/* Verification Stamp Footer */}
                <div className="mt-4 pt-3 border-t border-dashed border-stone-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-stone-600 font-sans text-[11px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>ALCOA+ Audit Check Passed</span>
                  </div>
                  <span className="text-[10px] font-sans font-semibold text-stone-400">EVM Block #481920</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── Key Statistics Paper Strip ────────────────────────────────────── */}
      <section className="border-y border-stone-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, idx) => (
            <div key={s.label} className={`px-4 ${idx !== stats.length - 1 ? "md:border-r md:border-stone-200" : ""}`}>
              <p className="text-3xl sm:text-4xl font-serif font-bold text-emerald-950 mb-1">
                <AnimatedCounter end={s.value} suffix={s.suffix} />
              </p>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Regulatory & Compliance Paper Chips ───────────────────────────── */}
      <section id="compliance" className="py-12 px-5 max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Regulatory Standards Supported</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
          {complianceBadges.map((badge) => (
            <div key={badge} className="paper-chip">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{badge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Core Value Props / Feature Paper Sheets ────────────────────────── */}
      <section id="features" className="py-16 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="px-3 py-1 bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider rounded">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mt-4 mb-4">
            Built for Rigorous Ayurveda Research Standards
          </h2>
          <p className="text-stone-600 text-base leading-relaxed">
            Generic EDC systems struggle with Ayurvedic doshas, dravya preparations, and panchakarma workflows. NIDANA is purpose-built to model complex botanical protocols with paper-level ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="paper-card p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-emerald-900">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-stone-900 mb-2">{f.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{f.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-semibold">
                <span>{f.category}</span>
                <span className="text-emerald-800 flex items-center gap-1 font-bold">
                  Verified <CheckCircle2 className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ledger Standard Operating Procedure (Process Timeline) ───────── */}
      <section id="process" className="py-16 px-5 sm:px-8 bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider rounded">
              Standard Operating Procedure
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mt-4 mb-3">
              How NIDANA Seals Clinical Integrity
            </h2>
            <p className="text-stone-600 text-sm">
              A decoupled ledger architecture ensuring fast day-to-day database queries with zero-compromise cryptographic proof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Point-of-Entry Capture",
                desc: "Investigators record trial visits, dosha profiles, and dosages in the digital CRF.",
                icon: FileText,
              },
              {
                step: "02",
                title: "SHA-256 Batch Hashing",
                desc: "Data entries are grouped and hashed into a unified Merkle root every N minutes.",
                icon: Database,
              },
              {
                step: "03",
                title: "On-Chain Anchoring",
                desc: "The batch hash is committed to the EVM CTMS ledger contract with timestamp proof.",
                icon: ShieldCheck,
              },
              {
                step: "04",
                title: "One-Click Audit Package",
                desc: "Export CDISC SDTM datasets pre-validated against on-chain transaction hashes.",
                icon: FileCheck,
              },
            ].map((s) => (
              <div key={s.step} className="paper-card p-5 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      STEP {s.step}
                    </span>
                    <s.icon className="w-4 h-4 text-stone-400" />
                  </div>
                  <h3 className="font-serif font-bold text-stone-900 text-base mb-2">{s.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Institutional CTA Sheet ───────────────────────────────────────── */}
      <section className="py-20 px-5 sm:px-8 max-w-5xl mx-auto">
        <div className="bg-emerald-950 text-stone-100 rounded-xl p-8 sm:p-12 border border-emerald-900 shadow-lg text-center relative overflow-hidden">
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900 border border-emerald-700 text-emerald-200 text-xs font-bold uppercase tracking-wider rounded mb-6">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> All India Institute of Ayurveda
            </span>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
              Advance Ayurvedic Science with Verifiable Evidence
            </h2>

            <p className="text-emerald-200/90 text-sm leading-relaxed mb-8">
              Join leading clinical investigators and institutional ethics committees using NIDANA for regulatory-compliant, tamper-proof trial documentation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-md shadow-xs transition-all w-full sm:w-auto"
              >
                Access CTMS Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-900/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold text-sm rounded-md transition-all w-full sm:w-auto"
              >
                Subscribe for Regulatory Updates <Globe className="w-4 h-4 opacity-70" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── Paper Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-stone-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-stone-600">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded bg-emerald-800 flex items-center justify-center text-white text-xs font-bold font-serif">
              N
            </div>
            <span className="font-serif font-bold text-stone-900 text-sm tracking-wide">NIDANA CTMS</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-stone-500">
            <span>EVM Testnet Anchored</span>
            <span>·</span>
            <span>CDISC SDTM v1.7</span>
            <span>·</span>
            <span>AIIA Portfolio</span>
          </div>

          <p className="text-xs text-stone-500 font-medium">© {new Date().getFullYear()} All rights reserved</p>
        </div>
      </footer>

      {/* ── Subscription Modal ───────────────────────────────────────────── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-stone-300 rounded-xl p-6 sm:p-8 max-w-md w-full shadow-lg relative">
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 mb-4">
              <Globe className="w-5 h-5" />
            </div>

            <h3 className="font-serif font-bold text-xl text-stone-900 mb-2">Subscribe to NIDANA Updates</h3>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              Receive notifications on GCP-ASU regulatory updates, CDISC template releases, and AIIA trial announcements.
            </p>

            {emailSubmitted ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Subscribed successfully!
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="investigator@institution.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded shadow-xs transition-all"
                >
                  Confirm Subscription
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
