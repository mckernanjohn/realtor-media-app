/**
 * In-memory mock persistence (Phase 1). Resets on cold start / serverless instance recycle.
 * FUTURE: Supabase Postgres — submissions + media_items tables, transactions, audit trail.
 */

import type {
  AdminReviewChecklist,
  MediaItem,
  PublicMediaEntry,
  Submission,
  WorkflowStatus,
} from "./types";

const store = {
  submissions: [] as Submission[],
  seeded: false,
};

function nowIso() {
  return new Date().toISOString();
}

function newSubmissionId() {
  return `sub_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function newMediaId() {
  return `med_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function seedIfNeeded() {
  if (store.seeded) return;
  store.seeded = true;

  const t = nowIso();
  const checklist: AdminReviewChecklist = {
    noMlsWatermarkContamination: true,
    noPrivateClientSensitiveContent: true,
    noVisibleAddressIssueUnlessApproved: true,
    propertyProjectAssignmentConfirmed: true,
    brandAppropriateForGreyCollective: true,
    technicalQualityAcceptable: true,
    captionFinalCopyReviewed: true,
    usageRightsRealtorPermissionAcceptable: true,
    approvedForPublicUse: true,
  };

  const pubId = "seed_sub_published";
  const pubMediaId = "seed_med_published";
  store.submissions = [
    {
      id: pubId,
      submitterName: "Taylor Brooks",
      submitterEmail: "t.brooks@example.com",
      brokerageCompany: "Grey Collective Realty",
      propertyName: "Caballo Drive Estate — Main Residence",
      propertyAddress: "4820 N Reserve Way (Caballo Drive Estate parcel)",
      location: "Paradise Valley, AZ",
      projectAssignment: "Caballo Drive Estate",
      intendedUse: "Website",
      status: "Published",
      submittedAt: t,
      reviewedAt: t,
      publishedAt: t,
      internalReviewNotes: "Seeded internal note — must never appear on /media.",
      rejectionOrEditReason: "",
      adminReviewChecklist: checklist,
      updatedAt: t,
      mediaItems: [
        {
          id: pubMediaId,
          submissionId: pubId,
          mediaTitle: "Twilight facade — hero still",
          mediaDescription: "Primary marketing still for the estate landing page.",
          suggestedCaption: "Golden hour at Caballo Drive.",
          finalCaption: "Golden hour at Caballo Drive Estate — offered by Grey Collective.",
          mediaType: "Photo",
          fileName: "caballo-hero.jpg",
          mimeType: "image/jpeg",
          mockSizeLabel: "4.2 MB",
          previewLabel: "CD",
          sortOrder: 0,
          mediaStatus: "Published",
        },
      ],
    },
    {
      id: "seed_sub_ready",
      submitterName: "Jordan Lee",
      submitterEmail: "jordan@example.com",
      brokerageCompany: "Highland Development Partners",
      propertyName: "Hillcrest Penthouse",
      propertyAddress: "8842 E Agave Ridge Place, Penthouse North",
      location: "Scottsdale, AZ",
      projectAssignment: "Hillcrest Development",
      intendedUse: "Social media",
      status: "Ready to Publish",
      submittedAt: t,
      reviewedAt: t,
      publishedAt: null,
      internalReviewNotes: "Awaiting final publish click.",
      rejectionOrEditReason: "",
      adminReviewChecklist: checklist,
      updatedAt: t,
      mediaItems: [
        {
          id: "seed_med_ready",
          submissionId: "seed_sub_ready",
          mediaTitle: "Skyline reel cutdown",
          mediaDescription: "15s vertical for Instagram.",
          suggestedCaption: "Views for days.",
          finalCaption: "Skyline views — Hillcrest Development.",
          mediaType: "Reel",
          fileName: "hillcrest-reel.mp4",
          mimeType: "video/mp4",
          mockSizeLabel: "22 MB",
          previewLabel: "HL",
          sortOrder: 0,
          mediaStatus: "Ready to Publish",
        },
      ],
    },
    {
      id: "seed_sub_approved",
      submitterName: "Sam Rivera",
      submitterEmail: "sam@example.com",
      brokerageCompany: "Rivera Team",
      propertyName: "Via Los Ranchos compound",
      propertyAddress: "12440 N Mountain Preserve Way (Via Los Ranchos Estate)",
      location: "Paradise Valley, AZ",
      projectAssignment: "Via Los Ranchos Estate",
      intendedUse: "Listing support",
      status: "Approved for Use",
      submittedAt: t,
      reviewedAt: t,
      publishedAt: null,
      internalReviewNotes: "Approved internally — not public until publish.",
      rejectionOrEditReason: "",
      adminReviewChecklist: checklist,
      updatedAt: t,
      mediaItems: [
        {
          id: "seed_med_appr",
          submissionId: "seed_sub_approved",
          mediaTitle: "Pool & guest house",
          mediaDescription: "Daytime still set.",
          suggestedCaption: "Resort-like grounds.",
          finalCaption: "",
          mediaType: "Photo",
          fileName: "vlr-pool.webp",
          mimeType: "image/webp",
          mockSizeLabel: "2.1 MB",
          previewLabel: "VR",
          sortOrder: 0,
          mediaStatus: "Approved for Use",
        },
      ],
    },
    {
      id: "seed_sub_needs_review",
      submitterName: "Alex Morgan",
      submitterEmail: "alex@example.com",
      brokerageCompany: "Morgan Estates",
      propertyName: "Mockingbird modern",
      propertyAddress: "7301 E Mockingbird Lane",
      location: "Scottsdale, AZ",
      projectAssignment: "7301 Mockingbird",
      intendedUse: "Construction update",
      status: "Needs Review",
      submittedAt: t,
      reviewedAt: null,
      publishedAt: null,
      internalReviewNotes: "",
      rejectionOrEditReason: "",
      adminReviewChecklist: null,
      updatedAt: t,
      mediaItems: [
        {
          id: "seed_med_nr",
          submissionId: "seed_sub_needs_review",
          mediaTitle: "Site progress — week 12",
          mediaDescription: "Exterior shell complete.",
          suggestedCaption: "Progress update.",
          finalCaption: "",
          mediaType: "Construction Update",
          fileName: "mockingbird-progress.png",
          mimeType: "image/png",
          mockSizeLabel: "900 KB",
          previewLabel: "MB",
          sortOrder: 0,
          mediaStatus: "Needs Review",
        },
      ],
    },
    {
      id: "seed_sub_needs_edits",
      submitterName: "Riley Chen",
      submitterEmail: "riley@example.com",
      brokerageCompany: "Chen Collective",
      propertyName: "New spec — TBD",
      propertyAddress: "TBD lot — Silverleaf vicinity, survey pending",
      location: "Scottsdale, AZ",
      projectAssignment: "Unknown / Needs Admin Assignment",
      intendedUse: "Unknown",
      status: "Needs Edits",
      submittedAt: t,
      reviewedAt: t,
      publishedAt: null,
      internalReviewNotes: "Address TBD blocked publish path.",
      rejectionOrEditReason: "Please confirm full property address and project assignment.",
      adminReviewChecklist: null,
      updatedAt: t,
      mediaItems: [
        {
          id: "seed_med_edits",
          submissionId: "seed_sub_needs_edits",
          mediaTitle: "Placeholder hero",
          mediaDescription: "Temporary asset.",
          suggestedCaption: "TBD",
          finalCaption: "",
          mediaType: "Listing Media",
          fileName: "placeholder.mov",
          mimeType: "video/quicktime",
          mockSizeLabel: "41 MB",
          previewLabel: "RC",
          sortOrder: 0,
          mediaStatus: "Needs Edits",
        },
      ],
    },
    {
      id: "seed_sub_rejected",
      submitterName: "Casey Ng",
      submitterEmail: "casey@example.com",
      brokerageCompany: "Ng & Partners",
      propertyName: "Off-market teaser",
      propertyAddress: "Address withheld — North Scottsdale enclave (off-market)",
      location: "Scottsdale, AZ",
      projectAssignment: "Other / New Property",
      intendedUse: "Internal review",
      status: "Rejected",
      submittedAt: t,
      reviewedAt: t,
      publishedAt: null,
      internalReviewNotes: "",
      rejectionOrEditReason: "MLS sheet visible in frame — resubmit without overlays.",
      adminReviewChecklist: null,
      updatedAt: t,
      mediaItems: [
        {
          id: "seed_med_rej",
          submissionId: "seed_sub_rejected",
          mediaTitle: "Living room pano",
          mediaDescription: "Wide pano — issues noted.",
          suggestedCaption: "Spacious living.",
          finalCaption: "",
          mediaType: "Photo",
          fileName: "living-pano.jpg",
          mimeType: "image/jpeg",
          mockSizeLabel: "6 MB",
          previewLabel: "CN",
          sortOrder: 0,
          mediaStatus: "Rejected",
        },
      ],
    },
    {
      id: "seed_sub_archived",
      submitterName: "Morgan Blake",
      submitterEmail: "morgan@example.com",
      brokerageCompany: "Blake Group",
      propertyName: "Legacy listing — withdrawn",
      propertyAddress: "4621 N Dawn Vista Lane",
      location: "Scottsdale, AZ",
      projectAssignment: "Other / New Property",
      intendedUse: "Website",
      status: "Archived",
      submittedAt: t,
      reviewedAt: t,
      publishedAt: null,
      internalReviewNotes: "Withdrawn from marketing.",
      rejectionOrEditReason: "",
      adminReviewChecklist: null,
      updatedAt: t,
      mediaItems: [
        {
          id: "seed_med_arch",
          submissionId: "seed_sub_archived",
          mediaTitle: "Canyon view terrace",
          mediaDescription: "Archived mock asset — desert modern terrace set.",
          suggestedCaption: "Desert modern living.",
          finalCaption: "",
          mediaType: "Photo",
          fileName: "deck-view.jpg",
          mimeType: "image/jpeg",
          mockSizeLabel: "3.3 MB",
          previewLabel: "MB",
          sortOrder: 0,
          mediaStatus: "Archived",
        },
      ],
    },
  ];
}

export function listSubmissions(): Submission[] {
  seedIfNeeded();
  return [...store.submissions].sort(
    (a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt),
  );
}

export function listSubmissionsFiltered(status: WorkflowStatus | "All"): Submission[] {
  const all = listSubmissions();
  if (status === "All") return all;
  return all.filter((s) => s.status === status);
}

export function getSubmission(id: string): Submission | undefined {
  seedIfNeeded();
  return store.submissions.find((s) => s.id === id);
}

/** Public gallery: Published submission × Published media only — no PII beyond what’s safe on-site. */
export function listPublicMediaEntries(): PublicMediaEntry[] {
  seedIfNeeded();
  const out: PublicMediaEntry[] = [];
  for (const sub of store.submissions) {
    if (sub.status !== "Published" || !sub.publishedAt) continue;
    for (const m of sub.mediaItems) {
      if (m.mediaStatus !== "Published") continue;
      const caption = m.finalCaption.trim() || m.suggestedCaption.trim();
      out.push({
        id: `${sub.id}::${m.id}`,
        propertyName: sub.propertyName,
        projectName: sub.projectAssignment,
        location: sub.location,
        mediaTitle: m.mediaTitle,
        finalCaption: caption,
        mediaDescription: m.mediaDescription,
        mediaType: m.mediaType,
        publishedAt: sub.publishedAt,
        previewLabel: m.previewLabel,
      });
    }
  }
  return out.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export function replaceSubmission(next: Submission) {
  seedIfNeeded();
  const idx = store.submissions.findIndex((s) => s.id === next.id);
  if (idx === -1) {
    store.submissions = [next, ...store.submissions];
    return next;
  }
  store.submissions = [...store.submissions.slice(0, idx), next, ...store.submissions.slice(idx + 1)];
  return next;
}

export function addSubmissionDraft(input: Omit<Submission, "id" | "submittedAt" | "updatedAt" | "mediaItems"> & { mediaItems: Omit<MediaItem, "id" | "submissionId">[] }) {
  seedIfNeeded();
  const iso = nowIso();
  const sid = newSubmissionId();
  const mediaItems: MediaItem[] = input.mediaItems.map((mi, i) => ({
    ...mi,
    id: newMediaId(),
    submissionId: sid,
    sortOrder: i,
  }));
  const row: Submission = {
    ...input,
    id: sid,
    submittedAt: iso,
    updatedAt: iso,
    mediaItems,
  };
  store.submissions = [row, ...store.submissions];
  return row;
}

function checklistComplete(c: AdminReviewChecklist | null): c is AdminReviewChecklist {
  if (!c) return false;
  return (
    c.noMlsWatermarkContamination &&
    c.noPrivateClientSensitiveContent &&
    c.noVisibleAddressIssueUnlessApproved &&
    c.propertyProjectAssignmentConfirmed &&
    c.brandAppropriateForGreyCollective &&
    c.technicalQualityAcceptable &&
    c.captionFinalCopyReviewed &&
    c.usageRightsRealtorPermissionAcceptable &&
    c.approvedForPublicUse
  );
}

export function submissionAllowsPublish(sub: Submission): boolean {
  if (sub.status === "Ready to Publish") return true;
  if (sub.status === "Approved for Use" && checklistComplete(sub.adminReviewChecklist)) return true;
  return false;
}
