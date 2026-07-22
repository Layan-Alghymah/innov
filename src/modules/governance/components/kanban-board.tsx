"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core";

import { cn, readinessColor } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { GOVERNANCE_COLUMNS, type GovernanceColumn, type SolutionRecord } from "@/modules/solutions/types";

/**
 * Governance Kanban shell. Columns and card placement are driven by the
 * `governanceColumn` field on each record (i.e. the workflow status is data,
 * not merely a visual position). Drag-and-drop updates local state here; a later
 * phase will persist the status change via a server action + audit log.
 */
function Card({ solution }: { solution: SolutionRecord }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: solution.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "mb-2.5 cursor-grab rounded-xl border border-border bg-surface p-3.5 active:cursor-grabbing dark:border-border-dark dark:bg-surface-dark",
        isDragging && "opacity-50 shadow-card-hover",
      )}
    >
      <div className="mb-1.5 text-[13px] font-bold text-slate-800 dark:text-slate-100">{solution.name}</div>
      <div className="mb-2 text-[11px] text-muted">{solution.owner}</div>
      <Progress value={solution.readinessPct} color={readinessColor(solution.readinessPct)} height={5} />
      <div className="mt-1 text-start text-[10.5px] text-muted">جاهزية الملف: {solution.readinessPct}%</div>
    </div>
  );
}

function Column({ column, items }: { column: GovernanceColumn; items: SolutionRecord[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: column });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl bg-slate-100/70 p-3 transition-colors dark:bg-white/5",
        isOver && "ring-2 ring-primary/40",
      )}
    >
      <div className="px-2 pb-2.5 pt-1.5 text-[12.5px] text-muted">
        {column} <span>({items.length})</span>
      </div>
      {items.length === 0 ? (
        <div className="px-1 py-2.5 text-[11.5px] text-muted">لا توجد بطاقات</div>
      ) : (
        items.map((item) => <Card key={item.id} solution={item} />)
      )}
    </div>
  );
}

export function KanbanBoard({ solutions }: { solutions: SolutionRecord[] }) {
  const [items, setItems] = useState(solutions);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byColumn = useMemo(() => {
    const map = new Map<GovernanceColumn, SolutionRecord[]>();
    for (const col of GOVERNANCE_COLUMNS) map.set(col, []);
    for (const s of items) map.get(s.governanceColumn)?.push(s);
    return map;
  }, [items]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const target = over.id as GovernanceColumn;
    if (!GOVERNANCE_COLUMNS.includes(target)) return;
    setItems((prev) =>
      prev.map((s) => (s.id === active.id ? { ...s, governanceColumn: target } : s)),
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {GOVERNANCE_COLUMNS.map((col) => (
          <Column key={col} column={col} items={byColumn.get(col) ?? []} />
        ))}
      </div>
    </DndContext>
  );
}
