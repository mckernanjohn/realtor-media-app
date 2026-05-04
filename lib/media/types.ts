/**
 * Grey Collective — Realtor Media (Phase 1, mock/local only).
 *
 * Future integration points (replace mock-store + forms):
 * - Supabase database: submissions + media_items tables, RLS, realtime admin queue
 * - Supabase Storage: private intake bucket, signed URLs, virus scan hooks, transcoding
 * - Admin authentication: protected /admin, role claims, audit log
 * - Public media API: read-only edge/cache for /media, CDN-friendly payloads
 * - Manus publishing bridge: webhook or queue worker on status transitions
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

export type ProjectAssignment =
  | "Caballo Drive Estate"
  | "Hillcrest Development"
  | "Via Los Ranchos Estate"
  | "7301 Mockingbird"
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

/** Admin intake checklist — all required before “Approve for Use” from review states. */
export type AdminReviewChecklist = {
  noMlsWatermarkContamination: boolean;
  noPrivateClientSensitiveContent: boolean;
  noVisibleAddressIssueUnlessApproved: boolean;
  propertyProjectAssignmentConfirmed: boolean;
  brandAppropriateForGreyCollective: boolean;
  technicalQualityAcceptable: boolean;
  captionFinalCopyReviewed: boolean;
  usageRightsRealtorPermissionAcceptable: boolean;
  approvedForPublicUse: boolean;
};

export const REVIEW_CHECKLIST_KEYS = [
  "noMlsWatermarkContamination",
  "noPrivateClientSensitiveContent",
  "noVisibleAddressIssueUnlessApproved",
  "propertyProjectAssignmentConfirmed",
  "brandAppropriateForGreyCollective",
  "technicalQualityAcceptable",
  "captionFinalCopyReviewed",
  "usageRightsRealtorPermissionAcceptable",
  "approvedForPublicUse",
] as const satisfies readonly (keyof AdminReviewChecklist)[];

export const REVIEW_CHECKLIST_LABELS: Record<keyof AdminReviewChecklist, string> = {
  noMlsWatermarkContamination: "No MLS / watermark contamination",
  noPrivateClientSensitiveContent: "No private or client-sensitive content visible",
  noVisibleAddressIssueUnlessApproved: "No visible address issue unless explicitly approved",
  propertyProjectAssignmentConfirmed: "Property / project assignment confirmed",
  brandAppropriateForGreyCollective: "Media is brand-appropriate for Grey Collective",
  technicalQualityAcceptable: "Technical quality is acceptable",
  captionFinalCopyReviewed: "Caption / final copy reviewed",
  usageRightsRealtorPermissionAcceptable: "Usage rights / realtor permission acceptable",
  approvedForPublicUse: "Approved for public use",
};

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
  brokerageCompany: string;
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
  /** Intake is Phase 1 single-asset; array models future multi-upload. */
  mediaItems: MediaItem[];
  adminReviewChecklist: AdminReviewChecklist | null;
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

/** Row for public gallery: no emails, notes, or rejection data. */
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
};

export const PROJECT_OPTIONS: ProjectAssignment[] = [
  "Caballo Drive Estate",
  "Hillcrest Development",
  "Via Los Ranchos Estate",
  "7301 Mockingbird",
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
