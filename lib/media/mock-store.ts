/**
 * In-memory mock persistence (Phase 2). Resets on cold start / serverless instance recycle.
 * FUTURE: Supabase Postgres — submissions + media_items tables, transactions, audit trail.
 */

import type {
  AdminReviewChecklist,
  MediaItem,
  PublicMediaEntry,
  Submission,
  WorkflowStatus,
} from "./types";
import {
  emptyAdminReviewFlags,
  isChecklistComplete,
  PUBLIC_SAFE_SUBMISSION_CATEGORIES,
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

function fullChecklist(): AdminReviewChecklist {
  return {
    universal: {
      correctProjectAssigned: true,
      submitterTypeReviewed: true,
      submissionCategoryReviewed: true,
      mediaQualityAcceptable: true,
      captionNotesReviewed: true,
      noPrivateClientSensitiveVisible: true,
      approvedForSelectedDestination: true,
    },
    construction: {
      noUnsafeJobsiteVisible: true,
      noTradeVendorIssueVisible: true,
      noSensitiveAddressPermitPlanDetail: true,
      progressPhaseAccurate: true,
      internalOnlyDefaultConsidered: true,
    },
  };
}

function seedIfNeeded() {
  if (store.seeded) return;
  store.seeded = true;

  const t = nowIso();
  const checklist = fullChecklist();

  store.submissions = [
    // 1. Realtor listing — Public Media Gallery, Published → /media
    {
      id: "seed_sub_realtor_pub",
      submitterName: "Taylor Brooks",
      submitterEmail: "t.brooks@example.com",
      companyTeam: "Grey Collective Realty",
      submitterType: "Realtor / Broker",
      submissionCategory: "Broker / Listing Media",
      publishingDestination: "Public Media Gallery",
      projectPhase: "Completed",
      propertyArea: "Exterior",
      progressDate: "2026-04-18",
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
      adminReviewFlags: emptyAdminReviewFlags(),
      updatedAt: t,
      mediaItems: [
        {
          id: "seed_med_realtor_pub",
          submissionId: "seed_sub_realtor_pub",
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
    // 2. Superintendent — Internal Progress Log, Approved / Ready — not /media
    {
      id: "seed_sub_superintendent",
      submitterName: "Chris Vance",
      submitterEmail: "c.vance@example.com",
      companyTeam: "Grey Collective Field Ops",
      submitterType: "Superintendent",
      submissionCategory: "Construction Progress",
      publishingDestination: "Internal Progress Log",
      projectPhase: "Framing",
      propertyArea: "Jobsite / general",
      progressDate: "2026-05-01",
      propertyName: "7301 Mockingbird — framing progression",
      propertyAddress: "7301 E Mockingbird Lane",
      location: "Scottsdale, AZ",
      projectAssignment: "7301 Mockingbird",
      intendedUse: "Construction update",
      status: "Ready to Publish",
      submittedAt: t,
      reviewedAt: t,
      publishedAt: null,
      internalReviewNotes: "Weekly superintendent upload — internal routing only.",
      rejectionOrEditReason: "",
      adminReviewChecklist: checklist,
      adminReviewFlags: { ...emptyAdminReviewFlags(), constructionProgressOnlyNotMarketingSafe: true },
      updatedAt: t,
      mediaItems: [
        {
          id: "seed_med_super",
          submissionId: "seed_sub_superintendent",
          mediaTitle: "Level 2 deck framing — north elevation",
          mediaDescription: "Progress documentation for weekly internal log.",
          suggestedCaption: "Framing progress week 18.",
          finalCaption: "",
          mediaType: "Construction Update",
          fileName: "mockingbird-framing.jpg",
          mimeType: "image/jpeg",
          mockSizeLabel: "3.1 MB",
          previewLabel: "CV",
          sortOrder: 0,
          mediaStatus: "Ready to Publish",
        },
      ],
    },
    // 3. Project Manager milestone — Internal Progress Log, Needs Review
    {
      id: "seed_sub_pm_milestone",
      submitterName: "Jordan Lee",
      submitterEmail: "jordan@example.com",
      companyTeam: "Highland Development Partners",
      submitterType: "Project Manager",
      submissionCategory: "Project Milestone",
      publishingDestination: "Internal Progress Log",
      projectPhase: "Mechanical / Electrical / Plumbing",
      propertyArea: "Mechanical room",
      progressDate: "2026-04-28",
      propertyName: "Hillcrest — MEP rough-in sign-off",
      propertyAddress: "8842 E Agave Ridge Place, Penthouse North",
      location: "Scottsdale, AZ",
      projectAssignment: "Hillcrest Development",
      intendedUse: "Internal review",
      status: "Needs Review",
      submittedAt: t,
      reviewedAt: null,
      publishedAt: null,
      internalReviewNotes: "",
      rejectionOrEditReason: "",
      adminReviewChecklist: null,
      adminReviewFlags: emptyAdminReviewFlags(),
      updatedAt: t,
      mediaItems: [
        {
          id: "seed_med_pm",
          submissionId: "seed_sub_pm_milestone",
          mediaTitle: "MEP rough-in — milestone photo set",
          mediaDescription: "Rough-in complete prior to drywall close.",
          suggestedCaption: "MEP milestone.",
          finalCaption: "",
          mediaType: "Photo",
          fileName: "hillcrest-mep.jpg",
          mimeType: "image/jpeg",
          mockSizeLabel: "2.4 MB",
          previewLabel: "HL",
          sortOrder: 0,
          mediaStatus: "Needs Review",
        },
      ],
    },
    // 4. Marketing — Social Media Queue, Ready to Publish
    {
      id: "seed_sub_marketing_social",
      submitterName: "Sam Rivera",
      submitterEmail: "sam@example.com",
      companyTeam: "Rivera Creative",
      submitterType: "Marketing Team",
      submissionCategory: "Social Media Content",
      publishingDestination: "Social Media Queue",
      projectPhase: "Not applicable",
      propertyArea: "Pool / exterior living",
      progressDate: "2026-04-22",
      propertyName: "Via Los Ranchos — pool pavilion reel",
      propertyAddress: "12440 N Mountain Preserve Way",
      location: "Paradise Valley, AZ",
      projectAssignment: "Via Los Ranchos Estate",
      intendedUse: "Social media",
      status: "Ready to Publish",
      submittedAt: t,
      reviewedAt: t,
      publishedAt: null,
      internalReviewNotes: "Queued for social scheduler — not public gallery.",
      rejectionOrEditReason: "",
      adminReviewChecklist: checklist,
      adminReviewFlags: emptyAdminReviewFlags(),
      updatedAt: t,
      mediaItems: [
        {
          id: "seed_med_social",
          submissionId: "seed_sub_marketing_social",
          mediaTitle: "15s vertical — pool pavilion dusk",
          mediaDescription: "Short-form clip for approved social channels.",
          suggestedCaption: "Desert evenings at Via Los Ranchos.",
          finalCaption: "Evening light at Via Los Ranchos Estate.",
          mediaType: "Reel",
          fileName: "vlr-pool-reel.mp4",
          mimeType: "video/mp4",
          mockSizeLabel: "19 MB",
          previewLabel: "VL",
          sortOrder: 0,
          mediaStatus: "Ready to Publish",
        },
      ],
    },
    // 5. Photographer — Public Media Gallery, Published → /media
    {
      id: "seed_sub_photo_finished",
      submitterName: "Alex Morgan",
      submitterEmail: "alex@example.com",
      companyTeam: "Morgan Visuals",
      submitterType: "Photographer / Videographer",
      submissionCategory: "Finished Project Media",
      publishingDestination: "Public Media Gallery",
      projectPhase: "Completed",
      propertyArea: "Interior",
      progressDate: "2026-03-15",
      propertyName: "Silverleaf Ridge Villa — great room",
      propertyAddress: "North Scottsdale, Silverleaf enclave (marketing address)",
      location: "Scottsdale, AZ",
      projectAssignment: "Silverleaf Ridge Villa",
      intendedUse: "Website",
      status: "Published",
      submittedAt: t,
      reviewedAt: t,
      publishedAt: t,
      internalReviewNotes: "Architectural photography — cleared for public gallery.",
      rejectionOrEditReason: "",
      adminReviewChecklist: checklist,
      adminReviewFlags: emptyAdminReviewFlags(),
      updatedAt: t,
      mediaItems: [
        {
          id: "seed_med_photo",
          submissionId: "seed_sub_photo_finished",
          mediaTitle: "Great room — finished interiors",
          mediaDescription: "Editorial still for portfolio and public gallery.",
          suggestedCaption: "Tailored desert modern living.",
          finalCaption: "Silverleaf Ridge Villa — great room, completed by Grey Collective.",
          mediaType: "Photo",
          fileName: "slv-great-room.webp",
          mimeType: "image/webp",
          mockSizeLabel: "5.6 MB",
          previewLabel: "SR",
          sortOrder: 0,
          mediaStatus: "Published",
        },
      ],
    },
    // 6. Website hero — Website Project Page, Published — not /media
    {
      id: "seed_sub_website_hero",
      submitterName: "Riley Chen",
      submitterEmail: "riley@example.com",
      companyTeam: "Chen Collective",
      submitterType: "Internal Team",
      submissionCategory: "Finished Project Media",
      publishingDestination: "Website Project Page",
      projectPhase: "Completed",
      propertyArea: "Exterior",
      progressDate: "2026-04-10",
      propertyName: "Caballo Drive — project page hero",
      propertyAddress: "4820 N Reserve Way",
      location: "Paradise Valley, AZ",
      projectAssignment: "Caballo Drive Estate",
      intendedUse: "Website",
      status: "Published",
      submittedAt: t,
      reviewedAt: t,
      publishedAt: t,
      internalReviewNotes: "Published to website project page only.",
      rejectionOrEditReason: "",
      adminReviewChecklist: checklist,
      adminReviewFlags: emptyAdminReviewFlags(),
      updatedAt: t,
      mediaItems: [
        {
          id: "seed_med_webhero",
          submissionId: "seed_sub_website_hero",
          mediaTitle: "Hero still — primary elevation",
          mediaDescription: "Wide hero for Caballo project detail page.",
          suggestedCaption: "Desert modern elevation.",
          finalCaption: "Caballo Drive Estate — primary elevation.",
          mediaType: "Photo",
          fileName: "caballo-hero-wide.jpg",
          mimeType: "image/jpeg",
          mockSizeLabel: "6.2 MB",
          previewLabel: "CD",
          sortOrder: 0,
          mediaStatus: "Published",
        },
      ],
    },
    // 7. Client / investor — Published but not public gallery
    {
      id: "seed_sub_investor_safe",
      submitterName: "Morgan Blake",
      submitterEmail: "morgan@example.com",
      companyTeam: "Blake Group",
      submitterType: "Project Manager",
      submissionCategory: "Construction Progress",
      publishingDestination: "Client / Investor Portal",
      projectPhase: "Drywall",
      propertyArea: "Interior",
      progressDate: "2026-04-25",
      propertyName: "Hillcrest — investor-safe progress still",
      propertyAddress: "8842 E Agave Ridge Place",
      location: "Scottsdale, AZ",
      projectAssignment: "Hillcrest Development",
      intendedUse: "Internal review",
      status: "Published",
      submittedAt: t,
      reviewedAt: t,
      publishedAt: t,
      internalReviewNotes: "Sanitized for investor portal — not marketing gallery.",
      rejectionOrEditReason: "",
      adminReviewChecklist: checklist,
      adminReviewFlags: emptyAdminReviewFlags(),
      updatedAt: t,
      mediaItems: [
        {
          id: "seed_med_investor",
          submissionId: "seed_sub_investor_safe",
          mediaTitle: "Drywall close — living volume",
          mediaDescription: "Progress update suitable for client portal distribution.",
          suggestedCaption: "Interior progression.",
          finalCaption: "Hillcrest Development — interior progression, April 2026.",
          mediaType: "Photo",
          fileName: "hillcrest-drywall.jpg",
          mimeType: "image/jpeg",
          mockSizeLabel: "2.9 MB",
          previewLabel: "HB",
          sortOrder: 0,
          mediaStatus: "Published",
        },
      ],
    },
    // 8. Rejected — watermark / private content
    {
      id: "seed_sub_rejected",
      submitterName: "Casey Ng",
      submitterEmail: "casey@example.com",
      companyTeam: "Ng & Partners",
      submitterType: "Realtor / Broker",
      submissionCategory: "Broker / Listing Media",
      publishingDestination: "Not Set",
      projectPhase: "Not applicable",
      propertyArea: "Interior",
      progressDate: "2026-04-12",
      propertyName: "Off-market teaser — living pano",
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
      adminReviewFlags: { ...emptyAdminReviewFlags(), mlsWatermarkIssue: true, privateClientSensitiveContent: true },
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
    // 9. Archived
    {
      id: "seed_sub_archived",
      submitterName: "Pat Ellis",
      submitterEmail: "pat@example.com",
      companyTeam: "Ellis Residential",
      submitterType: "Realtor / Broker",
      submissionCategory: "Broker / Listing Media",
      publishingDestination: "Not Set",
      projectPhase: "Completed",
      propertyArea: "Exterior",
      progressDate: "2025-11-02",
      propertyName: "Legacy listing — withdrawn",
      propertyAddress: "4621 N Dawn Vista Lane",
      location: "Scottsdale, AZ",
      projectAssignment: "Other / New Property",
      intendedUse: "Listing support",
      status: "Archived",
      submittedAt: t,
      reviewedAt: t,
      publishedAt: null,
      internalReviewNotes: "Withdrawn from marketing.",
      rejectionOrEditReason: "",
      adminReviewChecklist: null,
      adminReviewFlags: emptyAdminReviewFlags(),
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
          previewLabel: "PE",
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

/**
 * Public marketing gallery: Published + Public Media Gallery only.
 * No PII; categories shown only when public-safe labels apply.
 */
export function listPublicMediaEntries(): PublicMediaEntry[] {
  seedIfNeeded();
  const out: PublicMediaEntry[] = [];
  for (const sub of store.submissions) {
    if (sub.status !== "Published" || !sub.publishedAt) continue;
    if (sub.publishingDestination !== "Public Media Gallery") continue;
    for (const m of sub.mediaItems) {
      if (m.mediaStatus !== "Published") continue;
      const caption = m.finalCaption.trim() || m.suggestedCaption.trim();
      const categoryLabel = PUBLIC_SAFE_SUBMISSION_CATEGORIES.includes(sub.submissionCategory)
        ? sub.submissionCategory
        : undefined;
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
        submissionCategoryLabel: categoryLabel,
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

export function addSubmissionDraft(
  input: Omit<Submission, "id" | "submittedAt" | "updatedAt" | "mediaItems"> & {
    mediaItems: Omit<MediaItem, "id" | "submissionId">[];
  },
) {
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

export function submissionAllowsPublish(sub: Submission): boolean {
  if (sub.status === "Ready to Publish") return true;
  if (sub.status === "Approved for Use" && isChecklistComplete(sub.adminReviewChecklist, sub.submissionCategory)) {
    return true;
  }
  return false;
}
