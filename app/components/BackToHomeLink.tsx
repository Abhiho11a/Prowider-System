import Link from "next/link";

type BackToHomeLinkProps = {
  variant?: "light" | "dark";
  className?: string;
};

export default function BackToHomeLink({
  variant = "light",
  className = "mb-6",
}: BackToHomeLinkProps) {
  const styles =
    variant === "dark"
      ? "inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
      : "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100";

  return (
    <Link href="/" className={`${styles} ${className}`}>
      ← Back to Home
    </Link>
  );
}
