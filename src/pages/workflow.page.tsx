import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/footer/footer";
import { Navbar } from "@/components/user section/navbar/navbar";
import { SubscribeTo } from "@/components/user section/subscribeto";
import { Superchared } from "@/components/user section/superchared";
import { WorkflowdDetails } from "@/components/user section/work-flow/workflowdetails";
import { WorkflowHero } from "@/components/user section/work-flow/workflowhero";
import { WorkflowSteps } from "@/components/user section/work-flow/workflowsteps";
import { useEffect } from "react";

const WORKFLOW_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "How Flowlio Works — Business Workflow from Lead to Invoice",
  "description": "See how Flowlio connects every step of your business — capture leads, convert clients, plan projects, track time and get paid — all in one platform.",
  "url": "https://flowlioapp.com/workflow",
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
      { "@type": "ListItem", "position": 2, "name": "Workflow", "item": "https://flowlioapp.com/workflow" }
    ]
  }
};

export const WorkFlowPage = () => {
  useEffect(() => {
    scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>How Flowlio Works — From Lead to Invoice in One Platform</title>
        <meta name="description" content="See how Flowlio connects every step of your business — capture leads, convert clients, plan projects, track time and get paid — all in one seamless workflow." />
        <meta name="keywords" content="workflow management, lead to invoice, client management workflow, project management software, CRM workflow, time tracking, invoicing software" />
        <link rel="canonical" href="https://flowlioapp.com/workflow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="How Flowlio Works — From Lead to Invoice in One Platform" />
        <meta property="og:description" content="Capture leads, convert clients, plan projects, track time and get paid — all in one seamless workflow with Flowlio." />
        <meta property="og:url" content="https://flowlioapp.com/workflow" />
        <meta property="og:image" content="https://flowlioapp.com/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How Flowlio Works — From Lead to Invoice" />
        <meta name="twitter:description" content="Capture leads, convert clients, plan projects, track time and get paid — all in one seamless workflow." />
        <meta name="twitter:image" content="https://flowlioapp.com/og-image.png" />

        {/* JSON-LD structured data */}
        <script type="application/ld+json">
          {JSON.stringify(WORKFLOW_SCHEMA)}
        </script>
      </Helmet>

      <Navbar />
      <WorkflowHero />
      <WorkflowSteps />
      <WorkflowdDetails />
      <Superchared isWorkFlow={true} />
      <SubscribeTo />
      <Footer />
    </>
  );
};
