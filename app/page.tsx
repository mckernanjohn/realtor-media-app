import Link from "next/link";

import { PageHero } from "@/components/page-hero";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14 px-4 py-14 sm:px-6 sm:py-20">
      <PageHero
        title="Realtor media command center"
        subtitle="Phase 1 exercises the full intake-to-publish path in a controlled mock environment: structured submissions with attached media, admin review, and a public gallery that only ever shows Published work."
        summary="No live storage, authentication, or external integrations in this build — workflow fidelity first, infrastructure next."
      />

      <ul className="grid gap-5 sm:grid-cols-3">
        <li>
          <Link
            href="/submit"
            className="group flex h-full flex-col rounded-2xl border border-stone-200/90 bg-[var(--card)] p-6 shadow-[var(--shadow-card)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-stone-300/90 hover:shadow-[var(--shadow-card-hover)] dark:border-stone-800 dark:hover:border-stone-600"
          >
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">Submit</span>
            <span className="mt-3 block text-xs font-normal leading-relaxed text-stone-600 dark:text-stone-400">
              Structured intake with mock file metadata — no bytes leave the browser.
            </span>
            <span className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-stone-500 group-hover:text-stone-800 dark:text-stone-500 dark:group-hover:text-stone-300">
              Open intake →
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin"
            className="group flex h-full flex-col rounded-2xl border border-stone-200/90 bg-[var(--card)] p-6 shadow-[var(--shadow-card)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-stone-300/90 hover:shadow-[var(--shadow-card-hover)] dark:border-stone-800 dark:hover:border-stone-600"
          >
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">Admin</span>
            <span className="mt-3 block text-xs font-normal leading-relaxed text-stone-600 dark:text-stone-400">
              Queue, checklist, internal notes, and explicit publish control.
            </span>
            <span className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-stone-500 group-hover:text-stone-800 dark:text-stone-500 dark:group-hover:text-stone-300">
              Review queue →
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/media"
            className="group flex h-full flex-col rounded-2xl border border-stone-200/90 bg-[var(--card)] p-6 shadow-[var(--shadow-card)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-stone-300/90 hover:shadow-[var(--shadow-card-hover)] dark:border-stone-800 dark:hover:border-stone-600"
          >
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">Public media</span>
            <span className="mt-3 block text-xs font-normal leading-relaxed text-stone-600 dark:text-stone-400">
              Client-safe gallery: Published listings only, editorial captions.
            </span>
            <span className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-stone-500 group-hover:text-stone-800 dark:text-stone-500 dark:group-hover:text-stone-300">
              View gallery →
            </span>
          </Link>
        </li>
      </ul>

      <section className="rounded-2xl border border-stone-200/90 bg-[var(--card)] p-8 shadow-[var(--shadow-card)] dark:border-stone-800">
        <div className="flex flex-col gap-2 border-b border-stone-200/80 pb-6 dark:border-stone-800">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
            Operational workflow
          </h2>
          <p className="max-w-2xl text-sm text-stone-600 dark:text-stone-400">
            From intake to public gallery, each step is deliberate — nothing surfaces on /media until publishing
            is explicit.
          </p>
        </div>
        <ol className="mt-6 space-y-4 text-sm leading-relaxed text-stone-800 dark:text-stone-200">
          <li className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white dark:bg-stone-100 dark:text-stone-900">
              1
            </span>
            <span>
              Intake creates a submission in <span className="font-semibold text-stone-900 dark:text-stone-50">Submitted</span>{" "}
              with a submission package that includes attached media items.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white dark:bg-stone-100 dark:text-stone-900">
              2
            </span>
            <span>
              Admin triages (<span className="font-semibold">Needs Review</span>), completes the checklist, and may
              mark <span className="font-semibold">Approved for Use</span> (internal only).
            </span>
          </li>
          <li className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white dark:bg-stone-100 dark:text-stone-900">
              3
            </span>
            <span>
              Prefer <span className="font-semibold">Ready to Publish</span> for public prep, then{" "}
              <span className="font-semibold">Publish</span> — the only path to the public gallery (or publish from
              Approved with a complete checklist, validated on the server).
            </span>
          </li>
        </ol>
      </section>
    </main>
  );
}
