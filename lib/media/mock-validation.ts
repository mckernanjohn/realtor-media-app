/**
 * Mock client-side validation (no bytes uploaded).
 * FUTURE: Supabase Storage — server-side MIME sniff, size quotas, signed upload URLs, AV scan.
 */

export const MOCK_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
] as const;

/** Browser-reported types we normalize to canonical MIME strings. */
const MIME_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
};

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

/** Mock cap — Phase 1 messaging only; FUTURE: Supabase bucket policy + multipart limits. */
const MOCK_MAX_BYTES = 50 * 1024 * 1024;

export type MockValidationResult =
  | { ok: true; messages: string[]; normalizedMime: string }
  | { ok: false; messages: string[]; normalizedMime: string };

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function extFromName(name: string): string {
  const i = name.lastIndexOf(".");
  if (i === -1) return "";
  return name.slice(i).toLowerCase();
}

export function resolveMockMime(file: File): string {
  const raw = (file.type || "").toLowerCase().trim();
  if (raw) {
    const n = MIME_ALIASES[raw] ?? raw;
    return MIME_ALIASES[n] ?? n;
  }
  const ext = extFromName(file.name);
  return EXT_TO_MIME[ext] ?? "";
}

/** Server-side MIME gate (metadata only in Phase 1). */
export function isMimeAllowedForMockUpload(mime: string): boolean {
  const m = (mime || "").toLowerCase().trim();
  const c = MIME_ALIASES[m] ?? m;
  return (MOCK_ALLOWED_MIME_TYPES as readonly string[]).includes(c);
}

/** Resolve MIME from filename + browser hint without reading bytes (mirrors client `File` behavior). */
export function canonicalMimeForIntake(fileName: string, mimeTypeHint: string): string {
  const f = new File([], fileName, { type: mimeTypeHint || "" });
  return resolveMockMime(f);
}

export function validateMockFileSelection(file: File): MockValidationResult {
  const messages: string[] = [];
  messages.push(`Selected file: ${file.name}`);

  const normalizedMime = resolveMockMime(file);
  messages.push(
    `MIME / file type label: ${normalizedMime || "unknown (no browser MIME — used extension fallback if possible)"}`,
  );

  const allowed = MOCK_ALLOWED_MIME_TYPES as readonly string[];
  const canonical = MIME_ALIASES[normalizedMime] ?? normalizedMime;
  if (!canonical || !allowed.includes(canonical)) {
    messages.push(
      "Unsupported type for this mock intake. Allowed: JPG, JPEG, PNG, WEBP, MP4, MOV (browser MIME or extension).",
    );
    messages.push(
      "Note: real binaries are not uploaded. Later, Supabase Storage will enforce type + size at the bucket.",
    );
    return { ok: false, messages, normalizedMime: normalizedMime || "" };
  }

  messages.push(`${canonical} is allowed for Grey Collective mock intake.`);

  messages.push(`Reported file size: ${formatBytes(file.size)}`);
  if (file.size > MOCK_MAX_BYTES) {
    messages.push(
      `Oversized for mock limit: exceeds ${formatBytes(MOCK_MAX_BYTES)} (simulated gate — nothing was uploaded).`,
    );
    messages.push(
      "Supabase Storage (later) will apply production limits, virus scanning, and optional transcoding.",
    );
    return { ok: false, messages, normalizedMime: canonical };
  }
  messages.push(`Within mock size limit (${formatBytes(MOCK_MAX_BYTES)}).`);

  messages.push("Simulated validation passed — metadata only; no upload occurred.");
  return { ok: true, messages, normalizedMime: canonical };
}
