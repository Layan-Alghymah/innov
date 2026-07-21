import { FolderKanban, Activity, AlertTriangle, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProgressAreaChart, DomainPieChart, DepartmentBarChart } from "@/components/dashboard/charts";
import {
  RecentProjectsWidget,
  NotificationsWidget,
  AIRecommendationsWidget,
  ActivitiesWidget,
} from "@/components/dashboard/side-widgets";
import { dashboardStats } from "@/lib/mock-data";

export default function DashboardPage() {
  const s = dashboardStats;

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي المشاريع" value={s.totalProjects} delta={s.totalProjectsDelta} icon={FolderKanban} iconColor="#4F46E5" index={0} />
        <StatCard label="المشاريع النشطة" value={s.activeProjects} delta={s.activeProjectsDelta} icon={Activity} iconColor="#16B364" index={1} />
        <StatCard label="المشاريع المتعثرة" value={s.atRiskProjects} delta={s.atRiskProjectsDelta} icon={AlertTriangle} iconColor="#EF4444" index={2} />
        <StatCard label="عدد الموظفين" value={s.totalEmployees} delta={s.totalEmployeesDelta} icon={Users} iconColor="#7C3AED" index={3} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProgressAreaChart />
        </div>
        <DomainPieChart />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <DepartmentBarChart />
          <RecentProjectsWidget />
        </div>
        <div className="flex flex-col gap-5">
          <AIRecommendationsWidget />
          <NotificationsWidget />
          <ActivitiesWidget />
        </div>
      </div>
    </div>
  );
}
