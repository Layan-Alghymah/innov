import Link from "next/link";

import { StatTile } from "@/components/shared/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadinessGrid } from "@/modules/dashboard/components/readiness-grid";
import { MaturityBreakdown } from "@/modules/dashboard/components/maturity-breakdown";
import { overallReadinessPct } from "@/modules/dashboard/mock";
import { AlertItem } from "@/modules/alerts/components/alert-item";
import { solutionsMock } from "@/modules/solutions/mock";
import { alertsMock, urgentAlertsCount } from "@/modules/alerts/mock";

export default function DashboardPage() {
  const reminderCount = alertsMock.length - urgentAlertsCount;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="الجاهزية الإجمالية للامتثال (DGA)"
          value={`${overallReadinessPct}%`}
          sub="▲ أعلى من آخر تقييم بـ 6 نقاط"
          href="/compliance"
          hero
        />
        <StatTile
          label="الحلول الابتكارية المسجّلة"
          value={String(solutionsMock.length)}
          sub="عدّة حلول من هاكاثون المعسكر"
          href="/solutions"
        />
        <StatTile label="الفعاليات الابتكارية هذا العام" value="9" sub="تجاوزت الحد الأدنى (3)" href="/activities" />
        <StatTile
          label="تنبيهات تتطلب إجراء"
          value={String(alertsMock.length)}
          sub={`${urgentAlertsCount} عاجل / ${reminderCount} تذكير`}
          href="/alerts"
          danger
        />
      </div>

      <ReadinessGrid />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MaturityBreakdown solutions={solutionsMock} />
        <Card>
          <CardHeader>
            <CardTitle>أحدث التنبيهات الزمنية</CardTitle>
            <Link href="/alerts" className="text-[11.5px] font-semibold text-primary hover:underline">
              عرض الكل ‹
            </Link>
          </CardHeader>
          <CardContent>
            {alertsMock.slice(0, 3).map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
