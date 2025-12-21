import type { ProposalData } from "@/pages/ProposalBuilder";
import { formatIDR } from "@/lib/currency";

interface ProposalPreviewProps {
  currentPage: number;
  data: ProposalData;
}

export function ProposalPreview({ currentPage, data }: ProposalPreviewProps) {
  if (currentPage === 1) return <CoverPreview data={data} />;
  if (currentPage === 2) return <IntroPreview data={data} />;
  if (currentPage === 3) return <ExperiencePreview data={data} />;
  if (currentPage === 4) return <ServicesPreview data={data} />;
  if (currentPage === 5) return <TimelinePreview data={data} />;
  if (currentPage === 6) return <InvestmentPreview data={data} />;
  return null;
}

function CoverPreview({ data }: { data: ProposalData }) {
  const titleWords = data.projectTitle.split(" ");
  const firstLine = titleWords.slice(0, 2).join(" ");
  const secondLine = titleWords.slice(2).join(" ");
  
  return (
    <div className="h-full bg-[#1a1a1a] text-white flex flex-col relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ACC1]/10 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#00ACC1]/8 rounded-full blur-[80px] transform -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[10px] tracking-[0.15em] uppercase text-white/90">{data.studioName}</span>
        </div>
        {data.clientCompany && (
          <div className="text-right">
            <div className="text-[8px] text-gray-500 uppercase tracking-wide">Prepared for</div>
            <div className="text-[10px] font-medium text-white">{data.clientCompany}</div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pt-4 relative z-10">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="text-[#00ACC1] text-[9px] font-extrabold tracking-[0.2em] uppercase">Project Proposal</div>
            {/* UPDATED: Added uppercase and font-black */}
            <h1 className="text-[26px] font-black leading-[1.15] tracking-tight uppercase">
              {firstLine}
              {secondLine && (
                <>
                  <br />
                  <span className="text-[#00ACC1]">{secondLine}</span>
                </>
              )}
            </h1>
          </div>
          <p className="text-gray-400 text-[11px] max-w-[240px] leading-relaxed font-normal">{data.tagline}</p>
        </div>
      </div>

      <div className="relative z-10 px-6 pb-6 flex items-end justify-between">
        <div className="text-[9px] text-gray-500 space-y-0.5 font-normal">
          {data.clientName && <div>For: {data.clientName}</div>}
          <div>{data.year}</div>
        </div>
      </div>
      <div className="absolute bottom-14 right-5 w-24 h-24 border border-white/10 rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-8 w-16 h-16 border border-[#00ACC1]/30 rounded-full pointer-events-none" />
    </div>
  );
}

function IntroPreview({ data }: { data: ProposalData }) {
  return (
    <div className="h-full bg-white flex flex-col font-sans">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-2"></div>
        {data.clientCompany && <span className="text-[10px] text-gray-400">{data.clientCompany}</span>}
      </div>

      <div className="flex-1 px-6 pb-4 flex flex-col min-h-0">
        <div className="bg-gradient-to-br from-[#00ACC1]/15 to-[#00ACC1]/5 rounded-lg h-32 flex items-center justify-center mb-4 flex-shrink-0">
          {data.heroImageUrl ? (
            <img src={data.heroImageUrl} alt="Hero" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="text-center text-gray-400">
              <span className="text-3xl text-gray-300">🌐</span>
              <p className="text-[10px] mt-1 font-medium">Place Image Here</p>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="text-[8px] text-[#00ACC1] font-semibold tracking-[0.15em] uppercase mb-1.5">
            Value Proposition
          </div>
          <h2 className="text-lg font-black text-[#1a1a1a] mb-3 leading-tight uppercase">{data.introTitle}</h2>
          <div className="text-[11px] text-gray-600 leading-[1.6] space-y-2 overflow-y-auto font-normal">
            {data.introText.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExperiencePreview({ data }: { data: ProposalData }) {
  return (
    <div className="h-full bg-white flex flex-col font-sans">
      <div className="flex-1 flex flex-col justify-center px-6 min-h-0">
        {/* UPDATED: Corrected font-black and added uppercase */}
        <h2 className="text-xl font-black text-[#1a1a1a] mb-2 leading-tight uppercase tracking-tight">{data.experienceTitle}</h2>
        <p className="text-[11px] text-gray-500 mb-5 max-w-xs leading-relaxed font-normal">{data.experienceSubtitle}</p>

        <div className="flex gap-6 mb-5">
          <div>
            <div className="text-xl font-black text-[#1a1a1a]">{data.projectCount}</div>
            <div className="text-[8px] text-gray-400 uppercase tracking-wider mt-0.5 font-medium">Projects</div>
          </div>
          <div>
            <div className="text-xl font-black text-[#1a1a1a]">{data.countriesCount}</div>
            <div className="text-[8px] text-gray-400 uppercase tracking-wider mt-0.5 font-medium">Countries</div>
          </div>
          <div>
            <div className="text-xl font-black text-[#1a1a1a]">{data.rating}</div>
            <div className="text-[8px] text-gray-400 uppercase tracking-wider mt-0.5 font-medium">Rating</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
              <span className="text-gray-200 text-xl">🏢</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServicesPreview({ data }: { data: ProposalData }) {
  const allServices = [...data.selectedServices, ...(data.customServices || [])];
  return (
    <div className="h-full bg-white flex flex-col font-sans">
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
        <span className="text-[8px] text-[#00ACC1] font-semibold uppercase tracking-wider">Services</span>
      </div>

      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {/* UPDATED: Added uppercase */}
        <h2 className="text-lg font-black text-[#1a1a1a] mb-1 uppercase tracking-tight">Our Services</h2>
        <p className="text-[10px] text-gray-500 mb-4 font-normal">What we bring to the table</p>

        <div className="space-y-2">
          {allServices.map((service, index) => (
            <div key={service.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-[#00ACC1]/10 text-[#00ACC1] flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-[11px] font-semibold text-[#1a1a1a]">{service.name || "Untitled Service"}</h3>
                    {service.description && <p className="text-[9px] text-gray-