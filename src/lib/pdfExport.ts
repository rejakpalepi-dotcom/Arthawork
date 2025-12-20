import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportToPDF(
  elementId: string,
  fileName: string = "document.pdf"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Create a clone for better rendering
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = "absolute";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = "794px"; // A4 width at 96 DPI
  clone.style.background = "white";
  clone.style.color = "#1a1a1a";
  document.body.appendChild(clone);

  // Fix text colors for PDF
  const allElements = clone.querySelectorAll("*");
  allElements.forEach((el) => {
    const element = el as HTMLElement;
    const computed = window.getComputedStyle(element);
    
    // Make text visible
    if (computed.color.includes("255, 255, 255") || computed.color === "rgb(255, 255, 255)") {
      element.style.color = "#1a1a1a";
    }
    
    // Handle gradient text
    if (element.classList.contains("gradient-text")) {
      element.style.background = "none";
      element.style.webkitBackgroundClip = "unset";
      element.style.webkitTextFillColor = "#00D9FF";
      element.style.color = "#00D9FF";
    }
  });

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    document.body.removeChild(clone);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  } catch (error) {
    document.body.removeChild(clone);
    throw error;
  }
}

export async function exportElementToPDF(
  element: HTMLElement,
  fileName: string = "document.pdf"
): Promise<void> {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = "absolute";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = "794px";
  clone.style.background = "white";
  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    document.body.removeChild(clone);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  } catch (error) {
    document.body.removeChild(clone);
    throw error;
  }
}
