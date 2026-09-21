import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminOverview } from "@/lib/admin/getAdminOverview";
import { AdminNav } from "@/components/admin/AdminNav";
import { formatRelativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Admin Overview" };

const METRICS = [
  { key: "openFlagCount", label: "Open flags" },
  { key: "sellerCount", label: "Sellers" },
  { key: "activeReportCount", label: "Active price reports" },
  { key: "userCount", label: "Users" },
] as const;

export default async function AdminOverviewPage() {
  await requireAdmin("/admin");
  const overview = await getAdminOverview();

  return (
    <main className="container-page flex flex-col gap-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Admin</h1>
        <p className="text-sm text-slate-600">Moderation and platform activity.</p>
      </div>

      <AdminNav active="/admin" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <div key={metric.key} className="rounded-2xl border border-border bg-white p-5 shadow-sm shadow-ink-900/5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-ink-900">{overview[metric.key]}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-ink-900">Recent activity</p>
        {overview.recentAuditLog.length === 0 ? (
          <p className="text-sm text-slate-600">No moderation activity yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {overview.recentAuditLog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-2.5 text-sm"
              >
                <span className="text-ink-900">
                  <span className="font-medium">{entry.actorName}</span> — {entry.action.replaceAll("_", " ")}
                </span>
                <span className="text-xs text-slate-500">{formatRelativeTime(entry.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
