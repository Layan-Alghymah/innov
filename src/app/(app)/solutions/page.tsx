import { Card, CardContent } from "@/components/ui/card";
import { StatTile } from "@/components/shared/stat-tile";
import { SolutionsTable } from "@/modules/solutions/components/solutions-table";
import { solutionsMock } from "@/modules/solutions/mock";

export default function SolutionsPage() {
  return (
    <div className="flex flex-col gap-5">
      <StatTile
        label="5.24.1 — حصر وتطوير الحلول الابتكارية وتوطينها"
        value="70%"
        sub="السجل الرئيسي للحلول الابتكارية"
        hero
      />

      <SolutionsTable data={solutionsMock} />

      <Card className="border-secondary/20 bg-secondary-50/40">
        <CardContent className="pt-5 text-[12.5px] leading-relaxed text-slate-700">
          ⏱ متطلب نطاق العمر الزمني (متطلب التطبيق 2-ب): يجب أن يكون الحل مستهدفًا منذ فترة لا تقل عن
          6 أشهر ولا تزيد عن 5 سنوات، وفي مرحلة التخطيط أو التجريب، ليكون مؤهلًا للحصر ضمن الملف الرئيسي.
        </CardContent>
      </Card>
    </div>
  );
}
