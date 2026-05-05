/**
 * Grey Collective — Media Intake (Phase 2, mock/local only).
 *
 * Future integration points (replace mock-store + forms):
 * - Supabase database: submissions + media_items tables, RLS, realtime admin queue
 * - Supabase Storage: private intake bucket, signed URLs, virus scan hooks, transcoding
 * - Admin authentication: protected /admin, role claims, audit log
 * - Public media API: read-only edge/cache for /media, CDN-friendly payloads
 * - Notifications: email/Slack on Needs Edits, Ready to Publish, Published
 * - Vercel production hardening: rate limits, WAF, ISR/revalidation strategy, monitoring
 */

/** Canonical workflow / visibility states (submission + per-media). */
export type WorkflowStatus =
  | "Submitted"
  | "Needs Review"
  | "Approved for Use"
  | "Needs Edits"
  | "Ready to Publish"
  | "Published"
  | "Rejected"
  | "Archived";

export type SubmitterType =
  | "Realtor / Broker"
  | "Superintendent"
  | "Project Manager"
  | "Internal Team"
  | "Marketing Team"
  | "Photographer / Videographer"
  | "Other";

export type SubmissionCategory =
  | "Broker / Listing Media"
  | "Construction Progress"
  | "Project Milestone"
  | "Finished Project Media"
  | "Social Media Content"
  | "Internal Documentation"
  | "Other";

/** Admin-only: where published work is routed; submitters do not set this. */
export type PublishingDestination =
  | "Public Media Gallery"
  | "Internal Progress Log"
  | "Client / Investor Portal"
  | "Social Media Queue"
  | "Website Project Page"
  | "Not Set";

export type ProjectPhase =
  | "Pre-construction"
  | "Site work"
  | "Foundation"
  | "Framing"
  | "Mechanical / Electrical / Plumbing"
  | "Drywall"
  | "Interior finishes"
  | "Exterior finishes"
  | "Landscape / hardscape"
  | "Final punch"
  | "Completed"
  | "Not applicable";

export type PropertyArea =
  | "Exterior"
  | "Interior"
  | "Kitchen"
  | "Primary suite"
  | "Bathroom"
  | "Garage"
  | "Pool / exterior living"
  | "Landscape"
  | "Mechanical room"
  | "Jobsite / general"
  | "Other"
  | "Not applicable";

export type ProjectAssignment =
  | "Caballo Drive Estate"
  | "Hillcrest Development"
  | "Via Los Ranchos Estate"
  | "7301 Mockingbird"
  | "Silverleaf Ridge Villa"
  | "Other / New Property"
  | "Unknown / Needs Admin Assignment";

export type IntendedUseOption =
  | "Website"
  | "Social media"
  | "Listing support"
  | "Construction update"
  | "Internal review"
  | "Unknown";

export type MediaTypeOption =
  | "Photo"
  | "Video"
  | "Reel"
  | "Construction Update"
  | "Listing Media";

/** Universal review — required before Approve for Use. */
export type UniversalReviewChecklist = {
  correctProjectAssigned: boolean;
  submitterTypeReviewed: boolean;
  submissionCategoryReviewed: boolean;
  mediaQualityAcceptable: boolean;
  captionNotesReviewed: boolean;
  noPrivateClientSensitiveVisible: boolean;
  approvedForSelectedDestination: boolean;
};

/** Construction / jobsite — required when submission category warrants (see needsConstructionReviewChecklist). */
export type ConstructionReviewChecklist = {
  noUnsafeJobsiteVisible: boolean;
  noTradeVendorIssueVisible: boolean;
  noSensitiveAddressPermitPlanDetail: boolean;
  progressPhaseAccurate: boolean;
  internalOnlyDefaultConsidered: boolean;
};

export type AdminReviewChecklist = {
  universal: UniversalReviewChecklist;
  construction: ConstructionReviewChecklist;
};

export type AdminReviewFlags = {
  mlsWatermarkIssue: boolean;
  privateClientSensitiveContent: boolean;
  unsafeJobsiteVisible: boolean;
  tradeVendorIssueVisible: boolean;
  addressShouldStayPrivate: boolean;
  lowQualityBlurry: boolean;
  wrongProjectAssignment: boolean;
  captionNeedsWork: boolean;
  notBrandAppropriate: boolean;
  constructionProgressOnlyNotMarketingSafe: boolean;
};

export const UNIVERSAL_CHECKLIST_KEYS = [
  "correctProjectAssigned",
  "submitterTypeReviewed",
  "submissionCategoryReviewed",
  "mediaQualityAcceptable",
  "captionNotesReviewed",
  "noPrivateClientSensitiveVisible",
  "approvedForSelectedDestination",
] as const satisfies readonly (keyof UniversalReviewChecklist)[];

export const CONSTRUCTION_CHECKLIST_KEYS = [
  "noUnsafeJobsiteVisible",
  "noTradeVendorIssueVisible",
  "noSensitiveAddressPermitPlanDetail",
  "progressPhaseAccurate",
  "internalOnlyDefaultConsidered",
] as const satisfies readonly (keyof ConstructionReviewChecklist)[];

export const REVIEW_FLAG_KEYS = [
  "mlsWatermarkIssue",
  "privateClientSensitiveContent",
  "unsafeJobsiteVisible",
  "tradeVendorIssueVisible",
  "addressShouldStayPrivate",
  "lowQualityBlurry",
  "wrongProjectAssignment",
  "captionNeedsWork",
  "notBrandAppropriate",
  "constructionProgressOnlyNotMarketingSafe",
] as const satisfies readonly (keyof AdminReviewFlags)[];

export const UNIVERSAL_CHECKLIST_LABELS: Record<keyof UniversalReviewChecklist, string> = {
  correctProjectAssigned: "Correct project assigned",
  submitterTypeReviewed: "Submitter type reviewed",
  submissionCategoryReviewed: "Submission category reviewed",
  mediaQualityAcceptable: "Media quality acceptable",
  captionNotesReviewed: "Caption / notes reviewed",
  noPrivateClientSensitiveVisible: "No private / client-sensitive content visible",
  approvedForSelectedDestination: "Approved for selected publishing destination",
};

export const CONSTRUCTION_CHECKLIST_LABELS: Record<keyof ConstructionReviewChecklist, string> = {
  noUnsafeJobsiteVisible: "No unsafe jobsite condition visible",
  noTradeVendorIssueVisible: "No trade / vendor issue visible",
  noSensitiveAddressPermitPlanDetail: "No sensitive address / permit / plan detail visible",
  progressPhaseAccurate: "Progress phase is accurate",
  internalOnlyDefaultConsidered: "Internal-only default considered",
};

export const REVIEW_FLAG_LABELS: Record<keyof AdminReviewFlags, string> = {
  mlsWatermarkIssue: "MLS / watermark issue",
  privateClientSensitiveContent: "Private / client-sensitive content",
  unsafeJobsiteVisible: "Unsafe jobsite condition visible",
  tradeVendorIssueVisible: "Trade / vendor issue visible",
  addressShouldStayPrivate: "Address or identifying detail should stay private",
  lowQualityBlurry: "Low quality / blurry",
  wrongProjectAssignment: "Wrong project assignment",
  captionNeedsWork: "Caption needs work",
  notBrandAppropriate: "Not brand appropriate",
  constructionProgressOnlyNotMarketingSafe: "Construction progress only / not marketing-safe",
};

export function needsConstructionReviewChecklist(category: SubmissionCategory): boolean {
  return category === "Construction Progress" || category === "Project Milestone";
}

export function emptyUniversalChecklist(): UniversalReviewChecklist {
  return {
    correctProjectAssigned: false,
    submitterTypeReviewed: false,
    submissionCategoryReviewed: false,
    mediaQualityAcceptable: false,
    captionNotesReviewed: false,
    noPrivateClientSensitiveVisible: false,
    approvedForSelectedDestination: false,
  };
}

export function emptyConstructionChecklist(): ConstructionReviewChecklist {
  return {
    noUnsafeJobsiteVisible: false,
    noTradeVendorIssueVisible: false,
    noSensitiveAddressPermitPlanDetail: false,
    progressPhaseAccurate: false,
    internalOnlyDefaultConsidered: false,
  };
}

export function emptyAdminReviewChecklist(): AdminReviewChecklist {
  return { universal: emptyUniversalChecklist(), construction: emptyConstructionChecklist() };
}

export function emptyAdminReviewFlags(): AdminReviewFlags {
  return {
    mlsWatermarkIssue: false,
    privateClientSensitiveContent: false,
    unsafeJobsiteVisible: false,
    tradeVendorIssueVisible: false,
    addressShouldStayPrivate: false,
    lowQualityBlurry: false,
    wrongProjectAssignment: false,
    captionNeedsWork: false,
    notBrandAppropriate: false,
    constructionProgressOnlyNotMarketingSafe: false,
  };
}

export function isChecklistComplete(
  c: AdminReviewChecklist | null,
  category: SubmissionCategory,
): boolean {
  if (!c) return false;
  if (!UNIVERSAL_CHECKLIST_KEYS.every((k) => c.universal[k])) return false;
  if (needsConstructionReviewChecklist(category)) {
    if (!CONSTRUCTION_CHECKLIST_KEYS.every((k) => c.construction[k])) return false;
  }
  return true;
}

export type MediaItem = {
  id: string;
  submissionId: string;
  mediaTitle: string;
  mediaDescription: string;
  suggestedCaption: string;
  finalCaption: string;
  mediaType: MediaTypeOption;
  fileName: string;
  mimeType: string;
  mockSizeLabel: string;
  previewLabel: string;
  sortOrder: number;
  mediaStatus: WorkflowStatus;
};

export type Submission = {
  id: string;
  submitterName: string;
  submitterEmail: string;
  companyTeam: string;
  submitterType: SubmitterType;
  submissionCategory: SubmissionCategory;
  publishingDestination: PublishingDestination;
  projectPhase: ProjectPhase;
  propertyArea: PropertyArea;
  /** Mock date string from intake (e.g. progress-as-of). */
  progressDate: string;
  propertyName: string;
  propertyAddress: string;
  location: string;
  projectAssignment: ProjectAssignment;
  intendedUse: IntendedUseOption;
  status: WorkflowStatus;
  submittedAt: string;
  reviewedAt: string | null;
  publishedAt: string | null;
  internalReviewNotes: string;
  rejectionOrEditReason: string;
  /** Intake is single-asset; array models future multi-upload. */
  mediaItems: MediaItem[];
  adminReviewChecklist: AdminReviewChecklist | null;
  adminReviewFlags: AdminReviewFlags;
  updatedAt: string;
};

/** Admin queue filter chips — “All” is UI-only (no status value). */
export const ADMIN_FILTER_STATUSES: (WorkflowStatus | "All")[] = [
  "All",
  "Submitted",
  "Needs Review",
  "Approved for Use",
  "Needs Edits",
  "Ready to Publish",
  "Published",
  "Rejected",
  "Archived",
];

/** Categories safe to label on the public marketing gallery when destination is Public Media Gallery. */
export const PUBLIC_SAFE_SUBMISSION_CATEGORIES: readonly SubmissionCategory[] = [
  "Broker / Listing Media",
  "Finished Project Media",
  "Social Media Content",
];

/** Row for public gallery: no emails, notes, rejection data, or internal destinations. */
export type PublicMediaEntry = {
  id: string;
  propertyName: string;
  projectName: ProjectAssignment;
  location: string;
  mediaTitle: string;
  finalCaption: string;
  mediaDescription: string;
  mediaType: MediaTypeOption;
  publishedAt: string;
  previewLabel: string;
  submissionCategoryLabel?: SubmissionCategory;
};

export const PROJECT_OPTIONS: ProjectAssignment[] = [
  "Caballo Drive Estate",
  "Hillcrest Development",
  "Via Los Ranchos Estate",
  "7301 Mockingbird",
  "Silverleaf Ridge Villa",
  "Other / New Property",
  "Unknown / Needs Admin Assignment",
];

export const INTENDED_USE_OPTIONS: IntendedUseOption[] = [
  "Website",
  "Social media",
  "Listing support",
  "Construction update",
  "Internal review",
  "Unknown",
];

export const MEDIA_TYPE_OPTIONS: MediaTypeOption[] = [
  "Photo",
  "Video",
  "Reel",
  "Construction Update",
  "Listing Media",
];

export const SUBMITTER_TYPE_OPTIONS: SubmitterType[] = [
  "Realtor / Broker",
  "Superintendent",
  "Project Manager",
  "Internal Team",
  "Marketing Team",
  "Photographer / Videographer",
  "Other",
];

export const SUBMISSION_CATEGORY_OPTIONS: SubmissionCategory[] = [
  "Broker / Listing Media",
  "Construction Progress",
  "Project Milestone",
  "Finished Project Media",
  "Social Media Content",
  "Internal Documentation",
  "Other",
];

export const PUBLISHING_DESTINATION_OPTIONS: PublishingDestination[] = [
  "Public Media Gallery",
  "Internal Progress Log",
  "Client / Investor Portal",
  "Social Media Queue",
  "Website Project Page",
  "Not Set",
];

export const PROJECT_PHASE_OPTIONS: ProjectPhase[] = [
  "Pre-construction",
  "Site work",
  "Foundation",
  "Framing",
  "Mechanical / Electrical / Plumbing",
  "Drywall",
  "Interior finishes",
  "Exterior finishes",
  "Landscape / hardscape",
  "Final punch",
  "Completed",
  "Not applicable",
];

export const PROPERTY_AREA_OPTIONS: PropertyArea[] = [
  "Exterior",
  "Interior",
  "Kitchen",
  "Primary suite",
  "Bathroom",
  "Garage",
  "Pool / exterior living",
  "Landscape",
  "Mechanical room",
  "Jobsite / general",
  "Other",
  "Not applicable",
];
