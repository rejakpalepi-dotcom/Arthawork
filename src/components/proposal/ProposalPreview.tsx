import type { ProposalData } from "@/pages/ProposalBuilder";
import { formatIDR } from "@/lib/currency";

interface ProposalPreviewProps {
  currentPage: number;
  data: ProposalData;
}

export function ProposalPreview({ currentPage, data }: ProposalPreviewProps) {
  if (currentPage === 1) {
    return <CoverPreview data={data} />;
  }
  if (currentPage === 2) {
    return <IntroPreview data={data} />;
  }
  if (currentPage === 3) {
    return <ExperiencePreview data={data} />;
  }
  if (currentPage === 4) {
    return <ServicesPreview data={data} />;
  }
  if (currentPage === 5) {
    return <TimelinePreview data={data} />;
  }
  if (currentPage === 6) {
    return <InvestmentPreview data={data} />;
  }
  return null;
}

function CoverPreview({ data }: { data: ProposalData }) {
  const titleWords = data.projectTitle.split(" ");
  const firstLine = titleWords.slice(0, 2).join(" ");
  const secondLine = titleWords.slice(2).join(" ");

  return (
    <div className="h-full bg-[#1a1a1a] text-white flex flex-col relative overflow-hidden font-[Inter,sans-serif]">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ACC1]/10 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#00ACC1]/8 rounded-full blur-[80px] transform -translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Header - with proper spacing */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#00ACC1] rounded-md flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-sm">design_services</span>
          </div>
          <span className="font-semibold text-[10px] tracking-[0.15em] uppercase text-white/90">
            {data.studioName}
          </span>
        </div>
        {data.clientCompany && (
          <div className="text-right">
            <div className="text-[8px] text-gray-500 uppercase tracking-wide">Prepared for</div>
            <div className="text-[10px] font-medium text-white">{data.clientCompany}</div>
          </div>
        )}
      </div>

      {/* Main Content - centered with flex-1 */}
      <div className="flex-1 flex flex-col justify-center px-6 relative z-10">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-[#00ACC1] text-[9px] font-semibold tracking-[0.2em] uppercase">
              Project Proposal
            </div>
            <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-tight">
              {firstLine}
              {secondLine && (
                <>
                  <br />
                  <span className="text-[#00ACC1]">{secondLine}</span>
                </>
              )}
            </h1>
          </div>
          <p className="text-gray-400 text-[11px] max-w-[240px] leading-relaxed">
            {data.tagline}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 pb-6 flex items-end justify-between">
        <div className="text-[9px] text-gray-500 space-y-0.5">
          {data.clientName && <div>For: {data.clientName}</div>}
          <div>{data.year}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-[#00ACC1]/20 text-[#00ACC1] text-[8px] rounded-full font-semibold tracking-wide">
            NEW
          </span>
          <span className="px-2 py-0.5 bg-white/10 text-white/80 text-[8px] rounded-full font-medium">
            UPDATE
          </span>
        </div>
      </div>

      {/* Decorative Circles */}
      <div className="absolute bottom-14 right-5 w-24 h-24 border border-white/10 rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-8 w-16 h-16 border border-[#00ACC1]/30 rounded-full pointer-events-none" />
    </div>
  );
}

function IntroPreview({ data }: { data: ProposalData }) {
  return (
    <div className="h-full bg-white flex flex-col font-[Inter,sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#1a1a1a] rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[8px] font-bold">S</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">{data.studioName}</span>
        </div>
        {data.clientCompany && (
          <span className="text-[10px] text-gray-400">{data.clientCompany}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-4 flex flex-col min-h-0">
        {/* Hero Image Placeholder */}
        <div className="bg-gradient-to-br from-[#00ACC1]/15 to-[#00ACC1]/5 rounded-lg h-32 flex items-center justify-center mb-4 flex-shrink-0">
          {data.heroImageUrl ? (
            <img src={data.heroImageUrl} alt="Hero" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="text-center text-gray-400">
              <span className="material-symbols-outlined text-3xl text-gray-300">public</span>
              <p className="text-[10px] mt-1 font-medium">Place Image Here</p>
            </div>
          )}
        </div>

        {/* Value Proposition */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="text-[8px] text-[#00ACC1] font-semibold tracking-[0.15em] uppercase mb-1.5">
            Value Proposition
          </div>
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-3 leading-tight">
            {data.introTitle}
          </h2>
          <div className="text-[11px] text-gray-600 leading-[1.6] space-y-2 overflow-y-auto">
            {data.introText.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-[8px] text-gray-400">
        <span>{data.studioName} © {data.year}</span>
        <span>Proposal Template</span>
      </div>
    </div>
  );
}

function ExperiencePreview({ data }: { data: ProposalData }) {
  return (
    <div className="h-full bg-white flex flex-col font-[Inter,sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#00ACC1] rounded-full flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0">
            SS
          </div>
          <span className="text-[11px] font-semibold text-[#1a1a1a]">{data.studioName}</span>
        </div>
        <span className="material-symbols-outlined text-gray-300 text-lg">menu</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 min-h-0">
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2 leading-tight lowercase italic">
          {data.experienceTitle}
        </h2>
        <p className="text-[11px] text-gray-500 mb-5 max-w-xs leading-relaxed">
          {data.experienceSubtitle}
        </p>

        {/* Stats */}
        <div className="flex gap-6 mb-5">
          <div>
            <div className="text-xl font-extrabold text-[#1a1a1a]">{data.projectCount}</div>
            <div className="text-[8px] text-gray-400 uppercase tracking-wider mt-0.5">Projects</div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#1a1a1a]">{data.countriesCount}</div>
            <div className="text-[8px] text-gray-400 uppercase tracking-wider mt-0.5">Countries</div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#1a1a1a]">{data.rating}</div>
            <div className="text-[8px] text-gray-400 uppercase tracking-wider mt-0.5">Rating</div>
          </div>
        </div>

        {/* Client Logos Grid - 3 columns with uniform sizing */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100"
            >
              <span className="material-symbols-outlined text-gray-200 text-xl">image</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="text-[8px] text-gray-400">
          The Ultimate Project Proposal Template {data.year}
        </div>
        <div className="flex items-center gap-1 text-[8px]">
          <span className="text-gray-400">©</span>
          <span className="text-[#00ACC1] font-semibold">{data.studioName}</span>
          <span className="material-symbols-outlined text-gray-300 text-xs">arrow_forward</span>
        </div>
      </div>
    </div>
  );
}

function ServicesPreview({ data }: { data: ProposalData }) {
  return (
    <div className="h-full bg-white flex flex-col font-[Inter,sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#1a1a1a] rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[8px] font-bold">S</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">{data.studioName}</span>
        </div>
        <span className="text-[8px] text-[#00ACC1] font-semibold uppercase tracking-wider">Services</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">Our Services</h2>
        <p className="text-[10px] text-gray-500 mb-4">What we bring to the table</p>

        {data.selectedServices.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <span className="material-symbols-outlined text-3xl mb-2">design_services</span>
            <p className="text-[10px]">No services selected yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.selectedServices.map((service, index) => (
              <div
                key={service.id}
                className="p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded bg-[#00ACC1]/10 text-[#00ACC1] flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-[11px] font-semibold text-[#1a1a1a]">{service.name}</h3>
                      {service.description && (
                        <p className="text-[9px] text-gray-500 mt-0.5 line-clamp-2">{service.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#00ACC1] whitespace-nowrap">
                    {formatIDR(service.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-[8px] text-gray-400">
        <span>{data.studioName} © {data.year}</span>
        <span>Page 4 of 6</span>
      </div>
    </div>
  );
}

function TimelinePreview({ data }: { data: ProposalData }) {
  return (
    <div className="h-full bg-white flex flex-col font-[Inter,sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#1a1a1a] rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[8px] font-bold">S</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">{data.studioName}</span>
        </div>
        <span className="text-[8px] text-[#00ACC1] font-semibold uppercase tracking-wider">Timeline</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">Project Timeline</h2>
        <p className="text-[10px] text-gray-500 mb-5">Our roadmap to success</p>

        {data.milestones.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <span className="material-symbols-outlined text-3xl mb-2">schedule</span>
            <p className="text-[10px]">No milestones defined yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gray-200" />
            
            <div className="space-y-4">
              {data.milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex gap-3 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    index === 0 ? "bg-[#00ACC1] text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    <span className="text-[9px] font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="text-[9px] text-[#00ACC1] font-semibold uppercase tracking-wider mb-0.5">
                      {milestone.week}
                    </div>
                    <h3 className="text-[11px] font-semibold text-[#1a1a1a]">
                      {milestone.title || "Untitled Phase"}
                    </h3>
                    {milestone.description && (
                      <p className="text-[9px] text-gray-500 mt-0.5 leading-relaxed">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-[8px] text-gray-400">
        <span>{data.studioName} © {data.year}</span>
        <span>Page 5 of 6</span>
      </div>
    </div>
  );
}

function InvestmentPreview({ data }: { data: ProposalData }) {
  const subtotal = data.selectedServices.reduce((sum, s) => sum + s.price, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="h-full bg-[#1a1a1a] text-white flex flex-col font-[Inter,sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#00ACC1] rounded flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-xs">payments</span>
          </div>
          <span className="text-[10px] text-white/70 font-medium">{data.studioName}</span>
        </div>
        <span className="text-[8px] text-[#00ACC1] font-semibold uppercase tracking-wider">Investment</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-white mb-1">Project Investment</h2>
        <p className="text-[10px] text-gray-400 mb-4">Scope of work and pricing</p>

        {data.selectedServices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="material-symbols-outlined text-3xl mb-2">shopping_cart</span>
            <p className="text-[10px]">No services selected</p>
          </div>
        ) : (
          <>
            {/* Scope Table */}
            <div className="rounded-lg border border-white/10 overflow-hidden mb-4">
              <div className="bg-white/5 px-3 py-2 grid grid-cols-3 text-[8px] font-semibold text-gray-400 uppercase tracking-wider">
                <span>Service</span>
                <span className="text-center">Unit</span>
                <span className="text-right">Amount</span>
              </div>
              {data.selectedServices.map((service) => (
                <div key={service.id} className="px-3 py-2.5 border-t border-white/5 grid grid-cols-3 text-[10px]">
                  <span className="text-white font-medium">{service.name}</span>
                  <span className="text-center text-gray-400">{service.unit || "—"}</span>
                  <span className="text-right text-white">{formatIDR(service.price)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{formatIDR(subtotal)}</span>
              </div>
              {data.taxRate > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-400">Tax ({data.taxRate}%)</span>
                  <span className="text-white">{formatIDR(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/10">
                <span className="text-white">Total Investment</span>
                <span className="text-[#00ACC1]">{formatIDR(total)}</span>
              </div>
            </div>

            {/* Notes */}
            {data.investmentNotes && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-[8px] text-[#00ACC1] font-semibold uppercase tracking-wider mb-1">Notes</div>
                <p className="text-[9px] text-gray-300 leading-relaxed">{data.investmentNotes}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA */}
      <div className="px-6 pb-5">
        <div className="bg-[#00ACC1] rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[8px] text-white/70 uppercase tracking-wider">Project Total</div>
            <div className="text-base font-bold text-white">{formatIDR(total)}</div>
          </div>
          <div className="flex items-center gap-1 text-white text-[10px] font-semibold">
            Start Project
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between text-[8px] text-gray-500">
        <span>{data.studioName} © {data.year}</span>
        <span>Page 6 of 6</span>
      </div>
    </div>
  );
}
