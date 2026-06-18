import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/footer/footer";
import { Box } from "@/components/ui/box";
import { GetSmart } from "@/components/user section/getsmart";
import { InsightsCards } from "@/components/user section/insights/insightscards";
import { InsightsHero } from "@/components/user section/insights/insightshero";
import { Navbar } from "@/components/user section/navbar/navbar";
import { SubscribeTo } from "@/components/user section/subscribeto";
import { useEffect } from "react";

const INSIGHTS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Business Analytics & Insights — Flowlio",
  "description": "Monitor project progress, team performance, invoice totals and billable hours — all in one real-time dashboard. Flowlio turns your business data into clear, actionable reports.",
  "url": "https://flowlioapp.com/insights",
  "publisher": {
    "@type": "Organization",
    "name": "Flowlio",
    "url": "https://flowlioapp.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://flowlioapp.com/logo/logo.png"
    }
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://flowlioapp.com/" },
      { "@type": "ListItem", "position": 2, "name": "Insights", "item": "https://flowlioapp.com/insights" }
    ]
  }
};

export const InsightsPage = () => {
  useEffect(() => {
    scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Business Analytics & Insights — Track Projects, Time & Revenue | Flowlio</title>
        <meta name="description" content="Monitor project progress, team performance, invoice totals and billable hours — all in one real-time dashboard. Flowlio turns your business data into clear, actionable reports." />
        <meta name="keywords" content="business analytics, project tracking software, team performance reports, time tracking analytics, invoice reporting, CRM insights, agency reporting tool" />
        <link rel="canonical" href="https://flowlioapp.com/insights" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Business Analytics & Insights | Flowlio" />
        <meta property="og:description" content="See project progress, team performance, revenue and time in one real-time dashboard. Turn your business data into decisions." />
        <meta property="og:url" content="https://flowlioapp.com/insights" />
        <meta property="og:image" content="https://flowlioapp.com/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Business Analytics & Insights | Flowlio" />
        <meta name="twitter:description" content="See project progress, team performance, revenue and time in one real-time dashboard." />
        <meta name="twitter:image" content="https://flowlioapp.com/og-image.png" />

        {/* JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(INSIGHTS_SCHEMA)}
        </script>
      </Helmet>

      <Navbar />
      <Box className="relative w-full h-full mb-110 max-md:mb-240">
        <InsightsHero />
        <InsightsCards />
      </Box>
      <GetSmart isInsights={true} />
      <SubscribeTo />
      <Footer />
    </>
  );
};
