/**
 * Authorization model (documented) — role + permission + data scope.
 *
 * The platform does NOT authorize on a bare role label. Instead:
 *   User → UserRole (carries a data scope) → Role → RolePermission → Permission
 *
 * 1. PERMISSIONS are fine-grained capability keys (below). UI and server code
 *    check permissions, never role labels directly.
 * 2. ROLES bundle permissions. The four seeded roles are a starting point; new
 *    roles can be created without code changes.
 * 3. DATA SCOPE is attached to each role assignment (UserRole.scopeType/scopeId):
 *    PLATFORM | ORGANIZATION | DEPARTMENT | AGREEMENT | SOLUTION | PUBLISHED.
 *    Every server-side query must filter records by the caller's effective scope
 *    — hiding UI is never sufficient.
 *
 * This file is the single source of truth for permission keys and the default
 * role→permission mapping consumed by the seed.
 */

export const PERMISSIONS = {
  // solutions
  SOLUTION_VIEW: "solution.view",
  SOLUTION_CREATE: "solution.create",
  SOLUTION_UPDATE: "solution.update",
  SOLUTION_ARCHIVE: "solution.archive",
  // governance / ideas
  IDEA_VIEW: "idea.view",
  IDEA_EVALUATE: "idea.evaluate",
  IDEA_DECIDE: "idea.decide",
  // impact
  IMPACT_VIEW: "impact.view",
  IMPACT_UPDATE: "impact.update",
  IMPACT_VERIFY: "impact.verify",
  // partners / agreements / meetings
  AGREEMENT_VIEW: "agreement.view",
  AGREEMENT_UPDATE: "agreement.update",
  MEETING_UPDATE: "meeting.update",
  // evidence
  EVIDENCE_VIEW: "evidence.view",
  EVIDENCE_UPLOAD: "evidence.upload",
  EVIDENCE_APPROVE: "evidence.approve",
  // compliance
  COMPLIANCE_VIEW: "compliance.view",
  COMPLIANCE_CONFIGURE: "compliance.configure",
  COMPLIANCE_EXPORT: "compliance.export",
  // alerts
  ALERT_VIEW: "alert.view",
  ALERT_RESOLVE: "alert.resolve",
  // administration
  USER_MANAGE: "user.manage",
  ROLE_MANAGE: "role.manage",
  AUDIT_VIEW: "audit.view",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_KEYS = {
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  INTERNAL_EDITOR: "INTERNAL_EDITOR",
  EXTERNAL_PARTNER: "EXTERNAL_PARTNER",
  VIEWER: "VIEWER",
} as const;

export type RoleKey = (typeof ROLE_KEYS)[keyof typeof ROLE_KEYS];

const all = Object.values(PERMISSIONS);

/** Default role → permission mapping (seed source). */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  SYSTEM_ADMIN: all,
  INTERNAL_EDITOR: [
    PERMISSIONS.SOLUTION_VIEW,
    PERMISSIONS.SOLUTION_CREATE,
    PERMISSIONS.SOLUTION_UPDATE,
    PERMISSIONS.IDEA_VIEW,
    PERMISSIONS.IDEA_EVALUATE,
    PERMISSIONS.IMPACT_VIEW,
    PERMISSIONS.IMPACT_UPDATE,
    PERMISSIONS.EVIDENCE_VIEW,
    PERMISSIONS.EVIDENCE_UPLOAD,
    PERMISSIONS.AGREEMENT_VIEW,
    PERMISSIONS.ALERT_VIEW,
    PERMISSIONS.ALERT_RESOLVE,
    PERMISSIONS.COMPLIANCE_VIEW,
  ],
  EXTERNAL_PARTNER: [
    PERMISSIONS.AGREEMENT_VIEW,
    PERMISSIONS.AGREEMENT_UPDATE,
    PERMISSIONS.MEETING_UPDATE,
    PERMISSIONS.EVIDENCE_VIEW,
    PERMISSIONS.EVIDENCE_UPLOAD,
    PERMISSIONS.SOLUTION_VIEW,
  ],
  VIEWER: [
    PERMISSIONS.SOLUTION_VIEW,
    PERMISSIONS.IDEA_VIEW,
    PERMISSIONS.IMPACT_VIEW,
    PERMISSIONS.AGREEMENT_VIEW,
    PERMISSIONS.EVIDENCE_VIEW,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.ALERT_VIEW,
  ],
};

export const DEFAULT_ROLES: { key: RoleKey; nameAr: string; description: string }[] = [
  { key: ROLE_KEYS.SYSTEM_ADMIN, nameAr: "مدير النظام", description: "صلاحية كاملة على المنصة" },
  { key: ROLE_KEYS.INTERNAL_EDITOR, nameAr: "محرر داخلي", description: "تحرير سجلات نطاقه المخصّص" },
  { key: ROLE_KEYS.EXTERNAL_PARTNER, nameAr: "شريك خارجي", description: "وصول مقيّد لاتفاقياته واجتماعاته" },
  { key: ROLE_KEYS.VIEWER, nameAr: "مطّلع", description: "اطلاع للقراءة فقط" },
];
