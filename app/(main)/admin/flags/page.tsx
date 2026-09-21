import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { getFlagsQueue } from "@/lib/admin/getFlagsQueue";
import { AdminNav } from "@/components/admin/AdminNav";
import { FlagsQueueTable } from "@/components/admin/FlagsQueueTable";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Flagged Reports" };

export default async function AdminFlagsPage() {
  await requireAdmin("/admin/flags");
  const flags = await getFlagsQueue();

  return (
    <main className="container-page flex flex-col gap-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Admin</h1>
        <p className="text-sm text-slate-600">Moderation and platform activity.</p>
      </div>

      <AdminNav active="/admin/flags" />

      {flags.length === 0 ? (
        <EmptyState title="No open flags" description="Everything reported so far has been resolved." />
      ) : (
        <FlagsQueueTable flags={flags} />
      )}
    </main>
  );
}
