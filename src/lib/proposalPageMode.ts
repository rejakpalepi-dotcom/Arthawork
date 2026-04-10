/**
 * Proposal Page Mode — Visual Mode Mapping
 *
 * Defines which visual mode each proposal page uses.
 * Only page 1 (cover) is dark. All other pages are light.
 */

export type ProposalPageMode = "cover_dark" | "content_light";

/**
 * Get the visual mode for a proposal page number.
 * Page 1 = cover_dark, everything else = content_light.
 */
export function getProposalPageMode(pageNumber: number): ProposalPageMode {
  if (pageNumber === 1) return "cover_dark";
  return "content_light";
}
