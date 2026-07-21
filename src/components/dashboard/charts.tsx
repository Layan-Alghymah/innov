"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { areaChartData, projectsByDomain, barChartData } from "@/lib/mock-data";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #E6EAF2",
  fontSize: 12,
  fontFamily: "var(--font-ibm-plex-arabic)",
  boxShadow: "0 4px 24px -4px rgba(19,42,99,0.12)",
};

export function ProgressAreaChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تقدّم المشاريع مقابل الخطة</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={areaChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPlan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EAF2" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8A93A6" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#8A93A6" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="مخطط" stroke="#7C3AED" fill="url(#colorPlan)" strokeWidth={2} />
            <Area type="monotone" dataKey="إنجاز" stroke="#4F46E5" fill="url(#colorDone)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DomainPieChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>توزيع المشاريع حسب المجال</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={projectsByDomain}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              strokeWidth={0}
            >
              {projectsByDomain.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-ibm-plex-arabic)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DepartmentBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>عدد المشاريع حسب القسم</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EAF2" />
            <XAxis dataKey="department" tick={{ fontSize: 11, fill: "#8A93A6" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#8A93A6" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#4F46E50D" }} />
            <Bar dataKey="مشاريع" fill="#4F46E5" radius={[8, 8, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
