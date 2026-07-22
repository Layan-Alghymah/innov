import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { readinessColor } from "@/lib/utils";
import { readinessCriteria } from "@/modules/dashboard/mock";

export function ReadinessGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {readinessCriteria.map((c) => (
        <Link key={c.code} href={c.href}>
          <Card className="p-5 hover:shadow-card-hover">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-2xl font-extrabold" style={{ color: readinessColor(c.pct) }}>
                {c.pct}%
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] text-muted dark:bg-white/10">
                {c.code}
              </span>
            </div>
            <div className="mb-2.5 text-[13px] font-semibold">{c.name}</div>
            <Progress value={c.pct} color={readinessColor(c.pct)} />
          </Card>
        </Link>
      ))}
    </div>
  );
}
