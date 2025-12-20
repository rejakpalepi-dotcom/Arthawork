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
    <div className="h-full flex items-center justify-center bg-gray-100 text-gray-400">
      <div className="text-center">
        <span className="material-symbols-outlined text-6xl mb-2">construction</span>
        <p className="text-lg">Coming Soon</p>
      </div>
    </div>
  );
}

function CoverPreview({ data }: { data: ProposalData }) {
  return (
    <div className="h-full bg-[#1a1a1a] text-white p-8 flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ACC1] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00ACC1] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00ACC1] rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">design_services</span>
          </div>
          <span className="font-semibold text-sm tracking-wide">{data.studioName.toUpperCase()}</span>
        </div>
        {data.clientCompany && (
          <div className="text-right text-xs text-gray-400">
            <div>Prepared for</div>
            <div className="font-medium text-white">{data.clientCompany}</div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center relative z-10 py-12">
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="text-[#00ACC1] text-xs font-medium tracking-widest uppercase">Project Proposal</div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {data.projectTitle.split(" ").map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </h1>
          </div>
          <p className="text-gray-400 text-sm max-w-xs">{data.tagline}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-end justify-between">
        <div className="text-xs text-gray-500">
          {data.clientName && <div>For: {data.clientName}</div>}
          <div>{data.year}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-[#00ACC1]/20 text-[#00ACC1] text-xs rounded-full font-medium">NEW</span>
          <span className="px-2 py-1 bg-white/10 text-white text-xs rounded-full font-medium">UPDATE</span>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-20 right-8 w-32 h-32 border border-white/10 rounded-full" />
      <div className="absolute bottom-16 right-12 w-24 h-24 border border-[#00ACC1]/30 rounded-full" />
    </div>
  );
}

function IntroPreview({ data }: { data: ProposalData }) {
  return (
    <div className="h-full bg-white p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1a1a1a] rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="text-xs text-gray-400">{data.studioName}</span>
        </div>
        {data.clientCompany && (
          <span className="text-xs text-gray-400">{data.clientCompany}</span>
        )}
      </div>

      {/* Hero Image Placeholder */}
      <div className="bg-gradient-to-br from-[#00ACC1]/20 to-[#00ACC1]/5 rounded-xl flex-1 max-h-48 flex items-center justify-center mb-6">
        {data.heroImageUrl ? (
          <img src={data.heroImageUrl} alt="Hero" className="w-full h-full object-cover rounded-xl" />
        ) : (
          <div className="text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl">image</span>
            <p className="text-xs mt-1">Place Image Here</p>
          </div>
        )}
      </div>

      {/* Value Proposition */}
      <div className="flex-1">
        <div className="text-xs text-[#00ACC1] font-medium tracking-wide mb-2">VALUE PROPOSITION</div>
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 leading-tight">
          {data.introTitle}
        </h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-3">
          {data.introText.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>{data.studioName} © {data.year}</span>
        <span>Proposal Template</span>
      </div>
    </div>
  );
}

function ExperiencePreview({ data }: { data: ProposalData }) {
  return (
    <div className="h-full bg-white p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00ACC1] rounded-full flex items-center justify-center text-white font-bold text-sm">
            SS
          </div>
          <span className="text-sm font-medium text-[#1a1a1a]">{data.studioName}</span>
        </div>
        <span className="material-symbols-outlined text-gray-400">menu</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4 leading-tight lowercase italic">
          {data.experienceTitle}
        </h2>
        <p className="text-sm text-gray-500 mb-8 max-w-md">
          {data.experienceSubtitle}
        </p>

        {/* Stats */}
        <div className="flex gap-8 mb-8">
          <div>
            <div className="text-3xl font-bold text-[#1a1a1a]">{data.projectCount}</div>
            <div className="text-xs text-gray-400">Projects</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#1a1a1a]">{data.countriesCount}</div>
            <div className="text-xs text-gray-400">Countries</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#1a1a1a]">{data.rating}</div>
            <div className="text-xs text-gray-400">Rating</div>
          </div>
        </div>

        {/* Client Logos Placeholder Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-gray-300">image</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          <span>The Ultimate Project Proposal Template {data.year}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">©</span>
          <span className="text-[#00ACC1] font-medium">{data.studioName}</span>
          <span className="material-symbols-outlined text-gray-400 text-sm">arrow_forward</span>
        </div>
      </div>
    </div>
  );
}
