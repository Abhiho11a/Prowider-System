"use client";

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
  const [resetLoading, setResetLoading] =
    useState(false);

  const [idempotencyLoading, setIdempotencyLoading] =
    useState(false);

  const [concurrencyLoading, setConcurrencyLoading] =
    useState(false);

  const [resetLogs, setResetLogs] = useState<
    LogEntry[]
  >([]);

  const [idempotencyLogs, setIdempotencyLogs] =
    useState<LogEntry[]>([]);

  const [concurrencyLogs, setConcurrencyLogs] =
    useState<LogEntry[]>([]);

  function addLog(
    setter: React.Dispatch<
      React.SetStateAction<LogEntry[]>
    >,
    message: string,
    type: "success" | "error" | "info"
  ) {
    setter((prev) => [
      {
        id: Date.now() + Math.random(),
        message,
        type,
        timestamp:
          new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  }

  /* ------------------------------- */
  /* RESET QUOTA */
  /* ------------------------------- */

  async function handleResetQuota() {
    try {
      setResetLoading(true);

      addLog(
        setResetLogs,
        "Initiating quota reset request...",
        "info"
      );

      const response = await fetch(
        "/api/test-tools/reset-quota",
        {
          method: "POST",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message
        );
      }

      addLog(
        setResetLogs,
        "Monthly quotas reset successfully.",
        "success"
      );
    } catch (error: any) {
      addLog(
        setResetLogs,
        error.message ||
          "Reset failed",
        "error"
      );
    } finally {
      setResetLoading(false);
    }
  }

  /* ------------------------------- */
  /* IDEMPOTENCY TEST */
  /* ------------------------------- */

  async function handleIdempotencyTest() {
    try {
      setIdempotencyLoading(true);

      addLog(
        setIdempotencyLogs,
        "Sending duplicate request payloads...",
        "info"
      );

      const payload = {
        fullName:
          "John Doe",
        phone:
          "9876543210",
        city:
          "Bangalore",
        serviceType:
          "Service 1",
        description:
          "Duplicate submission test",
      };

      const response1 =
        await fetch(
          "/api/leads",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              payload
            ),
          }
        );

      const response2 =
        await fetch(
          "/api/leads",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              payload
            ),
          }
        );

      const data1 =
        await response1.json();

      const data2 =
        await response2.json();

      addLog(
        setIdempotencyLogs,
        `Request 1 → ${
          data1.message ||
          "Success"
        }`,
        response1.ok
          ? "success"
          : "error"
      );

      addLog(
        setIdempotencyLogs,
        `Request 2 → ${
          data2.message ||
          "Duplicate blocked"
        }`,
        response2.ok
          ? "success"
          : "error"
      );
    } catch (error: any) {
      addLog(
        setIdempotencyLogs,
        error.message,
        "error"
      );
    } finally {
      setIdempotencyLoading(false);
    }
  }

  /* ------------------------------- */
  /* CONCURRENCY TEST */
  /* ------------------------------- */

  async function handleConcurrencyTest() {
    try {
      setConcurrencyLoading(true);

      addLog(
        setConcurrencyLogs,
        "Running concurrent requests...",
        "info"
      );

      const requests =
        Array.from(
          { length: 5 },
          (_, i) =>
            fetch(
              "/api/leads",
              {
                method:
                  "POST",
                headers:
                  {
                    "Content-Type":
                      "application/json",
                  },
                body:
                  JSON.stringify(
                    {
                      fullName: `Concurrent User ${i}`,
                      phone: `98765432${i}${i}`,
                      city:
                        "Bangalore",
                      serviceType:
                        "Service 2",
                      description:
                        "Concurrency test",
                    }
                  ),
              }
            )
        );

      const responses =
        await Promise.all(
          requests
        );

      responses.forEach(
        async (
          response,
          index
        ) => {
          const data =
            await response.json();

          addLog(
            setConcurrencyLogs,
            `Request ${
              index + 1
            } → ${
              data.message
            }`,
            response.ok
              ? "success"
              : "error"
          );
        }
      );
    } catch (error: any) {
      addLog(
        setConcurrencyLogs,
        error.message,
        "error"
      );
    } finally {
      setConcurrencyLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8">

      <div className="mx-auto max-w-7xl">

        {/* Warning Banner */}

        <div
          className="
          mb-8
          flex
          items-center
          gap-4
          rounded-2xl
          border
          border-red-500/30
          bg-red-500/10
          px-6
          py-5
        "
        >
          <AlertTriangle
            className="text-red-400"
            size={24}
          />

          <div>
            <h2 className="font-bold text-red-300">
              ⚠️ Internal Testing Panel
            </h2>

            <p className="text-sm text-red-200/80">
              Not for public use —
              administrative developer
              utilities only.
            </p>
          </div>
        </div>

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Developer Tools
          </h1>

          <p className="mt-2 text-slate-400">
            Internal system utilities
            for validating quota logic,
            duplicate handling and
            concurrency behavior.
          </p>
        </div>

        {/* Tool Grid */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* RESET */}

          <ToolCard
            title="Reset Quota"
            icon={
              <RotateCcw />
            }
            description="Reset monthly quotas for all providers."
            buttonText="Reset Now"
            loading={
              resetLoading
            }
            onClick={
              handleResetQuota
            }
          >
            <TerminalLogs
              logs={
                resetLogs
              }
            />
          </ToolCard>

          {/* IDEMPOTENCY */}

          <ToolCard
            title="Idempotency Test"
            icon={
              <ShieldCheck />
            }
            description="Verify duplicate requests are blocked."
            buttonText="Run Test"
            loading={
              idempotencyLoading
            }
            onClick={
              handleIdempotencyTest
            }
          >
            <TerminalLogs
              logs={
                idempotencyLogs
              }
            />
          </ToolCard>

          {/* CONCURRENCY */}

          <ToolCard
            title="Concurrency Test"
            icon={
              <Workflow />
            }
            description="Trigger simultaneous requests and inspect behavior."
            buttonText="Start Test"
            loading={
              concurrencyLoading
            }
            onClick={
              handleConcurrencyTest
            }
          >
            <TerminalLogs
              logs={
                concurrencyLogs
              }
            />
          </ToolCard>

        </div>
      </div>
    </main>
  );
}

/* -------------------------------- */
/* TOOL CARD */
/* -------------------------------- */

function ToolCard({
  title,
  icon,
  description,
  buttonText,
  loading,
  onClick,
  children,
}: any) {
  return (
    <div
      className="
      rounded-3xl
      border
      border-slate-800
      bg-slate-900
      p-6
      shadow-2xl
    "
    >
      <div className="flex items-center gap-3">

        <div
          className="
          rounded-xl
          bg-slate-800
          p-3
        "
        >
          {icon}
        </div>

        <div>
          <h2 className="font-bold text-lg">
            {title}
          </h2>

          <p className="text-sm text-slate-400">
            {description}
          </p>
        </div>

      </div>

      <button
        onClick={onClick}
        disabled={loading}
        className="
        mt-6
        flex
        w-full
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-white
        px-5
        py-3
        font-medium
        text-black
        transition
        hover:bg-slate-200
        disabled:opacity-50
      "
      >
        {loading ? (
          <>
            <Loader2
              className="animate-spin"
              size={18}
            />
            Running...
          </>
        ) : (
          buttonText
        )}
      </button>

      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}

/* -------------------------------- */
/* TERMINAL WINDOW */
/* -------------------------------- */

function TerminalLogs({
  logs,
}: {
  logs: LogEntry[];
}) {
  return (
    <div
      className="
      overflow-hidden
      rounded-2xl
      border
      border-slate-700
      bg-black
    "
    >

      <div
        className="
        flex
        items-center
        gap-2
        border-b
        border-slate-700
        px-4
        py-3
      "
      >
        <Terminal
          size={16}
        />

        <span className="text-sm text-slate-300">
          Terminal Output
        </span>
      </div>

      <div className="h-[250px] overflow-y-auto p-4">

        {logs.length ===
        0 ? (
          <p className="text-sm text-slate-500">
            Waiting for logs...
          </p>
        ) : (
          logs.map(
            (log) => (
              <div
                key={
                  log.id
                }
                className="mb-3 text-sm"
              >

                <div className="flex gap-2">

                  <span className="text-slate-500">
                    [
                    {
                      log.timestamp
                    }
                    ]
                  </span>

                  {log.type ===
                    "success" && (
                    <CheckCircle2
                      size={
                        15
                      }
                      className="text-green-400"
                    />
                  )}

                  {log.type ===
                    "error" && (
                    <span className="text-red-400">
                      ✖
                    </span>
                  )}

                  {log.type ===
                    "info" && (
                    <span className="text-blue-400">
                      ➜
                    </span>
                  )}

                  <span>
                    {
                      log.message
                    }
                  </span>

                </div>

              </div>
            )
          )
        )}
      </div>

    </div>
  );
}