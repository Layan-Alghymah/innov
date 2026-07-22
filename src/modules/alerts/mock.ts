import type { AlertItemData } from "./types";

/** Typed seed/mock alerts preserved from the Vite prototype (`ALERTS`). */
export const alertsMock: AlertItemData[] = [
  {
    id: "alert-1",
    title: "اجتماع دوري متأخر — شركة سهم",
    detail: "تجاوز الموعد المحدد للاجتماع الربعي. آخر اجتماع: 10 فبراير 2026",
    tag: "البند 5.23.1 / انتهاء تعاون",
    severity: "urgent",
  },
  {
    id: "alert-2",
    title: "ملف بيانات ناقص — شُمّان",
    detail: "نسبة اكتمال الحقول المطلوبة 62% فقط. غير قابل للإثبات ضمن التقرير.",
    tag: "البند 5.24.1",
    severity: "reminder",
  },
  {
    id: "alert-3",
    title: "ملف بيانات ناقص — يّـن",
    detail: "نسبة اكتمال الحقول المطلوبة 55% فقط. غير قابل للإثبات ضمن التقرير.",
    tag: "البند 5.24.1",
    severity: "reminder",
  },
  {
    id: "alert-4",
    title: "نافذة قياس أثر مفتوحة — سنَد",
    detail: "حان موعد تسجيل قياس الأثر التشغيلي للربع الحالي.",
    tag: "البند 5.24.2",
    severity: "reminder",
  },
];

export const urgentAlertsCount = alertsMock.filter((a) => a.severity === "urgent").length;
