import { useEffect } from "react";
import { FolderKanban, CheckSquare, Users, Clock, FileText, Sparkles, Globe, BarChart2 } from "lucide-react";
import { WhatIsFlowlioTemplate, type WIFContent } from "@/components/whatisflowlio/WhatIsFlowlioTemplate";

const content: WIFContent = {
  dir: "ltr",
  pageTitle: "What is Flowlio? — The all-in-one platform for your business",

  hero: {
    badge: "What is Flowlio",
    h1: "All your work.",
    h1Accent: "One",
    h1End: "place.",
    sub: "Flowlio combines project management and CRM so agencies, freelancers, and service businesses work with more control and less chaos.",
    cta1: "Try Flowlio for Free",
    cta2: "See how it works",
    trust: "Trusted by teams in 40+ countries · 4.9/5 from 1,200+ reviews",
    dashboardGreeting: "Good morning, Alex — here's what's happening with your projects today.",
    dashboardStats: [
      { label: "Active projects", value: "12" },
      { label: "Tasks",           value: "47" },
      { label: "Clients",         value: "28" },
      { label: "Hours tracked",   value: "184h" },
    ],
  },

  what: {
    label: "What Flowlio Does",
    h2: "Project management and CRM in one place",
    p1: "Flowlio was built to solve the operational chaos of agencies and service companies. Instead of splitting your operation across Trello, Notion, HubSpot and spreadsheets, Flowlio unifies everything: projects, tasks, clients, time, and invoicing — inside a single cohesive platform.",
    p2: "With 360° visibility into every project and every client, your team stays aligned, your clients always know what stage they're at, and you have the data to make better business decisions.",
    quote: "One Work Space, Total Control",
    sideFeatures: [
      { label: "Real-time updates",    desc: "Always know what's happening with your team and clients." },
      { label: "Powerful automation",  desc: "Save hours every week with smart, no-code workflows." },
      { label: "Reports & Insights",   desc: "Make smarter decisions with built-in analytics." },
    ],
  },

  who: {
    label: "Who Is It For",
    h2: "Built for those who live by their services",
    cards: [
      {
        title: "Digital Agencies",
        colorClass: "purple",
        items: [
          "Manage multiple clients and campaigns from one panel.",
          "Coordinate your team and tasks effortlessly.",
          "Deliver exceptional results to your clients.",
        ],
      },
      {
        title: "Freelancers",
        colorClass: "blue",
        items: [
          "Track your time and profitability by project.",
          "Invoice clients professionally.",
          "Keep everything in one simple place.",
        ],
      },
      {
        title: "Service Companies",
        colorClass: "orange",
        items: [
          "Streamline your operations and deliver better.",
          "Centralize your client communication.",
          "Make decisions based on real-time data.",
        ],
      },
    ],
  },

  platform: {
    label: "Everything You Can Manage",
    h2: "One platform. Every tool.",
    desc: "From projects to payments, Flowlio gives you everything you need to run your business efficiently.",
    cta: "Explore all features",
    features: [
      { icon: FolderKanban, name: "Projects",       desc: "Organize and track every project from start to finish." },
      { icon: CheckSquare,  name: "Tasks",           desc: "Create, assign, and prioritize tasks effortlessly." },
      { icon: Users,        name: "CRM",             desc: "Manage clients, leads, and conversations in one place." },
      { icon: Clock,        name: "Time Tracking",   desc: "Log time to every project or task with precision." },
      { icon: FileText,     name: "Invoicing",       desc: "Generate invoices and manage billing in seconds." },
      { icon: Sparkles,     name: "AI Assistant",    desc: "Get insights and suggestions powered by AI." },
      { icon: Globe,        name: "Client Portal",   desc: "Share progress and documents with clients in real time." },
      { icon: BarChart2,    name: "Reports",         desc: "Turn data into insights that drive growth." },
    ],
  },

  pain: {
    label: "Sound Familiar?",
    h2: "The problem everyone knows",
    pains: [
      "You use 6 or 5 different tools and information still gets lost.",
      "Your clients don't have full access to their projects.",
      "You have no visibility into how much time you spend on each account.",
      "Invoicing and payment follow-up is a time-waste process.",
    ],
    transitionLabel: "With Flowlio, all that changes.",
    gains: [
      "Your entire team works from one single place — no more chaos.",
      "Your clients have access to their own portal in real time.",
      "You know exactly how many hours you spend per project.",
      "Invoice in minutes, directly from the same platform.",
    ],
  },

  pricing: {
    label: "Plans & Pricing",
    h2: "Simple, transparent, no surprises",
    monthly: "Monthly",
    yearly: "Yearly",
    save: "Save 20%",
    plans: [
      {
        name: "Basic",
        price: "$8",
        period: "per user / month",
        featured: false,
        items: ["Up to 3 active projects", "Basic CRM", "Time tracking", "Email support"],
      },
      {
        name: "Enterprise",
        price: "$12",
        period: "per user / month",
        badge: "⭐ Most popular",
        featured: true,
        items: [
          "Unlimited projects",
          "Full CRM + pipeline",
          "Advanced time tracking",
          "Client portal",
          "AI Assistant included",
          "Priority support",
        ],
      },
      {
        name: "Pro",
        price: "$16",
        period: "per user / month",
        badge: "✅ All included",
        featured: false,
        items: [
          "Everything in Enterprise",
          "Advanced automation",
          "Custom reports",
          "API access",
          "Dedicated onboarding",
        ],
      },
    ],
    trial: "All plans include a 14-day free trial. No credit card required.",
    getStarted: "Get started",
  },

  finalCta: {
    h2: "Total control of your business starts here.",
    sub: "You don't need more tools. You need the right one.",
    btn: "Create my free account",
  },
};

const WhatIsFlowlioEN = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = content.pageTitle;
  }, []);

  return <WhatIsFlowlioTemplate c={content} />;
};

export default WhatIsFlowlioEN;
