import { useState, useEffect, useRef, useCallback } from "react";

export type AutosaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

export interface AutosaveState {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  error: string | null;
  isDirty: boolean;
  save: () => Promise<void>;
  retry: () => Promise<void>;
  markClean: () => void;
}

interface AutosaveOptions<T> {
  /** Current form/editor data to autosave */
  data: T;
  /** Persist callback — must throw on failure */
  onSave: (data: T) => Promise<void>;
  /** Enable/disable autosave (disable during initial load) */
  enabled?: boolean;
  /** Debounce delay in ms (default 2000) */
  debounceMs?: number;
}

/**
 * Deep-compare two values using JSON serialization.
 * Good enough for form data objects — not suitable for Date/Map/Set.
 */
function deepEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useAutosave<T>(options: AutosaveOptions<T>): AutosaveState {
  const { data, onSave, enabled = true, debounceMs = 2000 } = options;

  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for stable values across closures
  const lastSavedDataRef = useRef<T | null>(null);
  const savingRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  const dataRef = useRef(data);
  const enabledRef = useRef(enabled);

  // Keep refs up to date
  onSaveRef.current = onSave;
  dataRef.current = data;
  enabledRef.current = enabled;

  const isDirty =
    lastSavedDataRef.current !== null && !deepEqual(data, lastSavedDataRef.current);

  // Core save function with in-flight protection
  const executeSave = useCallback(async () => {
    if (savingRef.current) {
      // Queue another save when the current one completes
      pendingSaveRef.current = true;
      return;
    }

    const currentData = dataRef.current;

    // Skip if data hasn't changed from last save
    if (lastSavedDataRef.current !== null && deepEqual(currentData, lastSavedDataRef.current)) {
      return;
    }

    savingRef.current = true;
    setStatus("saving");
    setError(null);

    try {
      await onSaveRef.current(currentData);
      lastSavedDataRef.current = currentData;
      setLastSavedAt(new Date());
      setStatus("saved");
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      setStatus("error");
    } finally {
      savingRef.current = false;

      // Process queued save
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        // Re-check if data actually changed before re-saving
        if (!deepEqual(dataRef.current, lastSavedDataRef.current)) {
          executeSave();
        }
      }
    }
  }, []);

  // Manual save trigger
  const save = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    await executeSave();
  }, [executeSave]);

  // Retry after error
  const retry = useCallback(async () => {
    setError(null);
    setStatus("unsaved");
    await executeSave();
  }, [executeSave]);

  // Mark current data as clean (e.g. after loading from server)
  const markClean = useCallback(() => {
    lastSavedDataRef.current = dataRef.current;
    setStatus("saved");
    setError(null);
  }, []);

  // Debounced autosave on data changes
  useEffect(() => {
    if (!enabled) return;

    // On first render (no saved snapshot yet), set the initial snapshot and don't save
    if (lastSavedDataRef.current === null) {
      lastSavedDataRef.current = data;
      return;
    }

    // Check if data actually changed
    if (deepEqual(data, lastSavedDataRef.current)) {
      return;
    }

    // Mark as dirty
    if (status !== "saving" && status !== "error") {
      setStatus("unsaved");
    }

    // Debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      executeSave();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // Only re-run when the serialized data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data), enabled, debounceMs]);

  // beforeunload protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Warn if there are unsaved changes or an ongoing save
      if (
        enabledRef.current &&
        (status === "unsaved" || status === "saving" || status === "error")
      ) {
        e.preventDefault();
        // Modern browsers ignore custom messages but this is required
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  return {
    status,
    lastSavedAt,
    error,
    isDirty,
    save,
    retry,
    markClean,
  };
}
