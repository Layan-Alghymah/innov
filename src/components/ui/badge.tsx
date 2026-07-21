import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        success: "bg-success-bg text-success",
        warning: "bg-warning-bg text-warning",
        danger: "bg-danger-bg text-danger",
        info: "bg-info-bg text-info",
        neutral: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300",
        primary: "bg-primary-50 text-primary-600 dark:bg-primary/10 dark:text-primary-400",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const statusMap: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
  ACTIVE: { variant: "success", label: "نشط" },
  AT_RISK: { variant: "danger", label: "متعثر" },
  COMPLETED: { variant: "info", label: "مكتمل" },
  PLANNING: { variant: "warning", label: "قيد التخطيط" },
};

export function ProjectStatusBadge({ status }: { status: keyof typeof statusMap }) {
  const s = statusMap[status];
  return (
    <Badge variant={s.variant} dot>
      {s.label}
    </Badge>
  );
}
