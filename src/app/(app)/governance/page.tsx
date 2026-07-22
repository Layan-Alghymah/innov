import { StatTile } from "@/components/shared/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KanbanBoard } from "@/modules/governance/components/kanban-board";
import { solutionsMock } from "@/modules/solutions/mock";

export default function GovernancePage() {
  return (
    <div className="flex flex-col gap-5">
      <StatTile label="5.23.3 — حوكمة وتفعيل الابتكار" value="68%" sub="جاهزية البند" hero />

      <Card>
        <CardHeader>
          <CardTitle>لوحة بطاقات مبادرات الابتكار الرقمي — اسحب البطاقة لتغيير حالتها</CardTitle>
        </CardHeader>
        <CardContent>
          <KanbanBoard solutions={solutionsMock} />
        </CardContent>
      </Card>
    </div>
  );
}
