"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, TrendingUp, Boxes, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { ProjectStatusBadge } from "@/components/ui/badge";
import { projects, notifications, aiRecommendations, activities } from "@/lib/mock-data";

const notifIcon = { info: TrendingUp, success: Sparkles, warning: Clock, danger: AlertTriangle };
const notifColor = { info: "#3B82F6", success: "#16B364", warning: "#F5A623", danger: "#EF4444" };

export function RecentProjectsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>أحدث المشاريع</CardTitle>
        <Link href="/projects" className="text-xs font-semibold text-primary hover:underline">
          عرض الكل
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        {projects.slice(0, 4).map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col gap-2 rounded-xl border border-border p-3.5 transition-colors hover:bg-slate-50 dark:border-border-dark dark:hover:bg-white/5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {p.name}
              </span>
              <ProjectStatusBadge status={p.status} />
            </div>
            <ProgressBar value={p.progress} />
            <span className="text-xs text-muted">{p.progress}٪ مكتمل</span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

export function NotificationsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>التنبيهات</CardTitle>
        <Link href="/notifications" className="text-xs font-semibold text-primary hover:underline">
          عرض الكل
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {notifications.slice(0, 4).map((n) => {
          const Icon = notifIcon[n.type];
          return (
            <div key={n.id} className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${notifColor[n.type]}1A` }}
              >
                <Icon className="h-4 w-4" style={{ color: notifColor[n.type] }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                <p className="line-clamp-1 text-xs text-muted">{n.message}</p>
              </div>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function AIRecommendationsWidget() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary-50/60 to-secondary-50/40 dark:from-primary/5 dark:to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          توصيات الذكاء الاصطناعي
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {aiRecommendations.map((r) => (
          <div key={r.id} className="rounded-xl border border-white bg-white/80 p-3.5 dark:border-white/5 dark:bg-white/5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.title}</span>
              <span
                className="rounded-md px-2 py-0.5 text-[10px] font-bold"
                style={{
                  color: r.priority === "HIGH" ? "#EF4444" : r.priority === "MEDIUM" ? "#F5A623" : "#3B82F6",
                  backgroundColor:
                    r.priority === "HIGH" ? "#FDEEEE" : r.priority === "MEDIUM" ? "#FEF4E3" : "#EAF1FE",
                }}
              >
                {r.priority === "HIGH" ? "عالٍ" : r.priority === "MEDIUM" ? "متوسط" : "منخفض"}
              </span>
            </div>
            <p className="text-xs text-muted">{r.description}</p>
            <p className="mt-1.5 text-[11px] font-medium text-primary">{r.projectName}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ActivitiesWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>آخر الأنشطة</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        {activities.map((a) => (
          <div key={a.id} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-primary/10">
              <Boxes className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 text-sm">
              <p className="text-slate-700 dark:text-slate-200">
                <span className="font-semibold">{a.actor}</span> {a.action}{" "}
                <span className="font-semibold text-primary">{a.target}</span>
              </p>
              <span className="text-xs text-muted">{a.timestamp}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
