/**
 * Builder View State Machine Tests
 *
 * Pure transition logic for mobile builder view switching.
 * States: editor | preview
 * Events: SWITCH_TO_EDITOR | SWITCH_TO_PREVIEW
 */
import { describe, it, expect } from "vitest";
import {
  transitionBuilderView,
  BUILDER_VIEW_STATES,
  type BuilderViewState,
  type BuilderViewEvent,
} from "@/lib/builderViewMachine";

describe("Builder View State Machine", () => {
  describe("valid transitions", () => {
    it("editor → preview via SWITCH_TO_PREVIEW", () => {
      expect(transitionBuilderView("editor", "SWITCH_TO_PREVIEW")).toBe("preview");
    });

    it("preview → editor via SWITCH_TO_EDITOR", () => {
      expect(transitionBuilderView("preview", "SWITCH_TO_EDITOR")).toBe("editor");
    });
  });

  describe("idempotent transitions", () => {
    it("editor → editor via SWITCH_TO_EDITOR (no-op)", () => {
      expect(transitionBuilderView("editor", "SWITCH_TO_EDITOR")).toBe("editor");
    });

    it("preview → preview via SWITCH_TO_PREVIEW (no-op)", () => {
      expect(transitionBuilderView("preview", "SWITCH_TO_PREVIEW")).toBe("preview");
    });
  });

  describe("invalid inputs", () => {
    it("rejects invalid state gracefully", () => {
      expect(transitionBuilderView("split" as BuilderViewState, "SWITCH_TO_EDITOR")).toBeNull();
    });

    it("rejects invalid event gracefully", () => {
      expect(transitionBuilderView("editor", "TOGGLE" as BuilderViewEvent)).toBeNull();
    });
  });

  describe("state list completeness", () => {
    it("BUILDER_VIEW_STATES includes all 2 states", () => {
      expect(BUILDER_VIEW_STATES).toEqual(["editor", "preview"]);
    });
  });
});
