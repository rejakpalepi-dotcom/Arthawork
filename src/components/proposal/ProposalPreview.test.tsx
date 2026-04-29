import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProposalPreview } from "@/components/proposal/ProposalPreview";
import type { ProposalData } from "@/pages/ProposalBuilder";

const proposalFixture: ProposalData = {
  projectTitle: "Website Redesign Retainer",
  clientId: "client-1",
  clientName: "Rejak",
  clientCompany: "Arthawork",
  studioName: "Artha Studio",
  tagline: "Proposal yang lebih rapi dan lebih cepat dibayar",
  year: "2026",
  introTitle: "Why work with me?",
  introText: "Short intro copy.",
  heroImageUrl: "",
  experienceTitle: "Trusted by growing brands",
  experienceSubtitle: "Experience subtitle",
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
    expect(html).toContain("Project Proposal");
  });

  it("renders the closing investment page with the same dark shell family", () => {
    const html = renderToStaticMarkup(
      <ProposalPreview currentPage={6} data={proposalFixture} />,
    );

    expect(html).toContain("bg-[#1a1a1a] text-white");
    expect(html).toContain("Ready to begin?");
    expect(html).toContain("Rp");
  });
});
