"use server";

/**
 * Server mutations for Phase 1 mock workflow.
 * FUTURE: swap to Supabase RPC / edge functions + Storage webhooks; enforce admin auth here.
 */

import { revalidatePath } from "next/cache";

import {
  addSubmissionDraft,
  getSubmission,
  replaceSubmission,
  submissionAllowsPublish,
} from "@/lib/media/mock-store";
import { canonicalMimeForIntake, isMimeAllowedForMockUpload } from "@/lib/media/mock-validation";
import type {
  AdminReviewChecklist,
  IntendedUseOption,
  MediaItem,
  MediaTypeOption,
  ProjectAssignment,
  Submission,
  WorkflowStatus,
} from "@/lib/media/types";
import {
  INTENDED_USE_OPTIONS,
  MEDIA_TYPE_OPTIONS,
  PROJECT_OPTIONS,
  REVIEW_CHECKLIST_KEYS,
} from "@/lib/media/types";

function str(fd: FormData, key: string) {
  return (fd.get(key) ?? "").toString().trim();
}

function nowIso() {
  return new Date().toISOString();
}

export type ActionResult = { ok: true } | { ok: false; error: string };

function assertProject(v: string): v is ProjectAssignment {
  return (PROJECT_OPTIONS as readonly string[]).includes(v);
}

function assertIntended(v: string): v is IntendedUseOption {
  return (INTENDED_USE_OPTIONS as readonly string[]).includes(v);
}

function assertMediaType(v: string): v is MediaTypeOption {
  return (MEDIA_TYPE_OPTIONS as readonly string[]).includes(v);
}

function parseChecklist(fd: FormData): AdminReviewChecklist {
  const o = {} as AdminReviewChecklist;
  for (const key of REVIEW_CHECKLIST_KEYS) {
    o[key] = fd.get(`chk_${key}`) === "on";
  }
  return o;
}

function checklistComplete(c: AdminReviewChecklist) {
  return REVIEW_CHECKLIST_KEYS.every((k) => c[k] === true);
}

function syncAllMediaStatus(sub: Submission, status: WorkflowStatus): MediaItem[] {
  return sub.mediaItems.map((m) => ({ ...m, mediaStatus: status }));
}

function withTimestamps(
  sub: Submission,
  patch: Partial<Submission>,
  opts?: { touchReviewed?: boolean; touchPublished?: boolean; clearPublished?: boolean },
): Submission {
  let next: Submission = { ...sub, ...patch, updatedAt: nowIso() };
  if (opts?.touchReviewed && !next.reviewedAt) next = { ...next, reviewedAt: nowIso() };
  if (opts?.touchPublished) next = { ...next, publishedAt: nowIso() };
  if (opts?.clearPublished) next = { ...next, publishedAt: null };
  return next;
}

function patchMedia(sub: Submission, mediaId: string, patch: Partial<MediaItem>): Submission {
  return {
    ...sub,
    mediaItems: sub.mediaItems.map((m) => (m.id === mediaId ? { ...m, ...patch } : m)),
    updatedAt: nowIso(),
  };
}

export async function submitIntakeAction(fd: FormData): Promise<ActionResult> {
  const submitterName = str(fd, "submitterName");
  const submitterEmail = str(fd, "submitterEmail");
  const brokerageCompany = str(fd, "brokerageCompany");
  const propertyName = str(fd, "propertyName");
  const propertyAddress = str(fd, "propertyAddress");
  const location = str(fd, "location");
  const projectAssignment = str(fd, "projectAssignment");
  const intendedUse = str(fd, "intendedUse");
  const mediaTitle = str(fd, "mediaTitle");
  const mediaDescription = str(fd, "mediaDescription");
  const suggestedCaption = str(fd, "suggestedCaption");
  const mediaType = str(fd, "mediaType");
  const fileName = str(fd, "mockFileDisplayName");
  const mimeTypeRaw = str(fd, "mockFileMimeType");
  const mockSizeLabel = str(fd, "mockFileSizeLabel");
  const previewLabel = str(fd, "mockFilePreviewLabel").slice(0, 4).toUpperCase() || "GC";
  const permission = fd.get("permissionConfirm") === "on";

  if (!submitterName) return { ok: false, error: "Submitter name is required." };
  if (!submitterEmail || !submitterEmail.includes("@")) {
    return { ok: false, error: "A valid submitter email is required." };
  }
  if (!brokerageCompany) return { ok: false, error: "Brokerage / company is required." };
  if (!propertyName) return { ok: false, error: "Property name is required." };
  if (!propertyAddress) return { ok: false, error: "Property address is required." };
  if (!location) return { ok: false, error: "Location is required." };
  if (!assertProject(projectAssignment)) return { ok: false, error: "Invalid project assignment." };
  if (!assertIntended(intendedUse)) return { ok: false, error: "Invalid intended use." };
  if (!mediaTitle) return { ok: false, error: "Media title is required." };
  if (!mediaDescription) return { ok: false, error: "Media description is required." };
  if (!assertMediaType(mediaType)) return { ok: false, error: "Invalid media type." };
  if (!fileName) return { ok: false, error: "Please select a mock file." };
  if (!permission) return { ok: false, error: "Permission confirmation is required." };

  const effectiveMime = canonicalMimeForIntake(fileName, mimeTypeRaw);
  if (!effectiveMime || !isMimeAllowedForMockUpload(effectiveMime)) {
    return { ok: false, error: "Invalid or disallowed mock file type on server check." };
  }

  addSubmissionDraft({
    submitterName,
    submitterEmail,
    brokerageCompany,
    propertyName,
    propertyAddress,
    location,
    projectAssignment,
    intendedUse,
    status: "Submitted",
    reviewedAt: null,
    publishedAt: null,
    internalReviewNotes: "",
    rejectionOrEditReason: "",
    adminReviewChecklist: null,
    mediaItems: [
      {
        mediaTitle,
        mediaDescription,
        suggestedCaption,
        finalCaption: "",
        mediaType,
        fileName,
        mimeType: effectiveMime,
        mockSizeLabel: mockSizeLabel || "—",
        previewLabel,
        sortOrder: 0,
        mediaStatus: "Submitted",
      },
    ],
  });

  revalidatePath("/admin");
  revalidatePath("/media");
  return { ok: true };
}

/** FUTURE: persist via Supabase; today replaces in-memory row. */
export async function saveInternalNotesAction(fd: FormData): Promise<ActionResult> {
  const id = str(fd, "submissionId");
  const internalReviewNotes = str(fd, "internalReviewNotes");
  if (!id) return { ok: false, error: "Missing submission id." };
  const sub = getSubmission(id);
  if (!sub) return { ok: false, error: "Submission not found." };
  replaceSubmission(withTimestamps(sub, { internalReviewNotes }));
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveFinalCaptionAction(fd: FormData): Promise<ActionResult> {
  const submissionId = str(fd, "submissionId");
  const mediaId = str(fd, "mediaId");
  const finalCaption = str(fd, "finalCaption");
  if (!submissionId || !mediaId) return { ok: false, error: "Missing ids." };
  const sub = getSubmission(submissionId);
  if (!sub) return { ok: false, error: "Submission not found." };
  if (!sub.mediaItems.some((m) => m.id === mediaId)) {
    return { ok: false, error: "Media item not found." };
  }
  replaceSubmission(patchMedia(sub, mediaId, { finalCaption }));
  revalidatePath("/admin");
  revalidatePath("/media");
  return { ok: true };
}

export async function markNeedsReviewAction(fd: FormData): Promise<ActionResult> {
  const id = str(fd, "submissionId");
  if (!id) return { ok: false, error: "Missing submission id." };
  const sub = getSubmission(id);
  if (!sub) return { ok: false, error: "Submission not found." };
  if (sub.status !== "Submitted") {
    return { ok: false, error: "Only Submitted items can move to Needs Review." };
  }
  replaceSubmission(
    withTimestamps(
      sub,
      { status: "Needs Review", mediaItems: syncAllMediaStatus(sub, "Needs Review") },
      { touchReviewed: true },
    ),
  );
  revalidatePath("/admin");
  return { ok: true };
}

export async function approveForUseAction(fd: FormData): Promise<ActionResult> {
  const id = str(fd, "submissionId");
  if (!id) return { ok: false, error: "Missing submission id." };
  const sub = getSubmission(id);
  if (!sub) return { ok: false, error: "Submission not found." };
  if (sub.status !== "Submitted" && sub.status !== "Needs Review") {
    return { ok: false, error: "Approve for Use is only available from Submitted or Needs Review." };
  }
  const checklist = parseChecklist(fd);
  if (!checklistComplete(checklist)) {
    return { ok: false, error: "Complete the full checklist before approving for use." };
  }
  replaceSubmission(
    withTimestamps(
      sub,
      {
        status: "Approved for Use",
        adminReviewChecklist: checklist,
        rejectionOrEditReason: "",
        mediaItems: syncAllMediaStatus(sub, "Approved for Use"),
      },
      { touchReviewed: true },
    ),
  );
  revalidatePath("/admin");
  revalidatePath("/media");
  return { ok: true };
}

export async function requestEditsAction(fd: FormData): Promise<ActionResult> {
  const id = str(fd, "submissionId");
  const reason = str(fd, "rejectionOrEditReason");
  if (!id) return { ok: false, error: "Missing submission id." };
  if (!reason) return { ok: false, error: "Edit / feedback reason is required." };
  const sub = getSubmission(id);
  if (!sub) return { ok: false, error: "Submission not found." };
  const allowed: Submission["status"][] = [
    "Submitted",
    "Needs Review",
    "Approved for Use",
    "Ready to Publish",
  ];
  if (!allowed.includes(sub.status)) {
    return { ok: false, error: "Request Edits is not available for this status." };
  }
  replaceSubmission(
    withTimestamps(
      sub,
      {
        status: "Needs Edits",
        rejectionOrEditReason: reason,
        mediaItems: syncAllMediaStatus(sub, "Needs Edits"),
      },
      { touchReviewed: true },
    ),
  );
  revalidatePath("/admin");
  revalidatePath("/media");
  return { ok: true };
}

export async function markReadyToPublishAction(fd: FormData): Promise<ActionResult> {
  const id = str(fd, "submissionId");
  if (!id) return { ok: false, error: "Missing submission id." };
  const sub = getSubmission(id);
  if (!sub) return { ok: false, error: "Submission not found." };
  if (sub.status !== "Approved for Use" && sub.status !== "Needs Edits") {
    return { ok: false, error: "Mark Ready to Publish from Approved for Use or Needs Edits only." };
  }
  replaceSubmission(
    withTimestamps(
      sub,
      {
        status: "Ready to Publish",
        rejectionOrEditReason: "",
        mediaItems: syncAllMediaStatus(sub, "Ready to Publish"),
      },
      { touchReviewed: true },
    ),
  );
  revalidatePath("/admin");
  revalidatePath("/media");
  return { ok: true };
}

export async function publishAction(fd: FormData): Promise<ActionResult> {
  const id = str(fd, "submissionId");
  if (!id) return { ok: false, error: "Missing submission id." };
  const sub = getSubmission(id);
  if (!sub) return { ok: false, error: "Submission not found." };
  if (!submissionAllowsPublish(sub)) {
    return {
      ok: false,
      error:
        "Publish requires Ready to Publish, or Approved for Use with a complete checklist (preferred path goes through Ready to Publish).",
    };
  }
  replaceSubmission(
    withTimestamps(
      sub,
      { status: "Published", mediaItems: syncAllMediaStatus(sub, "Published") },
      { touchReviewed: true, touchPublished: true },
    ),
  );
  revalidatePath("/admin");
  revalidatePath("/media");
  return { ok: true };
}

export async function rejectAction(fd: FormData): Promise<ActionResult> {
  const id = str(fd, "submissionId");
  const reason = str(fd, "rejectionOrEditReason");
  if (!id) return { ok: false, error: "Missing submission id." };
  if (!reason) return { ok: false, error: "Rejection reason is required." };
  const sub = getSubmission(id);
  if (!sub) return { ok: false, error: "Submission not found." };
  if (sub.status === "Published" || sub.status === "Archived" || sub.status === "Rejected") {
    return { ok: false, error: "Cannot reject from this status." };
  }
  replaceSubmission(
    withTimestamps(
      sub,
      {
        status: "Rejected",
        rejectionOrEditReason: reason,
        mediaItems: syncAllMediaStatus(sub, "Rejected"),
      },
      { touchReviewed: true },
    ),
  );
  revalidatePath("/admin");
  revalidatePath("/media");
  return { ok: true };
}

export async function archiveAction(fd: FormData): Promise<ActionResult> {
  const id = str(fd, "submissionId");
  if (!id) return { ok: false, error: "Missing submission id." };
  const sub = getSubmission(id);
  if (!sub) return { ok: false, error: "Submission not found." };
  if (sub.status === "Archived") return { ok: false, error: "Already archived." };
  replaceSubmission(
    withTimestamps(
      sub,
      { status: "Archived", mediaItems: syncAllMediaStatus(sub, "Archived") },
      { touchReviewed: true },
    ),
  );
  revalidatePath("/admin");
  revalidatePath("/media");
  return { ok: true };
}

export async function unpublishAction(fd: FormData): Promise<ActionResult> {
  const id = str(fd, "submissionId");
  if (!id) return { ok: false, error: "Missing submission id." };
  const sub = getSubmission(id);
  if (!sub) return { ok: false, error: "Submission not found." };
  if (sub.status !== "Published") {
    return { ok: false, error: "Only Published submissions can be unpublished." };
  }
  replaceSubmission(
    withTimestamps(
      sub,
      {
        status: "Approved for Use",
        mediaItems: syncAllMediaStatus(sub, "Approved for Use"),
      },
      { clearPublished: true },
    ),
  );
  revalidatePath("/admin");
  revalidatePath("/media");
  return { ok: true };
}
