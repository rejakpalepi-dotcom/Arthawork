import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProposalPreview } from "@/components/proposal/ProposalPreview";
import type { ProposalData } from "@/pages/ProposalBuilder";

const proposalFixture: ProposalData = {
  projectTitle: "Retainer Redesign Website",
  clientId: "client-1",
  clientName: "Rejak",
  clientCompany: "Arthawork",
  studioName: "Artha Studio",
  tagline: "Proposal yang lebih rapi dan lebih cepat dibayar",
  year: "2026",
  introTitle: "Kenapa proyek ini layak dijalankan bersama",
  introText: "Short intro copy.",
  heroImageUrl: "",
  experienceTitle: "Dipercaya brand yang sedang tumbuh",
  experienceSubtitle: "Pengalaman yang membangun kejelasan dan kepercayaan",
  projectCount: "50+",
  countriesCount: "12",
  rating: "5.0",
  clientLogos: ["", "", "", "", "", ""],
  selectedServices: [
    {
      id: "svc-1",
      name: "Landing Page Design",
      description: "UI design and responsive layouts",
      price: 18500000,
      unit: "project",
    },
  ],
  customServices: [],
  milestones: [
    {
      id: "m-1",
      week: "Week 1",
      title: "Discovery",
      description: "Stakeholder alignment and scope review",
    },
  ],
  taxRate: 0,
  investmentNotes: "Payment due in 14 days.",
};

describe("ProposalPreview visual modes", () => {
  it("renders the cover with a dark shell", () => {
    const html = renderToStaticMarkup(
      <ProposalPreview currentPage={1} data={proposalFixture} />,
    );

    expect(html).toContain("bg-[#1a1a1a] text-white");
    expect(html).toContain("Proposal Proyek");
  });

  it("renders the closing investment page with the same dark shell family", () => {
    const html = renderToStaticMarkup(
      <ProposalPreview currentPage={6} data={proposalFixture} />,
    );

    expect(html).toContain("bg-[#1a1a1a] text-white");
    expect(html).toContain("Siap memulai?");
    expect(html).toContain("Mulai proyek");
    expect(html).toContain("Rp");
  });
});
