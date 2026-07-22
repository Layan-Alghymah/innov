import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import {
  DEFAULT_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSIONS,
  ROLE_KEYS,
} from "../src/modules/auth/permissions";

const prisma = new PrismaClient();

/**
 * Deterministic Phase-2A seed. Aligned with the aligned schema. Prepares data
 * for future testing; it does NOT implement the Phase 2B registration/auth flow.
 *
 * Credentials:
 *  - Admin password comes from SEED_ADMIN_PASSWORD (random-generated in production
 *    if unset). Demo (editor/partner/viewer) users use SEED_DEMO_PASSWORD or a
 *    clearly-marked local demo value; in production they are only seeded when
 *    SEED_DEMO_PASSWORD is explicitly provided. No real secret is ever committed.
 */
async function main() {
  const isProd = process.env.NODE_ENV === "production";

  // ---- 1) Permissions -----------------------------------------------------
  const permissionKeys = Object.values(PERMISSIONS);
  await Promise.all(
    permissionKeys.map((key) =>
      prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key, nameAr: key },
      }),
    ),
  );
  const permissions = await prisma.permission.findMany();
  const permByKey = new Map(permissions.map((p) => [p.key, p.id]));

  // ---- 2) Roles + role→permission mapping ---------------------------------
  const roleIdByKey = new Map<string, string>();
  for (const role of DEFAULT_ROLES) {
    const created = await prisma.role.upsert({
      where: { key: role.key },
      update: { nameAr: role.nameAr, description: role.description, isSystem: true },
      create: { key: role.key, nameAr: role.nameAr, description: role.description, isSystem: true },
    });
    roleIdByKey.set(role.key, created.id);
    for (const permKey of DEFAULT_ROLE_PERMISSIONS[role.key]) {
      const permissionId = permByKey.get(permKey);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: created.id, permissionId } },
        update: {},
        create: { roleId: created.id, permissionId },
      });
    }
  }

  // ---- 3) Owner org, two internal departments, one external partner -------
  const owner = await prisma.organization.upsert({
    where: { id: "org-owner" },
    update: {},
    create: {
      id: "org-owner",
      nameAr: "مدينة الملك عبدالله للطاقة الذرية والمتجددة",
      type: "OWNER",
    },
  });
  const deptDigital = await prisma.department.upsert({
    where: { id: "dept-digital" },
    update: {},
    create: { id: "dept-digital", organizationId: owner.id, nameAr: "إدارة التحول الرقمي" },
  });
  const deptStrategy = await prisma.department.upsert({
    where: { id: "dept-strategy" },
    update: {},
    create: { id: "dept-strategy", organizationId: owner.id, nameAr: "إدارة التخطيط الاستراتيجي" },
  });
  const partnerOrg = await prisma.organization.upsert({
    where: { id: "org-partner-uni" },
    update: {},
    create: { id: "org-partner-uni", nameAr: "جامعة الملك عبدالله للعلوم والتقنية", type: "UNIVERSITY" },
  });

  // ---- 4) Users (admin + three demo users) --------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@innovation.local";
  let adminPassword = process.env.SEED_ADMIN_PASSWORD;
  let generatedAdminPassword = false;
  if (!adminPassword) {
    if (isProd) {
      adminPassword = randomBytes(12).toString("base64url");
      generatedAdminPassword = true;
    } else {
      adminPassword = "Admin@12345"; // local dev only
    }
  }

  // Demo users: only seeded in production when SEED_DEMO_PASSWORD is provided.
  const demoPassword = process.env.SEED_DEMO_PASSWORD ?? (isProd ? undefined : "Demo@12345");

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      id: "user-admin",
      email: adminEmail,
      name: "مدير النظام",
      passwordHash: adminHash,
      status: "ACTIVE",
      registrationStatus: "APPROVED",
      jobTitle: "مدير منصة الابتكار المؤسسي",
    },
  });

  // Assign the platform-scoped SYSTEM_ADMIN role (upsert by fixed id).
  const adminRoleId = roleIdByKey.get(ROLE_KEYS.SYSTEM_ADMIN)!;
  await prisma.userRole.upsert({
    where: { id: "ur-admin-platform" },
    update: {},
    create: { id: "ur-admin-platform", userId: admin.id, roleId: adminRoleId, scopeType: "PLATFORM", scopeId: null },
  });

  // Helper to seed a demo user + membership + scoped role assignment.
  async function seedDemoUser(opts: {
    id: string;
    email: string;
    name: string;
    jobTitle: string;
    roleKey: string;
    scopeType: "PLATFORM" | "ORGANIZATION" | "DEPARTMENT" | "AGREEMENT" | "SOLUTION" | "PUBLISHED";
    scopeId: string | null;
    membership?: { organizationId?: string; departmentId?: string };
  }) {
    if (!demoPassword) return null; // skip demo users in prod without an explicit demo password
    const hash = await bcrypt.hash(demoPassword, 10);
    const user = await prisma.user.upsert({
      where: { email: opts.email },
      update: {},
      create: {
        id: opts.id,
        email: opts.email,
        name: opts.name,
        passwordHash: hash,
        status: "ACTIVE",
        registrationStatus: "APPROVED",
        requestedRoleKey: opts.roleKey,
        approvedById: admin.id,
        approvedAt: new Date(),
        jobTitle: opts.jobTitle,
      },
    });
    await prisma.userRole.upsert({
      where: { id: `ur-${opts.id}` },
      update: {},
      create: {
        id: `ur-${opts.id}`,
        userId: user.id,
        roleId: roleIdByKey.get(opts.roleKey)!,
        scopeType: opts.scopeType,
        scopeId: opts.scopeId,
      },
    });
    if (opts.membership) {
      await prisma.userMembership.upsert({
        where: { id: `mem-${opts.id}` },
        update: {},
        create: {
          id: `mem-${opts.id}`,
          userId: user.id,
          organizationId: opts.membership.organizationId ?? null,
          departmentId: opts.membership.departmentId ?? null,
        },
      });
    }
    return user;
  }

  const editor = await seedDemoUser({
    id: "user-editor",
    email: "editor@innovation.local",
    name: "محرر إدارة التحول الرقمي",
    jobTitle: "محرر داخلي",
    roleKey: ROLE_KEYS.INTERNAL_EDITOR,
    scopeType: "DEPARTMENT",
    scopeId: deptDigital.id,
    membership: { organizationId: owner.id, departmentId: deptDigital.id },
  });
  const partnerUser = await seedDemoUser({
    id: "user-partner",
    email: "partner@innovation.local",
    name: "منسّق الشراكة الجامعية",
    jobTitle: "شريك خارجي",
    roleKey: ROLE_KEYS.EXTERNAL_PARTNER,
    scopeType: "SOLUTION",
    scopeId: "sol-seed",
    membership: { organizationId: partnerOrg.id },
  });
  await seedDemoUser({
    id: "user-viewer",
    email: "viewer@innovation.local",
    name: "مطّلع قيادي",
    jobTitle: "مطّلع",
    roleKey: ROLE_KEYS.VIEWER,
    scopeType: "PUBLISHED",
    scopeId: null,
    membership: { organizationId: owner.id },
  });

  // Demo registration requests (no role assignment) to exercise the review UI.
  if (demoPassword) {
    const demoHash = await bcrypt.hash(demoPassword, 10);
    await prisma.user.upsert({
      where: { email: "pending@innovation.local" },
      update: {},
      create: {
        id: "user-pending",
        email: "pending@innovation.local",
        name: "طلب تسجيل قيد الانتظار",
        passwordHash: demoHash,
        status: "INACTIVE",
        registrationStatus: "PENDING",
        requestedRoleKey: ROLE_KEYS.INTERNAL_EDITOR,
        requestedDepartmentId: deptDigital.id,
        registrationNote: "طلب تجريبي لاختبار مسار الاعتماد",
      },
    });
    await prisma.user.upsert({
      where: { email: "rejected@innovation.local" },
      update: {},
      create: {
        id: "user-rejected",
        email: "rejected@innovation.local",
        name: "طلب تسجيل مرفوض",
        passwordHash: demoHash,
        status: "INACTIVE",
        registrationStatus: "REJECTED",
        requestedRoleKey: ROLE_KEYS.VIEWER,
        approvedById: admin.id,
        approvedAt: new Date(),
        rejectionReason: "بيانات غير مكتملة (سجل تجريبي)",
      },
    });
  }

  const editorId = editor?.id ?? admin.id; // fall back to admin when demo users are skipped

  // ---- 5) Strategy: one objective -----------------------------------------
  const objective = await prisma.strategicObjective.upsert({
    where: { id: "obj-seed" },
    update: {},
    create: {
      id: "obj-seed",
      code: "SO-1",
      titleAr: "رفع كفاءة التشغيل عبر الابتكار الرقمي",
      description: "هدف استراتيجي تجريبي للبذرة",
      departmentId: deptStrategy.id,
      responsibleUserId: admin.id,
      status: "ACTIVE",
    },
  });

  // ---- 6) Activity: one activity ------------------------------------------
  const activity = await prisma.innovationActivity.upsert({
    where: { id: "act-seed" },
    update: {},
    create: {
      id: "act-seed",
      nameAr: "هاكاثون الابتكار المؤسسي",
      type: "HACKATHON",
      challenge: "تحسين موثوقية الأصول التشغيلية",
      organizerDepartmentId: deptDigital.id,
      status: "COMPLETED",
    },
  });

  // ---- 7) Governance: one idea --------------------------------------------
  const idea = await prisma.idea.upsert({
    where: { id: "idea-seed" },
    update: {},
    create: {
      id: "idea-seed",
      titleAr: "نظام تنبيهات الصيانة الاستباقية",
      description: "فكرة تجريبية للبذرة",
      activityId: activity.id,
      submittedById: editorId,
      departmentId: deptDigital.id,
      status: "SUBMITTED",
    },
  });

  // ---- 8) Solutions registry: one solution (linked from the idea) ---------
  const solution = await prisma.innovationSolution.upsert({
    where: { id: "sol-seed" },
    update: {},
    create: {
      id: "sol-seed",
      nameAr: "منصة الصيانة الاستباقية",
      description: "حل تجريبي للبذرة",
      problemStatement: "اكتشاف الأعطال بعد وقوعها بدل توقّعها مسبقًا",
      source: "ACTIVITY",
      activityId: activity.id,
      ideaId: idea.id,
      owningDepartmentId: deptDigital.id,
      strategicObjectiveId: objective.id,
      ownerUserId: editorId,
      maturityStage: "PILOT",
      implementationStatus: "IN_PROGRESS",
      durationMonths: 10,
      cost: "27000.00",
      completionPct: 60,
      evidenceReadinessPct: 40,
      status: "ACTIVE",
    },
  });

  // ---- 9) Impact: one indicator -------------------------------------------
  await prisma.impactIndicator.upsert({
    where: { id: "imp-seed" },
    update: {},
    create: {
      id: "imp-seed",
      solutionId: solution.id,
      nameAr: "نسبة تقليل زمن التوقف غير المخطط",
      type: "OPERATIONAL",
      unit: "%",
      baselineValue: "100.0000",
      targetValue: "70.0000",
      measurementMethod: "مقارنة أرباع سنوية",
    },
  });

  // ---- 10) Partners: one agreement + one meeting --------------------------
  const agreement = await prisma.cooperationAgreement.upsert({
    where: { id: "agr-seed" },
    update: {},
    create: {
      id: "agr-seed",
      partnerOrgId: partnerOrg.id,
      titleAr: "مذكرة تعاون بحثي",
      type: "RESEARCH",
      responsibleUserId: admin.id,
      renewalStatus: "NOT_DUE",
      status: "ACTIVE",
      meetingFrequencyMonths: 3,
    },
  });
  await prisma.agreementMeeting.upsert({
    where: { id: "mtg-seed" },
    update: {},
    create: { id: "mtg-seed", agreementId: agreement.id, status: "SCHEDULED" },
  });

  // ---- 11) Explicit share: partner ← solution (allow-listed) --------------
  if (partnerUser) {
    await prisma.resourceShare.upsert({
      where: { id: "share-seed" },
      update: {},
      create: {
        id: "share-seed",
        userId: partnerUser.id,
        entityType: "INNOVATION_SOLUTION",
        solutionId: solution.id,
        allowedActions: ["upload_evidence", "update_contact"],
        allowedFields: ["notes"],
        grantedById: admin.id,
      },
    });
  }

  // ---- 12) Compliance: sections + requirements (+ example rules) ----------
  const sections = [
    { id: "sec-5-23", code: "5.23", titleAr: "الابتكار المؤسسي", sectionWeight: 1, orderIndex: 1 },
    { id: "sec-5-24", code: "5.24", titleAr: "الحلول الابتكارية", sectionWeight: 1, orderIndex: 2 },
  ];
  const sectionIdByCode = new Map<string, string>();
  for (const s of sections) {
    const created = await prisma.complianceSection.upsert({
      where: { code: s.code },
      update: { titleAr: s.titleAr, sectionWeight: s.sectionWeight, orderIndex: s.orderIndex, isActive: true },
      create: { ...s, isActive: true },
    });
    sectionIdByCode.set(s.code, created.id);
  }

  const requirements = [
    { code: "5.23.1", sectionCode: "5.23", titleAr: "التوجه الاستراتيجي" },
    { code: "5.23.2", sectionCode: "5.23", titleAr: "منهجيات الابتكار وفعالياته" },
    { code: "5.23.3", sectionCode: "5.23", titleAr: "حوكمة الابتكار" },
    { code: "5.24.1", sectionCode: "5.24", titleAr: "حصر الحلول الابتكارية" },
    { code: "5.24.2", sectionCode: "5.24", titleAr: "قياس أثر الحلول" },
  ];
  for (const r of requirements) {
    await prisma.complianceRequirement.upsert({
      where: { code: r.code },
      update: {
        titleAr: r.titleAr,
        sectionCode: r.sectionCode,
        sectionId: sectionIdByCode.get(r.sectionCode),
        isActive: true,
      },
      create: {
        code: r.code,
        titleAr: r.titleAr,
        sectionCode: r.sectionCode,
        sectionId: sectionIdByCode.get(r.sectionCode),
        entityType: r.code.startsWith("5.24") ? "INNOVATION_SOLUTION" : null,
        isActive: true,
        version: 1,
      },
    });
  }

  // Example scoring config on 5.24.1 (demonstrates configurable weights/gates —
  // NOT hard-coded scoring logic; the engine itself is future scope).
  const req5241 = await prisma.complianceRequirement.findUnique({ where: { code: "5.24.1" } });
  if (req5241) {
    await prisma.requirementFieldRule.upsert({
      where: { requirementId_fieldKey: { requirementId: req5241.id, fieldKey: "strategicObjectiveId" } },
      update: {},
      create: {
        requirementId: req5241.id,
        fieldKey: "strategicObjectiveId",
        labelAr: "الهدف الاستراتيجي",
        rule: "required",
        weight: 2,
        mandatoryGate: true,
      },
    });
    await prisma.requirementEvidenceRule.upsert({
      where: { requirementId_evidenceTypeKey: { requirementId: req5241.id, evidenceTypeKey: "APPROVAL_MEMO" } },
      update: {},
      create: {
        requirementId: req5241.id,
        evidenceTypeKey: "APPROVAL_MEMO",
        labelAr: "محضر اعتماد",
        minCount: 1,
        weight: 2,
        mandatoryGate: true,
      },
    });
  }

  console.log(`Seed complete. Admin email: ${adminEmail}`);
  if (generatedAdminPassword) {
    console.log(`Generated admin password (SAVE THIS NOW, shown once): ${adminPassword}`);
  } else if (!isProd) {
    console.log(`Admin password (dev): ${adminPassword}`);
    console.log(`Demo users (dev) password: ${demoPassword} — editor@ / partner@ / viewer@innovation.local`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
