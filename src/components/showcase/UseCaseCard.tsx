import {
  Monitor,
  Laptop,
  Building2,
  Megaphone,
  BriefcaseBusiness,
  Palette,
  type LucideProps,
} from "lucide-react";
import type { UseCase } from "@/data/useCases";

type IconName = UseCase["icon"];

const ICON_MAP: Record<IconName, React.FC<LucideProps>> = {
  Monitor,
  Laptop,
  Building2,
  Megaphone,
  BriefcaseBusiness,
  Palette,
};

interface UseCaseCardProps {
  useCase: UseCase;
  ctaLabel: string;
  featuresLabel: string;
  onWatch: (videoId: string, title: string) => void;
}

export const UseCaseCard = ({
  useCase,
  ctaLabel,
  featuresLabel,
  onWatch,
}: UseCaseCardProps) => {
  const Icon = ICON_MAP[useCase.icon] ?? Monitor;

  return (
    <article className="bg-white rounded-2xl border border-[#E5E7EB] shadow-md p-7 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-lg transition-all">
      {/* Icon */}
      <div className="size-12 rounded-xl bg-teal-50 flex items-center justify-center">
        <Icon className="size-6 text-[#0F766E]" />
      </div>

      {/* Persona */}
      <h3 className="text-lg font-bold text-[#1A1A2E]">{useCase.persona}</h3>

      {/* Scenario */}
      <p className="text-sm text-gray-500 leading-relaxed flex-1">{useCase.scenario}</p>

      {/* Feature pills */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {featuresLabel}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {useCase.features.map((f) => (
            <span
              key={f}
              className="text-xs font-medium text-[#0F766E] bg-teal-50 border border-teal-100 rounded-full px-2.5 py-1"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => onWatch(useCase.videoId, useCase.persona)}
        className="self-start text-sm font-semibold text-[#0F766E] hover:text-[#0D9488] transition-colors"
      >
        {ctaLabel}
      </button>
    </article>
  );
};
