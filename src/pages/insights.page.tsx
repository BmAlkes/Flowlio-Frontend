import { Footer } from "@/components/footer/footer";
import { Box } from "@/components/ui/box";
import { GetSmart } from "@/components/user section/getsmart";
import { InsightsCards } from "@/components/user section/insights/insightscards";
import { InsightsHero } from "@/components/user section/insights/insightshero";
import { Navbar } from "@/components/user section/navbar/navbar";
import { SubscribeTo } from "@/components/user section/subscribeto";
import { useEffect } from "react";

export const InsightsPage = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Insights - Flowlio";
  }, []);
  return (
    <>
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
