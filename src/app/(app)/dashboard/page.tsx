import Link from "next/link";

import { StatTile } from "@/components/shared/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadinessGrid } from "@/modules/dashboard/components/readiness-grid";
import { MaturityBreakdown } from "@/modules/dashboard/components/maturity-breakdown";
import { AlertItem } from "@/modules/alerts/components/alert-item";
import { alertsMock, urgentAlertsCount } from "@/modules/alerts/mock";
import { getAccessContext, can } from "@/server/authz";
import { getSolutionStats } from "@/modules/solutions/stats-service";
import type { SolutionStats } from "@/modules/solutions/stats-service";
import { listComplianceOverview } from "@/modules/compliance/service";
import { estimatedReadiness } from "@/modules/dashboard/readiness";

const EMPTY_STATS: SolutionStats = { total: 0, byMaturity: [], byImplementation: [], completeness: [] };

export default async function DashboardPage() {
  const reminderCount = alertsMock.length - urgentAlertsCount;
  // Real, scope-filtered solution aggregates (no mock). Nothing is fetched
  // without solution.view.
  const ctx = await getAccessContext();
  const [stats, complianceRows] = await Promise.all([
    ctx && can(ctx, "solution.view") ? getSolutionStats(ctx) : EMPTY_STATS,
    ctx && can(ctx, "compliance.view") ? listComplianceOverview(ctx) : [],
  ]);
  const readiness = estimatedReadiness(complianceRows);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="مؤشر جاهزية تقديري داخلي"
          value={readiness === null ? "—" : `${readiness}%`}
          sub={
            complianceRows.length
              ? `متوسط ${complianceRows.length} من الحلول ضمن نطاق صلاحياتك`
              : "لا توجد حلول مهيأة للحساب ضمن نطاق صلاحياتك"
          }
          href="/compliance"
          hero
        />
        <StatTile
          label="الحلول الابتكارية المسجّلة"
          value={String(stats.total)}
          sub="ضمن نطاق صلاحياتك"
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

      <ReadinessGrid rows={complianceRows} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MaturityBreakdown stats={stats} />
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
