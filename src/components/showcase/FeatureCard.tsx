import { Play } from "lucide-react";
import type { Feature } from "@/data/features";

interface FeatureCardProps {
  feature: Feature;
  watchLabel: string;
  onWatch: (videoId: string, title: string) => void;
}

const YT_THUMB = (id: string) =>
  `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

export const FeatureCard = ({ feature, watchLabel, onWatch }: FeatureCardProps) => (
  <article className="bg-white rounded-2xl border border-[#E5E7EB] shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow group">
    {/* Thumbnail */}
    <div
      className="relative cursor-pointer"
      onClick={() => onWatch(feature.videoId, feature.title)}
    >
      <img
        src={YT_THUMB(feature.videoId)}
        alt={`${feature.title} — Flowlio feature video`}
        width={640}
        height={360}
        loading="lazy"
        className="w-full object-cover aspect-video bg-gray-100"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            "https://img.youtube.com/vi/default/maxresdefault.jpg";
        }}
      />

      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
        <div className="size-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <Play className="size-6 text-[#0F766E] fill-[#0F766E] ml-0.5" />
        </div>
      </div>

      {/* Category pill */}
      <span className="absolute top-3 left-3 bg-[#0F766E] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
        {feature.category}
      </span>

      {/* Duration badge */}
      <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-0.5 rounded">
        {feature.duration}
      </span>
    </div>

    {/* Body */}
    <div className="flex flex-col flex-1 p-5 gap-3">
      <h3 className="text-base font-bold text-[#1A1A2E] leading-snug">
        {feature.title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
        {feature.description}
      </p>
      <button
        onClick={() => onWatch(feature.videoId, feature.title)}
        className="self-start text-sm font-semibold text-[#0F766E] hover:text-[#0D9488] transition-colors flex items-center gap-1"
      >
        {watchLabel}
      </button>
    </div>
  </article>
);
