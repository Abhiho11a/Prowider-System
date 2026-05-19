import Link from "next/link";
import {
  ArrowRight,
  RefreshCw,
  Shield,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      title: "Smart Round-Robin",
      description:
        "Fair distribution pools ensuring no provider is left behind.",
      icon: RefreshCw,
    },
    {
      title: "Strict Quota Control",
      description:
        "Automated monthly limits to balance lead flow.",
      icon: Shield,
    },
    {
      title: "Real-Time Sync",
      description:
        "Live dashboard updates powered by Server Sent Events.",
      icon: Activity,
    },
  ];

  const steps = [
    "Customer submits a request.",
    "Prowider calculates assignment rules and DB constraints.",
    "Exactly 3 providers are assigned instantly.",
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-[450px] w-[450px] rounded-full bg-gradient-to-r from-slate-200/50 to-slate-100/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-[350px] w-[350px] rounded-full bg-gradient-to-r from-indigo-100/40 to-blue-100/10 blur-3xl" />
      </div>

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-slate-900"
        >
          Prowider
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          Dashboard
        </Link>
      </nav>

      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-28 pt-16 text-center md:pt-28">
        <div className="mb-6 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm text-slate-600 shadow-sm">
          Intelligent Lead Routing Engine
        </div>

        <h1 className="max-w-5xl text-5xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
          Fair, Fast, and{" "}
          <span className="bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
            Intelligent
          </span>{" "}
          Lead Distribution.
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-slate-600">
          Prowider automatically routes customer requests to the right service
          providers using advanced round-robin logic and strict quota
          management.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/request-service"
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-7 py-4 font-medium text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-slate-800"
          >
            Submit a Request
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/dashboard"
            className="rounded-2xl border border-slate-200 bg-white px-7 py-4 font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-100"
          >
            Provider Dashboard
          </Link>
        </div>

        <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { label: "Provider Pools", value: "8" },
            { label: "Monthly Quota", value: "10" },
            { label: "Assigned Providers", value: "3" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-3xl font-bold text-slate-900">
                {item.value}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Features
          </p>
          <h2 className="mt-3 text-4xl font-bold text-slate-900">
            Built for intelligent lead flow
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 transition group-hover:scale-110">
                  <Icon size={24} className="text-slate-700" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Process
          </p>
          <h2 className="mt-3 text-4xl font-bold text-slate-900">
            How Prowider Works
          </h2>
        </div>

        <div className="mx-auto max-w-4xl space-y-8">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Step {index + 1}
                </h3>
                <p className="mt-2 text-slate-600">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} Prowider. All rights reserved.</p>
          <Link
            href="/test-tools"
            className="flex items-center gap-2 transition hover:text-slate-900"
          >
            <CheckCircle2 size={15} />
            Internal Test Panel
          </Link>
        </div>
      </footer>
    </main>
  );
}
