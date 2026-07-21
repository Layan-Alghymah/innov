"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  iconColor = "#4F46E5",
  index = 0,
}: {
  label: string;
  value: number;
  delta: number;
  icon: LucideIcon;
  iconColor?: string;
  index?: number;
}) {
  const positive = delta >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted dark:text-slate-400">{label}</span>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${iconColor}1A` }}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          {formatNumber(value)}
        </span>
        <span
          className={cn(
            "flex items-center gap-0.5 text-xs font-semibold",
            positive ? "text-success" : "text-danger"
          )}
        >
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(delta)}
        </span>
      </div>
    </motion.div>
  );
}
