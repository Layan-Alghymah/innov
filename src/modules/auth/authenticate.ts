import bcrypt from "bcryptjs";

import { prisma } from "@/server/db";

export type AuthPrincipal = {
  id: string;
  name: string;
  email: string;
  registrationStatus: "PENDING" | "APPROVED" | "REJECTED";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  roleKeys: string[];
};

export type AuthResult =
  | { ok: true; user: AuthPrincipal }
  | { ok: false; reason: "INVALID_CREDENTIALS" | "PENDING" | "REJECTED" | "INACTIVE" | "SUSPENDED"; userId?: string };

/**
 * Server-side credential check with account-state gating (Task C).
 * A user authenticates ONLY when the password is correct AND
 * registrationStatus = APPROVED AND status = ACTIVE. Password verification is
 * never weakened or skipped. Reasons are distinguished only AFTER a correct
 * password, so account state is not disclosed to arbitrary users.
 */
export async function authenticateCredentials(emailRaw: string, password: string): Promise<AuthResult> {
  const email = emailRaw.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      registrationStatus: true,
      status: true,
      roleAssignments: { select: { role: { select: { key: true } } } },
    },
  });

  if (!user?.passwordHash) return { ok: false, reason: "INVALID_CREDENTIALS" };
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { ok: false, reason: "INVALID_CREDENTIALS" };

  // Password correct — now gate on registration + operational status.
  if (user.registrationStatus === "PENDING") return { ok: false, reason: "PENDING", userId: user.id };
  if (user.registrationStatus === "REJECTED") return { ok: false, reason: "REJECTED", userId: user.id };
  if (user.status === "INACTIVE") return { ok: false, reason: "INACTIVE", userId: user.id };
  if (user.status === "SUSPENDED") return { ok: false, reason: "SUSPENDED", userId: user.id };

  const roleKeys = Array.from(new Set(user.roleAssignments.map((r) => r.role.key)));
  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      registrationStatus: user.registrationStatus,
      status: user.status,
      roleKeys,
    },
  };
}
