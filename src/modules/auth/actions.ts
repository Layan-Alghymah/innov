"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";

import { signIn, signOut } from "@/auth";
import { loginSchema } from "./schema";
import { authenticateCredentials } from "./authenticate";
import { writeAudit, AUDIT } from "@/server/audit";

export interface LoginState {
  error?: string;
}

type BlockedReason = "PENDING" | "REJECTED" | "INACTIVE" | "SUSPENDED";

const BLOCKED_MESSAGE: Record<BlockedReason, string> = {
  PENDING: "حسابك قيد المراجعة من قِبل مدير النظام. سيتم إشعارك عند الاعتماد.",
  REJECTED: "تم رفض طلب التسجيل. للاستفسار يرجى التواصل مع مدير النظام.",
  INACTIVE: "الحساب غير مُفعّل حاليًا. يرجى التواصل مع مدير النظام.",
  SUSPENDED: "تم إيقاف الحساب مؤقتًا. يرجى التواصل مع مدير النظام.",
};

const BLOCKED_AUDIT = {
  PENDING: AUDIT.LOGIN_BLOCKED_PENDING,
  REJECTED: AUDIT.LOGIN_BLOCKED_REJECTED,
  INACTIVE: AUDIT.LOGIN_BLOCKED_INACTIVE,
  SUSPENDED: AUDIT.LOGIN_BLOCKED_SUSPENDED,
} as const;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "يرجى إدخال بريد إلكتروني وكلمة مرور صحيحين" };
  }

  // Determine the specific reason (and audit blocked states) BEFORE issuing a
  // session. This runs server-side and never reveals account state without a
  // correct password.
  const result = await authenticateCredentials(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    if (result.reason !== "INVALID_CREDENTIALS") {
      const h = headers();
      await writeAudit({
        actorUserId: result.userId ?? null,
        action: BLOCKED_AUDIT[result.reason],
        entityId: result.userId ?? null,
        summary: "محاولة دخول محجوبة",
        ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
        userAgent: h.get("user-agent") ?? null,
      });
      return { error: BLOCKED_MESSAGE[result.reason] };
    }
    return { error: "بريد إلكتروني أو كلمة مرور غير صحيحة" };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "بريد إلكتروني أو كلمة مرور غير صحيحة" };
    }
    throw error; // re-throw NEXT_REDIRECT and other control-flow errors
  }
  return {};
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
