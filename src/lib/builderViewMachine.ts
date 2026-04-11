/**
 * Builder View State Machine — Pure Transition Layer
 *
 * Controls mobile builder view switching between editor and preview panes.
 *
 * States: editor | preview
 * Events: SWITCH_TO_EDITOR | SWITCH_TO_PREVIEW
 *
 * All transition logic is pure — no React, no side effects.
 */

// ═══════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════

export type BuilderViewState = "editor" | "preview";
export type BuilderViewEvent = "SWITCH_TO_EDITOR" | "SWITCH_TO_PREVIEW";

export const BUILDER_VIEW_STATES: readonly BuilderViewState[] = [
  "editor",
  "preview",
] as const;

// ═══════════════════════════════════════════════════════
//  TRANSITION TABLE
// ═══════════════════════════════════════════════════════

const TRANSITIONS: Record<BuilderViewState, Record<BuilderViewEvent, BuilderViewState>> = {
  editor: {
    SWITCH_TO_EDITOR: "editor",
    SWITCH_TO_PREVIEW: "preview",
  },
  preview: {
    SWITCH_TO_EDITOR: "editor",
    SWITCH_TO_PREVIEW: "preview",
  },
};

// ═══════════════════════════════════════════════════════
//  PURE TRANSITION FUNCTION
// ═══════════════════════════════════════════════════════

/**
 * Attempt a builder view transition.
 * Returns the new state, or null if the current state is invalid.
 */
export function transitionBuilderView(
  current: BuilderViewState,
  event: BuilderViewEvent,
): BuilderViewState | null {
  const stateTransitions = TRANSITIONS[current];
  if (!stateTransitions) return null;
  return stateTransitions[event] ?? null;
}
