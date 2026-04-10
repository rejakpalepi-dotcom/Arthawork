/**
 * Status State Machine Tests
 *
 * Tests for explicit state machine transitions for invoices and proposals.
 * Pure logic — no side effects, no DB, no hooks.
 */
import { describe, it, expect } from "vitest";
import {
  transitionInvoiceStatus,
  transitionProposalStatus,
  resolveInvoiceDisplayStatus,
  resolveProposalDisplayStatus,
  type InvoiceStoredStatus,
  type ProposalStoredStatus,
  type InvoiceEvent,
  type ProposalEvent,
} from "@/lib/statusMachine";

// ═══════════════════════════════════════════════════════
//  INVOICE STATE MACHINE
// ═══════════════════════════════════════════════════════

describe("Invoice Status Machine", () => {
  describe("valid transitions", () => {
    it("draft → sent via SEND", () => {
      expect(transitionInvoiceStatus("draft", "SEND")).toBe("sent");
    });

    it("draft → cancelled via CANCEL", () => {
      expect(transitionInvoiceStatus("draft", "CANCEL")).toBe("cancelled");
    });

    it("sent → paid via MARK_PAID", () => {
      expect(transitionInvoiceStatus("sent", "MARK_PAID")).toBe("paid");
    });

    it("sent → cancelled via CANCEL", () => {
      expect(transitionInvoiceStatus("sent", "CANCEL")).toBe("cancelled");
    });
  });

  describe("invalid transitions", () => {
    it("rejects paid → sent (terminal state)", () => {
      expect(transitionInvoiceStatus("paid", "SEND")).toBeNull();
    });

    it("rejects paid → cancelled (terminal state)", () => {
      expect(transitionInvoiceStatus("paid", "CANCEL")).toBeNull();
    });

    it("rejects cancelled → sent (terminal state)", () => {
      expect(transitionInvoiceStatus("cancelled", "SEND")).toBeNull();
    });

    it("rejects draft → paid (must go through sent)", () => {
      expect(transitionInvoiceStatus("draft", "MARK_PAID")).toBeNull();
    });

    it("rejects invalid current state gracefully", () => {
      expect(transitionInvoiceStatus("invalid" as InvoiceStoredStatus, "SEND")).toBeNull();
    });

    it("rejects invalid event gracefully", () => {
      expect(transitionInvoiceStatus("draft", "INVALID" as InvoiceEvent)).toBeNull();
    });
  });

  describe("display status derivation", () => {
    it("returns 'overdue' when sent + past due", () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      expect(resolveInvoiceDisplayStatus("sent", yesterday)).toBe("overdue");
    });

    it("returns 'sent' when sent + future due", () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      expect(resolveInvoiceDisplayStatus("sent", tomorrow)).toBe("sent");
    });

    it("returns 'sent' when sent + no due date", () => {
      expect(resolveInvoiceDisplayStatus("sent", null)).toBe("sent");
    });

    it("returns stored status for non-sent states regardless of due date", () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      expect(resolveInvoiceDisplayStatus("paid", yesterday)).toBe("paid");
      expect(resolveInvoiceDisplayStatus("draft", yesterday)).toBe("draft");
    });

    it("defaults to 'draft' for unknown stored status", () => {
      expect(resolveInvoiceDisplayStatus("garbage" as InvoiceStoredStatus, null)).toBe("draft");
    });
  });
});

// ═══════════════════════════════════════════════════════
//  PROPOSAL STATE MACHINE
// ═══════════════════════════════════════════════════════

describe("Proposal Status Machine", () => {
  describe("valid transitions", () => {
    it("draft → sent via SEND", () => {
      expect(transitionProposalStatus("draft", "SEND")).toBe("sent");
    });

    it("sent → approved via APPROVE", () => {
      expect(transitionProposalStatus("sent", "APPROVE")).toBe("approved");
    });

    it("sent → rejected via REJECT", () => {
      expect(transitionProposalStatus("sent", "REJECT")).toBe("rejected");
    });

    it("rejected → draft via REVISE", () => {
      expect(transitionProposalStatus("rejected", "REVISE")).toBe("draft");
    });
  });

  describe("invalid transitions", () => {
    it("rejects approved → sent (terminal state)", () => {
      expect(transitionProposalStatus("approved", "SEND")).toBeNull();
    });

    it("rejects approved → rejected", () => {
      expect(transitionProposalStatus("approved", "REJECT")).toBeNull();
    });

    it("rejects draft → approved (must go through sent)", () => {
      expect(transitionProposalStatus("draft", "APPROVE")).toBeNull();
    });

    it("rejects invalid current state gracefully", () => {
      expect(transitionProposalStatus("invalid" as ProposalStoredStatus, "SEND")).toBeNull();
    });

    it("rejects invalid event gracefully", () => {
      expect(transitionProposalStatus("draft", "INVALID" as ProposalEvent)).toBeNull();
    });
  });

  describe("display status derivation", () => {
    it("returns 'expired' when sent + past valid_until", () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      expect(resolveProposalDisplayStatus("sent", yesterday)).toBe("expired");
    });

    it("returns 'sent' when sent + future valid_until", () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      expect(resolveProposalDisplayStatus("sent", tomorrow)).toBe("sent");
    });

    it("returns 'sent' when sent + no valid_until", () => {
      expect(resolveProposalDisplayStatus("sent", null)).toBe("sent");
    });

    it("returns stored status for non-sent states regardless of valid_until", () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      expect(resolveProposalDisplayStatus("approved", yesterday)).toBe("approved");
      expect(resolveProposalDisplayStatus("draft", yesterday)).toBe("draft");
    });

    it("defaults to 'draft' for unknown stored status", () => {
      expect(resolveProposalDisplayStatus("garbage" as ProposalStoredStatus, null)).toBe("draft");
    });
  });
});
