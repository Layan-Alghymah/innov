"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { loginSchema } from "./schema";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "يرجى إدخال بريد إلكتروني وكلمة مرور صحيحين" };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "بريد إلكتروني أو كلمة مرور غير صحيحة" };
    }
    // Re-throw redirect (NEXT_REDIRECT) and any other control-flow errors.
    throw error;
  }
  return {};
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
