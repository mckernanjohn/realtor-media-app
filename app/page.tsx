import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-16 sm:px-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
          Grey Collective Development
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Realtor Media Submission App
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          Phase 1 proves the workflow before infrastructure:{" "}
          <span className="font-medium text-stone-800 dark:text-stone-200">Submission</span> with{" "}
          <span className="font-medium text-stone-800 dark:text-stone-200">mediaItems[]</span>, admin checklist,
          gating to <span className="font-medium text-stone-800 dark:text-stone-200">Published</span> for public
          /media. No Supabase, auth, real uploads, or external services in this build.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        <li>
          <Link
            href="/submit"
            className="block h-full rounded-2xl border border-stone-200/80 bg-white p-5 text-sm font-semibold shadow-sm transition hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-950 dark:hover:border-stone-700"
          >
            Submit
            <span className="mt-2 block text-xs font-normal leading-relaxed text-stone-500 dark:text-stone-400">
              Full intake + mock file metadata
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin"
            className="block h-full rounded-2xl border border-stone-200/80 bg-white p-5 text-sm font-semibold shadow-sm transition hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-950 dark:hover:border-stone-700"
          >
            Admin
            <span className="mt-2 block text-xs font-normal leading-relaxed text-stone-500 dark:text-stone-400">
              Filters, checklist, publish control
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/media"
            className="block h-full rounded-2xl border border-stone-200/80 bg-white p-5 text-sm font-semibold shadow-sm transition hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-950 dark:hover:border-stone-700"
          >
            Public media
            <span className="mt-2 block text-xs font-normal leading-relaxed text-stone-500 dark:text-stone-400">
              Published gallery only
            </span>
          </Link>
        </li>
      </ul>

      <section className="rounded-2xl border border-stone-200/80 bg-white p-6 text-sm leading-relaxed text-stone-700 shadow-sm dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Workflow
        </h2>
        <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-stone-800 dark:text-stone-200">
          <li>Intake creates a submission in <span className="font-medium">Submitted</span> with media rows.</li>
          <li>
            Admin triages (<span className="font-medium">Needs Review</span>), completes the checklist, and may
            mark <span className="font-medium">Approved for Use</span> (internal only).
          </li>
          <li>
            Prefer <span className="font-medium">Ready to Publish</span> for public prep, then{" "}
            <span className="font-medium">Publish</span> — the only path to /media (or publish from Approved with a
            complete checklist, server-validated).
          </li>
        </ol>
      </section>
    </main>
  );
}
