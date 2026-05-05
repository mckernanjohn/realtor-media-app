import type { Metadata } from "next";

/** FUTURE: read from public media API + CDN; strip all non-public fields at the edge. */
import { PageHero } from "@/components/page-hero";
import { listPublicMediaEntries } from "@/lib/media/mock-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Public media",
  description: "Grey Collective — Public Media Gallery only (Phase 2 mock).",
};

export default function MediaPage() {
  const entries = listPublicMediaEntries();
  const single = entries.length === 1;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6 sm:py-16">
      <PageHero
        title="Public media gallery"
        subtitle="Marketing-safe items only: status Published and publishing destination Public Media Gallery. No construction-only routing, internal destinations, submitter contact fields, notes, or non-published work."
        summary="Curated for Arizona luxury residential — Paradise Valley, Scottsdale, and Grey Collective developments."
      />

      {entries.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-stone-200/90 bg-[var(--card)] px-6 py-20 text-center shadow-[var(--shadow-card)] dark:border-stone-800">
          <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Nothing published yet</p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-stone-500 dark:text-stone-400">
            Items appear only when staff set destination to Public Media Gallery and publish. Mock placeholders stand
            in for future managed assets.
          </p>
        </div>
      ) : (
        <ul
          className={`mt-14 grid gap-8 sm:grid-cols-2 xl:grid-cols-3 ${single ? "sm:grid-cols-1 xl:max-w-2xl xl:mx-auto" : ""}`}
        >
          {entries.map((item) => (
            <li key={item.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-[var(--card)] shadow-[var(--shadow-card)] transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] dark:border-stone-800">
                <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(145deg,#e7e5e4_0%,#fafaf9_40%,#d6d3d1_100%)] dark:bg-[linear-gradient(145deg,#292524_0%,#1c1917_45%,#44403c_100%)]">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.12] dark:opacity-[0.1]"
                    style={{
                      backgroundImage: `repeating-linear-gradient(-12deg, transparent, transparent 6px, rgba(28,25,23,0.07) 6px, rgba(28,25,23,0.07) 7px)`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold tracking-tight text-stone-600 dark:text-stone-300">
                    {item.previewLabel}
                  </div>
                  <span className="absolute bottom-3 left-3 right-3 rounded-lg bg-stone-950/85 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-stone-100 backdrop-blur-sm dark:bg-stone-950/90">
                    Mock preview · future managed storage and CDN
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-7">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                      {item.projectName}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-stone-900 dark:text-stone-50">
                      {item.propertyName}
                    </h2>
                    <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">{item.location}</p>
                  </div>
                  <div className="border-t border-stone-200/80 pt-5 dark:border-stone-800">
                    {item.submissionCategoryLabel ? (
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                        {item.submissionCategoryLabel}
                      </p>
                    ) : null}
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400 ${item.submissionCategoryLabel ? "mt-2" : ""}`}
                    >
                      {item.mediaType}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-50">{item.mediaTitle}</p>
                    <p className="mt-3 text-sm font-serif leading-relaxed text-stone-800 dark:text-stone-200">
                      {item.finalCaption}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                      {item.mediaDescription}
                    </p>
                  </div>
                  <p className="mt-auto border-t border-stone-100 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400 dark:border-stone-800 dark:text-stone-500">
                    Published{" "}
                    {new Date(item.publishedAt).toLocaleDateString(undefined, { dateStyle: "long" })}
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
