import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MATURITY_STAGES, type SolutionRecord } from "@/modules/solutions/types";

const stageColor: Record<string, string> = {
  مفهوم: "#7C3AED",
  "نموذج أولي (Prototype)": "#7C3AED",
  "إثبات مفهوم (PoC)": "#4F46E5",
  "نسخة تجريبية": "#F5A623",
  "تشغيل فعلي": "#16B364",
};

export function MaturityBreakdown({ solutions }: { solutions: SolutionRecord[] }) {
  const counts = MATURITY_STAGES.map((stage) => ({
    stage,
    count: solutions.filter((s) => s.maturityStage === stage).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>الحلول الابتكارية حسب مرحلة النضج</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {counts.map(({ stage, count }) => (
          <div key={stage} className="flex items-center gap-3 text-[12.5px]">
            <span className="w-40 shrink-0 text-muted">{stage}</span>
            <span className="w-12 shrink-0 text-center font-bold">{count} حل</span>
            <Progress value={(count / max) * 100} color={stageColor[stage]} height={8} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
