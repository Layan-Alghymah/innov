import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

import { estimatedReadiness } from "@/modules/dashboard/readiness";

describe("dashboard estimated readiness", () => {
  it("aggregates only real scored solution rows", () => {
    expect(
      estimatedReadiness([
        { solutionId: "a", nameAr: "أ", departmentAr: null, overallReadiness: 60 },
        { solutionId: "b", nameAr: "ب", departmentAr: null, overallReadiness: null },
        { solutionId: "c", nameAr: "ج", departmentAr: null, overallReadiness: 90 },
      ]),
    ).toBe(75);
    expect(estimatedReadiness([])).toBeNull();
  });

  it("uses the internal estimated label and no fabricated DGA/delta mock", () => {
    const page = readFileSync(path.join(process.cwd(), "src/app/(app)/dashboard/page.tsx"), "utf8");
    const grid = readFileSync(path.join(process.cwd(), "src/modules/dashboard/components/readiness-grid.tsx"), "utf8");
    expect(page).toContain("مؤشر جاهزية تقديري داخلي");
    expect(page).toContain("listComplianceOverview");
    expect(page).not.toContain("(DGA)");
    expect(page).not.toContain("overallReadinessPct");
    expect(page).not.toContain("أعلى من آخر تقييم");
    expect(grid).not.toContain("@/modules/dashboard/mock");
  });
});
