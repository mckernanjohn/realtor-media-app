import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
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
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-14 sm:px-6 sm:py-16">
      <PageHero
        title="Admin review"
        subtitle="Internal console — no authentication in Phase 1. Filter the queue, complete the checklist, and move approved work toward publishing. Only Published submissions appear on the public media gallery."
        summary="Use filters to focus the queue; publish only when checklist and captions are ready."
      />

      <nav
        className="mt-10 flex flex-wrap gap-2"
        aria-label="Filter submissions by status"
      >
        {ADMIN_FILTER_STATUSES.map((s) => {
          const active = filter === s;
          const href = s === "All" ? "/admin" : `/admin?filter=${encodeURIComponent(s)}`;
          return (
            <Link
              key={s}
              href={href}
              className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-[background-color,color,box-shadow] ${
                active
                  ? "bg-stone-900 text-white shadow-[var(--shadow-card)] dark:bg-stone-100 dark:text-stone-900"
                  : "border border-stone-200/90 bg-[var(--card)] text-stone-700 shadow-sm hover:border-stone-300 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-stone-600"
              }`}
            >
              {s}
            </Link>
          );
        })}
      </nav>

      <section className="mt-12 space-y-10" aria-label="Submission queue">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300/80 bg-[var(--card)] px-6 py-14 text-center shadow-[var(--shadow-card)] dark:border-stone-700">
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200">No submissions in this view</p>
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
              Choose another filter or wait for new intake from Submit.
            </p>
          </div>
        ) : (
          rows.map((row) => (
            <AdminSubmissionCard key={row.id} row={row} canPublish={submissionAllowsPublish(row)} />
          ))
        )}
      </section>
    </main>
  );
}
