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

async function main() {
  // 1) Permissions
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
  const permByKey = new Map(permissions.map((p: { key: string; id: string }) => [p.key, p.id]));

  // 2) Roles + role→permission mapping
  for (const role of DEFAULT_ROLES) {
    const created = await prisma.role.upsert({
      where: { key: role.key },
      update: { nameAr: role.nameAr, description: role.description, isSystem: true },
      create: { key: role.key, nameAr: role.nameAr, description: role.description, isSystem: true },
    });
    const keys = DEFAULT_ROLE_PERMISSIONS[role.key];
    for (const permKey of keys) {
      const permissionId = permByKey.get(permKey);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: created.id, permissionId } },
        update: {},
        create: { roleId: created.id, permissionId },
      });
    }
  }

  // 3) Owner organization + a department
  const owner = await prisma.organization.upsert({
    where: { id: "org-owner" },
    update: {},
    create: {
      id: "org-owner",
      nameAr: "مدينة الملك عبدالله للطاقة الذرية والمتجددة",
      type: "OWNER",
    },
  });
  await prisma.department.upsert({
    where: { id: "dept-digital" },
    update: {},
    create: { id: "dept-digital", organizationId: owner.id, nameAr: "إدارة التحول الرقمي" },
  });

  // 4) System administrator user.
  //    Credentials come from env so we never ship a known password to a public
  //    deploy. In production with no SEED_ADMIN_PASSWORD, a strong random one is
  //    generated and printed once (save it). Locally it falls back to a dev value.
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@innovation.local";
  let adminPassword = process.env.SEED_ADMIN_PASSWORD;
  let generatedPassword = false;
  if (!adminPassword) {
    if (process.env.NODE_ENV === "production") {
      adminPassword = randomBytes(12).toString("base64url");
      generatedPassword = true;
    } else {
      adminPassword = "Admin@12345";
    }
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { key: ROLE_KEYS.SYSTEM_ADMIN } });
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "مدير النظام",
      passwordHash,
      status: "ACTIVE",
      jobTitle: "مدير منصة الابتكار المؤسسي",
    },
  });
  await prisma.userRole.upsert({
    where: {
      userId_roleId_scopeType_scopeId: {
        userId: admin.id,
        roleId: adminRole.id,
        scopeType: "PLATFORM",
        scopeId: "",
      },
    },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id, scopeType: "PLATFORM", scopeId: null },
  });

  // 5) Configurable compliance requirements (initial DGA structure — editable data)
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
      update: { titleAr: r.titleAr, sectionCode: r.sectionCode, isActive: true },
      create: { ...r, isActive: true, version: 1 },
    });
  }

  console.log(`Seed complete. Admin email: ${adminEmail}`);
  if (generatedPassword) {
    console.log(`Generated admin password (SAVE THIS NOW, shown once): ${adminPassword}`);
  } else if (process.env.NODE_ENV !== "production") {
    console.log(`Admin password (dev): ${adminPassword}`);
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
