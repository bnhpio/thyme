import { createFileRoute, Link } from '@tanstack/react-router';
import { PricingTable } from 'autumn-js/react';
import {
  Activity,
  ArrowRight,
  Check,
  Clock,
  Code,
  Infinity as InfinityIcon,
  Layers,
  Lock,
  Rocket,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Logo } from '@/components/base/Logo/Logo';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/home')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="size-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Thyme</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  Start Building
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-sm">
              <Sparkles className="size-4 text-emerald-400" />
              <span className="text-muted-foreground">
                Automate your Web3 logic without worrying about gas,
                infrastructure, or uptime
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease_infinite]">
                Web3 Automation
              </span>
              <br />
              <span className="text-foreground">Made Simple</span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Create, schedule, and run Web3 functions on our backend. We handle
              transaction execution, gas fees, and reliability — so you can
              focus on logic.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg px-8"
                >
                  Try Free
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to automate your Web3 operations
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative p-8 rounded-2xl border border-border bg-card hover:border-emerald-500/50 transition-all duration-300">
              <div className="absolute -top-4 -left-4 size-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                1
              </div>
              <Code className="size-12 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Create a Function</h3>
              <p className="text-muted-foreground">
                Write your Web3 logic using our intuitive interface. Define
                triggers, conditions, and on-chain actions.
              </p>
            </div>
            <div className="group relative p-8 rounded-2xl border border-border bg-card hover:border-emerald-500/50 transition-all duration-300">
              <div className="absolute -top-4 -left-4 size-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                2
              </div>
              <Clock className="size-12 text-teal-400 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Schedule It</h3>
              <p className="text-muted-foreground">
                Set up automated schedules, event-based triggers, or manual
                executions. Your function, your rules.
              </p>
            </div>
            <div className="group relative p-8 rounded-2xl border border-border bg-card hover:border-emerald-500/50 transition-all duration-300">
              <div className="absolute -top-4 -left-4 size-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                3
              </div>
              <Rocket className="size-12 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold mb-3">We Execute Reliably</h3>
              <p className="text-muted-foreground">
                Our infrastructure handles gas management, transaction
                execution, and monitoring. Just top up and go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer-Focused Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Built for Developers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build reliable Web3 automation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card hover:border-emerald-500/50 transition-all">
              <Shield className="size-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Execution Reliability
              </h3>
              <p className="text-sm text-muted-foreground">
                99.9% uptime with automatic retries and failover mechanisms
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card hover:border-emerald-500/50 transition-all">
              <Zap className="size-8 text-teal-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Built-in Gas Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Automatic gas estimation and optimization for cost efficiency
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card hover:border-emerald-500/50 transition-all">
              <Layers className="size-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Scalable Concurrency
              </h3>
              <p className="text-sm text-muted-foreground">
                Run thousands of functions simultaneously without breaking a
                sweat
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card hover:border-emerald-500/50 transition-all">
              <Lock className="size-8 text-teal-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure Sandbox</h3>
              <p className="text-sm text-muted-foreground">
                Isolated execution environment with comprehensive security
                measures
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans & Pricing */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Top up your balance and we handle gas. Commission based on your
              plan.
            </p>
          </div>
          <PricingTable />
        </div>
      </section>

      {/* Integrations / Supported Chains */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Supported Chains
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Deploy your automation across all major blockchain networks
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Ethereum', icon: '⟠' },
              { name: 'Polygon', icon: '⬟' },
              { name: 'Arbitrum', icon: '🔷' },
              { name: 'Optimism', icon: '🔴' },
              { name: 'Base', icon: '🔵' },
              { name: 'Avalanche', icon: '🔺' },
            ].map((chain) => (
              <div
                key={chain.name}
                className="group p-6 rounded-xl border border-border bg-card hover:border-emerald-500/50 transition-all text-center"
              >
                <div className="text-4xl mb-3">{chain.icon}</div>
                <div className="text-sm font-medium">{chain.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <Activity className="size-16 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Ready to Automate Your Web3?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers building the future of Web3 automation.
            Start free, scale as you grow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg px-8"
              >
                Start Building Free
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Connect Wallet
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo className="size-6 text-primary" />
              <span className="text-lg font-semibold">Thyme</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a
                href="/docs"
                className="hover:text-foreground transition-colors"
              >
                Documentation
              </a>
              <a
                href="/api"
                className="hover:text-foreground transition-colors"
              >
                API Reference
              </a>
              <a
                href="/support"
                className="hover:text-foreground transition-colors"
              >
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 Thyme. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
