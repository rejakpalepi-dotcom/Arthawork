/**
 * Autosave State Machine Tests
 *
 * Pure transition logic — no React, no hooks, no timers.
 */
import { describe, it, expect } from "vitest";
import {
  transitionAutosave,
  type AutosaveMachineState,
  type AutosaveEvent,
  AUTOSAVE_STATES,
} from "@/lib/autosaveMachine";

describe("Autosave State Machine", () => {
  describe("valid transitions", () => {
    it("idle → unsaved via EDIT", () => {
      expect(transitionAutosave("idle", "EDIT")).toBe("unsaved");
    });

    it("unsaved → saving via SAVE_START", () => {
      expect(transitionAutosave("unsaved", "SAVE_START")).toBe("saving");
    });

    it("saving → saved via SAVE_SUCCESS", () => {
      expect(transitionAutosave("saving", "SAVE_SUCCESS")).toBe("saved");
    });

    it("saving → error via SAVE_FAILURE", () => {
      expect(transitionAutosave("saving", "SAVE_FAILURE")).toBe("error");
    });

    it("error → saving via RETRY", () => {
      expect(transitionAutosave("error", "RETRY")).toBe("saving");
    });

    it("saved → unsaved via EDIT", () => {
      expect(transitionAutosave("saved", "EDIT")).toBe("unsaved");
    });

    it("error → unsaved via EDIT", () => {
      expect(transitionAutosave("error", "EDIT")).toBe("unsaved");
    });

    it("saving → unsaved via EDIT (edit during save)", () => {
      // User edits while save is in-flight — mark as unsaved
      expect(transitionAutosave("saving", "EDIT")).toBe("unsaved");
    });

    it("any state → idle via RESET", () => {
      for (const state of AUTOSAVE_STATES) {
        expect(transitionAutosave(state, "RESET")).toBe("idle");
      }
    });
  });

  describe("invalid transitions", () => {
    it("rejects idle → saving (must edit first)", () => {
      expect(transitionAutosave("idle", "SAVE_START")).toBeNull();
    });

    it("rejects idle → saved", () => {
      expect(transitionAutosave("idle", "SAVE_SUCCESS")).toBeNull();
    });

    it("rejects saved → saving (must edit first)", () => {
      expect(transitionAutosave("saved", "SAVE_START")).toBeNull();
    });

    it("rejects unsaved → saved (must go through saving)", () => {
      expect(transitionAutosave("unsaved", "SAVE_SUCCESS")).toBeNull();
    });

    it("rejects error → saved (must retry first)", () => {
      expect(transitionAutosave("error", "SAVE_SUCCESS")).toBeNull();
    });

    it("rejects invalid state gracefully", () => {
      expect(transitionAutosave("bogus" as AutosaveMachineState, "EDIT")).toBeNull();
    });

    it("rejects invalid event gracefully", () => {
      expect(transitionAutosave("idle", "BOGUS" as AutosaveEvent)).toBeNull();
    });
  });

  describe("state list completeness", () => {
    it("AUTOSAVE_STATES includes all 5 states", () => {
      expect(AUTOSAVE_STATES).toEqual(["idle", "unsaved", "saving", "saved", "error"]);
    });
  });
});
