import type { ProposalData } from "@/pages/ProposalBuilder";
import { formatIDR } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { getProposalPageMode } from "@/lib/proposalPageMode";

interface ProposalPreviewProps {
  currentPage: number;
  data: ProposalData;
  /** When true, forces print-safe styles for PDF export */
  forExport?: boolean;
}

export function ProposalPreview({ currentPage, data, forExport = false }: ProposalPreviewProps) {
  const pageMode = getProposalPageMode(currentPage);

  if (currentPage === 1) return <CoverPreview data={data} forExport={forExport} pageMode={pageMode} />;
  if (currentPage === 2) return <IntroPreview data={data} forExport={forExport} pageMode={pageMode} />;
  if (currentPage === 3) return <ExperiencePreview data={data} forExport={forExport} pageMode={pageMode} />;
  if (currentPage === 4) return <ServicesPreview data={data} forExport={forExport} pageMode={pageMode} />;
  if (currentPage === 5) return <TimelinePreview data={data} forExport={forExport} pageMode={pageMode} />;
  if (currentPage === 6) return <InvestmentPreview data={data} forExport={forExport} pageMode={pageMode} />;
  return null;
}

// ─── Export font families ────────────────────────────────
const FONT_SERIF_EXPORT = "'Source Serif 4', Georgia, serif";
const FONT_SANS_EXPORT  = "'Poppins', system-ui, sans-serif";
const FONT_NUMERIC_EXPORT = "'IBM Plex Sans', 'Poppins', system-ui, sans-serif";

interface PageProps {
  data: ProposalData;
  forExport?: boolean;
  pageMode: ReturnType<typeof getProposalPageMode>;
}

// ─── Shared page shell ───────────────────────────────────
function PageShell({
  children,
  dark = false,
  forExport = false,
  pageNum,
  totalPages = 6,
  printElement,
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  forExport?: boolean;
  pageNum?: number;
  totalPages?: number;
  printElement: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-full flex flex-col font-sans",
        dark ? "bg-[#1a1a1a] text-white" : "bg-white text-gray-900",
        forExport && "print-document",
        className
      )}
      style={forExport ? {
        width: "794px",
        height: "1123px",
        background: dark ? "#1a1a1a" : "#ffffff",
        color: dark ? "#ffffff" : "#1a1a1a",
      } : undefined}
      data-print-element={printElement}
      data-print-page-break="after"
    >
      {children}
      {pageNum && (
        <div
          className={cn(
            "px-10 py-3 text-[10px]",
            dark ? "text-gray-600" : "text-gray-400"
          )}
          style={forExport ? { color: dark ? "#4b5563" : "#9ca3af" } : undefined}
        >
          {pageNum} / {totalPages}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Page 1 — Cover
// ═══════════════════════════════════════════════════════════

function CoverPreview({ data, forExport }: PageProps) {
  return (
    <PageShell dark forExport={forExport} printElement="cover-page" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      </div>
      {/* Top bar */}
      <div className="relative px-10 pt-10 flex items-start justify-between">
        <span
          className="text-[11px] font-medium tracking-wide text-white/80"
          style={forExport ? { color: "rgba(255,255,255,0.8)", fontFamily: FONT_SANS_EXPORT } : undefined}
        >
          {data.studioName}
        </span>
        {data.clientCompany && (
          <div className="text-right">
            <div
              className="text-[10px] text-gray-500"
              style={forExport ? { color: "#6b7280" } : undefined}
            >
              Disiapkan untuk
            </div>
            <div
              className="text-[11px] font-medium text-white/90 mt-0.5"
              style={forExport ? { color: "rgba(255,255,255,0.9)" } : undefined}
            >
              {data.clientCompany}
            </div>
          </div>
        )}
      </div>

      {/* Title block — vertically centered */}
      <div className="relative flex-1 flex flex-col justify-center px-10">
        <div className="space-y-5">
          <div
            className="text-[10px] font-medium tracking-[0.15em] text-[#00ACC1]"
            style={forExport ? { color: "#00ACC1", fontFamily: FONT_SANS_EXPORT } : undefined}
          >
            Proposal Proyek
          </div>
          <h1
            className="text-[32px] font-serif font-semibold leading-[1.2] tracking-tight text-white"
            style={forExport ? { fontFamily: FONT_SERIF_EXPORT, color: "#ffffff" } : undefined}
            data-print-heading="editorial"
          >
            {data.projectTitle}
          </h1>
          <p
            className="text-gray-400 text-sm max-w-[300px] leading-relaxed"
            style={forExport ? { color: "#9ca3af" } : undefined}
          >
            {data.tagline}
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative px-10 pb-10 flex items-end justify-between">
        <div className="text-[10px] text-gray-500 space-y-0.5" style={forExport ? { color: "#6b7280" } : undefined}>
          {data.clientName && <div>{data.clientName}</div>}
          <div>{data.year}</div>
        </div>
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════
//  Page 2 — Overview (was "Intro")
// ═══════════════════════════════════════════════════════════

function IntroPreview({ data, forExport }: PageProps) {
  return (
    <PageShell forExport={forExport} pageNum={2} printElement="intro-page">
      <div className="flex-1 px-10 pt-10 pb-4 flex flex-col min-h-0">
        {/* Hero Image */}
        {data.heroImageUrl ? (
          <div className="h-36 mb-6 flex-shrink-0 overflow-hidden">
            <img src={data.heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-36 mb-6 flex-shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
            <span className="text-sm text-gray-300">Hero Image</span>
          </div>
        )}

        {/* Section title */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <h2
            className="text-xl font-serif font-semibold text-gray-900 mb-4 leading-tight"
            style={forExport ? { fontFamily: FONT_SERIF_EXPORT, color: "#111827" } : undefined}
            data-print-heading="editorial"
          >
            {data.introTitle}
          </h2>
          <div className="text-[13px] text-gray-600 leading-[1.75] space-y-3">
            {data.introText.split("\n\n").map((paragraph, i) => (
              <p key={i} style={forExport ? { color: "#4b5563" } : undefined}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════
//  Page 3 — Experience / Credentials
// ═══════════════════════════════════════════════════════════

function ExperiencePreview({ data, forExport }: PageProps) {
  return (
    <PageShell forExport={forExport} pageNum={3} printElement="experience-page">
      <div className="flex-1 px-10 pt-10 flex flex-col justify-center min-h-0">
        <h2
          className="text-xl font-serif font-semibold text-gray-900 mb-2 leading-tight"
          style={forExport ? { fontFamily: FONT_SERIF_EXPORT, color: "#111827" } : undefined}
          data-print-heading="editorial"
        >
          {data.experienceTitle}
        </h2>
        <p
          className="text-[13px] text-gray-500 mb-8 max-w-sm leading-relaxed"
          style={forExport ? { color: "#6b7280" } : undefined}
        >
          {data.experienceSubtitle}
        </p>

        {/* Stats row */}
        <div className="flex gap-10 mb-8">
          {[
            { value: data.projectCount, label: "Proyek" },
            { value: data.countriesCount, label: "Wilayah" },
            { value: data.rating, label: "Nilai" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                className="text-2xl font-numeric font-semibold text-gray-900"
                style={forExport ? { fontFamily: FONT_NUMERIC_EXPORT, fontVariantNumeric: "tabular-nums", color: "#111827" } : undefined}
                data-print-numeric
              >
                {stat.value}
              </div>
              <div
                className="text-[10px] text-gray-400 mt-0.5 font-medium"
                style={forExport ? { color: "#9ca3af" } : undefined}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Client logos grid */}
        <div className="grid grid-cols-3 gap-3 max-w-xs">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const logoUrl = data.clientLogos?.[i];
            return (
              <div
                key={i}
                className="aspect-square bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden"
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={`Client ${i + 1}`} className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-gray-200 text-lg">-</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════
//  Page 4 — Scope of Work (was "Services")
// ═══════════════════════════════════════════════════════════

function ServicesPreview({ data, forExport }: PageProps) {
  const allServices = [...data.selectedServices, ...(data.customServices || [])];
  return (
    <PageShell forExport={forExport} pageNum={4} printElement="services-page">
      <div className="flex-1 px-10 pt-10 pb-4 overflow-y-auto">
        <h2
          className="text-xl font-serif font-semibold text-gray-900 mb-1 leading-tight"
          style={forExport ? { fontFamily: FONT_SERIF_EXPORT, color: "#111827" } : undefined}
          data-print-heading="editorial"
        >
          Ruang Lingkup
        </h2>
        <p
          className="text-[13px] text-gray-500 mb-6"
          style={forExport ? { color: "#6b7280" } : undefined}
        >
          Rincian hasil kerja yang akan Anda terima
        </p>

        <div className="space-y-0">
          {allServices.map((service, index) => (
            <div
              key={service.id}
              className="py-4 border-b border-gray-100 last:border-b-0"
              style={forExport ? { borderColor: "#f3f4f6" } : undefined}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-[10px] font-numeric font-medium text-gray-400 tabular-nums"
                      style={forExport ? { color: "#9ca3af", fontFamily: FONT_NUMERIC_EXPORT } : undefined}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3
                      className="text-sm font-semibold text-gray-900"
                      style={forExport ? { color: "#111827" } : undefined}
                    >
                      {service.name || "Layanan Tanpa Judul"}
                    </h3>
                  </div>
                  {service.description && (
                    <p
                      className="text-[12px] text-gray-500 mt-1 ml-[30px] leading-relaxed"
                      style={forExport ? { color: "#6b7280" } : undefined}
                    >
                      {service.description}
                    </p>
                  )}
                </div>
                <span
                  className="text-sm font-numeric font-medium text-gray-900 whitespace-nowrap"
                  style={forExport ? { fontFamily: FONT_NUMERIC_EXPORT, fontVariantNumeric: "tabular-nums", color: "#111827" } : undefined}
                  data-print-numeric
                >
                  {formatIDR(service.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════
//  Page 5 — Timeline
// ═══════════════════════════════════════════════════════════

function TimelinePreview({ data, forExport }: PageProps) {
  return (
    <PageShell forExport={forExport} pageNum={5} printElement="timeline-page">
      <div className="flex-1 px-10 pt-10 pb-4 overflow-y-auto">
        <h2
          className="text-xl font-serif font-semibold text-gray-900 mb-1 leading-tight"
          style={forExport ? { fontFamily: FONT_SERIF_EXPORT, color: "#111827" } : undefined}
          data-print-heading="editorial"
        >
          Timeline Proyek
        </h2>
        <p
          className="text-[13px] text-gray-500 mb-8"
          style={forExport ? { color: "#6b7280" } : undefined}
        >
          Tahapan kerja dari arah awal hingga finalisasi
        </p>

        <div className="space-y-0">
          {data.milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className="flex gap-5 pb-6 last:pb-0"
            >
              {/* Left gutter — phase indicator */}
              <div className="flex flex-col items-center w-6 shrink-0">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-numeric font-medium shrink-0",
                    index === 0
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-500"
                  )}
                  style={forExport ? {
                    backgroundColor: index === 0 ? "#111827" : "#f3f4f6",
                    color: index === 0 ? "#ffffff" : "#6b7280",
                    fontFamily: FONT_NUMERIC_EXPORT,
                  } : undefined}
                >
                  {index + 1}
                </div>
                {index < data.milestones.length - 1 && (
                  <div
                    className="w-px flex-1 bg-gray-200 mt-1"
                    style={forExport ? { backgroundColor: "#e5e7eb" } : undefined}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div
                  className="text-[10px] font-medium text-gray-400 mb-0.5"
                  style={forExport ? { color: "#9ca3af" } : undefined}
                >
                  {milestone.week}
                </div>
                <h3
                  className="text-sm font-semibold text-gray-900 mb-1"
                  style={forExport ? { color: "#111827" } : undefined}
                >
                  {milestone.title || "Tahap Tanpa Judul"}
                </h3>
                {milestone.description && (
                  <p
                    className="text-[12px] text-gray-500 leading-relaxed"
                    style={forExport ? { color: "#6b7280" } : undefined}
                  >
                    {milestone.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════
//  Page 6 — Investment
// ═══════════════════════════════════════════════════════════

function InvestmentPreview({ data, forExport, pageMode }: PageProps) {
  const allServices = [...data.selectedServices, ...(data.customServices || [])];
  const subtotal = allServices.reduce((sum, s) => sum + s.price, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;
  const isClosingDark = pageMode === "closing_dark";
  const shellTitleColor = isClosingDark ? "#ffffff" : "#1a1a1a";
  const shellMutedColor = isClosingDark ? "rgba(255,255,255,0.68)" : "#6b7280";
  const shellBorderColor = isClosingDark ? "rgba(255,255,255,0.12)" : "#e5e7eb";
  const shellSurfaceClass = isClosingDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200";
  const shellTextClass = isClosingDark ? "text-white" : "text-gray-900";
  const shellSubtleTextClass = isClosingDark ? "text-white/70" : "text-gray-500";
  const shellTableBorderClass = isClosingDark ? "border-white/10" : "border-gray-100";

  return (
    <PageShell
      dark={isClosingDark}
      forExport={forExport}
      pageNum={6}
      printElement="investment-page"
      className={cn(isClosingDark && "relative overflow-hidden")}
    >
      {isClosingDark && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        </div>
      )}
      <div className="flex-1 px-10 pt-10 pb-4 overflow-y-auto">
        <h2
          className={cn(
            "text-xl font-serif font-semibold mb-1 leading-tight",
            isClosingDark ? "text-white" : "text-gray-900",
          )}
          style={forExport ? { fontFamily: FONT_SERIF_EXPORT, color: shellTitleColor } : undefined}
          data-print-heading="editorial"
        >
          Investasi
        </h2>
        <p
          className={cn("text-[13px] mb-8", shellSubtleTextClass)}
          style={forExport ? { color: shellMutedColor } : undefined}
        >
          Rangkuman ruang lingkup, nilai, dan kesiapan eksekusi
        </p>

        {/* Line items table */}
        <table
          className="w-full mb-6 border-collapse"
          data-print-page-break="avoid"
        >
          <thead>
            <tr className={cn("border-b", isClosingDark ? "border-white/12" : "border-gray-200")} style={forExport ? { borderColor: shellBorderColor } : undefined}>
              <th
                className={cn("text-left pb-2 text-[10px] font-medium", shellSubtleTextClass)}
                style={forExport ? { color: shellMutedColor } : undefined}
              >
                Layanan
              </th>
              <th
                className={cn("text-center pb-2 text-[10px] font-medium w-20", shellSubtleTextClass)}
                style={forExport ? { color: shellMutedColor } : undefined}
              >
                Unit
              </th>
              <th
                className={cn("text-right pb-2 text-[10px] font-medium w-28", shellSubtleTextClass)}
                style={forExport ? { color: shellMutedColor } : undefined}
              >
                Nilai
              </th>
            </tr>
          </thead>
          <tbody>
            {allServices.map((service) => (
              <tr
                key={service.id}
                className={cn("border-b", shellTableBorderClass)}
                style={forExport ? { borderColor: isClosingDark ? "rgba(255,255,255,0.08)" : "#f3f4f6" } : undefined}
              >
                <td
                  className={cn("py-3 text-sm font-medium", shellTextClass)}
                  style={forExport ? { color: shellTitleColor } : undefined}
                >
                  {service.name || "Tanpa Judul"}
                </td>
                <td
                  className={cn("py-3 text-sm text-center", shellSubtleTextClass)}
                  style={forExport ? { color: shellMutedColor } : undefined}
                >
                  {service.unit || "—"}
                </td>
                <td
                  className={cn("py-3 text-sm text-right font-numeric", shellTextClass)}
                  style={forExport ? { fontFamily: FONT_NUMERIC_EXPORT, fontVariantNumeric: "tabular-nums", color: shellTitleColor } : undefined}
                  data-print-numeric
                >
                  {formatIDR(service.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="max-w-xs ml-auto" data-print-page-break="avoid">
          {data.taxRate > 0 && (
            <div className="space-y-1.5 mb-3 text-sm">
              <div className="flex justify-between">
                <span className={shellSubtleTextClass} style={forExport ? { color: shellMutedColor } : undefined}>Subtotal</span>
                <span
                  className={cn("font-numeric", shellTextClass)}
                  style={forExport ? { fontFamily: FONT_NUMERIC_EXPORT, fontVariantNumeric: "tabular-nums", color: shellTitleColor } : undefined}
                  data-print-numeric
                >
                  {formatIDR(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={shellSubtleTextClass} style={forExport ? { color: shellMutedColor } : undefined}>Pajak ({data.taxRate}%)</span>
                <span
                  className={cn("font-numeric", shellTextClass)}
                  style={forExport ? { fontFamily: FONT_NUMERIC_EXPORT, fontVariantNumeric: "tabular-nums", color: shellTitleColor } : undefined}
                  data-print-numeric
                >
                  {formatIDR(taxAmount)}
                </span>
              </div>
            </div>
          )}

          <div
            className={cn("flex justify-between items-baseline pt-3 border-t", isClosingDark ? "border-white/15" : "border-gray-300")}
            style={forExport ? { borderColor: isClosingDark ? "rgba(255,255,255,0.16)" : "#d1d5db" } : undefined}
          >
            <span
              className={cn("text-sm font-semibold", shellTextClass)}
              style={forExport ? { color: shellTitleColor } : undefined}
            >
              Total Investasi
            </span>
            <span
              className={cn("text-xl font-numeric font-semibold", isClosingDark ? "text-cyan-300" : "text-gray-900")}
              style={forExport ? { fontFamily: FONT_NUMERIC_EXPORT, fontVariantNumeric: "tabular-nums", color: isClosingDark ? "#67e8f9" : "#1a1a1a" } : undefined}
              data-print-numeric
            >
              {formatIDR(total)}
            </span>
          </div>
        </div>
      </div>

      {/* CTA strip */}
      <div className="px-10 pb-8">
        <div
          className={cn(
            "px-6 py-4 flex items-center justify-between rounded-2xl border",
            isClosingDark
              ? "border-cyan-300/18 bg-cyan-400/8"
              : "border-gray-200 bg-white",
          )}
          style={forExport ? { borderColor: isClosingDark ? "rgba(103,232,249,0.2)" : "#e5e7eb" } : undefined}
        >
          <div>
            <div
              className={cn("text-[10px] mb-0.5", shellSubtleTextClass)}
              style={forExport ? { color: shellMutedColor } : undefined}
            >
              Siap memulai?
            </div>
            <div
              className={cn("text-base font-numeric font-semibold", isClosingDark ? "text-white" : "text-gray-900")}
              style={forExport ? { fontFamily: FONT_NUMERIC_EXPORT, fontVariantNumeric: "tabular-nums", color: shellTitleColor } : undefined}
              data-print-numeric
            >
              {formatIDR(total)}
            </div>
          </div>
          <div
            className={cn(
              "text-sm font-medium",
              isClosingDark ? "text-cyan-200" : "text-gray-700",
            )}
            style={forExport ? { color: isClosingDark ? "#a5f3fc" : "#374151" } : undefined}
          >
            Mulai proyek →
          </div>
        </div>
      </div>
    </PageShell>
  );
}
