import { Info } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { EvidenceReadiness } from "@/modules/evidence/service";

/**
 * Evidence readiness ONLY — approved ÷ tracked evidence. Deliberately labelled
 * so it is never mistaken for compliance/DGA/estimated readiness.
 */
export function EvidenceReadinessCard({ readiness }: { readiness: EvidenceReadiness }) {
  const color = readiness.percentage >= 80 ? "#16B364" : readiness.percentage >= 40 ? "#F79009" : "#EF4444";

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="text-[13px] font-bold text-slate-800 dark:text-slate-100">جاهزية الأدلة فقط</div>
            <div className="mt-0.5 text-[11.5px] text-muted">
              الأدلة المعتمدة ÷ الأدلة المتتبَّعة ({readiness.approved} من {readiness.expected})
            </div>
          </div>
          <div className="text-2xl font-extrabold" style={{ color }}>
            {readiness.percentage}%
          </div>
        </div>

        <div className="mt-3">
          <Progress value={readiness.percentage} color={color} height={7} />
        </div>

        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-info-bg px-3 py-2 text-[11.5px] leading-relaxed text-info">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          هذا المؤشر يقيس اعتماد الأدلة فقط. وهو ليس جاهزية امتثال، ولا جاهزية DGA، ولا مؤشر جاهزية تقديري.
        </p>
      </CardContent>
    </Card>
  );
}
