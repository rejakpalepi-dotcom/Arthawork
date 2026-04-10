/**
 * Autosave State Machine — Pure Transition Layer
 *
 * States: idle, unsaved, saving, saved, error
 * Events: EDIT, SAVE_START, SAVE_SUCCESS, SAVE_FAILURE, RETRY, RESET
 *
 * All transition logic is pure — no React, no timers, no side effects.
 */

// ═══════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════

export type AutosaveMachineState = "idle" | "unsaved" | "saving" | "saved" | "error";
export type AutosaveEvent = "EDIT" | "SAVE_START" | "SAVE_SUCCESS" | "SAVE_FAILURE" | "RETRY" | "RESET";

export const AUTOSAVE_STATES: readonly AutosaveMachineState[] = [
  "idle", "unsaved", "saving", "saved", "error",
] as const;

// ═══════════════════════════════════════════════════════
//  TRANSITION TABLE
// ═══════════════════════════════════════════════════════

const TRANSITIONS: Record<AutosaveMachineState, Partial<Record<AutosaveEvent, AutosaveMachineState>>> = {
  idle: {
    EDIT:  "unsaved",
    RESET: "idle",
  },
  unsaved: {
    EDIT:       "unsaved",
    SAVE_START: "saving",
    RESET:      "idle",
  },
  saving: {
    EDIT:         "unsaved",
    SAVE_SUCCESS: "saved",
    SAVE_FAILURE: "error",
    RESET:        "idle",
  },
  saved: {
    EDIT:  "unsaved",
    RESET: "idle",
  },
  error: {
    EDIT:  "unsaved",
    RETRY: "saving",
    RESET: "idle",
  },
};

// ═══════════════════════════════════════════════════════
//  PURE TRANSITION FUNCTION
// ═══════════════════════════════════════════════════════

/**
 * Attempt an autosave state transition.
 * Returns the new state, or null if the transition is invalid.
 */
export function transitionAutosave(
  current: AutosaveMachineState,
  event: AutosaveEvent,
): AutosaveMachineState | null {
  const stateTransitions = TRANSITIONS[current];
  if (!stateTransitions) return null;
  return stateTransitions[event] ?? null;
}
