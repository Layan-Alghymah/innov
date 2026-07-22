import {
  LayoutDashboard,
  Bell,
  Target,
  Sparkles,
  Landmark,
  Lightbulb,
  TrendingUp,
  Handshake,
  FolderCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: "alerts";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Navigation preserved from the Vite prototype, grouped by DGA compliance areas
 * (5.23 institutional innovation, 5.24 innovation solutions) plus operations.
 */
export const navGroups: NavGroup[] = [
  {
    label: "الرئيسية",
    items: [
      { href: "/dashboard", label: "لوحة المؤشرات", icon: LayoutDashboard },
      { href: "/alerts", label: "مركز التنبيهات", icon: Bell, badgeKey: "alerts" },
    ],
  },
  {
    label: "المسار الظاهر — 5.23 الابتكار المؤسسي",
    items: [
      { href: "/strategy", label: "التوجه الاستراتيجي", icon: Target },
      { href: "/activities", label: "منهجيات الابتكار وفعالياته", icon: Sparkles },
      { href: "/governance", label: "حوكمة الابتكار", icon: Landmark },
    ],
  },
  {
    label: "المسار الظاهر — 5.24 الحلول الابتكارية",
    items: [
      { href: "/solutions", label: "حصر الحلول الابتكارية", icon: Lightbulb },
      { href: "/impact", label: "قياس الأثر", icon: TrendingUp },
    ],
  },
  {
    label: "الإدارة والتشغيل",
    items: [
      { href: "/partners", label: "سجل الجهات والشراكات", icon: Handshake },
      { href: "/compliance", label: "ملف الامتثال (DGA)", icon: FolderCheck },
    ],
  },
];

/** Human-readable Arabic titles per route, for the topbar. */
export const routeTitles: Record<string, string> = {
  "/dashboard": "لوحة المؤشرات العامة",
  "/alerts": "مركز التنبيهات الزمنية",
  "/strategy": "التوجه الاستراتيجي",
  "/activities": "منهجيات الابتكار وفعالياته",
  "/governance": "حوكمة الابتكار — من الفكرة إلى الاعتماد",
  "/solutions": "السجل الرئيسي للحلول الابتكارية",
  "/impact": "قياس أثر الحلول",
  "/partners": "سجل الجهات والشراكات",
  "/compliance": "ملف الامتثال (DGA)",
};
