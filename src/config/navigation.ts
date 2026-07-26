import {
  LayoutDashboard,
  Landmark,
  Lightbulb,
  FolderCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Demo navigation exposes only implemented, reliable stakeholder journeys. */
export const navGroups: NavGroup[] = [
  {
    label: "مسار العرض التشغيلي",
    items: [
      { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
      { href: "/solutions", label: "الحلول الابتكارية والأدلة", icon: Lightbulb },
      { href: "/governance", label: "حوكمة الأفكار", icon: Landmark },
      { href: "/compliance", label: "ملف الامتثال", icon: FolderCheck },
    ],
  },
];

/** Human-readable Arabic titles per route, for the topbar. */
export const routeTitles: Record<string, string> = {
  "/dashboard": "لوحة المؤشرات العامة",
  "/strategy": "التوجه الاستراتيجي",
  "/activities": "منهجيات الابتكار وفعالياته",
  "/governance": "حوكمة الابتكار — من الفكرة إلى الاعتماد",
  "/solutions": "السجل الرئيسي للحلول الابتكارية",
  "/impact": "قياس أثر الحلول",
  "/partners": "سجل الجهات والشراكات",
  "/compliance": "ملف الامتثال",
};
