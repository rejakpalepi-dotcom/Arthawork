import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(__dirname, "../../", relativePath), "utf-8");
}

describe("UI copy localization regressions", () => {
  it("sidebar navigation no longer exposes English primary labels", () => {
    const content = readProjectFile("src/components/layout/Sidebar.tsx");

    expect(content).not.toContain('"Invoices"');
    expect(content).not.toContain('"Proposals"');
    expect(content).not.toContain('"Clients"');
    expect(content).not.toContain('"Services"');
    expect(content).not.toContain('"Projects"');
    expect(content).not.toContain('"Settings"');
    expect(content).not.toContain('"Sign Out"');
  });

  it("dashboard and quick actions use Indonesian action copy", () => {
    const dashboard = readProjectFile("src/pages/Dashboard.tsx");
    const actions = readProjectFile("src/components/dashboard/QuickActions.tsx");

    expect(dashboard).not.toContain("New Project");
    expect(dashboard).not.toContain("Revenue Trends");
    expect(actions).not.toContain("Quick Actions");
    expect(actions).not.toContain("New Invoice");
    expect(actions).not.toContain("New Proposal");
    expect(actions).not.toContain("Add Client");
    expect(actions).not.toContain("Export Report");
  });

  it("landing page no longer includes the SaaS badge copy", () => {
    const landing = readProjectFile("src/pages/LandingPage.tsx");

    expect(landing).not.toContain("SaaS untuk freelancer Indonesia");
  });
});
