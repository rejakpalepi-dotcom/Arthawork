import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { ProposalData } from "@/pages/ProposalBuilder";
import { formatIDR } from "@/lib/currency";

export async function exportProposalToPDF(
  data: ProposalData,
  fileName: string = "proposal.pdf"
): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Create temporary container for rendering
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "794px"; // A4 width at 96 DPI
  document.body.appendChild(container);

  const pages = [
    () => renderCoverPage(data),
    () => renderIntroPage(data),
    () => renderExperiencePage(data),
    () => renderServicesPage(data),
    () => renderTimelinePage(data),
    () => renderInvestmentPage(data),
  ];

  try {
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage();

      container.innerHTML = pages[i]();

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
    }

    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}

function renderCoverPage(data: ProposalData): string {
  const titleWords = data.projectTitle.split(" ");
  const firstLine = titleWords.slice(0, 2).join(" ");
  const secondLine = titleWords.slice(2).join(" ");

  return `
    <div style="width: 794px; height: 1123px; background: #1a1a1a; color: white; font-family: system-ui, -apple-system, sans-serif; position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; right: 0; width: 320px; height: 320px; background: rgba(0, 172, 193, 0.1); border-radius: 50%; filter: blur(100px); transform: translate(33%, -33%);"></div>
      <div style="position: absolute; bottom: 0; left: 0; width: 240px; height: 240px; background: rgba(0, 172, 193, 0.08); border-radius: 50%; filter: blur(80px); transform: translate(-33%, 33%);"></div>
      
      <div style="position: relative; z-index: 10; display: flex; align-items: center; justify-content: space-between; padding: 48px 48px 32px;">
        <span style="font-weight: 600; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.9);">${data.studioName}</span>
        ${data.clientCompany ? `
          <div style="text-align: right;">
            <div style="font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Prepared for</div>
            <div style="font-size: 14px; font-weight: 500; color: white;">${data.clientCompany}</div>
          </div>
        ` : ""}
      </div>
      
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 32px 48px; position: relative; z-index: 10; margin-top: 200px;">
        <div style="margin-bottom: 24px;">
          <div style="color: #00ACC1; font-size: 12px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 16px;">Project Proposal</div>
          <h1 style="font-size: 52px; font-weight: 900; line-height: 1.1; text-transform: uppercase; margin: 0;">
            ${firstLine}
            ${secondLine ? `<br><span style="color: #00ACC1;">${secondLine}</span>` : ""}
          </h1>
        </div>
        <p style="color: #9ca3af; font-size: 16px; max-width: 400px; line-height: 1.6; margin: 0;">${data.tagline}</p>
      </div>
      
      <div style="position: relative; z-index: 10; padding: 0 48px 48px; display: flex; align-items: flex-end; justify-content: space-between; margin-top: auto;">
        <div style="font-size: 12px; color: #6b7280;">
          ${data.clientName ? `<div>For: ${data.clientName}</div>` : ""}
          <div>${data.year}</div>
        </div>
      </div>
    </div>
  `;
}

function renderIntroPage(data: ProposalData): string {
  const paragraphs = data.introText.split("\n\n").map(p => `<p style="margin: 0 0 12px;">${p}</p>`).join("");
  
  return `
    <div style="width: 794px; height: 1123px; background: white; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 40px 48px 24px;">
        <div></div>
        ${data.clientCompany ? `<span style="font-size: 12px; color: #9ca3af;">${data.clientCompany}</span>` : ""}
      </div>
      
      <div style="flex: 1; padding: 0 48px 32px; display: flex; flex-direction: column;">
        <div style="background: linear-gradient(135deg, rgba(0,172,193,0.15), rgba(0,172,193,0.05)); border-radius: 12px; height: 240px; display: flex; align-items: center; justify-content: center; margin-bottom: 32px;">
          ${data.heroImageUrl ? 
            `<img src="${data.heroImageUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />` : 
            `<div style="text-align: center; color: #9ca3af;">
              <span style="font-size: 48px; color: #d1d5db;">🌐</span>
              <p style="font-size: 14px; margin-top: 8px; font-weight: 500;">Place Image Here</p>
            </div>`
          }
        </div>
        
        <div style="flex: 1;">
          <div style="font-size: 10px; color: #00ACC1; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px;">Value Proposition</div>
          <h2 style="font-size: 28px; font-weight: 900; color: #1a1a1a; margin: 0 0 24px; line-height: 1.2; text-transform: uppercase;">${data.introTitle}</h2>
          <div style="font-size: 14px; color: #4b5563; line-height: 1.7;">
            ${paragraphs}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderExperiencePage(data: ProposalData): string {
  return `
    <div style="width: 794px; height: 1123px; background: white; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; padding: 48px;">
      <h2 style="font-size: 32px; font-weight: 900; color: #1a1a1a; margin: 0 0 16px; line-height: 1.2; text-transform: uppercase;">${data.experienceTitle}</h2>
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 40px; max-width: 400px; line-height: 1.6;">${data.experienceSubtitle}</p>
      
      <div style="display: flex; gap: 48px; margin-bottom: 40px;">
        <div>
          <div style="font-size: 32px; font-weight: 900; color: #1a1a1a;">${data.projectCount}</div>
          <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; font-weight: 500;">Projects</div>
        </div>
        <div>
          <div style="font-size: 32px; font-weight: 900; color: #1a1a1a;">${data.countriesCount}</div>
          <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; font-weight: 500;">Countries</div>
        </div>
        <div>
          <div style="font-size: 32px; font-weight: 900; color: #1a1a1a;">${data.rating}</div>
          <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; font-weight: 500;">Rating</div>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        ${[1, 2, 3, 4, 5, 6].map(i => `
          <div style="aspect-ratio: 1; background: #f9fafb; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid #f3f4f6;">
            <span style="font-size: 32px; color: #e5e7eb;">🏢</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderServicesPage(data: ProposalData): string {
  const allServices = [...data.selectedServices, ...(data.customServices || [])];
  
  return `
    <div style="width: 794px; height: 1123px; background: white; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 40px 48px 24px; border-bottom: 1px solid #f3f4f6;">
        <span style="font-size: 10px; color: #00ACC1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Services</span>
      </div>
      
      <div style="flex: 1; padding: 32px 48px; overflow: hidden;">
        <h2 style="font-size: 28px; font-weight: 900; color: #1a1a1a; margin: 0 0 8px; text-transform: uppercase;">${"Our Services"}</h2>
        <p style="font-size: 12px; color: #6b7280; margin: 0 0 32px;">What we bring to the table</p>
        
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${allServices.map((service, index) => `
            <div style="padding: 20px; border-radius: 12px; background: #f9fafb; border: 1px solid #f3f4f6;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="width: 28px; height: 28px; border-radius: 6px; background: rgba(0,172,193,0.1); color: #00ACC1; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">
                    ${index + 1}
                  </div>
                  <div>
                    <h3 style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin: 0;">${service.name || "Untitled Service"}</h3>
                    ${service.description ? `<p style="font-size: 12px; color: #6b7280; margin: 4px 0 0;">${service.description}</p>` : ""}
                  </div>
                </div>
                <span style="font-size: 13px; font-weight: 600; color: #00ACC1; white-space: nowrap;">${formatIDR(service.price)}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
      <div style="padding: 24px 48px; border-top: 1px solid #f3f4f6; font-size: 10px; color: #9ca3af;">Page 4 of 6</div>
    </div>
  `;
}

function renderTimelinePage(data: ProposalData): string {
  return `
    <div style="width: 794px; height: 1123px; background: white; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 40px 48px 24px; border-bottom: 1px solid #f3f4f6;">
        <span style="font-size: 10px; color: #00ACC1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Timeline</span>
      </div>
      
      <div style="flex: 1; padding: 32px 48px;">
        <h2 style="font-size: 28px; font-weight: 900; color: #1a1a1a; margin: 0 0 8px; text-transform: uppercase;">Project Timeline</h2>
        <p style="font-size: 12px; color: #6b7280; margin: 0 0 40px;">Our roadmap to success</p>
        
        <div style="position: relative; padding-left: 24px;">
          <div style="position: absolute; left: 11px; top: 24px; bottom: 24px; width: 2px; background: #e5e7eb;"></div>
          
          ${data.milestones.map((milestone, index) => `
            <div style="display: flex; gap: 20px; position: relative; margin-bottom: 32px;">
              <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 10; ${index === 0 ? "background: #00ACC1; color: white;" : "background: #f3f4f6; color: #9ca3af;"}">
                <span style="font-size: 11px; font-weight: 700;">${index + 1}</span>
              </div>
              <div style="flex: 1; padding-bottom: 8px;">
                <div style="font-size: 11px; color: #00ACC1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">${milestone.week}</div>
                <h3 style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin: 0;">${milestone.title || "Untitled Phase"}</h3>
                ${milestone.description ? `<p style="font-size: 12px; color: #6b7280; margin: 4px 0 0; line-height: 1.5;">${milestone.description}</p>` : ""}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderInvestmentPage(data: ProposalData): string {
  const allServices = [...data.selectedServices, ...(data.customServices || [])];
  const subtotal = allServices.reduce((sum, s) => sum + s.price, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;

  return `
    <div style="width: 794px; height: 1123px; background: #1a1a1a; color: white; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 40px 48px 24px;">
        <div></div>
        <span style="font-size: 10px; color: #00ACC1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Investment</span>
      </div>
      
      <div style="flex: 1; padding: 0 48px 32px;">
        <h2 style="font-size: 28px; font-weight: 900; color: white; margin: 0 0 8px; text-transform: uppercase;">Project Investment</h2>
        <p style="font-size: 12px; color: #9ca3af; margin: 0 0 32px;">Scope of work and pricing</p>
        
        <div style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; margin-bottom: 32px;">
          <div style="background: rgba(255,255,255,0.05); padding: 12px 20px; display: grid; grid-template-columns: 2fr 1fr 1fr; font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em;">
            <span>Service</span>
            <span style="text-align: center;">Unit</span>
            <span style="text-align: right;">Amount</span>
          </div>
          ${allServices.map(service => `
            <div style="padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.05); display: grid; grid-template-columns: 2fr 1fr 1fr; font-size: 13px; align-items: center;">
              <span style="color: white; font-weight: 500;">${service.name}</span>
              <span style="text-align: center; color: #9ca3af;">${service.unit || "—"}</span>
              <span style="text-align: right; color: white;">${formatIDR(service.price)}</span>
            </div>
          `).join("")}
        </div>
        
        <div style="margin-bottom: 32px;">
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
            <span style="color: white; text-transform: uppercase;">Total Investment</span>
            <span style="color: #00ACC1;">${formatIDR(total)}</span>
          </div>
        </div>
      </div>
      
      <div style="padding: 0 48px 40px;">
        <div style="background: #00ACC1; border-radius: 12px; padding: 24px 32px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;">Project Total</div>
            <div style="font-size: 24px; font-weight: 900; color: white;">${formatIDR(total)}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; color: white; font-size: 13px; font-weight: 600; text-transform: uppercase;">Start Project →</div>
        </div>
      </div>
    </div>
  `;
}
