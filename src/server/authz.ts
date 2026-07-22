import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/server/db";
import type { PermissionKey } from "@/modules/auth/permissions";

export interface ScopeGrant {
  scopeType: string;
  scopeId: string | null;
}

export interface AccessContext {
  userId: string;
  name: string;
  email: string;
  permissions: Set<PermissionKey>;
  scopes: ScopeGrant[];
}

/**
 * Resolve the current user's effective permissions and data scopes from the
 * database. Deduped per-request via React `cache`. Returns null when there is
 * no valid session.
 */
export const getAccessContext = cache(async (): Promise<AccessContext | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      roleAssignments: {
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      },
    },
  });
  if (!user || user.status !== "ACTIVE") return null;

  const permissions = new Set<PermissionKey>();
  const scopes: ScopeGrant[] = [];
  for (const assignment of user.roleAssignments) {
    scopes.push({ scopeType: assignment.scopeType, scopeId: assignment.scopeId });
    for (const rp of assignment.role.permissions) {
      permissions.add(rp.permission.key as PermissionKey);
    }
  }

  return { userId: user.id, name: user.name, email: user.email, permissions, scopes };
});

/** Require a session; redirect to /login otherwise. Returns the access context. */
export async function requireUser(): Promise<AccessContext> {
  const ctx = await getAccessContext();
  if (!ctx) redirect("/login");
  return ctx;
}

/** Require a specific permission; redirect to /login when unauthenticated,
 *  or throw (→ nearest error boundary) when authenticated but unauthorized. */
export async function requirePermission(permission: PermissionKey): Promise<AccessContext> {
  const ctx = await requireUser();
  if (!ctx.permissions.has(permission)) {
    throw new Error("FORBIDDEN: missing permission " + permission);
  }
  return ctx;
}

export function can(ctx: AccessContext | null, permission: PermissionKey): boolean {
  return !!ctx?.permissions.has(permission);
}

/** True when the caller has an unrestricted (platform-wide) grant. */
export function hasPlatformScope(ctx: AccessContext | null): boolean {
  return !!ctx?.scopes.some((s) => s.scopeType === "PLATFORM");
}
