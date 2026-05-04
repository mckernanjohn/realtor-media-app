"use client";

/**
 * Admin console cards — FUTURE:
 * - Admin auth + RLS (only staff roles)
 * - Public media API: publish triggers cache purge / revalidation
 * - Manus bridge: optional webhook on Published
 * - Audit trail + notifications on Reject / Needs Edits
 */

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  approveForUseAction,
  archiveAction,
  markNeedsReviewAction,
  markReadyToPublishAction,
  publishAction,
  rejectAction,
  requestEditsAction,
  saveFinalCaptionAction,
  saveInternalNotesAction,
  unpublishAction,
  type ActionResult,
} from "@/app/actions/media";
import type { Submission, WorkflowStatus } from "@/lib/media/types";
import { REVIEW_CHECKLIST_KEYS, REVIEW_CHECKLIST_LABELS } from "@/lib/media/types";

function badgeFor(status: WorkflowStatus) {
  const styles: Record<WorkflowStatus, string> = {
    Submitted: "bg-stone-200/90 text-stone-900 ring-stone-300/80 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-600",
    "Needs Review": "bg-amber-100/90 text-amber-950 ring-amber-200/80 dark:bg-amber-950/50 dark:text-amber-50 dark:ring-amber-800",
    "Approved for Use":
      "bg-sky-100/90 text-sky-950 ring-sky-200/80 dark:bg-sky-950/45 dark:text-sky-50 dark:ring-sky-800",
    "Needs Edits": "bg-orange-100/90 text-orange-950 ring-orange-200/80 dark:bg-orange-950/40 dark:text-orange-50 dark:ring-orange-900",
    "Ready to Publish":
      "bg-violet-100/90 text-violet-950 ring-violet-200/80 dark:bg-violet-950/40 dark:text-violet-50 dark:ring-violet-800",
    Published:
      "bg-emerald-100/90 text-emerald-950 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-50 dark:ring-emerald-800",
    Rejected: "bg-red-100/90 text-red-950 ring-red-200/80 dark:bg-red-950/40 dark:text-red-50 dark:ring-red-900",
    Archived: "bg-zinc-300/80 text-zinc-900 ring-zinc-400/70 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ring-1 ring-inset ${styles[status]}`}
    >
      {status}
    </span>
  );
}

const btnPrimary =
  "rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-stone-800 disabled:opacity-45 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white";
const btnMuted =
  "rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-45 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-900";
const btnDanger =
  "rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-50 disabled:opacity-45 dark:border-red-900/60 dark:bg-stone-950 dark:text-red-200 dark:hover:bg-red-950/30";
const btnSuccess =
  "rounded-full bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-45";

export function AdminSubmissionCard({ row, canPublish }: { row: Submission; canPublish: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fd: FormData, action: (fd: FormData) => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const res = await action(fd);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  const canRequestEdits = ["Submitted", "Needs Review", "Approved for Use", "Ready to Publish"].includes(
    row.status,
  );
  const canReject = !["Published", "Archived", "Rejected"].includes(row.status);
  const showApprove = row.status === "Submitted" || row.status === "Needs Review";
  const showMarkReview = row.status === "Submitted";
  const showMarkReady = row.status === "Approved for Use" || row.status === "Needs Edits";
  const showPublish = row.status !== "Published" && canPublish;
  const showUnpublish = row.status === "Published";
  const showArchive = row.status !== "Archived";

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="border-b border-stone-100 px-6 py-5 dark:border-stone-800/80">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h2 className="truncate text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              {row.propertyName}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Submission <span className="font-mono text-stone-600 dark:text-stone-300">{row.id}</span>
            </p>
          </div>
          {badgeFor(row.status)}
        </div>
      </div>

      <div className="grid gap-0 sm:grid-cols-2">
        <dl className="space-y-3 border-b border-stone-100 p-6 dark:border-stone-800/80 sm:border-r">
          <div>
            <dt className={dt}>Submitter name</dt>
            <dd className={dd}>{row.submitterName}</dd>
          </div>
          <div>
            <dt className={dt}>Submitter email</dt>
            <dd className={dd}>{row.submitterEmail}</dd>
          </div>
          <div>
            <dt className={dt}>Brokerage / company</dt>
            <dd className={dd}>{row.brokerageCompany}</dd>
          </div>
          <div>
            <dt className={dt}>Property address</dt>
            <dd className={dd}>{row.propertyAddress}</dd>
          </div>
          <div>
            <dt className={dt}>Location</dt>
            <dd className={dd}>{row.location}</dd>
          </div>
          <div>
            <dt className={dt}>Project assignment</dt>
            <dd className={dd}>{row.projectAssignment}</dd>
          </div>
          <div>
            <dt className={dt}>Intended use</dt>
            <dd className={dd}>{row.intendedUse}</dd>
          </div>
        </dl>
        <dl className="space-y-3 p-6">
          <div>
            <dt className={dt}>Submitted</dt>
            <dd className={dd}>{new Date(row.submittedAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className={dt}>Reviewed</dt>
            <dd className={dd}>{row.reviewedAt ? new Date(row.reviewedAt).toLocaleString() : "—"}</dd>
          </div>
          <div>
            <dt className={dt}>Published</dt>
            <dd className={dd}>{row.publishedAt ? new Date(row.publishedAt).toLocaleString() : "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-stone-100 px-6 py-5 dark:border-stone-800/80">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Internal review notes
        </h3>
        <form
          className="mt-3 space-y-2"
          action={(fd) => {
            fd.set("submissionId", row.id);
            run(fd, saveInternalNotesAction);
          }}
        >
          <textarea
            name="internalReviewNotes"
            rows={3}
            defaultValue={row.internalReviewNotes}
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm text-stone-900 outline-none ring-stone-400/20 focus:ring-2 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-100"
            placeholder="Internal-only — never shown on public /media."
          />
          <button type="submit" disabled={pending} className={btnMuted}>
            Save notes
          </button>
        </form>
      </div>

      {(row.rejectionOrEditReason || row.status === "Needs Edits" || row.status === "Rejected") && (
        <div className="border-t border-stone-100 px-6 py-4 dark:border-stone-800/80">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Rejection / edit reason</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-800 dark:text-stone-200">
            {row.rejectionOrEditReason || "—"}
          </p>
        </div>
      )}

      <div className="space-y-6 border-t border-stone-100 px-6 py-6 dark:border-stone-800/80">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Media items
        </h3>
        {row.mediaItems.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-stone-200/80 bg-stone-50/40 p-5 dark:border-stone-800 dark:bg-stone-900/30"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">{m.mediaTitle}</p>
              {badgeFor(m.mediaStatus)}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-stone-300">{m.mediaDescription}</p>
            <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <dt className={dt}>Suggested caption</dt>
                <dd className={dd}>{m.suggestedCaption || "—"}</dd>
              </div>
              <div>
                <dt className={dt}>Media type</dt>
                <dd className={dd}>{m.mediaType}</dd>
              </div>
              <div>
                <dt className={dt}>File name</dt>
                <dd className="font-mono text-stone-800 dark:text-stone-200">{m.fileName}</dd>
              </div>
              <div>
                <dt className={dt}>MIME type</dt>
                <dd className="font-mono text-stone-800 dark:text-stone-200">{m.mimeType}</dd>
              </div>
              <div>
                <dt className={dt}>Mock file size</dt>
                <dd className={dd}>{m.mockSizeLabel}</dd>
              </div>
              <div>
                <dt className={dt}>Preview label</dt>
                <dd className={dd}>{m.previewLabel}</dd>
              </div>
            </dl>
            <form
              className="mt-4 space-y-2"
              action={(fd) => {
                fd.set("submissionId", row.id);
                fd.set("mediaId", m.id);
                run(fd, saveFinalCaptionAction);
              }}
            >
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Final caption
                </span>
                <textarea
                  name="finalCaption"
                  rows={2}
                  defaultValue={m.finalCaption}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-stone-400/20 focus:ring-2 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                  placeholder="Shown publicly when published (falls back to suggested caption if empty on /media)."
                />
              </label>
              <button type="submit" disabled={pending} className={btnMuted}>
                Save caption
              </button>
            </form>
          </div>
        ))}
      </div>

      {error ? (
        <div className="border-t border-red-100 bg-red-50/80 px-6 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-stone-100 bg-stone-50/50 px-6 py-6 dark:border-stone-800/80 dark:bg-stone-900/25">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Admin actions
        </p>
        <div className="flex flex-wrap gap-2">
          {showMarkReview ? (
            <form
              action={(fd) => {
                fd.set("submissionId", row.id);
                run(fd, markNeedsReviewAction);
              }}
            >
              <button type="submit" disabled={pending} className={btnMuted}>
                Mark Needs Review
              </button>
            </form>
          ) : null}

          {showApprove ? (
            <form
              action={(fd) => {
                fd.set("submissionId", row.id);
                run(fd, approveForUseAction);
              }}
            >
              <details className="group w-full min-w-[min(100%,280px)] flex-1 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-950">
                <summary className="cursor-pointer text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Approve for Use (checklist required)
                </summary>
                <ul className="mt-3 space-y-2 border-t border-stone-100 pt-3 dark:border-stone-800">
                  {REVIEW_CHECKLIST_KEYS.map((key) => (
                    <li key={key} className="flex gap-2 text-sm text-stone-800 dark:text-stone-200">
                      <input
                        type="checkbox"
                        id={`${row.id}__chk__${key}`}
                        name={`chk_${key}`}
                        className="mt-0.5 size-4 rounded border-stone-300 dark:border-stone-600"
                      />
                      <label htmlFor={`${row.id}__chk__${key}`} className="leading-snug">
                        {REVIEW_CHECKLIST_LABELS[key]}
                      </label>
                    </li>
                  ))}
                </ul>
                <button type="submit" disabled={pending} className={`${btnPrimary} mt-4 w-full sm:w-auto`}>
                  Approve for Use
                </button>
              </details>
            </form>
          ) : null}

          {canRequestEdits ? (
            <form
              className="flex min-w-[min(100%,320px)] flex-1 flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-950"
              action={(fd) => {
                fd.set("submissionId", row.id);
                run(fd, requestEditsAction);
              }}
            >
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">Request edits</label>
              <textarea
                name="rejectionOrEditReason"
                required
                rows={2}
                className="rounded-xl border border-stone-200 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
                placeholder="What should the submitter change?"
              />
              <button type="submit" disabled={pending} className={btnMuted}>
                Request Edits
              </button>
            </form>
          ) : null}

          {showMarkReady ? (
            <form
              action={(fd) => {
                fd.set("submissionId", row.id);
                run(fd, markReadyToPublishAction);
              }}
            >
              <button type="submit" disabled={pending} className={btnMuted}>
                Mark Ready to Publish
              </button>
            </form>
          ) : null}

          {showPublish ? (
            <form
              action={(fd) => {
                fd.set("submissionId", row.id);
                run(fd, publishAction);
              }}
            >
              <button type="submit" disabled={pending} className={btnSuccess}>
                Publish
              </button>
            </form>
          ) : null}

          {showUnpublish ? (
            <form
              action={(fd) => {
                fd.set("submissionId", row.id);
                run(fd, unpublishAction);
              }}
            >
              <button type="submit" disabled={pending} className={btnMuted}>
                Unpublish → Approved for Use
              </button>
            </form>
          ) : null}

          {canReject ? (
            <form
              className="flex min-w-[min(100%,320px)] flex-1 flex-col gap-2 rounded-2xl border border-red-100 bg-white p-4 dark:border-red-900/30 dark:bg-stone-950"
              action={(fd) => {
                fd.set("submissionId", row.id);
                run(fd, rejectAction);
              }}
            >
              <label className="text-xs font-semibold text-red-800 dark:text-red-200">Reject</label>
              <textarea
                name="rejectionOrEditReason"
                required
                rows={2}
                className="rounded-xl border border-red-200 px-3 py-2 text-sm dark:border-red-900/50 dark:bg-stone-900"
                placeholder="Rejection reason (internal tooling — not on /media)"
              />
              <button type="submit" disabled={pending} className={btnDanger}>
                Reject
              </button>
            </form>
          ) : null}

          {showArchive ? (
            <form
              action={(fd) => {
                fd.set("submissionId", row.id);
                run(fd, archiveAction);
              }}
            >
              <button type="submit" disabled={pending} className={btnMuted}>
                Archive
              </button>
            </form>
          ) : null}
        </div>
        <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-500">
          FUTURE: Admin auth + audit log. Publish is blocked server-side unless Ready to Publish, or Approved
          for Use with a complete checklist.
        </p>
      </div>
    </article>
  );
}

const dt = "text-[10px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400";
const dd = "mt-0.5 text-sm text-stone-900 dark:text-stone-100";
