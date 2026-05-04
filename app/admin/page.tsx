import type { Metadata } from "next";
import Link from "next/link";

import { AdminSubmissionCard } from "@/components/admin-submission-card";
import { listSubmissionsFiltered, submissionAllowsPublish } from "@/lib/media/mock-store";
import { ADMIN_FILTER_STATUSES } from "@/lib/media/types";

/** In-memory mock store — must not be prerender-snapshotted. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin review",
  description: "Grey Collective Realtor Media — admin queue (Phase 1, no auth).",
};

type Search = { filter?: string };

function parseFilter(raw: string | undefined): (typeof ADMIN_FILTER_STATUSES)[number] {
  if (!raw || raw === "All") return "All";
  const allowed = ADMIN_FILTER_STATUSES as readonly string[];
  if (!allowed.includes(raw)) return "All";
  return raw as (typeof ADMIN_FILTER_STATUSES)[number];
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const filter = parseFilter(sp.filter);
  const rows = listSubmissionsFiltered(filter);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Admin review
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          Phase 1 mock console — no authentication. Filter the queue, complete the checklist, move work
          toward <span className="font-medium text-stone-800 dark:text-stone-200">Ready to Publish</span>
          , then <span className="font-medium text-stone-800 dark:text-stone-200">Publish</span>. Only{" "}
          <span className="font-medium">Published</span> rows surface on public{" "}
          <span className="font-medium">/media</span>.
        </p>
      </header>

      <nav
        className="mt-8 flex flex-wrap gap-2"
        aria-label="Filter submissions by status"
      >
        {ADMIN_FILTER_STATUSES.map((s) => {
          const active = filter === s;
          const href = s === "All" ? "/admin" : `/admin?filter=${encodeURIComponent(s)}`;
          return (
            <Link
              key={s}
              href={href}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition ${
                active
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "border border-stone-200 bg-white text-stone-700 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-stone-600"
              }`}
            >
              {s}
            </Link>
          );
        })}
      </nav>

      <section className="mt-10 space-y-8" aria-label="Submission queue">
        {rows.length === 0 ? (
          <p className="text-sm text-stone-600 dark:text-stone-400">No submissions in this filter.</p>
        ) : (
          rows.map((row) => (
            <AdminSubmissionCard key={row.id} row={row} canPublish={submissionAllowsPublish(row)} />
          ))
        )}
      </section>
    </main>
  );
}
