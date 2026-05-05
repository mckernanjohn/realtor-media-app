import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { SubmitMediaForm } from "@/components/submit-media-form";

export const metadata: Metadata = {
  title: "Submit media",
  description: "Grey Collective Media Intake — project and marketing asset intake (Phase 2 mock).",
};

export default function SubmitPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6 sm:py-16">
      <PageHero
        title="Media intake"
        subtitle="For brokers, superintendents, project managers, marketing, photographers, and internal teams. Complete the fields and attach one mock file (metadata only — no upload). Staff control publishing destination; you can suggest intended use only."
        summary="Construction progress defaults to internal review. Nothing appears on the public gallery until an admin publishes to Public Media Gallery."
      />
      <div className="mt-12">
        <SubmitMediaForm />
      </div>
    </main>
  );
}
