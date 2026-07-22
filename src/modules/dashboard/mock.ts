/** Per-requirement readiness figures for the dashboard (shell phase). */
export interface ReadinessCriterion {
  code: string;
  name: string;
  pct: number;
  href: string;
}

export const readinessCriteria: ReadinessCriterion[] = [
  { code: "5.23.1", name: "التوجه الاستراتيجي", pct: 82, href: "/strategy" },
  { code: "5.23.2", name: "منهجيات الابتكار وفعالياته", pct: 91, href: "/activities" },
  { code: "5.23.3", name: "حوكمة الابتكار", pct: 68, href: "/governance" },
  { code: "5.24.1", name: "حصر الحلول الابتكارية", pct: 70, href: "/solutions" },
  { code: "5.24.2", name: "قياس الأثر", pct: 100, href: "/impact" },
];

export const overallReadinessPct = 82;
