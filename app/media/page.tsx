import type { Metadata } from "next";

/** FUTURE: read from public media API + CDN; strip all non-public fields at the edge. */
import { listPublicMediaEntries } from "@/lib/media/mock-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Public media",
  description: "Grey Collective — published realtor media (Phase 1 mock gallery).",
};

export default function MediaPage() {
  const entries = listPublicMediaEntries();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Public media
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          Only <span className="font-medium text-stone-800 dark:text-stone-200">Published</span>{" "}
          submissions appear here. No submitter email, internal notes, rejection reasons, or
          non-published statuses.
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="mt-12 text-sm text-stone-600 dark:text-stone-400">
          Nothing published yet. Use Admin to move a submission through review and publish.
        </p>
      ) : (
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((item) => (
            <li key={item.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-stone-200 via-stone-50 to-amber-100/30 dark:from-stone-800 dark:via-stone-900 dark:to-stone-950">
                  <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold tracking-tight text-stone-600 dark:text-stone-300">
                    {item.previewLabel}
                  </div>
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-600 shadow-sm dark:bg-stone-950/90 dark:text-stone-300">
                    Placeholder — FUTURE: Supabase Storage + CDN asset
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    {item.projectName}
                  </p>
                  <h2 className="text-lg font-semibold leading-snug text-stone-900 dark:text-stone-50">
                    {item.propertyName}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{item.location}</p>
                  <div className="border-t border-stone-100 pt-4 dark:border-stone-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      {item.mediaType}
                    </p>
                    <p className="mt-1 text-sm font-medium text-stone-900 dark:text-stone-50">
                      {item.mediaTitle}
                    </p>
                    <p className="mt-2 text-sm font-serif text-stone-800 dark:text-stone-200">
                      {item.finalCaption}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                      {item.mediaDescription}
                    </p>
                  </div>
                  <p className="mt-auto pt-2 text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
                    Published {new Date(item.publishedAt).toLocaleDateString(undefined, { dateStyle: "long" })}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
