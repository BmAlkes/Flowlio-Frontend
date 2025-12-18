import { Footer } from "@/components/footer/footer";
import { Box } from "@/components/ui/box";
import { GetSmart } from "@/components/user section/getsmart";
import { Hero } from "@/components/user section/hero";
import { ManageSmarter } from "@/components/user section/managesmarter";
import { ManageTask } from "@/components/user section/managetask";
import { Navbar } from "@/components/user section/navbar/navbar";
import { PurposeAndHowItWorks } from "@/components/user section/purposeandhowitworks";
import { SubscribeTo } from "@/components/user section/subscribeto";
import { Superchared } from "@/components/user section/superchared";
import { TeamMember2 } from "@/components/user section/teammember2";
import { useEffect } from "react";

const HomePage = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Flowlio";
  }, []);

  return (
    <>
      <Navbar />
      <Box className="relative w-full h-full">
        <Hero />
        <Superchared isWorkFlow={false} />
      </Box>
      {/* <TeamMember /> */}
      <TeamMember2 />
      <ManageTask />
      <ManageSmarter />
      <GetSmart />
      <PurposeAndHowItWorks />
      <SubscribeTo />
      <Footer />
    </>
  );
};

export default HomePage;
