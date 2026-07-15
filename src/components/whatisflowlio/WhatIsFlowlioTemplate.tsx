import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight, Check, X, FolderKanban, CheckSquare, Users, Clock,
  FileText, Sparkles,  BarChart2, Zap, Star, Monitor, Laptop,
  Building2, TrendingUp, DollarSign, BarChart3, Calendar,
} from "lucide-react";
import { Navbar } from "@/components/user section/navbar/navbar";
import { Footer } from "@/components/footer/footer";

// ── Content type ─────────────────────────────────────────────────────────
export interface WIFContent {
  dir: "ltr" | "rtl";
  pageTitle: string;
  hero: {
    badge: string;
    h1: string;
    h1Accent: string;
    h1End: string;
    sub: string;
    cta1: string;
    cta2: string;
    trust: string;
    dashboardGreeting: string;
    dashboardStats: { label: string; value: string }[];
  };
  what: {
    label: string;
    h2: string;
    p1: string;
    p2: string;
    quote: string;
    sideFeatures: { label: string; desc: string }[];
  };
  who: {
    label: string;
    h2: string;
    cards: { title: string; colorClass: string; items: string[] }[];
  };
  platform: {
    label: string;
    h2: string;
    desc: string;
    cta: string;
    features: { name: string; desc: string; icon: React.ElementType }[];
  };
  pain: {
    label: string;
    h2: string;
    pains: string[];
    transitionLabel: string;
    gains: string[];
  };
  pricing: {
    label: string;
    h2: string;
    monthly: string;
    yearly: string;
    save: string;
    plans: {
      name: string;
      price: string;
      period: string;
      badge?: string;
      featured: boolean;
      items: string[];
    }[];
    trial: string;
    getStarted: string;
  };
  finalCta: {
    h2: string;
    sub: string;
    btn: string;
  };
}

// ── Shared styles ────────────────────────────────────────────────────────
const CSS = `
  @keyframes wif-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes wif-glow {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 0.85; }
  }
  @keyframes wif-badge {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }
  .wif-float   { animation: wif-float 6s ease-in-out infinite; }
  .wif-glow    { animation: wif-glow 4s ease-in-out infinite; }
  .wif-badge-1 { animation: wif-badge 4s ease-in-out infinite; }
  .wif-badge-2 { animation: wif-badge 5s ease-in-out 0.8s infinite; }
  .wif-badge-3 { animation: wif-badge 3.5s ease-in-out 1.4s infinite; }

  .wif-dark-grid {
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 52px 52px;
  }
  .wif-btn-teal {
    display: inline-flex; align-items: center; gap: 8px;
    background: #0D9488; color: #fff; font-weight: 700; font-size: 14px;
    padding: 12px 26px; border-radius: 10px;
    box-shadow: 0 4px 20px rgba(13,148,136,0.35);
    transition: all 0.2s ease; border: none; cursor: pointer;
  }
  .wif-btn-teal:hover { background: #0F766E; box-shadow: 0 8px 32px rgba(13,148,136,0.5); transform: translateY(-1px); }
  .wif-btn-ghost-dark {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: rgba(255,255,255,0.75);
    font-weight: 600; font-size: 14px;
    padding: 12px 22px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.18);
    transition: all 0.2s ease; cursor: pointer; text-decoration: none;
  }
  .wif-btn-ghost-dark:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.35); }
  .wif-btn-outline-light {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: #0D9488;
    font-weight: 700; font-size: 14px;
    padding: 11px 22px; border-radius: 10px;
    border: 1.5px solid #0D9488;
    transition: all 0.2s ease; cursor: pointer;
  }
  .wif-btn-outline-light:hover { background: #f0fdfa; }
  .wif-section-label {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 10px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase;
    padding: 4px 12px; border-radius: 999px;
    margin-bottom: 16px;
  }
  .wif-label-dark { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14); color: rgba(255,255,255,0.6); }
  .wif-label-teal { background: rgba(13,148,136,0.1); border: 1px solid rgba(13,148,136,0.25); color: #0D9488; }
  .wif-label-orange { background: rgba(255,107,43,0.08); border: 1px solid rgba(255,107,43,0.2); color: #FF6B2B; }

  .wif-feature-card {
    background: #fff; border: 1px solid #E5E7EB; border-radius: 14px;
    padding: 20px; display: flex; flex-direction: column; gap: 10px;
    transition: all 0.2s ease;
  }
  .wif-feature-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: #CBD5E1; transform: translateY(-2px); }

  .wif-who-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 28px;
    transition: all 0.25s ease;
  }
  .wif-who-card:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15); transform: translateY(-3px); }

  .wif-plan-card {
    background: #fff; border-radius: 20px; padding: 32px;
    display: flex; flex-direction: column; border: 1px solid #E5E7EB;
    transition: all 0.2s ease;
  }
  .wif-plan-card.featured {
    background: #0C1228; border-color: #0D9488;
    box-shadow: 0 0 0 1px #0D9488, 0 24px 60px rgba(0,0,0,0.18);
  }
  .wif-plan-card:not(.featured):hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

  .wif-pain-item {
    display: flex; align-items: flex-start; gap: 12px;
    background: #FFF5F5; border: 1px solid #FED7D7;
    border-radius: 12px; padding: 14px 16px;
  }
  .wif-gain-item {
    display: flex; align-items: flex-start; gap: 12px;
    background: #F0FDFA; border: 1px solid #99F6E4;
    border-radius: 12px; padding: 14px 16px;
  }
`;

// ── Mini dashboard for Hero ──────────────────────────────────────────────
const HeroDashboard = ({ stats, greeting }: { stats: { label: string; value: string }[]; greeting: string }) => (
  <div
    className="wif-float relative rounded-2xl overflow-hidden"
    style={{
      background: "#0C1228",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 80px rgba(13,148,136,0.1), 0 0 120px rgba(79,142,247,0.08)",
    }}
  >
    {/* Browser bar */}
    <div className="flex items-center gap-1.5 px-4 h-9 border-b" style={{ background: "#07091A", borderColor: "rgba(255,255,255,0.07)" }}>
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
      <div className="flex-1 mx-3 h-5 rounded-md" style={{ background: "rgba(255,255,255,0.04)" }} />
      {/* Top-right avatar */}
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", fontSize: 7, fontWeight: 700 }}>A</div>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>Admin</span>
      </div>
    </div>

    {/* App body */}
    <div className="flex" style={{ height: 290 }}>
      {/* Sidebar */}
      <div className="flex flex-col py-3 px-2.5 border-e gap-0.5" style={{ width: 130, background: "#07091A", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-1.5 px-2 mb-3">
          <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0D9488,#0F766E)" }}>
            <Zap size={9} color="white" />
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>Flowlio</span>
        </div>
        {[
          { icon: BarChart3, label: "Dashboard",   active: true  },
          { icon: FolderKanban, label: "Projects",  active: false },
          { icon: CheckSquare,  label: "Tasks",     active: false },
          { icon: Users,        label: "CRM",       active: false },
          { icon: Calendar,     label: "Calendar",  active: false },
          { icon: Clock,        label: "Time Tracking", active: false },
          { icon: FileText,     label: "Invoices",  active: false },
          { icon: BarChart2,    label: "Reports",   active: false },
          { icon: Zap,          label: "Automation",active: false },
        ].map(({ icon: Icon, label, active }) => (
          <div key={label} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5" style={{ background: active ? "rgba(13,148,136,0.15)" : "transparent", color: active ? "#0D9488" : "rgba(255,255,255,0.38)", fontSize: 9, fontWeight: active ? 700 : 400 }}>
            <Icon size={10} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-3 overflow-hidden" style={{ background: "#0C1228" }}>
        {/* Greeting */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{greeting}</div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-2 mb-2.5">
          {stats.map((s, i) => (
            <div key={s.label} className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 7, color: ["#10B981","#4F8EF7","#FF6B2B","#8B5CF6"][i % 4], marginTop: 2, fontWeight: 600 }}>
                {["+12.5%","+18.6%","Active","184h"][i % 4]}
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {/* Project progress donut */}
          <div className="rounded-xl p-2.5 flex flex-col items-center justify-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Project Progress</div>
            <div className="relative" style={{ width: 48, height: 48 }}>
              <svg viewBox="0 0 48 48" width="48" height="48">
                <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle cx="24" cy="24" r="18" fill="none" stroke="#0D9488" strokeWidth="5" strokeDasharray="70 43" strokeDashoffset="-8" strokeLinecap="round" />
                <circle cx="24" cy="24" r="18" fill="none" stroke="#FF6B2B" strokeWidth="5" strokeDasharray="28 85" strokeDashoffset="-78" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>73%</span>
              </div>
            </div>
          </div>

          {/* Tasks overview */}
          <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Tasks Overview</div>
            {[
              { label: "Done", pct: 65, color: "#10B981" },
              { label: "In Progress", pct: 25, color: "#4F8EF7" },
              { label: "To Do", pct: 10, color: "#94A3B8" },
            ].map((t) => (
              <div key={t.label} className="mb-1.5">
                <div className="flex justify-between" style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>
                  <span>{t.label}</span><span>{t.pct}%</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recent activities */}
          <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Recent Activities</div>
            {[
              { text: "New invoice created", color: "#10B981" },
              { text: "Task completed", color: "#4F8EF7" },
              { text: "Client feedback rec.", color: "#FF6B2B" },
              { text: "Project updated", color: "#8B5CF6" },
            ].map((a) => (
              <div key={a.text} className="flex items-center gap-1.5 mb-1.5">
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${a.color}20` }}>
                  <div className="w-1 h-1 rounded-full" style={{ background: a.color }} />
                </div>
                <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini project cards */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Website Redesign", pct: 78, color: "#0D9488" },
            { name: "Mobile App v2",    pct: 45, color: "#4F8EF7" },
          ].map((p) => (
            <div key={p.name} className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 7.5, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{p.name}</div>
              <div className="rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,0.06)", marginBottom: 2 }}>
                <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
              </div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)" }}>{p.pct}% complete</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Laptop mockup for Section 2 ──────────────────────────────────────────
const LaptopMockup = () => (
  <div className="relative mx-auto" style={{ maxWidth: 440 }}>
    {/* Laptop body */}
    <div className="rounded-xl overflow-hidden" style={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}>
      {/* Screen chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{ background: "#0F0F1A", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
        <div className="w-2 h-2 rounded-full" style={{ background: "#febc2e" }} />
        <div className="w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
        <div className="flex-1 mx-2 h-4 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
      </div>
      {/* App in laptop */}
      <div className="flex" style={{ height: 220 }}>
        <div className="flex flex-col py-2.5 px-2 gap-0.5 border-e" style={{ width: 90, background: "#0C1024", borderColor: "rgba(255,255,255,0.06)" }}>
          {["Dashboard","Projects","CRM","Tasks","Reports"].map((l, i) => (
            <div key={l} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5" style={{ background: i === 0 ? "rgba(13,148,136,0.18)" : "transparent", color: i === 0 ? "#0D9488" : "rgba(255,255,255,0.35)", fontSize: 8 }}>
              <span>{l}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 p-2.5" style={{ background: "#0C1024" }}>
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            {[{l:"Projects",v:"24"},{l:"Clients",v:"67"},{l:"Hours",v:"312h"},{l:"Revenue",v:"$48K"}].map((s) => (
              <div key={s.l} className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>{s.v}</div>
                <div style={{ fontSize: 6.5, color: "rgba(255,255,255,0.35)" }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-2 mb-2" style={{ background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.2)" }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: "#0D9488", marginBottom: 4 }}>Project Progress</div>
            <div className="flex items-end gap-1" style={{ height: 36 }}>
              {[60,80,55,90,70,85,75,95].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i >= 6 ? "#0D9488" : "rgba(13,148,136,0.3)" }} />
              ))}
            </div>
          </div>
          <div className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>Recent Tasks</div>
            {["Website redesign", "Client proposal", "Brand review"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#0D9488" }} />
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.55)" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    {/* Laptop base */}
    <div className="mx-auto mt-0 rounded-b-xl" style={{ height: 10, background: "#2D2D42", width: "95%" }} />
    <div className="mx-auto rounded-b-xl" style={{ height: 4, background: "#1A1A2E", width: "80%" }} />
  </div>
);


// ── Main Template ─────────────────────────────────────────────────────────
export const WhatIsFlowlioTemplate = ({ c }: { c: WIFContent }) => {
  const navigate = useNavigate();
  const [billingAnnual, setBillingAnnual] = useState(false);
  const isRTL = c.dir === "rtl";

  return (
    <>
      <style>{CSS}</style>
      <Navbar />

      {/* ════════════════════════════════════════════════════════════
          1. HERO — dark navy, split layout
      ════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden wif-dark-grid"
        style={{ background: "#07091A", paddingTop: 80 }}
        dir={c.dir}
      >
        {/* Glow blobs */}
        <div className="wif-glow absolute pointer-events-none" style={{ top: "5%", left: "0%", width: 600, height: 600, background: "radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)" }} />
        <div className="absolute pointer-events-none" style={{ top: "10%", right: "2%", width: 500, height: 500, background: "radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(50px)" }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className={`flex flex-col lg:flex-row items-center gap-12 py-16 lg:py-20 ${isRTL ? "lg:flex-row-reverse" : ""}`}>
            {/* Left: text */}
            <div className="flex-1 max-w-lg">
              <div className="wif-section-label wif-label-dark">
                <Sparkles size={9} /> {c.hero.badge}
              </div>
              <h1
                className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.06] mb-5 mt-3"
                style={{ color: "#fff", letterSpacing: "-0.025em" }}
              >
                {c.hero.h1}<br />
                <span style={{ color: "#F97316" }}>{c.hero.h1Accent}</span>{" "}
                {c.hero.h1End}
              </h1>
              <p className="text-base sm:text-lg mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                {c.hero.sub}
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <button className="wif-btn-teal" onClick={() => navigate("/pricing")}>
                  {c.hero.cta1} <ArrowRight size={14} />
                </button>
                <a href="#what-is" className="wif-btn-ghost-dark">
                  {c.hero.cta2}
                </a>
              </div>
              {/* Trust row */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["#0D9488","#7C3AED","#EA580C","#1D4ED8"].map((color, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-white font-bold" style={{ background: color, borderColor: "#07091A", fontSize: 10 }}>
                      {["A","B","C","D"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">
                    {[0,1,2,3,4].map((i) => <Star key={i} size={10} fill="#F59E0B" color="#F59E0B" />)}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{c.hero.trust}</div>
                </div>
              </div>
            </div>

            {/* Right: dashboard + floating badges */}
            <div className="flex-1 relative w-full flex items-center justify-center">
              {/* Warm glow */}
              <div className="absolute pointer-events-none" style={{ bottom: "-10%", right: "-5%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%)", filter: "blur(40px)" }} />

              {/* Floating badges */}
              <div className="wif-badge-1 absolute -top-2 left-2 z-20 hidden lg:block">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "rgba(12,18,40,0.9)", border: "1px solid rgba(13,148,136,0.3)", backdropFilter: "blur(16px)" }}>
                  <TrendingUp size={11} color="#10B981" /> +24h saved weekly
                </div>
              </div>
              <div className="wif-badge-2 absolute -top-1 right-2 z-20 hidden lg:block">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "rgba(12,18,40,0.9)", border: "1px solid rgba(79,142,247,0.3)", backdropFilter: "blur(16px)" }}>
                  <Zap size={11} color="#4F8EF7" /> 312 automated actions
                </div>
              </div>
              <div className="wif-badge-3 absolute bottom-4 left-0 z-20 hidden lg:block">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "rgba(12,18,40,0.9)", border: "1px solid rgba(249,115,22,0.3)", backdropFilter: "blur(16px)" }}>
                  <DollarSign size={11} color="#F97316" /> 99.9% uptime
                </div>
              </div>

              <div className="w-full" style={{ maxWidth: 520 }}>
                <HeroDashboard stats={c.hero.dashboardStats} greeting={c.hero.dashboardGreeting} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: "linear-gradient(to top, #07091A, transparent)" }} />
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. WHAT IS FLOWLIO — white, split layout
      ════════════════════════════════════════════════════════════ */}
      <section id="what-is" className="bg-white py-24 px-6" dir={c.dir}>
        <div className="max-w-7xl mx-auto">
          <div className={`flex flex-col lg:flex-row items-center gap-16 ${isRTL ? "lg:flex-row-reverse" : ""}`}>
            {/* Left text */}
            <div className="flex-1 max-w-md">
              <div className="wif-section-label wif-label-teal">{c.what.label}</div>
              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-gray-900 mt-3 mb-5 leading-tight" style={{ letterSpacing: "-0.02em" }}>
                {c.what.h2}
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-4">{c.what.p1}</p>
              <p className="text-gray-500 text-base leading-relaxed mb-8">{c.what.p2}</p>
              <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #f0fdfa, #eff6ff)", border: "1px solid #99F6E4" }}>
                <p className="text-xl font-bold text-teal-700">"{c.what.quote}"</p>
              </div>
            </div>

            {/* Center: laptop */}
            <div className="flex-none">
              <LaptopMockup />
            </div>

            {/* Right: feature list */}
            <div className="flex-none max-w-[200px] hidden xl:flex flex-col gap-4">
              {c.what.sideFeatures.map((f) => (
                <div key={f.label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: "rgba(13,148,136,0.1)" }}>
                      <Check size={11} color="#0D9488" />
                    </div>
                    <span className="text-sm font-bold text-gray-800">{f.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed ms-7">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. WHO IS IT FOR — dark, 3 cards
      ════════════════════════════════════════════════════════════ */}
      <section id="who-for" className="py-24 px-6 wif-dark-grid" style={{ background: "#07091A" }} dir={c.dir}>
        <div className="max-w-7xl mx-auto">
          <div className={`flex flex-col lg:flex-row gap-16 ${isRTL ? "lg:flex-row-reverse" : ""}`}>
            {/* Left: heading */}
            <div className="flex-none max-w-xs">
              <div className="wif-section-label wif-label-dark">{c.who.label}</div>
              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white mt-3 leading-tight" style={{ letterSpacing: "-0.02em" }}>
                {c.who.h2}
              </h2>
            </div>

            {/* Right: cards */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5">
              {c.who.cards.map((card, i) => {
                const colors = [
                  { icon: "#7C3AED", iconBg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.25)", top: "rgba(124,58,237,0.08)" },
                  { icon: "#4F8EF7", iconBg: "rgba(79,142,247,0.12)", border: "rgba(79,142,247,0.25)", top: "rgba(79,142,247,0.08)" },
                  { icon: "#F97316", iconBg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.25)", top: "rgba(249,115,22,0.08)" },
                ];
                const col = colors[i % colors.length];
                const Icon = [Monitor, Laptop, Building2][i % 3];
                return (
                  <div key={card.title} className="wif-who-card" style={{ borderColor: col.border }}>
                    <div style={{ background: col.top, borderRadius: 8, padding: "6px 10px", marginBottom: 16, display: "inline-block" }}>
                      <Icon size={18} color={col.icon} />
                    </div>
                    <h3 className="text-lg font-black text-white mb-4">{card.title}</h3>
                    <ul className="flex flex-col gap-3">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: col.iconBg }}>
                            <Check size={9} color={col.icon} />
                          </div>
                          <span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. ONE PLATFORM — light, feature grid
      ════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-6" style={{ background: "#F8FAFC" }} dir={c.dir}>
        <div className="max-w-7xl mx-auto">
          <div className={`flex flex-col lg:flex-row gap-16 ${isRTL ? "lg:flex-row-reverse" : ""}`}>
            {/* Left: text */}
            <div className="flex-none max-w-xs">
              <div className="wif-section-label wif-label-teal">{c.platform.label}</div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-4 leading-tight" style={{ letterSpacing: "-0.02em" }}>
                {c.platform.h2}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">{c.platform.desc}</p>
              <button className="wif-btn-outline-light" onClick={() => navigate("/pricing")}>
                {c.platform.cta} <ArrowRight size={14} />
              </button>
            </div>

            {/* Right: feature grid 2×4 */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {c.platform.features.map(({ name, desc, icon: Icon }) => (
                <div key={name} className="wif-feature-card">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.15)" }}>
                    <Icon size={18} color="#0D9488" />
                  </div>
                  <div className="font-bold text-gray-900 text-sm">{name}</div>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. PAIN / SOLUTION — white, 3 column
      ════════════════════════════════════════════════════════════ */}
      <section id="pain-solution" className="py-24 px-6 bg-white" dir={c.dir}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="wif-section-label wif-label-orange mx-auto">{c.pain.label}</div>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-gray-900 mt-4" style={{ letterSpacing: "-0.02em" }}>
              {c.pain.h2}
            </h2>
          </div>

          {/* 3-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">
            {/* Pain column */}
            <div className="flex flex-col gap-3">
              {c.pain.pains.map((p) => (
                <div key={p} className="wif-pain-item">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#FED7D7" }}>
                    <X size={11} color="#E53E3E" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{p}</p>
                </div>
              ))}
            </div>

            {/* Center logo */}
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl" style={{ background: "linear-gradient(135deg,#0D9488,#0F766E)", boxShadow: "0 0 40px rgba(13,148,136,0.3)" }}>
                <Zap size={36} color="white" />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-teal-700">{c.pain.transitionLabel}</div>
              </div>
            </div>

            {/* Gain column */}
            <div className="flex flex-col gap-3">
              {c.pain.gains.map((g) => (
                <div key={g} className="wif-gain-item">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#99F6E4" }}>
                    <Check size={11} color="#0D9488" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{g}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6. PRICING — white, 3 cards
      ════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 px-6" style={{ background: "#F8FAFC" }} dir={c.dir}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="wif-section-label wif-label-teal mx-auto">{c.pricing.label}</div>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-gray-900 mt-4 mb-8" style={{ letterSpacing: "-0.02em" }}>
              {c.pricing.h2}
            </h2>
            {/* Toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl" style={{ background: "#E5E7EB" }}>
              <button
                className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: !billingAnnual ? "#fff" : "transparent",
                  color: !billingAnnual ? "#111827" : "#6B7280",
                  boxShadow: !billingAnnual ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                }}
                onClick={() => setBillingAnnual(false)}
              >
                {c.pricing.monthly}
              </button>
              <button
                className="px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                style={{
                  background: billingAnnual ? "#fff" : "transparent",
                  color: billingAnnual ? "#111827" : "#6B7280",
                  boxShadow: billingAnnual ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                }}
                onClick={() => setBillingAnnual(true)}
              >
                {c.pricing.yearly}
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#16A34A" }}>{c.pricing.save}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {c.pricing.plans.map((plan) => (
              <div key={plan.name} className={`wif-plan-card ${plan.featured ? "featured" : ""}`}>
                {plan.badge && (
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full self-start mb-4"
                    style={
                      plan.featured
                        ? { background: "rgba(13,148,136,0.2)", color: "#5EEAD4" }
                        : { background: "#F3F4F6", color: "#374151" }
                    }
                  >
                    {plan.badge}
                  </span>
                )}
                <div className="text-xl font-black mb-2" style={{ color: plan.featured ? "#fff" : "#111827" }}>{plan.name}</div>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-black" style={{ color: plan.featured ? "#fff" : "#111827" }}>
                    {billingAnnual ? `$${Math.round(parseInt(plan.price.replace("$","")) * 0.8)}` : plan.price}
                  </span>
                  <span className="text-sm mb-1.5" style={{ color: plan.featured ? "rgba(255,255,255,0.45)" : "#9CA3AF" }}>{plan.period}</span>
                </div>
                <ul className="flex flex-col gap-2.5 flex-1 mb-8">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: plan.featured ? "rgba(255,255,255,0.75)" : "#4B5563" }}>
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: plan.featured ? "rgba(13,148,136,0.25)" : "#ECFDF5" }}>
                        <Check size={9} color={plan.featured ? "#5EEAD4" : "#0D9488"} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={
                    plan.featured
                      ? { background: "#0D9488", color: "#fff", boxShadow: "0 4px 16px rgba(13,148,136,0.35)" }
                      : { background: "#F3F4F6", color: "#111827" }
                  }
                >
                  {c.pricing.getStarted} →
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">{c.pricing.trial}</p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          7. FINAL CTA — dark, split layout
      ════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-6 overflow-hidden" style={{ background: "#07091A" }} dir={c.dir}>
        {/* Deep blue/purple glow at bottom */}
        <div className="absolute pointer-events-none" style={{ bottom: "-10%", left: "20%", right: "20%", height: "60%", background: "radial-gradient(ellipse, rgba(79,142,247,0.2) 0%, rgba(124,58,237,0.15) 40%, transparent 70%)", filter: "blur(60px)" }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`flex flex-col lg:flex-row items-center gap-16 ${isRTL ? "lg:flex-row-reverse" : ""}`}>
            {/* Left text */}
            <div className="flex-1 max-w-lg">
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-5" style={{ letterSpacing: "-0.025em" }}>
                {c.finalCta.h2}
              </h2>
              <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.55)" }}>
                {c.finalCta.sub}
              </p>
              <button
                className="wif-btn-teal"
                onClick={() => navigate("/pricing")}
                style={{ fontSize: 16, padding: "14px 32px" }}
              >
                {c.finalCta.btn} <ArrowRight size={16} />
              </button>
            </div>

            {/* Right: smaller dashboard */}
            <div className="flex-1 w-full max-w-lg opacity-90">
              <HeroDashboard stats={c.hero.dashboardStats} greeting={c.hero.dashboardGreeting} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};
