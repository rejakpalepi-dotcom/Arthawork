import type { ProposalData } from "@/pages/ProposalBuilder";

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
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 font-sans">
      <div className="text-center">
        <span className="material-symbols-outlined text-6xl mb-2">construction</span>
        <p className="text-lg font-medium">Coming Soon</p>
      </div>
    </div>
  );
}

function CoverPreview({ data }: { data: ProposalData }) {
  return (
    <div className="h-full bg-[#1a1a1a] text-white p-8 flex flex-col relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ACC1]/10 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#00ACC1]/8 rounded-full blur-[80px] transform -translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#00ACC1] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-lg">design_services</span>
          </div>
          <span className="font-semibold text-xs tracking-widest uppercase text-white/90">
            {data.studioName}
          </span>
        </div>
        {data.clientCompany && (
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Prepared for</div>
            <div className="text-xs font-medium text-white">{data.clientCompany}</div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center relative z-10 py-8">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="text-[#00ACC1] text-[10px] font-semibold tracking-[0.2em] uppercase">
              Project Proposal
            </div>
            <h1 className="text-3xl font-bold leading-[1.15] tracking-tight">
              {data.projectTitle.split(" ").slice(0, 2).join(" ")}
              <br />
              <span className="text-[#00ACC1]">{data.projectTitle.split(" ").slice(2).join(" ")}</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm max-w-[260px] leading-relaxed">
            {data.tagline}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-end justify-between">
        <div className="text-[10px] text-gray-500 space-y-0.5">
          {data.clientName && <div>For: {data.clientName}</div>}
          <div>{data.year}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[#00ACC1]/20 text-[#00ACC1] text-[10px] rounded-full font-semibold tracking-wide">
            NEW
          </span>
          <span className="px-2.5 py-1 bg-white/10 text-white/80 text-[10px] rounded-full font-medium">
            UPDATE
          </span>
        </div>
      </div>

      {/* Decorative Circles */}
      <div className="absolute bottom-16 right-6 w-28 h-28 border border-white/10 rounded-full pointer-events-none" />
      <div className="absolute bottom-12 right-10 w-20 h-20 border border-[#00ACC1]/30 rounded-full pointer-events-none" />
    </div>
  );
}

function IntroPreview({ data }: { data: ProposalData }) {
  return (
    <div className="h-full bg-white p-8 flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1a1a1a] rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">S</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">{data.studioName}</span>
        </div>
        {data.clientCompany && (
          <span className="text-xs text-gray-400">{data.clientCompany}</span>
        )}
      </div>

      {/* Hero Image Placeholder */}
      <div className="bg-gradient-to-br from-[#00ACC1]/15 to-[#00ACC1]/5 rounded-xl h-40 flex items-center justify-center mb-6 flex-shrink-0">
        {data.heroImageUrl ? (
          <img src={data.heroImageUrl} alt="Hero" className="w-full h-full object-cover rounded-xl" />
        ) : (
          <div className="text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl text-gray-300">public</span>
            <p className="text-xs mt-1.5 font-medium">Place Image Here</p>
          </div>
        )}
      </div>

      {/* Value Proposition */}
      <div className="flex-1 min-h-0">
        <div className="text-[10px] text-[#00ACC1] font-semibold tracking-[0.15em] uppercase mb-2">
          Value Proposition
        </div>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-4 leading-tight">
          {data.introTitle}
        </h2>
        <div className="text-sm text-gray-600 leading-[1.7] space-y-3">
          {data.introText.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
        <span>{data.studioName} © {data.year}</span>
        <span>Proposal Template</span>
      </div>
    </div>
  );
}

function ExperiencePreview({ data }: { data: ProposalData }) {
  return (
    <div className="h-full bg-white p-8 flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#00ACC1] rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            SS
          </div>
          <span className="text-sm font-semibold text-[#1a1a1a]">{data.studioName}</span>
        </div>
        <span className="material-symbols-outlined text-gray-300 text-xl">menu</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center min-h-0">
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3 leading-tight lowercase italic">
          {data.experienceTitle}
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm leading-relaxed">
          {data.experienceSubtitle}
        </p>

        {/* Stats */}
        <div className="flex gap-8 mb-6">
          <div>
            <div className="text-2xl font-bold text-[#1a1a1a]">{data.projectCount}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Projects</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1a1a1a]">{data.countriesCount}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Countries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1a1a1a]">{data.rating}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Rating</div>
          </div>
        </div>

        {/* Client Logos Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100"
            >
              <span className="material-symbols-outlined text-gray-200 text-2xl">image</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-[10px] text-gray-400">
          The Ultimate Project Proposal Template {data.year}
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-gray-400">©</span>
          <span className="text-[#00ACC1] font-semibold">{data.studioName}</span>
          <span className="material-symbols-outlined text-gray-300 text-sm">arrow_forward</span>
        </div>
      </div>
    </div>
  );
}
