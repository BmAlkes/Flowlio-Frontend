import { Helmet } from "react-helmet-async";
import type { Feature } from "@/data/features";
import type { UseCase } from "@/data/useCases";

/** Converts "1:30" → "PT1M30S" per ISO 8601 */
export const toDuration = (mmss: string): string => {
  const parts = mmss.split(":").map(Number);
  if (parts.length === 2) {
    const [m, s] = parts;
    return `PT${m}M${s}S`;
  }
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return `PT${h}H${m}M${s}S`;
  }
  return "PT0S";
};

const PUBLISHER = {
  "@type": "Organization",
  name: "Flowlio",
  logo: {
    "@type": "ImageObject",
    url: "https://flowlioapp.com/logo.png",
  },
};

const videoObject = (
  title: string,
  description: string,
  videoId: string,
  duration: string,
  uploadDate: string,
) => ({
  "@type": "VideoObject",
  name: title,
  description,
  thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  uploadDate,
  duration: toDuration(duration),
  embedUrl: `https://www.youtube.com/embed/${videoId}`,
  publisher: PUBLISHER,
});

interface ShowcaseSchemaProps {
  features: Feature[];
  useCases: UseCase[];
}

export const ShowcaseSchema = ({ features, useCases }: ShowcaseSchemaProps) => {
  const featureVideoObjects = features.map((f) =>
    videoObject(f.title, f.description, f.videoId, f.duration, f.uploadDate),
  );

  const useCaseVideoObjects = useCases.map((u) =>
    videoObject(u.persona, u.scenario, u.videoId, u.duration, u.uploadDate),
  );

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Flowlio Feature Videos",
    numberOfItems: features.length,
    itemListElement: features.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: f.title,
      url: `https://flowlioapp.com/showcase#${f.id}`,
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://flowlioapp.com" },
      { "@type": "ListItem", position: 2, name: "Showcase", item: "https://flowlioapp.com/showcase" },
    ],
  };

  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Flowlio",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "All-in-one project management, CRM, time tracking and invoicing platform for agencies, freelancers and service teams.",
    url: "https://flowlioapp.com",
    screenshot: "https://flowlioapp.com/og-image.jpg",
  };

  const allVideos = [
    ...featureVideoObjects.map((v) => ({ "@context": "https://schema.org", ...v })),
    ...useCaseVideoObjects.map((v) => ({ "@context": "https://schema.org", ...v })),
  ];

  return (
    <Helmet>
      {allVideos.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
      <script type="application/ld+json">{JSON.stringify(itemList)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      <script type="application/ld+json">{JSON.stringify(softwareApp)}</script>
    </Helmet>
  );
};
