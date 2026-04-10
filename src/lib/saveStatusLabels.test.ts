/**
 * Save Status Localization Tests
 *
 * Ensures save status copy is in Bahasa Indonesia.
 */
import { describe, it, expect } from "vitest";
import { getSaveStatusLabel } from "@/lib/saveStatusLabels";

describe("Save Status Labels (ID)", () => {
  it("idle → Belum ada perubahan", () => {
    expect(getSaveStatusLabel("idle")).toBe("Belum ada perubahan");
  });

  it("unsaved → Perubahan belum disimpan", () => {
    expect(getSaveStatusLabel("unsaved")).toBe("Perubahan belum disimpan");
  });

  it("saving → Menyimpan...", () => {
    expect(getSaveStatusLabel("saving")).toBe("Menyimpan...");
  });

  it("saved without time → Tersimpan", () => {
    expect(getSaveStatusLabel("saved")).toBe("Tersimpan");
  });

  it("saved with time → Tersimpan pukul HH:MM", () => {
    const date = new Date(2026, 0, 1, 14, 30); // 14:30
    const label = getSaveStatusLabel("saved", date);
    expect(label).toMatch(/^Tersimpan pukul \d{2}[.:]\d{2}$/);
  });

  it("error without message → Gagal menyimpan", () => {
    expect(getSaveStatusLabel("error")).toBe("Gagal menyimpan");
  });

  it("error with custom message → uses the custom message", () => {
    expect(getSaveStatusLabel("error", null, "Network timeout")).toBe("Network timeout");
  });

  it("unknown status → Belum ada perubahan (safe default)", () => {
    expect(getSaveStatusLabel("unknown" as any)).toBe("Belum ada perubahan");
  });
});
