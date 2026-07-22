"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { readinessColor } from "@/lib/utils";
import type { SolutionRecord } from "@/modules/solutions/types";

const column = createColumnHelper<SolutionRecord>();

export function SolutionsTable({ data }: { data: SolutionRecord[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      column.accessor("name", {
        header: "الحل",
        cell: (info) => <span className="font-bold text-slate-800 dark:text-slate-100">{info.getValue()}</span>,
      }),
      column.accessor("maturityStage", {
        header: "مرحلة النضج",
        cell: (info) => <Badge>{info.getValue()}</Badge>,
      }),
      column.accessor("owner", { header: "الجهة المالكة" }),
      column.accessor("source", { header: "المصدر" }),
      column.accessor("readinessPct", {
        header: "جاهزية الملف",
        cell: (info) => {
          const pct = info.getValue();
          return (
            <div className="flex items-center gap-2">
              <Progress value={pct} color={readinessColor(pct)} className="w-16" />
              <span className="w-8 text-[11.5px] font-bold">{pct}%</span>
            </div>
          );
        },
      }),
      column.accessor("governanceColumn", {
        header: "حالة الحوكمة",
        cell: (info) => <Badge>{info.getValue()}</Badge>,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="card-surface overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.column.getCanSort() ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
