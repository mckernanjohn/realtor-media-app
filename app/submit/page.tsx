import type { Metadata } from "next";

import { SubmitMediaForm } from "@/components/submit-media-form";

export const metadata: Metadata = {
  title: "Submit media",
  description: "Grey Collective Realtor Media — business intake (Phase 1 mock).",
};

export default function SubmitPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Media intake
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          Complete the business fields and attach one mock file (metadata only — no upload). Your
          submission is modeled as a <span className="font-medium text-stone-800 dark:text-stone-200">Submission</span>{" "}
          with a <span className="font-medium text-stone-800 dark:text-stone-200">mediaItems[]</span> array so the
          future Supabase schema is obvious.
        </p>
      </header>
      <div className="mt-10">
        <SubmitMediaForm />
      </div>
    </main>
  );
}
