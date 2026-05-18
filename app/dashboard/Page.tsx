"use client";

import { useEffect, useMemo, useState } from "react";
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
  customerName: string;
  serviceType: string;
  city: string;
  createdAt: string;
};

type Provider = {
  id: string;
  providerName: string;
  leadsReceived: number;
  monthlyQuota: number; // expected: 10
  assignedLeads: Lead[];
};

export default function DashboardPage() {
  const [providers, setProviders] = useState<
    Provider[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  async function fetchDashboard(
    silent = false
  ) {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await fetch(
        "/api/dashboard",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load dashboard"
        );
      }

      const data =
        await response.json();

      setProviders(data.providers);
    } catch (error) {
      console.log(
        "Dashboard error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /*
  INITIAL FETCH
  */

  useEffect(() => {
    fetchDashboard();
  }, []);

  /*
  SSE REALTIME LISTENER
  */

  useEffect(() => {
    const eventSource =
      new EventSource(
        "/api/dashboard/stream"
      );

    eventSource.onmessage = () => {
      fetchDashboard(true);
    };

    eventSource.onerror = () => {
      eventSource.close();

      /*
      reconnect automatically after delay
      */

      setTimeout(() => {
        window.location.reload();
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const totalLeads = useMemo(() => {
    return providers.reduce(
      (acc, provider) =>
        acc +
        provider.leadsReceived,
      0
    );
  }, [providers]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">

      {/* Header */}

      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Provider Dashboard
            </h1>

            <p className="mt-2 text-slate-500">
              Real-time lead
              distribution system
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-5 py-4">
            <Users
              className="text-slate-600"
              size={22}
            />

            <div>
              <p className="text-xs text-slate-500">
                Total Leads
              </p>

              <p className="font-bold text-slate-900">
                {totalLeads}
              </p>
            </div>

            {refreshing && (
              <Loader2
                className="animate-spin text-slate-500"
                size={18}
              />
            )}
          </div>
        </div>

        {/* Loading Skeleton */}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({
              length: 8,
            }).map((_, i) => (
              <DashboardSkeleton
                key={i}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

            {providers.map(
              (provider) => (
                <ProviderCard
                  key={
                    provider.id
                  }
                  provider={
                    provider
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

/* ------------------------------------- */
/* PROVIDER CARD */
/* ------------------------------------- */

function ProviderCard({
  provider,
}: {
  provider: Provider;
}) {
  const remaining =
    provider.monthlyQuota -
    provider.leadsReceived;

  const percentage =
    (provider.leadsReceived /
      provider.monthlyQuota) *
    100;

  return (
    <div
      className="
      rounded-3xl
      border
      border-slate-200
      bg-white
      p-6
      shadow-sm
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-xl
    "
    >

      {/* Top */}

      <div className="flex items-start justify-between">

        <div className="flex items-center gap-3">

          <div
            className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-slate-100
          "
          >
            <User
              size={22}
              className="text-slate-700"
            />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              {
                provider.providerName
              }
            </h2>

            <p className="text-xs text-slate-500">
              Active Provider
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}

      <div className="mt-6 grid grid-cols-2 gap-4">

        <div className="rounded-2xl bg-slate-50 p-4">

          <p className="text-xs text-slate-500">
            Leads Received
          </p>

          <h3 className="mt-2 text-xl font-bold text-slate-900">
            {
              provider.leadsReceived
            }
          </h3>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">

          <p className="text-xs text-slate-500">
            Remaining
          </p>

          <h3 className="mt-2 text-xl font-bold text-slate-900">
            {remaining}
          </h3>
        </div>
      </div>

      {/* Progress */}

      <div className="mt-6">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-sm text-slate-600">
            Quota Usage
          </span>

          <span className="text-sm font-semibold">
            {
              provider.leadsReceived
            }
            /
            {
              provider.monthlyQuota
            }
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-100">

          <div
            className="
            h-full
            rounded-full
            bg-slate-900
            transition-all
            duration-700
          "
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>

      {/* Leads */}

      <div className="mt-6">

        <h3 className="mb-3 font-semibold text-slate-900">
          Assigned Leads
        </h3>

        <div className="space-y-3 max-h-[250px] overflow-auto pr-1">

          {provider
            .assignedLeads
            .length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
              No leads assigned
            </div>
          ) : (
            provider.assignedLeads.map(
              (lead) => (
                <div
                  key={
                    lead.id
                  }
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-4
                  "
                >
                  <div className="flex items-center gap-2">

                    <User
                      size={14}
                    />

                    <span className="font-medium text-slate-800">
                      {
                        lead.customerName
                      }
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs text-slate-600">

                    <div className="flex items-center gap-2">
                      <Briefcase
                        size={
                          14
                        }
                      />

                      {
                        lead.serviceType
                      }
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin
                        size={
                          14
                        }
                      />

                      {
                        lead.city
                      }
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar
                        size={
                          14
                        }
                      />

                      {new Date(
                        lead.createdAt
                      ).toLocaleDateString()}
                    </div>

                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------- */
/* SKELETON */
/* ------------------------------------- */

function DashboardSkeleton() {
  return (
    <div
      className="
      rounded-3xl
      border
      border-slate-200
      bg-white
      p-6
      shadow-sm
    "
    >
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
    </div>
  );
}