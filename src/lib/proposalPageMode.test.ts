/**
 * Proposal Page Mode Tests
 *
 * Ensures consistent visual mode mapping for proposal pages.
 */
import { describe, it, expect } from "vitest";
import { getProposalPageMode, type ProposalPageMode } from "@/lib/proposalPageMode";

describe("Proposal Page Mode", () => {
  it("page 1 (cover) is cover_dark", () => {
    expect(getProposalPageMode(1)).toBe("cover_dark");
  });

  it("page 2 is content_light", () => {
    expect(getProposalPageMode(2)).toBe("content_light");
  });

  it("page 3 is content_light", () => {
    expect(getProposalPageMode(3)).toBe("content_light");
  });

  it("page 4 is content_light", () => {
    expect(getProposalPageMode(4)).toBe("content_light");
  });

  it("page 5 is content_light", () => {
    expect(getProposalPageMode(5)).toBe("content_light");
  });

  it("page 6 (investment) is content_light — NOT dark", () => {
    // Regression: page 6 was previously dark, must now be light
    expect(getProposalPageMode(6)).toBe("content_light");
  });

  it("invalid page 0 defaults to content_light", () => {
    expect(getProposalPageMode(0)).toBe("content_light");
  });

  it("invalid page 99 defaults to content_light", () => {
    expect(getProposalPageMode(99)).toBe("content_light");
  });

  it("negative page defaults to content_light", () => {
    expect(getProposalPageMode(-1)).toBe("content_light");
  });
});
