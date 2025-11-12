import { Footer } from "@/components/footer/footer";
import { Navbar } from "@/components/user section/navbar/navbar";
import { SubscribeTo } from "@/components/user section/subscribeto";
import { Superchared } from "@/components/user section/superchared";
import { WorkflowdDetails } from "@/components/user section/work-flow/workflowdetails";
import { WorkflowHero } from "@/components/user section/work-flow/workflowhero";
import { useEffect } from "react";
export const WorkFlowPage = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Workflow - Flowlio";
  }, []);
  return (
    <>
      <Navbar />
      <WorkflowHero />
      <WorkflowdDetails />
      <Superchared isWorkFlow={true} />
      <SubscribeTo />
      <Footer />
    </>
  );
};
