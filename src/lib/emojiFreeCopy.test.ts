/**
 * Production Copy — Emoji-Free Contract Tests
 *
 * Regression tests ensuring no emoji characters remain in
 * user-facing production code. Source files are read directly
 * to enforce the contract at the config/copy level.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { resolve, extname } from "path";

// ─── Helpers ──────────────────────────────────────────

/** Matches standard Unicode emoji ranges (decorative glyphs) */
const EMOJI_REGEX =
  /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1FAFF}\u{200D}\u{2702}-\u{27B0}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2614}-\u{2615}\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/u;

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(__dirname, "../../", relativePath), "utf-8");
}

/**
 * Recursively collects all .ts/.tsx files under a directory.
 * Skips test files and node_modules.
 */
function collectSourceFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = resolve(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".git") continue;
      results.push(...collectSourceFiles(full));
    } else {
      const ext = extname(entry);
      if ((ext === ".ts" || ext === ".tsx") && !entry.includes(".test.")) {
        results.push(full);
      }
    }
  }
  return results;
}

// ─── Tests ────────────────────────────────────────────

describe("Emoji-Free Production Code", () => {

  describe("subscription feature labels (file-level)", () => {
    const content = readProjectFile("src/lib/subscription.ts");

    it("pro features contain no emoji characters", () => {
      // Extract feature strings between "pro:" and its closing bracket
      const proBlock = content.match(/pro:\s*\{[\s\S]*?features:\s*\[([\s\S]*?)\]/);
      expect(proBlock).not.toBeNull();
      const features = proBlock![1];
      expect(features, "Pro features block contains emoji").not.toMatch(EMOJI_REGEX);
    });

    it("business features contain no emoji characters", () => {
      const bizBlock = content.match(/business:\s*\{[\s\S]*?features:\s*\[([\s\S]*?)\]/);
      expect(bizBlock).not.toBeNull();
      const features = bizBlock![1];
      expect(features, "Business features block contains emoji").not.toMatch(EMOJI_REGEX);
    });
  });

  describe("email template subjects (file-level)", () => {
    const content = readProjectFile("src/lib/email.ts");

    it("email subjects contain no emoji characters", () => {
      const subjectMatches = content.match(/subject:\s*"([^"]*)"/g) || [];
      expect(subjectMatches.length).toBeGreaterThan(0);
      for (const match of subjectMatches) {
        expect(match, `Email subject contains emoji: ${match}`).not.toMatch(EMOJI_REGEX);
      }
    });
  });

  describe("source file sweep", () => {
    const srcDir = resolve(__dirname, "..");
    const sourceFiles = collectSourceFiles(srcDir);

    it("found source files to check", () => {
      expect(sourceFiles.length).toBeGreaterThan(10);
    });

    it("no production .ts/.tsx file contains emoji characters", () => {
      const violations: { file: string; line: number; content: string }[] = [];

      for (const file of sourceFiles) {
        const content = readFileSync(file, "utf-8");
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (EMOJI_REGEX.test(lines[i])) {
            violations.push({
              file: file.replace(srcDir, "src"),
              line: i + 1,
              content: lines[i].trim().substring(0, 80),
            });
          }
        }
      }

      if (violations.length > 0) {
        const report = violations
          .map((v) => `  ${v.file}:${v.line} — ${v.content}`)
          .join("\n");
        expect.fail(`Found ${violations.length} emoji violation(s):\n${report}`);
      }
    });
  });
});
