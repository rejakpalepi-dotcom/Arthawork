/**
 * Font System Contract Tests
 *
 * Ensures the font system matches the current product direction:
 * - Poppins for headings (font-heading)
 * - Poppins for body (font-sans)
 * - IBM Plex Sans for numeric data (font-numeric)
 * - Source Serif 4 for editorial (font-serif)
 * - No Space Grotesk, no JetBrains Mono in config
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(__dirname, "../../", relativePath), "utf-8");
}

describe("Font System", () => {
  describe("tailwind.config.ts font families", () => {
    const config = readProjectFile("tailwind.config.ts");

    it("font-heading maps to Poppins, not Space Grotesk", () => {
      // Regression: font-heading was previously Space Grotesk
      expect(config).not.toContain('"Space Grotesk"');
      expect(config).toMatch(/heading:\s*\[.*"Poppins"/);
    });

    it("font-sans maps to Poppins", () => {
      expect(config).toMatch(/sans:\s*\[.*"Poppins"/);
    });

    it("font-numeric maps to IBM Plex Sans", () => {
      expect(config).toMatch(/numeric:\s*\[.*"IBM Plex Sans"/);
    });

    it("font-serif maps to Source Serif 4", () => {
      expect(config).toMatch(/serif:\s*\[.*"Source Serif 4"/);
    });

    it("does not contain JetBrains Mono", () => {
      expect(config).not.toContain("JetBrains Mono");
    });
  });

  describe("Google Fonts import", () => {
    const css = readProjectFile("src/index.css");

    it("imports Poppins", () => {
      expect(css).toContain("Poppins");
    });

    it("imports IBM Plex Sans", () => {
      expect(css).toContain("IBM+Plex+Sans");
    });

    it("imports Source Serif 4", () => {
      expect(css).toContain("Source+Serif+4");
    });

    it("does NOT import Space Grotesk", () => {
      // Regression: Space Grotesk was in the import but is no longer used
      expect(css).not.toContain("Space+Grotesk");
    });

    it("does NOT import JetBrains Mono", () => {
      expect(css).not.toContain("JetBrains+Mono");
    });
  });
});
