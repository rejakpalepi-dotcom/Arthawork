import { renderElementToPDF } from "./exportEngine";
import type { ExportResult } from "./exportEngine";

/**
 * Export an element by ID to PDF.
 * Backward-compatible wrapper around the new export engine.
 *
 * Used by InvoiceDetail for invoice export.
 */
export async function exportToPDF(
  elementId: string,
  fileName: string = "document.pdf"
): Promise<ExportResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    return { success: false, error: `Element with id "${elementId}" not found` };
  }

  return renderElementToPDF(element, {
    fileName,
    margins: [15, 12, 15, 12],
  });
}

/**
 * Export a specific HTML element to PDF.
 * Used when you have a direct ref to the element.
 */
export async function exportElementToPDF(
  element: HTMLElement,
  fileName: string = "document.pdf"
): Promise<ExportResult> {
  return renderElementToPDF(element, {
    fileName,
    margins: [15, 12, 15, 12],
  });
}
