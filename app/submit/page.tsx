import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { SubmitMediaForm } from "@/components/submit-media-form";

export const metadata: Metadata = {
  title: "Submit media",
  description: "Grey Collective Realtor Media — business intake (Phase 1 mock).",
};

export default function SubmitPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6 sm:py-16">
      <PageHero
        title="Media intake"
        subtitle="Complete the business fields and attach one mock file (metadata only — no upload occurs). Your entry is stored as a submission with an attached media item so the eventual production model stays straightforward."
        summary="Controlled mock: data stays in this session; publishing remains admin-only after review."
      />
      <div className="mt-12">
        <SubmitMediaForm />
      </div>
    </main>
  );
}
