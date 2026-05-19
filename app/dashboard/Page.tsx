"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Loader2,
} from "lucide-react";

type Lead = {
  id: string;
  customer_name: string;
  service_name: string;
  city: string;
  created_at: string;
};

type Provider = {
  id: number;
  name: string;
  leads_received_count: number;
  monthly_quota: number;
  leads: Lead[];
};

export default function DashboardPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Failed to load dashboard");

      const data = await response.json();
      setProviders(data.providers);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const eventSource = new EventSource("/api/dashboard/stream");

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (
          payload.type === "lead_assigned" ||
          payload.type === "quota_reset"
        ) {
          fetchDashboard(true);
        }
      } catch {
        // connected / heartbeat
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [fetchDashboard]);

  const totalLeads = useMemo(
    () =>
      providers.reduce(
        (acc, provider) => acc + provider.leads_received_count,
        0
      ),
    [providers]
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <nav className="mx-auto mb-8 flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-lg font-bold text-slate-900">
          Prowider
        </Link>
        <Link
          href="/request-service"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
        >
          Request Service
        </Link>
      </nav>

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Provider Dashboard
            </h1>
            <p className="mt-2 flex items-center gap-2 text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Real-time lead distribution system
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-5 py-4">
            <Users className="text-slate-600" size={22} />
            <div>
              <p className="text-xs text-slate-500">Total Leads</p>
              <p className="font-bold text-slate-900">{totalLeads}</p>
            </div>
            {refreshing && (
              <Loader2 className="animate-spin text-slate-500" size={18} />
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <DashboardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ProviderCard({ provider }: { provider: Provider }) {
  const remaining = provider.monthly_quota;
  const used = provider.leads_received_count;
  const percentage = (used / 10) * 100;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
          <User size={22} className="text-slate-700" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">{provider.name}</h2>
          <p className="text-xs text-slate-500">Active Provider</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Leads Received</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">{used}</h3>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Remaining</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">{remaining}</h3>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-slate-600">Quota Usage</span>
          <span className="text-sm font-semibold">
            {used}/10
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-700"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-slate-900">Assigned Leads</h3>
        <div className="max-h-[250px] space-y-3 overflow-auto pr-1">
          {provider.leads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
              No leads assigned
            </div>
          ) : (
            provider.leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span className="font-medium text-slate-800">
                    {lead.customer_name}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} />
                    {lead.service_name}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    {lead.city}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(lead.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </article>
  );
}

function DashboardSkeleton() {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-3 w-20 rounded bg-slate-200" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
        </div>
        <div className="mt-6 h-3 rounded-full bg-slate-100" />
        <div className="mt-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
        </div>
      </div>
    </article>
  );
}
