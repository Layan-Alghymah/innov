"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAccessContext } from "@/server/authz";
import { isAuthorizationError } from "@/server/authorization";
import {
  uploadEvidence,
  submitEvidence,
  startEvidenceReview,
  approveEvidence,
  rejectEvidence,
  archiveEvidence,
  linkEvidence,
  unlinkEvidence,
  EvidenceError,
} from "./service";
import { MAX_FILE_BYTES } from "./schema";

export interface EvidenceFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
export interface EvidenceActionState {
  error?: string;
  success?: string;
}

const MSG: Record<string, string> = {
  FORBIDDEN: "لا تملك صلاحية تنفيذ هذا الإجراء",
  OUT_OF_SCOPE: "هذا السجل خارج نطاق صلاحياتك",
  NOT_FOUND: "السجل غير موجود",
  SHARE_INACTIVE: "لا توجد مشاركة سارية لهذا الحل",
  ACTION_NOT_ALLOWED: "رفع الأدلة غير مسموح ضمن المشاركة الممنوحة لك",
  VALIDATION: "يرجى تصحيح الحقول المطلوبة",
  INVALID_TRANSITION: "لا يمكن تنفيذ هذا الإجراء على حالة الدليل الحالية",
  UNSUPPORTED_FILE: "نوع الملف غير مدعوم (المسموح: PDF، DOCX، XLSX)",
  FILE_TOO_LARGE: "حجم الملف يتجاوز الحد المسموح",
  DUPLICATE: "الربط موجود بالفعل",
  BAD_REFERENCE: "السجل المستهدف غير صالح",
};

function message(e: unknown): string {
  if (e instanceof EvidenceError) {
    const specific = e.message && e.message !== e.code ? e.message : null;
    return specific ?? MSG[e.code] ?? "تعذّر تنفيذ الإجراء";
  }
  if (isAuthorizationError(e)) return MSG[e.code] ?? "غير مصرّح";
  throw e; // re-throw NEXT_REDIRECT / unknown
}
function toFormState(e: unknown): EvidenceFormState {
  const msg = message(e);
  return { error: msg, fieldErrors: e instanceof EvidenceError ? e.fieldErrors : undefined };
}

function revalidate(solutionId: string, evidenceId?: string) {
  revalidatePath(`/solutions/${solutionId}/evidence`);
  if (evidenceId) revalidatePath(`/solutions/${solutionId}/evidence/${evidenceId}`);
  revalidatePath(`/solutions/${solutionId}`);
}

/**
 * Upload: the real file is read server-side to derive its true size and a
 * SHA-256 checksum (never trusting client-declared values). Binary retention is
 * not implemented — see the Phase 5A limitations.
 */
export async function uploadEvidenceAction(_p: EvidenceFormState, fd: FormData): Promise<EvidenceFormState> {
  const ctx = await getAccessContext();
  if (!ctx) return { error: "غير مصرّح" };
  const solutionId = String(fd.get("solutionId") ?? "");

  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "يرجى اختيار ملف" };
  if (file.size > MAX_FILE_BYTES) return { error: MSG.FILE_TOO_LARGE };

  let checksum: string;
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    checksum = createHash("sha256").update(bytes).digest("hex");
  } catch {
    return { error: "تعذّر قراءة الملف" };
  }

  let created: { id: string };
  try {
    created = await uploadEvidence(
      ctx,
      solutionId,
      {
        title: fd.get("title"),
        description: fd.get("description"),
        classification: fd.get("classification"),
      },
      { fileName: file.name, mimeType: file.type, sizeBytes: file.size, checksum },
    );
  } catch (e) {
    return toFormState(e);
  }
  revalidate(solutionId, created.id);
  redirect(`/solutions/${solutionId}/evidence/${created.id}`);
}

async function runTransition(
  fd: FormData,
  fn: (ctx: NonNullable<Awaited<ReturnType<typeof getAccessContext>>>, id: string) => Promise<unknown>,
  success: string,
): Promise<EvidenceActionState> {
  const ctx = await getAccessContext();
  if (!ctx) return { error: "غير مصرّح" };
  const evidenceId = String(fd.get("evidenceId") ?? "");
  const solutionId = String(fd.get("solutionId") ?? "");
  try {
    await fn(ctx, evidenceId);
  } catch (e) {
    return { error: message(e) };
  }
  revalidate(solutionId, evidenceId);
  return { success };
}

export async function submitEvidenceAction(_p: EvidenceActionState, fd: FormData) {
  return runTransition(fd, submitEvidence, "تم تقديم الدليل للمراجعة");
}
export async function startReviewAction(_p: EvidenceActionState, fd: FormData) {
  return runTransition(fd, startEvidenceReview, "بدأت مراجعة الدليل");
}
export async function approveEvidenceAction(_p: EvidenceActionState, fd: FormData) {
  return runTransition(fd, approveEvidence, "تم اعتماد الدليل");
}
export async function archiveEvidenceAction(_p: EvidenceActionState, fd: FormData) {
  return runTransition(fd, archiveEvidence, "تمت أرشفة الدليل");
}

export async function rejectEvidenceAction(_p: EvidenceActionState, fd: FormData): Promise<EvidenceActionState> {
  const ctx = await getAccessContext();
  if (!ctx) return { error: "غير مصرّح" };
  const evidenceId = String(fd.get("evidenceId") ?? "");
  const solutionId = String(fd.get("solutionId") ?? "");
  try {
    await rejectEvidence(ctx, evidenceId, String(fd.get("reason") ?? ""));
  } catch (e) {
    return { error: message(e) };
  }
  revalidate(solutionId, evidenceId);
  return { success: "تم رفض الدليل" };
}

export async function linkEvidenceAction(_p: EvidenceActionState, fd: FormData): Promise<EvidenceActionState> {
  const ctx = await getAccessContext();
  if (!ctx) return { error: "غير مصرّح" };
  const evidenceId = String(fd.get("evidenceId") ?? "");
  const solutionId = String(fd.get("solutionId") ?? "");
  try {
    await linkEvidence(ctx, evidenceId, {
      entityType: fd.get("entityType"),
      entityId: fd.get("entityId"),
      requirementId: fd.get("requirementId"),
    });
  } catch (e) {
    return { error: message(e) };
  }
  revalidate(solutionId, evidenceId);
  return { success: "تم ربط الدليل" };
}

export async function unlinkEvidenceAction(_p: EvidenceActionState, fd: FormData): Promise<EvidenceActionState> {
  const ctx = await getAccessContext();
  if (!ctx) return { error: "غير مصرّح" };
  const evidenceId = String(fd.get("evidenceId") ?? "");
  const solutionId = String(fd.get("solutionId") ?? "");
  try {
    await unlinkEvidence(ctx, String(fd.get("linkId") ?? ""));
  } catch (e) {
    return { error: message(e) };
  }
  revalidate(solutionId, evidenceId);
  return { success: "تم إلغاء الربط" };
}
