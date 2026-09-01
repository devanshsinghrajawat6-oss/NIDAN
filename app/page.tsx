import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Activity, BrainCircuit } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-brand-600" />
            <span className="font-heading font-bold text-xl tracking-tight">NIDANA</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#features" className="hover:text-brand-600 transition-colors">Features</Link>
            <Link href="#compliance" className="hover:text-brand-600 transition-colors">Compliance</Link>
            <Link href="/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium hover:text-brand-600 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/dashboard"
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          {/* Background decor */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-background dark:from-brand-950/20 dark:to-background -z-10" />
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-brand-200/40 dark:bg-brand-900/20 rounded-full blur-3xl -z-10" />
          
          <div className="container mx-auto px-4 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-sm font-medium mb-8 border border-brand-200 dark:border-brand-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              Next-Gen Ayurveda CTMS
            </div>
            <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-balance">
              Modernizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">Ayurveda</span> Clinical Trials
            </h1>
            <p className="text-lg text-foreground/80 max-w-2xl mb-10 text-balance">
              Enterprise-grade clinical trial management system combining natural precision with blockchain-backed regulatory compliance and real-time monitoring.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href="/dashboard"
                className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-full text-base font-semibold transition-all shadow-lg hover:shadow-brand-500/25 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Access Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="#features"
                className="bg-card hover:bg-card/80 border border-border px-8 py-4 rounded-full text-base font-medium transition-all w-full sm:w-auto justify-center flex items-center"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-card/30 border-y border-border/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold tracking-tight mb-4">Built for Traditional Medicine Research</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto">Comprehensive tools designed specifically for the unique requirements of Ayurveda and herbal formulation clinical trials.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: ShieldCheck,
                  title: "Blockchain Compliance",
                  description: "Immutable audit trails for patient consent and trial milestones using decentralized ledger technology."
                },
                {
                  icon: Activity,
                  title: "Real-time Monitoring",
                  description: "Track patient vitals, formulation efficacy, and compliance scores instantly across multiple trial sites."
                },
                {
                  icon: BrainCircuit,
                  title: "Smart Analytics",
                  description: "Advanced data processing to identify patterns in holistic treatments and formulation responses."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-card border border-border/60 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="h-12 w-12 bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-12 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/60">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-brand-600" />
            <span className="font-heading font-semibold text-foreground">NIDANA Ayurveda CTMS</span>
          </div>
          <p>© {new Date().getFullYear()} NIDANA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
