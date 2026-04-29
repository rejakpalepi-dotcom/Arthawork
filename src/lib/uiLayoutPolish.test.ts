import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(__dirname, "../../", relativePath), "utf-8");
}

describe("Authenticated layout polish regressions", () => {
  it("dashboard, invoices, proposals, and settings expose dedicated visual shells", () => {
    const dashboard = readProjectFile("src/pages/Dashboard.tsx");
    const invoices = readProjectFile("src/pages/Invoices.tsx");
    const proposals = readProjectFile("src/pages/Proposals.tsx");
    const settings = readProjectFile("src/pages/Settings.tsx");

    expect(dashboard).toContain('data-ui-shell="dashboard-overview"');
    expect(invoices).toContain('data-ui-shell="invoice-overview"');
    expect(proposals).toContain('data-ui-shell="proposal-overview"');
    expect(settings).toContain('data-ui-shell="settings-workspace"');
  });
});
