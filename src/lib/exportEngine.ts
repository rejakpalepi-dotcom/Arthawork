import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Export result — always returned, never throws silently.
 */
export interface ExportResult {
  success: boolean;
  error?: string;
}

/**
 * Options for the PDF export engine.
 */
export interface ExportOptions {
  fileName?: string;
  /** Margins in mm [top, right, bottom, left] */
  margins?: [number, number, number, number];
  orientation?: "portrait" | "landscape";
  format?: "a4" | "letter";
  /** html2canvas scale factor (default 2) */
  scale?: number;
  /** Called with progress 0–1 */
  onProgress?: (progress: number) => void;
}

const DEFAULT_MARGINS: [number, number, number, number] = [15, 12, 15, 12];

/**
 * Clone an element, isolate it for print rendering, and capture it as a canvas.
 * Returns the canvas or null on failure.
 */
async function captureElement(
  element: HTMLElement,
  options: { width?: number; scale?: number } = {}
): Promise<HTMLCanvasElement | null> {
  const { width = 794, scale = 2 } = options;

  // Clone off-screen
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = "absolute";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = `${width}px`;
  clone.style.zIndex = "-1";

  // Force print-document class for theme isolation
  clone.classList.add("print-document");

  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      // Ignore hidden/off-screen detection issues
      onclone: (doc) => {
        const clonedEl = doc.body.lastElementChild as HTMLElement;
        if (clonedEl) {
          clonedEl.style.position = "relative";
          clonedEl.style.left = "0";
        }
      },
    });

    document.body.removeChild(clone);

    // Sanity check: detect blank canvas
    if (canvas.width === 0 || canvas.height === 0) {
      return null;
    }

    return canvas;
  } catch {
    // Clean up on failure
    if (clone.parentNode) {
      document.body.removeChild(clone);
    }
    return null;
  }
}

/**
 * Render a single HTML element to a PDF document.
 * The element is cloned off-screen, forced into print-document mode,
 * and rendered via html2canvas → jsPDF.
 *
 * Handles multi-page content by slicing the canvas into A4-sized chunks.
 */
export async function renderElementToPDF(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<ExportResult> {
  const {
    fileName = "document.pdf",
    margins = DEFAULT_MARGINS,
    orientation = "portrait",
    format = "a4",
    scale = 2,
    onProgress,
  } = options;

  try {
    onProgress?.(0.1);

    const canvas = await captureElement(element, { scale });

    if (!canvas) {
      return { success: false, error: "Failed to render document — canvas was empty" };
    }

    onProgress?.(0.6);

    const pdf = new jsPDF({ orientation, unit: "mm", format });

    const [marginTop, marginRight, marginBottom, marginLeft] = margins;
    const pageWidth = orientation === "portrait" ? 210 : 297;
    const pageHeight = orientation === "portrait" ? 297 : 210;
    const contentWidth = pageWidth - marginLeft - marginRight;
    const contentHeight = pageHeight - marginTop - marginBottom;

    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = marginTop;

    // First page
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      marginLeft,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= contentHeight;

    // Additional pages
    while (heightLeft > 0) {
      pdf.addPage();
      position = marginTop - (imgHeight - heightLeft);
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        marginLeft,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= contentHeight;
    }

    onProgress?.(0.9);

    pdf.save(fileName);

    onProgress?.(1.0);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown export error";
    console.error("[ExportEngine] PDF export failed:", err);
    return { success: false, error: message };
  }
}

/**
 * Render multiple elements as separate PDF pages.
 * Each element becomes exactly one page (clipped to A4).
 *
 * Used for proposal exports where each "page" is a separate preview component.
 */
export async function renderPagesToPDF(
  pages: HTMLElement[],
  options: ExportOptions = {}
): Promise<ExportResult> {
  const {
    fileName = "document.pdf",
    orientation = "portrait",
    format = "a4",
    scale = 2,
    onProgress,
  } = options;

  if (pages.length === 0) {
    return { success: false, error: "No pages to export" };
  }

  try {
    const pdf = new jsPDF({ orientation, unit: "mm", format });
    const pageWidth = orientation === "portrait" ? 210 : 297;
    const pageHeight = orientation === "portrait" ? 297 : 210;

    for (let i = 0; i < pages.length; i++) {
      onProgress?.((i / pages.length) * 0.9);

      if (i > 0) pdf.addPage();

      const canvas = await captureElement(pages[i], {
        width: 794, // A4 at 96 DPI
        scale,
      });

      if (!canvas) {
        console.warn(`[ExportEngine] Page ${i + 1} rendered as empty`);
        continue;
      }

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        imgWidth,
        Math.min(imgHeight, pageHeight)
      );
    }

    onProgress?.(0.95);

    pdf.save(fileName);

    onProgress?.(1.0);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown export error";
    console.error("[ExportEngine] Multi-page PDF export failed:", err);
    return { success: false, error: message };
  }
}
