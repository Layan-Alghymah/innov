import type { EvidenceReviewStatus, LinkedEntityType, Prisma } from "@prisma/client";

import { prisma } from "@/server/db";
import { writeAudit, AUDIT } from "@/server/audit";
import type { AccessContext } from "@/server/access-context";
import {
  requirePermission,
  requireScope,
  effectiveScopes,
  findActiveShareForEntity,
  requireShareAction,
} from "@/server/authorization";
import {
  evidenceMetadataSchema,
  evidenceLinkSchema,
  ALLOWED_MIME_TYPES,
  MAX_FILE_BYTES,
  type EvidenceMetadataInput,
} from "./schema";

export type EvidenceErrorCode =
  | "VALIDATION"
  | "INVALID_TRANSITION"
  | "UNSUPPORTED_FILE"
  | "FILE_TOO_LARGE"
  | "DUPLICATE"
  | "BAD_REFERENCE"
  | "NOT_FOUND";

export class EvidenceError extends Error {
  code: EvidenceErrorCode;
  fieldErrors?: Record<string, string[]>;
  constructor(code: EvidenceErrorCode, message?: string, fieldErrors?: Record<string, string[]>) {
    super(message ?? code);
    this.name = "EvidenceError";
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

const VIEW = "evidence.view" as const;
const UPLOAD = "evidence.upload" as const;
const APPROVE = "evidence.approve" as const;

/** Governance transitions (status-definitions.md §11). */
const REVIEW_TRANSITIONS: Record<EvidenceReviewStatus, EvidenceReviewStatus[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["ARCHIVED"],
  REJECTED: ["ARCHIVED"],
  ARCHIVED: [],
};

export type AccessMode = "INTERNAL" | "PARTNER" | "PUBLISHED";

type SolutionCtx = { id: string; owningDepartmentId: string | null; organizationId: string | null };

async function loadSolutionCtx(solutionId: string): Promise<SolutionCtx> {
  const s = await prisma.innovationSolution.findUnique({
    where: { id: solutionId },
    select: { id: true, owningDepartmentId: true, owningDepartment: { select: { organizationId: true } } },
  });
  if (!s) throw new EvidenceError("NOT_FOUND", "الحل غير موجود");
  return { id: s.id, owningDepartmentId: s.owningDepartmentId, organizationId: s.owningDepartment?.organizationId ?? null };
}

/**
 * How this principal reaches the solution: as an internal (department /
 * organization / platform) user, through an active ResourceShare (partner), or
 * only via the PUBLISHED projection (viewer).
 */
async function resolveAccessMode(actor: AccessContext, solution: SolutionCtx): Promise<AccessMode> {
  const es = effectiveScopes(actor);
  if (es.platform) return "INTERNAL";
  if (solution.owningDepartmentId && es.departmentIds.includes(solution.owningDepartmentId)) return "INTERNAL";
  if (solution.organizationId && es.organizationIds.includes(solution.organizationId)) return "INTERNAL";
  const share = await findActiveShareForEntity(actor.userId, "INNOVATION_SOLUTION", solution.id);
  return share ? "PARTNER" : "PUBLISHED";
}

/** Read gate: evidence.view + solution scope. Published-only readers see APPROVED evidence only. */
async function requireEvidenceRead(actor: AccessContext, solutionId: string) {
  requirePermission(actor, VIEW);
  await requireScope(actor, "INNOVATION_SOLUTION", solutionId);
  const solution = await loadSolutionCtx(solutionId);
  const mode = await resolveAccessMode(actor, solution);
  return { solution, mode };
}

/**
 * Upload gate. Internal users need `evidence.upload` within scope. A partner
 * reaching the solution only through a share must additionally hold an ACTIVE
 * share whose allowedActions include `evidence.create`.
 */
async function requireEvidenceUpload(actor: AccessContext, solutionId: string) {
  requirePermission(actor, UPLOAD);
  await requireScope(actor, "INNOVATION_SOLUTION", solutionId);
  const solution = await loadSolutionCtx(solutionId);
  const mode = await resolveAccessMode(actor, solution);
  if (mode !== "INTERNAL") {
    // Partners (and anyone not internally scoped) must be explicitly permitted.
    await requireShareAction(actor, "INNOVATION_SOLUTION", solution.id, "evidence.create");
  }
  return { solution, mode };
}

/** The solution an evidence item belongs to (its INNOVATION_SOLUTION link). */
async function solutionIdForEvidence(evidenceId: string): Promise<string> {
  const link = await prisma.evidenceLink.findFirst({
    where: { evidenceId, entityType: "INNOVATION_SOLUTION" },
    select: { entityId: true },
  });
  if (!link) throw new EvidenceError("NOT_FOUND", "الدليل غير مرتبط بحل");
  return link.entityId;
}

// ── Evidence readiness ─────────────────────────────────────────────────────

export interface EvidenceReadiness {
  percentage: number;
  approved: number;
  expected: number;
}

/**
 * EVIDENCE READINESS ONLY — approved evidence ÷ tracked (expected) evidence.
 * Tracked = evidence attached to the solution that is neither ARCHIVED nor
 * REJECTED. This is NOT compliance readiness, DGA readiness, or an estimated
 * readiness score; it says nothing about requirements being met.
 */
export async function computeEvidenceReadiness(solutionId: string, db: Prisma.TransactionClient | typeof prisma = prisma): Promise<EvidenceReadiness> {
  const links = await db.evidenceLink.findMany({
    where: { entityType: "INNOVATION_SOLUTION", entityId: solutionId },
    select: { evidenceId: true },
  });
  const ids = links.map((l) => l.evidenceId);
  if (ids.length === 0) return { percentage: 0, approved: 0, expected: 0 };

  const [expected, approved] = await Promise.all([
    db.evidence.count({ where: { id: { in: ids }, reviewStatus: { notIn: ["ARCHIVED", "REJECTED"] } } }),
    db.evidence.count({ where: { id: { in: ids }, reviewStatus: "APPROVED" } }),
  ]);
  return { percentage: expected > 0 ? Math.round((approved / expected) * 100) : 0, approved, expected };
}

async function recomputeAndStoreReadiness(db: Prisma.TransactionClient, solutionId: string) {
  const readiness = await computeEvidenceReadiness(solutionId, db);
  await db.innovationSolution.update({ where: { id: solutionId }, data: { evidenceReadinessPct: readiness.percentage } });
  return readiness;
}

// ── Registry ───────────────────────────────────────────────────────────────

export interface EvidenceFilters {
  q?: string;
  reviewStatus?: string;
  fileProcessingStatus?: string;
  includeArchived?: boolean;
}

export async function listSolutionEvidence(actor: AccessContext, solutionId: string, filters: EvidenceFilters = {}) {
  const { mode } = await requireEvidenceRead(actor, solutionId);

  const links = await prisma.evidenceLink.findMany({
    where: { entityType: "INNOVATION_SOLUTION", entityId: solutionId },
    select: { evidenceId: true },
  });
  const ids = links.map((l) => l.evidenceId);
  if (ids.length === 0) return [];

  const and: Prisma.EvidenceWhereInput[] = [{ id: { in: ids } }];
  // Published-only readers never see anything but approved evidence.
  if (mode === "PUBLISHED") and.push({ reviewStatus: "APPROVED" });
  else if (!filters.includeArchived) and.push({ reviewStatus: { not: "ARCHIVED" } });
  if (filters.reviewStatus) and.push({ reviewStatus: filters.reviewStatus as EvidenceReviewStatus });
  if (filters.fileProcessingStatus) and.push({ fileProcessingStatus: filters.fileProcessingStatus as never });
  if (filters.q?.trim()) {
    const q = filters.q.trim();
    and.push({ OR: [{ title: { contains: q, mode: "insensitive" } }, { fileName: { contains: q, mode: "insensitive" } }] });
  }

  return prisma.evidence.findMany({
    where: { AND: and },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, fileName: true, mimeType: true, sizeBytes: true,
      reviewStatus: true, fileProcessingStatus: true, classification: true,
      createdAt: true, approvedAt: true, archivedAt: true,
      uploadedBy: { select: { name: true } },
    },
  });
}

export async function getEvidenceById(actor: AccessContext, evidenceId: string) {
  const solutionId = await solutionIdForEvidence(evidenceId);
  const { mode } = await requireEvidenceRead(actor, solutionId);

  const evidence = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    select: {
      id: true, title: true, notes: true, classification: true, fileName: true, mimeType: true,
      sizeBytes: true, checksum: true, version: true, storagePath: true,
      reviewStatus: true, fileProcessingStatus: true, verificationStatus: true,
      reviewedById: true, reviewedAt: true, approvedById: true, approvedAt: true,
      createdAt: true, updatedAt: true, archivedAt: true,
      uploadedById: true,
      uploadedBy: { select: { name: true } },
    },
  });
  if (!evidence) throw new EvidenceError("NOT_FOUND", "الدليل غير موجود");
  if (mode === "PUBLISHED" && evidence.reviewStatus !== "APPROVED") {
    throw new EvidenceError("NOT_FOUND", "الدليل غير متاح");
  }
  return { ...evidence, solutionId };
}

// ── Upload ─────────────────────────────────────────────────────────────────

export interface UploadedFileDescriptor {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksum?: string | null;
}

/** Validate the file against the supported types and the size ceiling. */
export function validateFile(file: UploadedFileDescriptor) {
  if (!ALLOWED_MIME_TYPES[file.mimeType]) {
    throw new EvidenceError("UNSUPPORTED_FILE", "نوع الملف غير مدعوم. المسموح: PDF أو DOCX أو XLSX");
  }
  if (!Number.isFinite(file.sizeBytes) || file.sizeBytes <= 0) {
    throw new EvidenceError("VALIDATION", "حجم الملف غير صالح");
  }
  if (file.sizeBytes > MAX_FILE_BYTES) {
    throw new EvidenceError("FILE_TOO_LARGE", "حجم الملف يتجاوز الحد المسموح (25 ميغابايت)");
  }
}

/**
 * Register an evidence item against a solution. Creates the Evidence record
 * (reviewStatus=DRAFT, fileProcessingStatus=UPLOADED) plus its
 * INNOVATION_SOLUTION link, audits, and refreshes evidence readiness.
 */
export async function uploadEvidence(
  actor: AccessContext,
  solutionId: string,
  raw: unknown,
  file: UploadedFileDescriptor,
): Promise<{ id: string }> {
  const { solution } = await requireEvidenceUpload(actor, solutionId);
  const parsed = evidenceMetadataSchema.safeParse(raw);
  if (!parsed.success) throw new EvidenceError("VALIDATION", "invalid", parsed.error.flatten().fieldErrors);
  validateFile(file);
  const meta: EvidenceMetadataInput = parsed.data;

  return prisma.$transaction(async (tx) => {
    const created = await tx.evidence.create({
      data: {
        title: meta.title,
        notes: meta.description, // Evidence has no `description` column — mapped to notes
        classification: meta.classification,
        fileName: file.fileName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        checksum: file.checksum ?? null,
        uploadedById: actor.userId,
        reviewStatus: "DRAFT",
        fileProcessingStatus: "UPLOADED",
      },
      select: { id: true },
    });
    await tx.evidenceLink.create({
      data: { evidenceId: created.id, entityType: "INNOVATION_SOLUTION", entityId: solutionId },
    });
    await writeAudit(
      {
        actorUserId: actor.userId,
        action: AUDIT.EVIDENCE_UPLOADED,
        entityType: "EVIDENCE",
        entityId: created.id,
        departmentId: solution.owningDepartmentId,
        summary: "رفع دليل جديد",
        metadata: { solutionId, fileName: file.fileName, mimeType: file.mimeType, sizeBytes: file.sizeBytes },
        after: { reviewStatus: "DRAFT", fileProcessingStatus: "UPLOADED" },
      },
      tx,
    );
    await recomputeAndStoreReadiness(tx, solutionId);
    return created;
  });
}

// ── Lifecycle ──────────────────────────────────────────────────────────────

function assertTransition(from: EvidenceReviewStatus, to: EvidenceReviewStatus) {
  if (!REVIEW_TRANSITIONS[from].includes(to)) {
    throw new EvidenceError("INVALID_TRANSITION", "انتقال غير مسموح لحالة الدليل");
  }
}

async function transition(
  actor: AccessContext,
  evidenceId: string,
  to: EvidenceReviewStatus,
  opts: { permission: typeof UPLOAD | typeof APPROVE; action: string; summary: string; uploaderAllowed?: boolean; extra?: Prisma.EvidenceUpdateInput; note?: string },
) {
  const solutionId = await solutionIdForEvidence(evidenceId);
  requirePermission(actor, opts.permission);
  await requireScope(actor, "INNOVATION_SOLUTION", solutionId);
  const solution = await loadSolutionCtx(solutionId);

  const evidence = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    select: { id: true, reviewStatus: true, uploadedById: true },
  });
  if (!evidence) throw new EvidenceError("NOT_FOUND", "الدليل غير موجود");
  assertTransition(evidence.reviewStatus, to);

  // Submitting is the uploader's action; reviewers act via evidence.approve.
  if (opts.uploaderAllowed) {
    const mode = await resolveAccessMode(actor, solution);
    const isUploader = evidence.uploadedById === actor.userId;
    if (!isUploader && mode !== "INTERNAL") throw new EvidenceError("INVALID_TRANSITION", "التقديم من صلاحية صاحب الرفع");
  }

  return prisma.$transaction(async (tx) => {
    await tx.evidence.update({ where: { id: evidenceId }, data: { reviewStatus: to, ...(opts.extra ?? {}) } });
    await writeAudit(
      {
        actorUserId: actor.userId,
        action: opts.action,
        entityType: "EVIDENCE",
        entityId: evidenceId,
        departmentId: solution.owningDepartmentId,
        summary: opts.summary,
        before: { reviewStatus: evidence.reviewStatus },
        after: { reviewStatus: to },
        metadata: { solutionId, ...(opts.note ? { note: opts.note } : {}) },
      },
      tx,
    );
    const readiness = await recomputeAndStoreReadiness(tx, solutionId);
    return readiness;
  });
}

/** DRAFT → SUBMITTED (uploader, or an internal in-scope user). */
export async function submitEvidence(actor: AccessContext, evidenceId: string) {
  return transition(actor, evidenceId, "SUBMITTED", {
    permission: UPLOAD,
    action: AUDIT.EVIDENCE_SUBMITTED,
    summary: "تقديم الدليل للمراجعة",
    uploaderAllowed: true,
  });
}

/** SUBMITTED → UNDER_REVIEW (reviewer). */
export async function startEvidenceReview(actor: AccessContext, evidenceId: string) {
  return transition(actor, evidenceId, "UNDER_REVIEW", {
    permission: APPROVE,
    action: AUDIT.EVIDENCE_REVIEW_STARTED,
    summary: "بدء مراجعة الدليل",
    extra: { reviewedById: actor.userId, reviewedAt: new Date() },
  });
}

/** UNDER_REVIEW → APPROVED — the only status that counts toward evidence readiness. */
export async function approveEvidence(actor: AccessContext, evidenceId: string) {
  return transition(actor, evidenceId, "APPROVED", {
    permission: APPROVE,
    action: AUDIT.EVIDENCE_APPROVED,
    summary: "اعتماد الدليل",
    extra: { approvedById: actor.userId, approvedAt: new Date() },
  });
}

/** UNDER_REVIEW → REJECTED. */
export async function rejectEvidence(actor: AccessContext, evidenceId: string, reason?: string) {
  return transition(actor, evidenceId, "REJECTED", {
    permission: APPROVE,
    action: AUDIT.EVIDENCE_REJECTED,
    summary: "رفض الدليل",
    note: reason?.trim() || undefined,
    extra: { reviewedById: actor.userId, reviewedAt: new Date() },
  });
}

/** APPROVED/REJECTED → ARCHIVED (soft; never a hard delete). */
export async function archiveEvidence(actor: AccessContext, evidenceId: string) {
  return transition(actor, evidenceId, "ARCHIVED", {
    permission: APPROVE,
    action: AUDIT.EVIDENCE_ARCHIVED,
    summary: "أرشفة الدليل",
    extra: { archivedAt: new Date(), archivedById: actor.userId },
  });
}

// ── Linking ────────────────────────────────────────────────────────────────

const TARGET_EXISTS: Record<string, (id: string) => Promise<boolean>> = {
  COMPLIANCE_REQUIREMENT: async (id) => !!(await prisma.complianceRequirement.findUnique({ where: { id }, select: { id: true } })),
  INNOVATION_SOLUTION: async (id) => !!(await prisma.innovationSolution.findUnique({ where: { id }, select: { id: true } })),
  STRATEGIC_OBJECTIVE: async (id) => !!(await prisma.strategicObjective.findUnique({ where: { id }, select: { id: true } })),
  INNOVATION_ACTIVITY: async (id) => !!(await prisma.innovationActivity.findUnique({ where: { id }, select: { id: true } })),
  IMPACT_MEASUREMENT: async (id) => !!(await prisma.impactMeasurement.findUnique({ where: { id }, select: { id: true } })),
};

/** Map evidence to another record. entityId integrity is application-enforced. */
export async function linkEvidence(actor: AccessContext, evidenceId: string, raw: unknown) {
  const solutionId = await solutionIdForEvidence(evidenceId);
  requirePermission(actor, UPLOAD);
  await requireScope(actor, "INNOVATION_SOLUTION", solutionId);
  const solution = await loadSolutionCtx(solutionId);

  const parsed = evidenceLinkSchema.safeParse(raw);
  if (!parsed.success) throw new EvidenceError("VALIDATION", "invalid", parsed.error.flatten().fieldErrors);
  const { entityType, entityId, requirementId } = parsed.data;

  const exists = await TARGET_EXISTS[entityType]?.(entityId);
  if (!exists) throw new EvidenceError("BAD_REFERENCE", "السجل المستهدف غير موجود");
  if (requirementId) {
    const req = await prisma.complianceRequirement.findUnique({ where: { id: requirementId }, select: { id: true } });
    if (!req) throw new EvidenceError("BAD_REFERENCE", "المتطلب غير موجود");
  }

  const duplicate = await prisma.evidenceLink.findUnique({
    where: { evidenceId_entityType_entityId: { evidenceId, entityType: entityType as LinkedEntityType, entityId } },
  });
  if (duplicate) throw new EvidenceError("DUPLICATE", "الربط موجود بالفعل");

  try {
    return await prisma.$transaction(async (tx) => {
      const link = await tx.evidenceLink.create({
        data: { evidenceId, entityType: entityType as LinkedEntityType, entityId, requirementId: requirementId ?? null },
        select: { id: true },
      });
      await writeAudit(
        {
          actorUserId: actor.userId,
          action: AUDIT.EVIDENCE_LINKED,
          entityType: "EVIDENCE",
          entityId: evidenceId,
          departmentId: solution.owningDepartmentId,
          summary: "ربط الدليل بسجل",
          metadata: { solutionId, linkId: link.id, targetType: entityType, targetId: entityId, requirementId: requirementId ?? null },
        },
        tx,
      );
      return link;
    });
  } catch (e) {
    if (typeof e === "object" && e && (e as { code?: string }).code === "P2002") {
      throw new EvidenceError("DUPLICATE", "الربط موجود بالفعل");
    }
    throw e;
  }
}

/** Remove a mapping. The solution link itself cannot be removed. */
export async function unlinkEvidence(actor: AccessContext, linkId: string) {
  const link = await prisma.evidenceLink.findUnique({
    where: { id: linkId },
    select: { id: true, evidenceId: true, entityType: true, entityId: true },
  });
  if (!link) throw new EvidenceError("NOT_FOUND", "الربط غير موجود");

  const solutionId = await solutionIdForEvidence(link.evidenceId);
  requirePermission(actor, UPLOAD);
  await requireScope(actor, "INNOVATION_SOLUTION", solutionId);
  const solution = await loadSolutionCtx(solutionId);

  if (link.entityType === "INNOVATION_SOLUTION" && link.entityId === solutionId) {
    throw new EvidenceError("INVALID_TRANSITION", "لا يمكن فصل الدليل عن الحل المالك");
  }

  await prisma.$transaction(async (tx) => {
    await tx.evidenceLink.delete({ where: { id: linkId } });
    await writeAudit(
      {
        actorUserId: actor.userId,
        action: AUDIT.EVIDENCE_UNLINKED,
        entityType: "EVIDENCE",
        entityId: link.evidenceId,
        departmentId: solution.owningDepartmentId,
        summary: "إلغاء ربط الدليل",
        metadata: { solutionId, targetType: link.entityType, targetId: link.entityId },
      },
      tx,
    );
  });
}

export async function listEvidenceLinks(actor: AccessContext, evidenceId: string) {
  const solutionId = await solutionIdForEvidence(evidenceId);
  await requireEvidenceRead(actor, solutionId);
  return prisma.evidenceLink.findMany({
    where: { evidenceId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, entityType: true, entityId: true, requirementId: true, createdAt: true,
      requirement: { select: { code: true, titleAr: true } },
    },
  });
}

// ── Timeline ───────────────────────────────────────────────────────────────

/** Read-only evidence timeline from the append-only audit log. */
export async function getEvidenceTimeline(actor: AccessContext, evidenceId: string) {
  const solutionId = await solutionIdForEvidence(evidenceId);
  await requireEvidenceRead(actor, solutionId);
  return prisma.auditLog.findMany({
    where: { entityType: "EVIDENCE", entityId: evidenceId },
    orderBy: { createdAt: "desc" },
    select: { id: true, action: true, summary: true, metadata: true, createdAt: true, actor: { select: { name: true } } },
  });
}

export type EvidenceTimelineRow = Awaited<ReturnType<typeof getEvidenceTimeline>>[number];

/** UI flags — every action re-enforces server-side. */
export function computeEvidenceFlags(
  evidence: { reviewStatus: EvidenceReviewStatus; uploadedById: string | null },
  _actor: AccessContext,
  perms: { canUpload: boolean; canApprove: boolean },
) {
  return {
    // The server additionally requires the uploader or an internal in-scope user.
    canSubmit: perms.canUpload && evidence.reviewStatus === "DRAFT",
    canStartReview: perms.canApprove && evidence.reviewStatus === "SUBMITTED",
    canApprove: perms.canApprove && evidence.reviewStatus === "UNDER_REVIEW",
    canReject: perms.canApprove && evidence.reviewStatus === "UNDER_REVIEW",
    canArchive: perms.canApprove && (evidence.reviewStatus === "APPROVED" || evidence.reviewStatus === "REJECTED"),
    canLink: perms.canUpload && evidence.reviewStatus !== "ARCHIVED",
  };
}
