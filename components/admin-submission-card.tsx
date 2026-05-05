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
  savePublishingDestinationAction,
  saveReviewFlagsAction,
  unpublishAction,
  type ActionResult,
} from "@/app/actions/media";
import type { Submission, WorkflowStatus } from "@/lib/media/types";
import {
  CONSTRUCTION_CHECKLIST_KEYS,
  CONSTRUCTION_CHECKLIST_LABELS,
  PUBLISHING_DESTINATION_OPTIONS,
  REVIEW_FLAG_KEYS,
  REVIEW_FLAG_LABELS,
  UNIVERSAL_CHECKLIST_KEYS,
  UNIVERSAL_CHECKLIST_LABELS,
  needsConstructionReviewChecklist,
} from "@/lib/media/types";

function badgeFor(status: WorkflowStatus) {
  const styles: Record<WorkflowStatus, string> = {
    Submitted:
      "bg-stone-200/95 text-stone-900 ring-stone-400/25 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-600/40",
    "Needs Review":
      "bg-amber-100/95 text-amber-950 ring-amber-300/50 dark:bg-amber-950/55 dark:text-amber-50 dark:ring-amber-800/50",
    "Approved for Use":
      "bg-sky-100/95 text-sky-950 ring-sky-300/45 dark:bg-sky-950/50 dark:text-sky-50 dark:ring-sky-800/45",
    "Needs Edits":
      "bg-orange-100/95 text-orange-950 ring-orange-300/45 dark:bg-orange-950/45 dark:text-orange-50 dark:ring-orange-900/40",
    "Ready to Publish":
      "bg-violet-100/95 text-violet-950 ring-violet-300/45 dark:bg-violet-950/45 dark:text-violet-50 dark:ring-violet-800/45",
    Published:
      "bg-emerald-100/95 text-emerald-950 ring-emerald-300/45 dark:bg-emerald-950/45 dark:text-emerald-50 dark:ring-emerald-800/45",
    Rejected:
      "bg-red-100/95 text-red-950 ring-red-300/45 dark:bg-red-950/45 dark:text-red-50 dark:ring-red-900/40",
    Archived:
      "bg-zinc-200/95 text-zinc-900 ring-zinc-400/40 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-600/40",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset backdrop-blur-[2px] ${styles[status]}`}
    >
      {status}
    </span>
  );
}

const btnPrimary =
  "rounded-full bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 disabled:opacity-45 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white";
const btnMuted =
  "rounded-full border border-stone-200/90 bg-[var(--card)] px-5 py-2.5 text-xs font-semibold text-stone-800 shadow-sm transition-colors hover:border-stone-300 hover:bg-white disabled:opacity-45 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:hover:border-stone-600 dark:hover:bg-stone-900";
const btnDanger =
  "rounded-full border border-red-200/90 bg-[var(--card)] px-5 py-2.5 text-xs font-semibold text-red-800 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-45 dark:border-red-900/55 dark:bg-stone-950 dark:text-red-200 dark:hover:bg-red-950/35";
const btnSuccess =
  "rounded-full bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-45";

const panelTitle =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400";

const metaChip =
  "inline-flex min-w-0 max-w-full flex-col gap-0.5 rounded-lg border border-stone-200/80 bg-white/80 px-2.5 py-1.5 dark:border-stone-700 dark:bg-stone-950/60";

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
  const constructionContext =
    row.submissionCategory === "Construction Progress" || row.submissionCategory === "Project Milestone";
  const showConstructionChecklist = needsConstructionReviewChecklist(row.submissionCategory);

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200/90 bg-[var(--card)] shadow-[var(--shadow-card)] dark:border-stone-800">
      <div className="border-b border-stone-200/80 bg-gradient-to-b from-stone-900 to-stone-800 px-6 py-6 text-stone-50 dark:from-stone-950 dark:to-stone-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <h2 className="text-lg font-semibold tracking-tight text-white">{row.propertyName}</h2>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
              Reference <span className="font-mono text-stone-300">{row.id}</span>
            </p>
          </div>
          <div className="shrink-0">{badgeFor(row.status)}</div>
        </div>
      </div>

      <div className="border-b border-stone-200/80 bg-stone-100/50 px-4 py-3 dark:border-stone-800 dark:bg-stone-900/40">
        <p className={panelTitle}>Intake context</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["Submitter type", row.submitterType],
              ["Category", row.submissionCategory],
              ["Phase", row.projectPhase],
              ["Area", row.propertyArea],
              ["Progress date", row.progressDate || "—"],
              ["Destination", row.publishingDestination],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className={metaChip}>
              <span className="text-[9px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                {k}
              </span>
              <span className="line-clamp-2 text-[11px] font-medium text-stone-900 dark:text-stone-100">{v}</span>
            </div>
          ))}
        </div>
        <form
          className="mt-3 flex flex-wrap items-end gap-2 border-t border-stone-200/60 pt-3 dark:border-stone-700"
          action={(fd) => {
            fd.set("submissionId", row.id);
            run(fd, savePublishingDestinationAction);
          }}
        >
          <label className="flex min-w-[200px] flex-1 flex-col gap-1">
            <span className="text-[9px] font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-400">
              Publishing destination (admin only)
            </span>
            <select
              name="publishingDestination"
              defaultValue={row.publishingDestination}
              className="rounded-lg border border-stone-200/90 bg-white px-2.5 py-2 text-xs font-medium text-stone-900 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            >
              {PUBLISHING_DESTINATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={pending} className={btnMuted}>
            Save destination
          </button>
        </form>
        {constructionContext ? (
          <p className="mt-3 text-[11px] leading-relaxed text-amber-950/90 dark:text-amber-100/90">
            Construction progress media should remain internal unless explicitly cleared for{" "}
            <span className="font-semibold">Public Media Gallery</span> use. Route to Internal Progress Log or other
            destinations by default.
          </p>
        ) : null}
      </div>

      <div className="bg-stone-900/[0.03] dark:bg-white/[0.02]">
        <div className="grid gap-0 sm:grid-cols-2">
          <dl className="space-y-4 border-b border-stone-200/80 p-6 dark:border-stone-800 sm:border-r sm:border-stone-200/80">
            <div>
              <dt className={dt}>Submitter name</dt>
              <dd className={dd}>{row.submitterName}</dd>
            </div>
            <div>
              <dt className={dt}>Submitter email</dt>
              <dd className={dd}>{row.submitterEmail}</dd>
            </div>
            <div>
              <dt className={dt}>Company / team</dt>
              <dd className={dd}>{row.companyTeam}</dd>
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
              <dt className={dt}>Intended use (submitter)</dt>
              <dd className={dd}>{row.intendedUse}</dd>
            </div>
          </dl>
          <dl className="space-y-4 border-b border-stone-200/80 p-6 dark:border-stone-800">
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
      </div>

      <div className="border-t border-stone-200/80 bg-[var(--card)] px-6 py-5 dark:border-stone-800">
        <h3 className={panelTitle}>Review flags</h3>
        <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-500">
          Mark issues observed — internal only; does not change status automatically.
        </p>
        <form
          className="mt-3"
          action={(fd) => {
            fd.set("submissionId", row.id);
            run(fd, saveReviewFlagsAction);
          }}
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {REVIEW_FLAG_KEYS.map((key) => (
              <li key={key} className="flex gap-2 text-[11px] text-stone-800 dark:text-stone-200">
                <input
                  type="checkbox"
                  id={`${row.id}__flag__${key}`}
                  name={`flag_${key}`}
                  defaultChecked={row.adminReviewFlags[key]}
                  className="mt-0.5 size-3.5 rounded border-stone-300 dark:border-stone-600"
                />
                <label htmlFor={`${row.id}__flag__${key}`} className="leading-snug">
                  {REVIEW_FLAG_LABELS[key]}
                </label>
              </li>
            ))}
          </ul>
          <button type="submit" disabled={pending} className={`${btnMuted} mt-3`}>
            Save flags
          </button>
        </form>
      </div>

      <div className="border-t border-stone-200/80 bg-[var(--card)] px-6 py-6 dark:border-stone-800">
        <div className="border-l-2 border-stone-900/20 pl-5 dark:border-stone-100/25">
          <h3 className={panelTitle}>Internal review notes</h3>
          <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-500">Staff-only — never shown on public media.</p>
          <form
            className="mt-4 space-y-3"
            action={(fd) => {
              fd.set("submissionId", row.id);
              run(fd, saveInternalNotesAction);
            }}
          >
            <textarea
              name="internalReviewNotes"
              rows={3}
              defaultValue={row.internalReviewNotes}
              className="w-full rounded-xl border border-stone-200/90 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm outline-none ring-stone-400/20 focus:ring-2 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
              placeholder="Internal-only context for this submission."
            />
            <button type="submit" disabled={pending} className={btnMuted}>
              Save notes
            </button>
          </form>
        </div>
      </div>

      {(row.rejectionOrEditReason || row.status === "Needs Edits" || row.status === "Rejected") && (
        <div className="border-t border-stone-200/80 bg-amber-50/40 px-6 py-5 dark:border-stone-800 dark:bg-amber-950/15">
          <h3 className={panelTitle}>Rejection / edit reason</h3>
          <p className="mt-3 text-sm leading-relaxed text-stone-800 dark:text-stone-200">
            {row.rejectionOrEditReason || "—"}
          </p>
        </div>
      )}

      <div className="space-y-6 border-t border-stone-200/80 bg-stone-900/[0.025] px-6 py-7 dark:border-stone-800 dark:bg-white/[0.02]">
        <div className="flex items-end justify-between gap-4 border-b border-stone-200/60 pb-4 dark:border-stone-800">
          <h3 className={panelTitle}>Media items</h3>
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500">
            {row.mediaItems.length} in package
          </span>
        </div>
        {row.mediaItems.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-stone-200/90 bg-[var(--card)] p-6 shadow-sm dark:border-stone-800"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4 dark:border-stone-800">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">{m.mediaTitle}</p>
              {badgeFor(m.mediaStatus)}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stone-700 dark:text-stone-300">{m.mediaDescription}</p>
            <div className="mt-5 flex flex-col gap-5 lg:flex-row">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-stone-200/90 bg-[linear-gradient(145deg,#e7e5e4_0%,#fafaf9_40%,#d6d3d1_100%)] lg:max-w-[200px] dark:border-stone-700 dark:bg-[linear-gradient(145deg,#292524_0%,#1c1917_45%,#44403c_100%)]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage: `repeating-linear-gradient(-12deg, transparent, transparent 5px, rgba(28,25,23,0.08) 5px, rgba(28,25,23,0.08) 6px)`,
                  }}
                />
                <div className="flex h-full items-center justify-center text-xl font-semibold text-stone-600 dark:text-stone-300">
                  {m.previewLabel}
                </div>
                <span className="absolute bottom-2 left-2 right-2 rounded-md bg-stone-950/80 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-stone-200">
                  Mock asset
                </span>
              </div>
              <dl className="grid min-w-0 flex-1 gap-3 text-xs sm:grid-cols-2">
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
            </div>
            <form
              className="mt-5 space-y-3 border-t border-stone-100 pt-5 dark:border-stone-800"
              action={(fd) => {
                fd.set("submissionId", row.id);
                fd.set("mediaId", m.id);
                run(fd, saveFinalCaptionAction);
              }}
            >
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Final caption</span>
                <textarea
                  name="finalCaption"
                  rows={2}
                  defaultValue={m.finalCaption}
                  className="w-full rounded-xl border border-stone-200/90 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none ring-stone-400/20 focus:ring-2 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                  placeholder="Public caption when published to Public Media Gallery (falls back to suggested caption if empty)."
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
        <div className="border-t border-red-200/80 bg-red-50/90 px-6 py-4 text-sm text-red-900 dark:border-red-900/45 dark:bg-red-950/35 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <div className="border-t-2 border-stone-900/10 bg-gradient-to-b from-stone-900/[0.06] to-stone-900/[0.03] px-6 py-7 dark:border-stone-100/10 dark:from-white/[0.04] dark:to-white/[0.02]">
        <p className={panelTitle}>Admin actions</p>
        <p className="mt-2 max-w-3xl text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
          Approved and Ready to Publish are internal states. Published does not surface on the public gallery unless
          publishing destination is <span className="font-semibold">Public Media Gallery</span>.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
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
              <details className="group w-full min-w-[min(100%,320px)] max-w-xl flex-1 rounded-2xl border border-stone-200/90 bg-[var(--card)] p-5 shadow-sm dark:border-stone-700 dark:bg-stone-950">
                <summary className="cursor-pointer text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Approve for Use (checklists required)
                </summary>
                <div className="mt-4 space-y-4 border-t border-stone-100 pt-4 dark:border-stone-800">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">Universal review</p>
                    <ul className="mt-2 space-y-2">
                      {UNIVERSAL_CHECKLIST_KEYS.map((key) => (
                        <li key={key} className="flex gap-2 text-sm text-stone-800 dark:text-stone-200">
                          <input
                            type="checkbox"
                            id={`${row.id}__uchk__${key}`}
                            name={`chk_u_${key}`}
                            className="mt-0.5 size-4 rounded border-stone-300 dark:border-stone-600"
                          />
                          <label htmlFor={`${row.id}__uchk__${key}`} className="leading-snug">
                            {UNIVERSAL_CHECKLIST_LABELS[key]}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {showConstructionChecklist ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                        Construction review
                      </p>
                      <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-500">
                        Required for Construction Progress and Project Milestone submissions.
                      </p>
                      <ul className="mt-2 space-y-2">
                        {CONSTRUCTION_CHECKLIST_KEYS.map((key) => (
                          <li key={key} className="flex gap-2 text-sm text-stone-800 dark:text-stone-200">
                            <input
                              type="checkbox"
                              id={`${row.id}__cchk__${key}`}
                              name={`chk_c_${key}`}
                              className="mt-0.5 size-4 rounded border-stone-300 dark:border-stone-600"
                            />
                            <label htmlFor={`${row.id}__cchk__${key}`} className="leading-snug">
                              {CONSTRUCTION_CHECKLIST_LABELS[key]}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-[11px] italic text-stone-500 dark:text-stone-500">
                      Construction checklist not required for this category.
                    </p>
                  )}
                </div>
                <button type="submit" disabled={pending} className={`${btnPrimary} mt-5 w-full sm:w-auto`}>
                  Approve for Use
                </button>
              </details>
            </form>
          ) : null}

          {canRequestEdits ? (
            <form
              className="flex min-w-[min(100%,320px)] flex-1 flex-col gap-3 rounded-2xl border border-stone-200/90 bg-[var(--card)] p-5 shadow-sm dark:border-stone-700 dark:bg-stone-950"
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
                className="rounded-xl border border-stone-200/90 px-3 py-2 text-sm shadow-sm dark:border-stone-700 dark:bg-stone-900"
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
            <div className="flex min-w-[min(100%,280px)] flex-col gap-2">
              {row.publishingDestination !== "Public Media Gallery" ? (
                <p className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-100/90">
                  Destination is not Public Media Gallery — publish still records status, but this item will not appear
                  on /media until you change destination and revalidate workflow as needed.
                </p>
              ) : null}
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
            </div>
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
              className="flex min-w-[min(100%,320px)] flex-1 flex-col gap-3 rounded-2xl border border-red-200/70 bg-[var(--card)] p-5 shadow-sm dark:border-red-900/35 dark:bg-stone-950"
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
                className="rounded-xl border border-red-200/90 px-3 py-2 text-sm dark:border-red-900/50 dark:bg-stone-900"
                placeholder="Reason for rejection (internal — not on public media)"
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
        <p className="mt-6 text-[11px] leading-relaxed text-stone-500 dark:text-stone-500">
          Phase 2+: authenticated staff and audit log. Publish remains gated by checklist rules; gallery visibility is
          additionally gated by publishing destination.
        </p>
      </div>
    </article>
  );
}

const dt = "text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400";
const dd = "mt-1 text-sm text-stone-900 dark:text-stone-100";
