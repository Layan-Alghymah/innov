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
