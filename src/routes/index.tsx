import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Activity,
  ArrowRight,
  Clock,
  Code,
  Layers,
  Lock,
  Rocket,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import PricingTableView from '@/components/autumn/pricing-table-view';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { Button } from '@/components/ui/button';
import { RollingText } from '@/components/ui/shadcn-io/rolling-text';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { HomeLayout } from '@/layouts/HomeLayout';
import { CHAINS } from '@/lib/chains';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const heroRef = useScrollAnimation({
    threshold: 0.2,
    margin: '0px 0px -100px 0px',
  });
  const howItWorksRef = useScrollAnimation({
    threshold: 0.15,
    margin: '0px 0px -100px 0px',
  });
  const featuresRef = useScrollAnimation({
    threshold: 0.15,
    margin: '0px 0px -100px 0px',
  });
  const pricingRef = useScrollAnimation({
    threshold: 0.15,
    margin: '0px 0px -100px 0px',
  });
  const chainsRef = useScrollAnimation({
    threshold: 0.15,
    margin: '0px 0px -100px 0px',
  });
  const ctaRef = useScrollAnimation({
    threshold: 0.2,
    margin: '0px 0px -100px 0px',
  });

  return (
    <HomeLayout>
      {/* Hero Section */}
      <section
        ref={heroRef.ref as React.RefObject<HTMLElement>}
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[600px]"
      >
        <AnimatedBackground variant="hero" intensity="high" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 text-sm backdrop-blur-sm hover:scale-105 transition-transform duration-300 animate-pulse-glow bg-gradient-to-r from-primary/20 via-accent-secondary/20 to-accent/20">
              <Sparkles className="size-4 animate-pulse text-primary-light" />
              <span className="text-muted-foreground">
                Automate your Web3 logic without worrying about gas,
                infrastructure, or uptime
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <RollingText
                text="Web3 Automation"
                className="bg-clip-text text-transparent bg-size-[200%_auto] animate-[gradient_3s_ease_infinite] drop-shadow-lg"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, var(--primary-light), var(--accent-secondary-light), var(--accent-light))',
                }}
              />
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
                  className="text-lg px-8 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  style={{
                    background:
                      'linear-gradient(to right, var(--primary), var(--accent-secondary), var(--accent))',
                    boxShadow:
                      '0 10px 15px -3px oklch(from var(--primary) l c h / 0.3), 0 4px 6px -2px oklch(from var(--primary) l c h / 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      'linear-gradient(to right, var(--primary-dark), var(--accent-secondary-dark), var(--accent-dark))';
                    e.currentTarget.style.boxShadow =
                      '0 10px 15px -3px oklch(from var(--primary) l c h / 0.5), 0 4px 6px -2px oklch(from var(--primary) l c h / 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      'linear-gradient(to right, var(--primary), var(--accent-secondary), var(--accent))';
                    e.currentTarget.style.boxShadow =
                      '0 10px 15px -3px oklch(from var(--primary) l c h / 0.3), 0 4px 6px -2px oklch(from var(--primary) l c h / 0.3)';
                  }}
                >
                  <span className="relative z-10 flex items-center">
                    Try Free
                    <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>
              </Link>
              <a
                href="https://docs.thyme.sh/getting-started"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 hover:scale-105 transition-all duration-300"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      'oklch(from var(--primary) l c h / 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                  }}
                >
                  View Documentation
                </Button>
              </a>
            </div>
          </div>
        </div>
        {/* Section Divider - Gradient Flow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 section-divider pointer-events-none" />
      </section>

      {/* How It Works */}
      <section
        ref={howItWorksRef.ref as React.RefObject<HTMLElement>}
        className={`relative py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 overflow-hidden transition-all duration-1000 ${
          howItWorksRef.isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <AnimatedBackground variant="section" intensity="low" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div
            className={`text-center mb-16 transition-all duration-700 delay-200 ${
              howItWorksRef.isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to automate your Web3 operations
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div
              className={`group relative p-8 rounded-2xl border border-border bg-card transition-all duration-500 hover:scale-105 hover:shadow-xl hover:border-primary/50 hover:shadow-[0_20px_25px_-5px_rgb(var(--primary)/0.2)] ${
                howItWorksRef.isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: howItWorksRef.isVisible ? '300ms' : '0ms',
              }}
            >
              <div
                className="absolute -top-4 -left-4 size-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
                style={{
                  background:
                    'linear-gradient(to bottom right, var(--primary), var(--accent-secondary))',
                }}
              >
                1
              </div>
              <Code className="size-12 mb-4 group-hover:scale-110 transition-all duration-300 text-primary-light group-hover:text-accent-secondary-light" />
              <h3 className="text-2xl font-bold mb-3">Create a Function</h3>
              <p className="text-muted-foreground">
                Write your Web3 logic using our intuitive interface. Define
                triggers, conditions, and on-chain actions.
              </p>
            </div>
            <div
              className={`group relative p-8 rounded-2xl border border-border bg-card transition-all duration-500 hover:scale-105 hover:shadow-xl hover:border-accent-secondary/50 hover:shadow-[0_20px_25px_-5px_rgb(var(--accent-secondary)/0.2)] ${
                howItWorksRef.isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: howItWorksRef.isVisible ? '450ms' : '0ms',
              }}
            >
              <div
                className="absolute -top-4 -left-4 size-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
                style={{
                  background:
                    'linear-gradient(to bottom right, var(--accent-secondary), var(--accent))',
                }}
              >
                2
              </div>
              <Clock className="size-12 mb-4 group-hover:scale-110 transition-all duration-300 text-accent-secondary-light group-hover:text-accent-light" />
              <h3 className="text-2xl font-bold mb-3">Schedule It</h3>
              <p className="text-muted-foreground">
                Set up automated schedules, event-based triggers, or manual
                executions. Your function, your rules.
              </p>
            </div>
            <div
              className={`group relative p-8 rounded-2xl border border-border bg-card transition-all duration-500 hover:scale-105 hover:shadow-xl hover:border-accent/50 hover:shadow-[0_20px_25px_-5px_rgb(var(--accent)/0.2)] ${
                howItWorksRef.isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: howItWorksRef.isVisible ? '600ms' : '0ms',
              }}
            >
              <div
                className="absolute -top-4 -left-4 size-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
                style={{
                  background:
                    'linear-gradient(to bottom right, var(--accent), var(--accent-tertiary))',
                }}
              >
                3
              </div>
              <Rocket className="size-12 mb-4 group-hover:scale-110 transition-all duration-300 text-accent-light group-hover:text-accent-tertiary-light" />
              <h3 className="text-2xl font-bold mb-3">We Execute Reliably</h3>
              <p className="text-muted-foreground">
                Our infrastructure handles gas management, transaction
                execution, and monitoring. Just top up and go.
              </p>
            </div>
          </div>
        </div>
        {/* Section Divider - Gradient Flow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 section-divider pointer-events-none" />
      </section>

      {/* Developer-Focused Features */}
      <section
        ref={featuresRef.ref as React.RefObject<HTMLElement>}
        className={`relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-all duration-1000 ${
          featuresRef.isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <AnimatedBackground variant="section" intensity="medium" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div
            className={`text-center mb-16 transition-all duration-700 delay-200 ${
              featuresRef.isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Built for Developers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build reliable Web3 automation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              className={`group p-6 rounded-xl border border-border bg-card transition-all duration-500 hover:scale-105 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_10px_15px_-3px_rgb(var(--primary)/0.2)] ${
                featuresRef.isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6'
              }`}
              style={{
                transitionDelay: featuresRef.isVisible ? '300ms' : '0ms',
              }}
            >
              <div className="relative">
                <Shield className="size-8 mb-4 group-hover:scale-125 transition-all duration-300 text-primary-light group-hover:text-accent-secondary-light" />
                <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/20" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Execution Reliability
              </h3>
              <p className="text-sm text-muted-foreground">
                99.9% uptime with automatic retries and failover mechanisms
              </p>
            </div>
            <div
              className={`group p-6 rounded-xl border border-border bg-card transition-all duration-500 hover:scale-105 hover:shadow-lg hover:-translate-y-1 hover:border-accent-secondary/50 hover:shadow-[0_10px_15px_-3px_rgb(var(--accent-secondary)/0.2)] ${
                featuresRef.isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6'
              }`}
              style={{
                transitionDelay: featuresRef.isVisible ? '400ms' : '0ms',
              }}
            >
              <div className="relative">
                <Zap className="size-8 mb-4 group-hover:scale-125 transition-all duration-300 text-accent-secondary-light group-hover:text-accent-light" />
                <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-accent-secondary/20" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Built-in Gas Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Automatic gas estimation and optimization for cost efficiency
              </p>
            </div>
            <div
              className={`group p-6 rounded-xl border border-border bg-card transition-all duration-500 hover:scale-105 hover:shadow-lg hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_10px_15px_-3px_rgb(var(--accent)/0.2)] ${
                featuresRef.isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6'
              }`}
              style={{
                transitionDelay: featuresRef.isVisible ? '500ms' : '0ms',
              }}
            >
              <div className="relative">
                <Layers className="size-8 mb-4 group-hover:scale-125 transition-all duration-300 text-accent-light group-hover:text-accent-tertiary-light" />
                <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-accent/20" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Scalable Concurrency
              </h3>
              <p className="text-sm text-muted-foreground">
                Run thousands of functions simultaneously without breaking a
                sweat
              </p>
            </div>
            <div
              className={`group p-6 rounded-xl border border-border bg-card transition-all duration-500 hover:scale-105 hover:shadow-lg hover:-translate-y-1 hover:border-accent-tertiary/50 hover:shadow-[0_10px_15px_-3px_rgb(var(--accent-tertiary)/0.2)] ${
                featuresRef.isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6'
              }`}
              style={{
                transitionDelay: featuresRef.isVisible ? '600ms' : '0ms',
              }}
            >
              <div className="relative">
                <Lock className="size-8 mb-4 group-hover:scale-125 transition-all duration-300 text-accent-tertiary-light group-hover:text-primary-light" />
                <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-accent-tertiary/20" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Sandbox</h3>
              <p className="text-sm text-muted-foreground">
                Isolated execution environment with comprehensive security
                measures
              </p>
            </div>
          </div>
        </div>
        {/* Section Divider - Gradient Flow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 section-divider pointer-events-none" />
      </section>

      {/* Plans & Pricing */}
      <section
        ref={pricingRef.ref as React.RefObject<HTMLElement>}
        className={`relative py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 overflow-hidden transition-all duration-1000 ${
          pricingRef.isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <AnimatedBackground variant="section" intensity="low" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div
            className={`text-center mb-16 transition-all duration-700 delay-200 ${
              pricingRef.isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Top up your balance and we handle gas. Commission based on your
              plan.
            </p>
          </div>
          <div
            className={`transition-all duration-700 delay-300 ${
              pricingRef.isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <PricingTableView />
          </div>
        </div>
        {/* Section Divider - Gradient Flow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 section-divider pointer-events-none" />
      </section>

      {/* Integrations / Supported Chains */}
      <section
        ref={chainsRef.ref as React.RefObject<HTMLElement>}
        className={`relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-all duration-1000 ${
          chainsRef.isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <AnimatedBackground variant="section" intensity="medium" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div
            className={`text-center mb-16 transition-all duration-700 delay-200 ${
              chainsRef.isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Supported Chains
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Deploy your automation across all major blockchain networks
            </p>
          </div>
        </div>
        <div className="relative overflow-x-hidden overflow-y-visible -mx-4 sm:-mx-6 lg:-mx-8 py-4">
          {/* Gradient fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="flex animate-scroll-left gap-6 px-4 sm:px-6 lg:px-8 will-change-transform items-center">
            {(() => {
              // Duplicate 3 times for seamless infinite scroll
              return [...CHAINS, ...CHAINS, ...CHAINS].map((chain, index) => (
                <div
                  key={`${chain.name}-${index}`}
                  className="group shrink-0 w-32 sm:w-40 p-6 rounded-xl border border-border bg-card transition-all duration-300 text-center hover:scale-110 hover:shadow-lg hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_10px_15px_-3px_rgb(var(--primary)/0.2)]"
                >
                  <div className="flex items-center justify-center mb-3 group-hover:scale-125 transition-transform duration-300">
                    <img
                      src={chain.logo}
                      alt={chain.name}
                      className="w-12 h-12 object-contain rounded-full"
                    />
                  </div>
                  <div className="text-sm font-medium transition-colors duration-300 text-foreground hover:text-primary-light">
                    {chain.name}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
        {/* Section Divider - Gradient Flow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 section-divider pointer-events-none" />
      </section>

      {/* Final CTA */}
      <section
        ref={ctaRef.ref as React.RefObject<HTMLElement>}
        className={`py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 relative overflow-hidden transition-all duration-1000 ${
          ctaRef.isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <AnimatedBackground variant="cta" intensity="high" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div
            className={`relative inline-block mb-6 transition-all duration-700 delay-200 ${
              ctaRef.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
          >
            <Activity className="size-16 mx-auto animate-pulse text-primary-light" />
            <div className="absolute inset-0 rounded-full blur-2xl animate-pulse-glow bg-primary-light/30" />
          </div>
          <h2
            className={`text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent transition-all duration-700 delay-300 ${
              ctaRef.isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{
              backgroundImage:
                'linear-gradient(to right, var(--primary-light), var(--accent-secondary-light), var(--accent-light))',
            }}
          >
            Ready to Automate Your Web3?
          </h2>
          <p
            className={`text-xl text-muted-foreground mb-8 max-w-2xl mx-auto transition-all duration-700 delay-400 ${
              ctaRef.isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            Join thousands of developers building the future of Web3 automation.
            Start free, scale as you grow.
          </p>
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-500 ${
              ctaRef.isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <Link to="/login">
              <Button
                size="lg"
                className="text-lg px-8 hover:scale-110 transition-all duration-300 relative overflow-hidden group"
                style={{
                  background:
                    'linear-gradient(to right, var(--primary), var(--accent-secondary), var(--accent))',
                  boxShadow:
                    '0 20px 25px -5px oklch(from var(--primary) l c h / 0.3), 0 8px 10px -6px oklch(from var(--primary) l c h / 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(to right, var(--primary-dark), var(--accent-secondary-dark), var(--accent-dark))';
                  e.currentTarget.style.boxShadow =
                    '0 20px 25px -5px oklch(from var(--primary) l c h / 0.5), 0 8px 10px -6px oklch(from var(--primary) l c h / 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(to right, var(--primary), var(--accent-secondary), var(--accent))';
                  e.currentTarget.style.boxShadow =
                    '0 20px 25px -5px oklch(from var(--primary) l c h / 0.3), 0 8px 10px -6px oklch(from var(--primary) l c h / 0.3)';
                }}
              >
                <span className="relative z-10 flex items-center">
                  Start Building Free
                  <ArrowRight className="ml-2 size-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}
