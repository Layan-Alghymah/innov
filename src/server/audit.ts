import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/server/db";

/**
 * Append-only audit action keys used in Phase 2B (identity lifecycle).
 * Stored in AuditLog.action (String). Extend as later phases add actions.
 */
export const AUDIT = {
  USER_REGISTERED: "USER_REGISTERED",
  REGISTRATION_APPROVED: "REGISTRATION_APPROVED",
  REGISTRATION_REJECTED: "REGISTRATION_REJECTED",
  USER_ACTIVATED: "USER_ACTIVATED",
  USER_DEACTIVATED: "USER_DEACTIVATED",
  USER_SUSPENDED: "USER_SUSPENDED",
  USER_RESTORED: "USER_RESTORED",
  LOGIN_BLOCKED_PENDING: "LOGIN_BLOCKED_PENDING",
  LOGIN_BLOCKED_REJECTED: "LOGIN_BLOCKED_REJECTED",
  LOGIN_BLOCKED_INACTIVE: "LOGIN_BLOCKED_INACTIVE",
  LOGIN_BLOCKED_SUSPENDED: "LOGIN_BLOCKED_SUSPENDED",
  // Immutability (Layer 5) sanctioned change paths.
  DECISION_SUPERSEDED: "DECISION_SUPERSEDED",
  DECISION_REOPENED: "DECISION_REOPENED",
  MEASUREMENT_SUPERSEDED: "MEASUREMENT_SUPERSEDED",
  MEASUREMENT_REOPENED: "MEASUREMENT_REOPENED",
  // Ideas (governance 5.23.3 — Phase 3A).
  IDEA_CREATED: "IDEA_CREATED",
  IDEA_UPDATED: "IDEA_UPDATED",
  IDEA_SUBMITTED: "IDEA_SUBMITTED",
  IDEA_WITHDRAWN: "IDEA_WITHDRAWN",
  IDEA_ARCHIVED: "IDEA_ARCHIVED",
  // Idea evaluation / review (Phase 3B).
  IDEA_REVIEW_STARTED: "IDEA_REVIEW_STARTED",
  IDEA_EVALUATION_SUBMITTED: "IDEA_EVALUATION_SUBMITTED",
  IDEA_ADVANCED_TO_TECHNICAL: "IDEA_ADVANCED_TO_TECHNICAL",
  IDEA_MORE_INFO_REQUESTED: "IDEA_MORE_INFO_REQUESTED",
  IDEA_INFO_RESUBMITTED: "IDEA_INFO_RESUBMITTED",
  // Final decisions & conversion (Phase 3C).
  IDEA_DECISION_APPROVED: "IDEA_DECISION_APPROVED",
  IDEA_DECISION_REJECTED: "IDEA_DECISION_REJECTED",
  IDEA_CONVERTED: "IDEA_CONVERTED",
  // Solutions registry (5.24.1 — Phase 4A).
  SOLUTION_CREATED: "SOLUTION_CREATED",
  SOLUTION_UPDATED: "SOLUTION_UPDATED",
  SOLUTION_ARCHIVED: "SOLUTION_ARCHIVED",
  SOLUTION_PARTNER_UPDATED: "SOLUTION_PARTNER_UPDATED",
  // Lifecycle, publishing, sharing & participation (Phase 4B).
  SOLUTION_STATUS_CHANGED: "SOLUTION_STATUS_CHANGED",
  SOLUTION_MATURITY_CHANGED: "SOLUTION_MATURITY_CHANGED",
  SOLUTION_IMPLEMENTATION_CHANGED: "SOLUTION_IMPLEMENTATION_CHANGED",
  SOLUTION_PUBLISHED: "SOLUTION_PUBLISHED",
  SOLUTION_UNPUBLISHED: "SOLUTION_UNPUBLISHED",
  SOLUTION_SHARE_GRANTED: "SOLUTION_SHARE_GRANTED",
  SOLUTION_SHARE_UPDATED: "SOLUTION_SHARE_UPDATED",
  SOLUTION_SHARE_REVOKED: "SOLUTION_SHARE_REVOKED",
  SOLUTION_ORG_ADDED: "SOLUTION_ORG_ADDED",
  SOLUTION_ORG_REMOVED: "SOLUTION_ORG_REMOVED",
  // Evidence management (Phase 5A).
  EVIDENCE_UPLOADED: "EVIDENCE_UPLOADED",
  EVIDENCE_UPDATED: "EVIDENCE_UPDATED",
  EVIDENCE_SUBMITTED: "EVIDENCE_SUBMITTED",
  EVIDENCE_REVIEW_STARTED: "EVIDENCE_REVIEW_STARTED",
  EVIDENCE_APPROVED: "EVIDENCE_APPROVED",
  EVIDENCE_REJECTED: "EVIDENCE_REJECTED",
  EVIDENCE_ARCHIVED: "EVIDENCE_ARCHIVED",
  EVIDENCE_LINKED: "EVIDENCE_LINKED",
  EVIDENCE_UNLINKED: "EVIDENCE_UNLINKED",
  // Binary storage & secure access (Phase 5A.1).
  EVIDENCE_DOWNLOADED: "EVIDENCE_DOWNLOADED",
  EVIDENCE_DOWNLOAD_DENIED: "EVIDENCE_DOWNLOAD_DENIED",
  EVIDENCE_FILE_REPLACED: "EVIDENCE_FILE_REPLACED",
  // AI document analysis (Phase 5B) — the AI only ever proposes.
  ANALYSIS_QUEUED: "ANALYSIS_QUEUED",
  ANALYSIS_STARTED: "ANALYSIS_STARTED",
  ANALYSIS_COMPLETED: "ANALYSIS_COMPLETED",
  ANALYSIS_FAILED: "ANALYSIS_FAILED",
  SUGGESTION_ACCEPTED: "SUGGESTION_ACCEPTED",
  SUGGESTION_EDITED: "SUGGESTION_EDITED",
  SUGGESTION_REJECTED: "SUGGESTION_REJECTED",
} as const;

export type AuditAction = (typeof AUDIT)[keyof typeof AUDIT];

export interface AuditInput {
  actorUserId?: string | null;
  action: AuditAction | string;
  entityType?: Prisma.AuditLogCreateInput["entityType"];
  entityId?: string | null;
  organizationId?: string | null;
  departmentId?: string | null;
  summary?: string | null;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
  metadata?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Minimal append-only audit writer. NEVER pass passwords, password hashes, or
 * session tokens in before/after/metadata. Accepts an optional transaction
 * client so audit rows are written atomically with the action they record.
 */
export async function writeAudit(input: AuditInput, db: Db = prisma): Promise<void> {
  await db.auditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      organizationId: input.organizationId ?? null,
      departmentId: input.departmentId ?? null,
      summary: input.summary ?? null,
      beforeData: input.before ?? undefined,
      afterData: input.after ?? undefined,
      metadata: input.metadata ?? undefined,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}
