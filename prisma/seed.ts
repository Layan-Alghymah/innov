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

  // 4) System administrator user (local-dev credentials)
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { key: ROLE_KEYS.SYSTEM_ADMIN } });
  const passwordHash = await bcrypt.hash("Admin@12345", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@innovation.local" },
    update: {},
    create: {
      email: "admin@innovation.local",
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

  console.log("Seed complete. Admin login: admin@innovation.local / Admin@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
