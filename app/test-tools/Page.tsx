"use client";

import BackToHomeLink from "@/app/components/BackToHomeLink";
import { useState } from "react";
import {
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Workflow,
  Terminal,
  Loader2,
  CheckCircle2,
} from "lucide-react";

type LogEntry = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
  timestamp: string;
};

export default function TestToolsPage() {
  const [resetLoading, setResetLoading] = useState(false);
  const [idempotencyLoading, setIdempotencyLoading] = useState(false);
  const [concurrencyLoading, setConcurrencyLoading] = useState(false);
  const [resetLogs, setResetLogs] = useState<LogEntry[]>([]);
  const [idempotencyLogs, setIdempotencyLogs] = useState<LogEntry[]>([]);
  const [concurrencyLogs, setConcurrencyLogs] = useState<LogEntry[]>([]);

  function addLog(
    setter: React.Dispatch<React.SetStateAction<LogEntry[]>>,
    message: string,
    type: "success" | "error" | "info"
  ) {
    setter((prev) => [
      {
        id: Date.now() + Math.random(),
        message,
        type,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  }

  async function handleResetQuota() {
    setResetLoading(true);
    addLog(setResetLogs, "Initiating quota reset request...", "info");

    try {
      const key = `reset-${Date.now()}`;
      const response = await fetch("/api/webhook/quota-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotency_key: key }),
      });
      const data = await response.json();

      if (data.skipped) {
        addLog(setResetLogs, "⏭️ Skipped — Already processed", "info");
      } else if (data.success) {
        addLog(
          setResetLogs,
          "✅ Processed — Quota reset to 10 for all providers",
          "success"
        );
      } else {
        throw new Error(data.message || "Reset failed");
      }
    } catch (error: unknown) {
      addLog(
        setResetLogs,
        error instanceof Error ? error.message : "Reset failed",
        "error"
      );
    } finally {
      setResetLoading(false);
    }
  }

  async function handleIdempotencyTest() {
    setIdempotencyLoading(true);
    setIdempotencyLogs([]);
    addLog(
      setIdempotencyLogs,
      "Sending duplicate webhook payloads...",
      "info"
    );

    const key = `idempotency-test-${Date.now()}`;

    try {
      for (let i = 1; i <= 5; i++) {
        const response = await fetch("/api/webhook/quota-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idempotency_key: key }),
        });
        const data = await response.json();

        if (i === 1 && data.success && !data.skipped) {
          addLog(setIdempotencyLogs, `✅ Call ${i}: Processed`, "success");
        } else {
          addLog(
            setIdempotencyLogs,
            `⏭️ Call ${i}: Skipped — Already processed`,
            "info"
          );
        }
      }
    } catch (error: unknown) {
      addLog(
        setIdempotencyLogs,
        error instanceof Error ? error.message : "Test failed",
        "error"
      );
    } finally {
      setIdempotencyLoading(false);
    }
  }

  async function handleConcurrencyTest() {
    setConcurrencyLoading(true);
    setConcurrencyLogs([]);
    addLog(setConcurrencyLogs, "Running concurrent requests...", "info");

    const requests = Array.from({ length: 10 }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      return fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: `Concurrent User ${i + 1}`,
          phone_number: `90000000${n}`,
          city: "Bangalore",
          service_id: (i % 3) + 1,
          description: "Concurrency test",
        }),
      });
    });

    try {
      const responses = await Promise.all(requests);

      for (let i = 0; i < responses.length; i++) {
        const data = await responses[i].json();
        addLog(
          setConcurrencyLogs,
          responses[i].ok
            ? `✅ Lead ${i + 1} → Assigned to providers: [${data.assigned_providers?.join(", ") ?? ""}]`
            : `❌ Lead ${i + 1} → Error: ${data.error ?? "Unknown"}`,
          responses[i].ok ? "success" : "error"
        );
      }
    } catch (error: unknown) {
      addLog(
        setConcurrencyLogs,
        error instanceof Error ? error.message : "Test failed",
        "error"
      );
    } finally {
      setConcurrencyLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <BackToHomeLink variant="dark" />

        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5">
          <AlertTriangle className="text-red-400 shrink-0" size={24} />
          <div>
            <h2 className="font-bold text-red-300">
              ⚠️ Internal Testing Panel
            </h2>
            <p className="text-sm text-red-200/80">
              Not for public use — administrative developer utilities only.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold">Developer Tools</h1>
          <p className="mt-2 text-slate-400">
            Internal system utilities for validating quota logic, duplicate
            handling and concurrency behavior.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <ToolCard
            title="Reset Quota"
            icon={<RotateCcw />}
            description="Reset monthly quotas for all providers via webhook."
            buttonText="Reset Now"
            loading={resetLoading}
            onClick={handleResetQuota}
          >
            <TerminalLogs logs={resetLogs} />
          </ToolCard>

          <ToolCard
            title="Idempotency Test"
            icon={<ShieldCheck />}
            description="Verify duplicate webhook requests are skipped."
            buttonText="Run Test"
            loading={idempotencyLoading}
            onClick={handleIdempotencyTest}
          >
            <TerminalLogs logs={idempotencyLogs} />
          </ToolCard>

          <ToolCard
            title="Concurrency Test"
            icon={<Workflow />}
            description="Trigger 10 simultaneous lead creation requests."
            buttonText="Start Test"
            loading={concurrencyLoading}
            onClick={handleConcurrencyTest}
          >
            <TerminalLogs logs={concurrencyLogs} />
          </ToolCard>
        </div>
      </div>
    </main>
  );
}

function ToolCard({
  title,
  icon,
  description,
  buttonText,
  loading,
  onClick,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  buttonText: string;
  loading: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-800 p-3">{icon}</div>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-slate-200 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Running...
          </>
        ) : (
          buttonText
        )}
      </button>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function TerminalLogs({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-black">
      <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
        <Terminal size={16} />
        <span className="text-sm text-slate-300">Terminal Output</span>
      </div>
      <div className="h-[250px] overflow-y-auto p-4">
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500">Waiting for logs...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="mb-3 text-sm">
              <div className="flex gap-2">
                <span className="text-slate-500">[{log.timestamp}]</span>
                {log.type === "success" && (
                  <CheckCircle2 size={15} className="text-green-400" />
                )}
                {log.type === "error" && (
                  <span className="text-red-400">✖</span>
                )}
                {log.type === "info" && (
                  <span className="text-blue-400">➜</span>
                )}
                <span>{log.message}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
