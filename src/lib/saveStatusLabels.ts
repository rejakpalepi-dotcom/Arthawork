/**
 * Save Status Labels — Bahasa Indonesia
 *
 * Localized copy for save status indicators.
 */

import type { AutosaveStatus } from "@/hooks/useAutosave";

/**
 * Get the localized label for a save status.
 */
export function getSaveStatusLabel(
  status: AutosaveStatus,
  lastSavedAt?: Date | null,
  errorMessage?: string | null,
): string {
  switch (status) {
    case "idle":
      return "Belum ada perubahan";
    case "unsaved":
      return "Perubahan belum disimpan";
    case "saving":
      return "Menyimpan...";
    case "saved":
      if (lastSavedAt) {
        const time = lastSavedAt.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        return `Tersimpan pukul ${time}`;
      }
      return "Tersimpan";
    case "error":
      return errorMessage || "Gagal menyimpan";
    default:
      return "Belum ada perubahan";
  }
}
