import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router";
import {
  ArrowRight, Play, Zap, Shield, Globe2, Bot, TrendingUp, Users,
  Clock,  BarChart3, Calendar, CheckSquare, Star,
  Check, Monitor, Megaphone, Palette, BriefcaseBusiness,
  ChevronRight, ChevronLeft, Kanban, FileText, Timer, CreditCard, Sparkles,
  Building2,
} from "lucide-react";

import { Navbar } from "@/components/user section/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { VideoModal } from "@/components/showcase/VideoModal";
import { ShowcaseSchema } from "@/components/showcase/ShowcaseSchema";
import { features, CATEGORIES, type FeatureCategory } from "@/data/features";
import { useCases } from "@/data/useCases";

// ── Global styles & animations ─────────────────────────────────────────────
const globalStyles = `
  @keyframes float-dashboard {
    0%, 100% { transform: translateY(0px) rotateX(4deg) rotateY(-2deg); }
    50%       { transform: translateY(-14px) rotateX(4deg) rotateY(-2deg); }
  }
  @keyframes float-badge {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-7px); }
  }
  @keyframes gradient-pan {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes shine {
    0%   { left: -80%; }
    100% { left: 120%; }
  }
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes glow-blob {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50%       { opacity: 0.8; transform: scale(1.1); }
  }

  .float-db { animation: float-dashboard 6s ease-in-out infinite; perspective: 1200px; }
  .float-badge { animation: float-badge 3.5s ease-in-out infinite; }
  .float-badge-2 { animation: float-badge 4.8s ease-in-out 0.6s infinite; }
  .float-badge-3 { animation: float-badge 4s ease-in-out 1.2s infinite; }
  .glow-blob { animation: glow-blob 5s ease-in-out infinite; }
  .glow-blob-2 { animation: glow-blob 7s ease-in-out 1s infinite; }

  .fade-up { animation: fade-in-up 0.6s ease-out forwards; }
  .fade-up-1 { animation: fade-in-up 0.6s 0.1s ease-out both; }
  .fade-up-2 { animation: fade-in-up 0.6s 0.2s ease-out both; }
  .fade-up-3 { animation: fade-in-up 0.6s 0.3s ease-out both; }

  .orange-text { color: #FF6B2B; }
  .blue-text   { color: #4F8EF7; }

  .pill-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    padding: 4px 12px; border-radius: 999px;
  }
  .pill-dark {
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7);
  }
  .pill-light {
    background: rgba(255,107,43,0.08); border: 1px solid rgba(255,107,43,0.2); color: #FF6B2B;
  }

  .cta-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, #FF6B2B, #FF4500);
    color: #fff; font-weight: 700; font-size: 14px;
    padding: 11px 24px; border-radius: 10px;
    box-shadow: 0 4px 20px rgba(255,107,43,0.4);
    transition: all 0.2s ease; border: none; cursor: pointer;
  }
  .cta-primary:hover {
    box-shadow: 0 8px 32px rgba(255,107,43,0.55);
    transform: translateY(-1px);
  }
  .cta-ghost-dark {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: rgba(255,255,255,0.75);
    font-weight: 600; font-size: 14px;
    padding: 11px 22px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.15);
    transition: all 0.2s ease; cursor: pointer;
  }
  .cta-ghost-dark:hover {
    background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.3);
  }
  .cta-ghost-light {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: #374151;
    font-weight: 600; font-size: 14px;
    padding: 11px 22px; border-radius: 10px;
    border: 1px solid #E5E7EB;
    transition: all 0.2s ease; cursor: pointer;
  }
  .cta-ghost-light:hover { background: #F9FAFB; border-color: #D1D5DB; }

  .flow-card {
    border-radius: 14px; overflow: hidden;
    border: 1px solid #E5E7EB;
    transition: all 0.25s ease;
    background: #fff;
  }
  .flow-card:hover {
    border-color: #FF6B2B40;
    box-shadow: 0 12px 40px rgba(0,0,0,0.1);
    transform: translateY(-3px);
  }

  .video-card-dark {
    border-radius: 12px; overflow: hidden;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    transition: all 0.25s ease;
    cursor: pointer;
  }
  .video-card-dark:hover {
    border-color: rgba(255,107,43,0.25);
    background: rgba(255,255,255,0.07);
    transform: translateY(-3px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.4);
  }

  .industry-card {
    border-radius: 16px; overflow: hidden;
    padding: 24px 20px 0;
    display: flex; flex-direction: column;
    transition: all 0.25s ease;
    cursor: pointer;
  }
  .industry-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.2); }

  .module-icon-wrap {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }

  .dark-grid {
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 52px 52px;
  }
  .light-grid {
    background-image:
      linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px);
    background-size: 52px 52px;
  }

  .scrollbar-none::-webkit-scrollbar { display: none; }
  .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

  .tab-active-line {
    position: absolute; bottom: -1px; left: 0; right: 0;
    height: 2px; background: #FF6B2B; border-radius: 2px;
  }
`;

// ── constants ──────────────────────────────────────────────────────────────
const OVERVIEW_VIDEO_ID = "tuhGvLdxhVw";


// ── Mock thumbnail panels (for placeholder videos) ─────────────────────────
const THUMB_COLORS: Record<string, { from: string; to: string; mid: string; accent: string }> = {
  Projects:        { from: "#4c1d95", to: "#6d28d9", mid: "#5b21b6", accent: "#c4b5fd" },
  CRM:             { from: "#065f46", to: "#047857", mid: "#059669", accent: "#6ee7b7" },
  Tasks:           { from: "#1e40af", to: "#2563eb", mid: "#1d4ed8", accent: "#93c5fd" },
  Time:            { from: "#9b1c1c", to: "#b91c1c", mid: "#dc2626", accent: "#fca5a5" },
  Billing:         { from: "#92400e", to: "#b45309", mid: "#d97706", accent: "#fcd34d" },
  AI:              { from: "#3730a3", to: "#4338ca", mid: "#4f46e5", accent: "#a5b4fc" },
  "Client Portal": { from: "#065f46", to: "#0f766e", mid: "#0d9488", accent: "#5eead4" },
  Reports:         { from: "#1e3a8a", to: "#1d4ed8", mid: "#2563eb", accent: "#93c5fd" },
};

interface ThumbProps { category: string; duration: string; }
const MockThumb = ({ category, duration }: ThumbProps) => {
  const col = THUMB_COLORS[category] ?? { from: "#1f2937", to: "#374151", mid: "#2d3748", accent: "#9ca3af" };
  return (
    <div
      className="relative w-full h-full overflow-hidden group"
      style={{ background: `linear-gradient(140deg, ${col.from} 0%, ${col.mid} 50%, ${col.to} 100%)` }}
    >
      {/* Fake UI: top bar */}
      <div className="absolute top-0 left-0 right-0 h-6 flex items-center px-3 gap-1.5" style={{ background: "rgba(0,0,0,0.25)" }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.accent, opacity: 0.7 }} />
        <div className="h-2 rounded flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>
      {/* Fake UI: content lines */}
      <div className="absolute inset-0 flex flex-col justify-center px-4 py-8 gap-2">
        <div className="h-2.5 rounded-md" style={{ width: "80%", background: col.accent, opacity: 0.35 }} />
        <div className="h-2 rounded-md" style={{ width: "60%", background: col.accent, opacity: 0.22 }} />
        <div className="h-2 rounded-md" style={{ width: "72%", background: col.accent, opacity: 0.28 }} />
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[0,1,2].map((i) => (
            <div key={i} className="rounded-lg" style={{ height: 32, background: col.accent, opacity: [0.18,0.12,0.15][i] }} />
          ))}
        </div>
        <div className="h-2 rounded-md" style={{ width: "50%", background: col.accent, opacity: 0.18 }} />
      </div>
      {/* Hover play button */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
        <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(255,107,43,0.9)", boxShadow: "0 0 24px rgba(255,107,43,0.5)" }}>
          <Play size={14} color="white" fill="white" className="ml-0.5" />
        </div>
      </div>
      {/* Duration badge */}
      <div className="absolute bottom-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.65)", color: "#fff" }}>
        {duration}
      </div>
    </div>
  );
};

// ── Dashboard mockup for Hero ──────────────────────────────────────────────
const HeroDashboard = ({ onPlay }: { onPlay: () => void }) => (
  <div
    className="float-db relative cursor-pointer group"
    style={{ transformStyle: "preserve-3d" }}
    onClick={onPlay}
  >
    {/* Warm glow behind dashboard (matches reference) */}
    <div
      className="absolute pointer-events-none"
      style={{
        right: "-10%", bottom: "-15%",
        width: "70%", height: "70%",
        background: "radial-gradient(circle, rgba(255,107,43,0.35) 0%, transparent 70%)",
        filter: "blur(50px)",
        zIndex: 0,
      }}
    />

    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "#0C1228",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 48px 120px rgba(0,0,0,0.75), 0 0 80px rgba(79,142,247,0.1), 0 0 120px rgba(255,107,43,0.08)",
        zIndex: 1,
      }}
    >
      {/* Top chrome bar */}
      <div className="flex items-center gap-2 px-4 h-9 border-b" style={{ background: "#070C1B", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
        <div className="flex-1 mx-3 h-5 rounded-md flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>app.flowlioapp.com</span>
        </div>
        {/* Avatar */}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            <span style={{ fontSize: 7, fontWeight: 700, color: "#fff" }}>O</span>
          </div>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>Olivia Rhye</span>
        </div>
      </div>

      {/* App body */}
      <div className="flex" style={{ height: 300 }}>
        {/* Sidebar */}
        <div className="flex flex-col py-3 px-2 border-r gap-0.5" style={{ width: 120, background: "#070C1B", borderColor: "rgba(255,255,255,0.06)" }}>
          {/* Logo */}
          <div className="flex items-center gap-1.5 px-2 mb-3">
            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FF6B2B,#FF4500)" }}>
              <Zap size={9} color="white" />
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>Flowlio</span>
          </div>
          {[
            { icon: BarChart3, label: "Dashboard",    active: true  },
            { icon: CheckSquare, label: "Projects",   active: false },
            { icon: CheckSquare, label: "Tasks",      active: false },
            { icon: Users,      label: "CRM",         active: false },
            { icon: Calendar,   label: "Calendar",    active: false },
            { icon: Clock,      label: "Time Tracking",active: false },
            { icon: FileText,   label: "Invoices",    active: false },
            { icon: BarChart3,  label: "Reports",     active: false },
            { icon: Zap,        label: "Automation",  active: false },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
              style={{
                background: active ? "rgba(255,107,43,0.15)" : "transparent",
                color: active ? "#FF6B2B" : "rgba(255,255,255,0.38)",
                fontSize: 9,
                fontWeight: active ? 700 : 400,
              }}
            >
              <Icon size={10} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Main content — Dashboard view */}
        <div className="flex-1 overflow-hidden p-3" style={{ background: "#0C1228" }}>
          {/* Top KPI row */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {/* Revenue card with sparkline */}
            <div className="col-span-2 rounded-xl p-3 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>Revenue</div>
              <div className="flex items-end gap-2">
                <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>$24,780</span>
                <span style={{ fontSize: 8, color: "#10B981", fontWeight: 700 }}>+12.5%</span>
              </div>
              {/* Mini sparkline SVG */}
              <svg className="absolute bottom-0 right-0" width="80" height="36" viewBox="0 0 80 36">
                <polyline
                  points="0,32 12,24 24,28 36,16 48,20 60,8 72,12 80,4"
                  fill="none" stroke="#4F8EF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                />
                <polyline
                  points="0,32 12,24 24,28 36,16 48,20 60,8 72,12 80,4 80,36 0,36"
                  fill="url(#rg)" opacity="0.12"
                />
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F8EF7" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Tasks Completed */}
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>Tasks Completed</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>156</div>
              <div style={{ fontSize: 8, color: "#10B981", fontWeight: 700 }}>+18.6%</div>
            </div>
          </div>

          {/* Middle row: Recent Activity + Projects donut + My Tasks */}
          <div className="grid grid-cols-3 gap-2">
            {/* Recent Activity */}
            <div className="col-span-1 rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Recent Activity</div>
              {[
                { label: "Design approval", time: "2m ago",  color: "#FF6B2B" },
                { label: "New invoice created", time: "5m ago", color: "#10B981" },
                { label: "Task completed", time: "1h ago",   color: "#4F8EF7" },
                { label: "Client feedback", time: "2h ago",  color: "#8B5CF6" },
              ].map((a) => (
                <div key={a.label} className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${a.color}25` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: a.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.label}</div>
                  </div>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{a.time}</span>
                </div>
              ))}
            </div>

            {/* Projects donut */}
            <div className="col-span-1 rounded-xl p-2.5 flex flex-col items-center justify-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Projects</div>
              <div className="relative flex items-center justify-center" style={{ width: 52, height: 52 }}>
                <svg viewBox="0 0 52 52" width="52" height="52">
                  <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
                  <circle cx="26" cy="26" r="20" fill="none" stroke="#4F8EF7" strokeWidth="6"
                    strokeDasharray="75 50" strokeDashoffset="-8" strokeLinecap="round" />
                  <circle cx="26" cy="26" r="20" fill="none" stroke="#FF6B2B" strokeWidth="6"
                    strokeDasharray="30 95" strokeDashoffset="-83" strokeLinecap="round" />
                  <circle cx="26" cy="26" r="20" fill="none" stroke="#10B981" strokeWidth="6"
                    strokeDasharray="20 105" strokeDashoffset="-113" strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", lineHeight: 1 }}>72</div>
                </div>
              </div>
            </div>

            {/* My Tasks */}
            <div className="col-span-1 rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>My Tasks</div>
              {[
                { label: "Landing page design", status: "In Progress", c: "#FF6B2B" },
                { label: "Client meeting",       status: "Done",        c: "#10B981" },
                { label: "Wireframes approval",  status: "Review",      c: "#4F8EF7" },
                { label: "Project roadmap",      status: "Review",      c: "#4F8EF7" },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <div className="w-2 h-2 rounded-sm border flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
                    <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.label}</span>
                  </div>
                  <span className="flex-shrink-0 ml-1 px-1.5 py-0.5 rounded text-white" style={{ fontSize: 6.5, fontWeight: 700, background: `${t.c}22`, color: t.c }}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Centered play button overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-colors"
        style={{ background: "rgba(0,0,0,0.12)", zIndex: 10 }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform"
          style={{ background: "rgba(255,255,255,0.92)", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
        >
          <Play size={20} color="#0F766E" fill="#0F766E" className="ml-1" />
        </div>
      </div>
    </div>
  </div>
);

// ── Interactive Demo Panel ─────────────────────────────────────────────────
type DemoTab = "dashboard" | "projects" | "tasks" | "crm" | "calendar" | "reports";

const DEMO_TABS: { id: DemoTab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "projects",  label: "Projects"  },
  { id: "tasks",     label: "Tasks"     },
  { id: "crm",       label: "CRM"       },
  { id: "calendar",  label: "Calendar"  },
  { id: "reports",   label: "Reports"   },
];

const ProjectsTab = () => (
  <div className="p-5">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-bold text-gray-900">Projects Board</span>
      <button className="cta-primary text-xs py-1.5 px-3" style={{ borderRadius: 8, fontSize: 12, padding: "6px 12px" }}>+ New Project</button>
    </div>
    <div className="grid grid-cols-4 gap-3">
      {[
        { col: "Planning", color: "#94A3B8", cards: ["Brand Strategy", "API Integration", "SEO Audit"] },
        { col: "In Progress", color: "#FF6B2B", cards: ["Website Redesign", "Mobile App v2"] },
        { col: "Review", color: "#4F8EF7", cards: ["Landing Page", "Marketing Campaign"] },
        { col: "Done", color: "#10B981", cards: ["Client Portal", "Q4 Reports"] },
      ].map((c) => (
        <div key={c.col}>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
            <span className="text-xs font-semibold text-gray-500">{c.col}</span>
          </div>
          {c.cards.map((card) => (
            <div key={card} className="text-xs p-2.5 rounded-xl mb-1.5 cursor-pointer bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-white transition-all text-gray-700">
              {card}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const DashboardTab = () => (
  <div className="p-5">
    <div className="grid grid-cols-4 gap-3 mb-4">
      {[
        { label: "Revenue", value: "$48.2K", sub: "+18% this month", color: "#FF6B2B" },
        { label: "Active Projects", value: "24", sub: "3 due this week", color: "#4F8EF7" },
        { label: "Clients", value: "67", sub: "5 new this month", color: "#10B981" },
        { label: "Hours Tracked", value: "312h", sub: "87% utilization", color: "#8B5CF6" },
      ].map((s) => (
        <div key={s.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="text-xs text-gray-500 mb-1">{s.label}</div>
          <div className="text-xl font-black text-gray-900">{s.value}</div>
          <div className="text-xs mt-0.5 font-semibold" style={{ color: s.color }}>{s.sub}</div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
        <div className="text-xs font-semibold text-gray-500 mb-2">Revenue (last 12 months)</div>
        <div className="flex items-end gap-1 h-20">
          {[40,65,45,80,55,90,70,85,60,95,75,100].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i >= 10 ? "linear-gradient(to top,#FF6B2B,#FF9A5C)" : "#E5E7EB" }} />
          ))}
        </div>
      </div>
      <div className="p-3 rounded-xl border" style={{ background: "rgba(79,142,247,0.04)", borderColor: "rgba(79,142,247,0.15)" }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Bot size={11} color="#4F8EF7" />
          <span className="text-xs font-semibold" style={{ color: "#4F8EF7" }}>AI Insights</span>
        </div>
        {["Revenue up 18%", "3 at-risk projects", "2 invoices overdue", "Team at 87% capacity"].map((t) => (
          <div key={t} className="text-xs p-2 rounded-lg bg-white border border-gray-100 mb-1 text-gray-600">{t}</div>
        ))}
      </div>
    </div>
  </div>
);

const PANEL_MAP: Record<DemoTab, React.ReactElement> = {
  dashboard: <DashboardTab />,
  projects: <ProjectsTab />,
  tasks: (
    <div className="p-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { status: "To Do", color: "#94A3B8", items: ["Write scope doc", "Onboard client", "Setup CRM pipeline"] },
          { status: "In Progress", color: "#FF6B2B", items: ["Homepage design", "API endpoints", "User testing"] },
          { status: "Done", color: "#10B981", items: ["Brand guidelines", "Q1 report", "Email templates"] },
        ].map((c) => (
          <div key={c.status}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
              <span className="text-xs font-semibold text-gray-500">{c.status}</span>
            </div>
            {c.items.map((t) => (
              <div key={t} className="text-xs p-2.5 rounded-xl mb-1.5 bg-gray-50 border border-gray-100 text-gray-700">{t}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  ),
  crm: (
    <div className="p-5 space-y-2">
      {[
        { name: "Acme Corp", stage: "Proposal Sent", value: "$12,000", color: "#FF6B2B" },
        { name: "Studio Nova", stage: "Discovery Call", value: "$8,500", color: "#4F8EF7" },
        { name: "TechFlow Inc", stage: "Contract Review", value: "$24,000", color: "#10B981" },
        { name: "BrightMind", stage: "Qualified Lead", value: "$6,200", color: "#8B5CF6" },
        { name: "Nexus Group", stage: "Closed Won", value: "$18,000", color: "#F59E0B" },
      ].map((l) => (
        <div key={l.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: l.color }}>{l.name[0]}</div>
            <div>
              <div className="text-sm font-semibold text-gray-800">{l.name}</div>
              <div className="text-xs text-gray-500">{l.stage}</div>
            </div>
          </div>
          <div className="text-sm font-bold text-gray-800">{l.value}</div>
        </div>
      ))}
    </div>
  ),
  calendar: (
    <div className="p-5 space-y-2">
      {[
        { time: "9:00 AM", title: "Client Discovery — Acme Corp", type: "Meeting", color: "#FF6B2B" },
        { time: "11:30 AM", title: "Design Review — Studio Nova", type: "Review", color: "#4F8EF7" },
        { time: "2:00 PM", title: "Sprint Planning", type: "Internal", color: "#8B5CF6" },
        { time: "4:30 PM", title: "Invoice Delivery — TechFlow", type: "Billing", color: "#10B981" },
      ].map((ev) => (
        <div key={ev.title} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-1.5 self-stretch rounded-full" style={{ background: ev.color }} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800">{ev.title}</div>
            <div className="text-xs text-gray-500">{ev.time}</div>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: `${ev.color}18`, color: ev.color }}>{ev.type}</span>
        </div>
      ))}
    </div>
  ),
  reports: (
    <div className="p-5">
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Billable Hours", value: "312h", change: "+18%", color: "#FF6B2B" },
          { label: "Revenue", value: "$48.2K", change: "+24%", color: "#10B981" },
          { label: "Utilization", value: "87%", change: "+5%", color: "#4F8EF7" },
          { label: "On-Time Rate", value: "94%", change: "+2%", color: "#8B5CF6" },
        ].map((m) => (
          <div key={m.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">{m.label}</div>
            <div className="text-xl font-black text-gray-900">{m.value}</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: m.color }}>{m.change} this month</div>
          </div>
        ))}
      </div>
    </div>
  ),
};

// ── Industry cards data ────────────────────────────────────────────────────
const INDUSTRIES = [
  { id: "agencies",     label: "Creative Agencies",    metric: "+32%", metricLabel: "faster delivery",       from: "#4c1d95", to: "#7c3aed", icon: Palette },
  { id: "consultants",  label: "Consultants",           metric: "+28%", metricLabel: "more billable hours",   from: "#064e3b", to: "#065f46", icon: BriefcaseBusiness },
  { id: "service",      label: "Service Businesses",    metric: "+41%", metricLabel: "improvement in ops",    from: "#1e3a8a", to: "#1d4ed8", icon: Building2 },
  { id: "marketing",    label: "Marketing Teams",       metric: "+29%", metricLabel: "better performance",    from: "#92400e", to: "#b45309", icon: Megaphone },
  { id: "it",           label: "IT & Software Teams",   metric: "+37%", metricLabel: "productivity boost",    from: "#1e1b4b", to: "#3730a3", icon: Monitor },
  { id: "finance",      label: "Finance Teams",         metric: "+44%", metricLabel: "faster payments",       from: "#064e3b", to: "#047857", icon: CreditCard },
];

// ── Modules data ──────────────────────────────────────────────────────────
const MODULES = [
  { icon: Users,       label: "CRM",              desc: "Manage deals, leads and client relationships that grow.",         color: "#10B981", bg: "#052e16" },
  { icon: Kanban,      label: "Kanban Projects",   desc: "Visualize work, move fast and hit every deadline.",              color: "#8B5CF6", bg: "#1e1b4b" },
  { icon: Calendar,    label: "Calendar",          desc: "Plan your week, schedule and stay in sync.",                     color: "#FF6B2B", bg: "#3b1515" },
  { icon: Timer,       label: "Time Tracking",     desc: "Track time, boost productivity and bill with confidence.",       color: "#4F8EF7", bg: "#1e3a5f" },
  { icon: FileText,    label: "Invoices",          desc: "Create, send and track invoices. Get paid faster.",              color: "#F87171", bg: "#450a0a" },
  { icon: BarChart3,   label: "Reports",           desc: "Turn data into insights that drive growth.",                     color: "#2DD4BF", bg: "#042f2e" },
];

// ── Main Page ─────────────────────────────────────────────────────────────
interface ModalState { isOpen: boolean; videoId: string; title: string; }

const ShowcasePage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<FeatureCategory>("All");
  const [modal, setModal] = useState<ModalState>({ isOpen: false, videoId: "", title: "" });
  const [activeTab, setActiveTab] = useState<DemoTab>("projects");
  const [moduleIdx, setModuleIdx] = useState(0);

  const openModal = (videoId: string, title: string) =>
    setModal({ isOpen: true, videoId, title });
  const closeModal = () =>
    setModal({ isOpen: false, videoId: "", title: "" });

  const filtered =
    activeCategory === "All"
      ? features
      : features.filter((f) => f.category === activeCategory);

  useEffect(() => { scrollTo(0, 0); }, []);

  return (
    <>
      <style>{globalStyles}</style>

      <Helmet>
        <title>Flowlio Showcase — See How Project Management, CRM &amp; Invoicing Work in One Tool</title>
        <meta name="description" content="Watch real workflows showing how teams manage clients, projects, billing, automation and collaboration inside Flowlio." />
        <link rel="canonical" href="https://flowlioapp.com/showcase" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://img.youtube.com" />
      </Helmet>

      <ShowcaseSchema features={features} useCases={useCases} />
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════
          1. HERO — split layout
      ══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden dark-grid"
        style={{ background: "#06091A", paddingTop: 80 }}
      >
        {/* Glow blobs */}
        <div className="glow-blob absolute pointer-events-none" style={{ top: "10%", left: "5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(255,107,43,0.15) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(50px)" }} />
        <div className="glow-blob-2 absolute pointer-events-none" style={{ top: "15%", right: "8%", width: 450, height: 450, background: "radial-gradient(circle, rgba(79,142,247,0.14) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(50px)" }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-12 py-16">
          {/* Left — text */}
          <div className="flex-1 max-w-xl">
            <div className="pill-badge pill-dark mb-6">
              <Star size={9} fill="currentColor" /> Video Showcase
            </div>

            <h1
              className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.06] mb-5"
              style={{ color: "#fff", letterSpacing: "-0.025em" }}
            >
              Workflows that actually{" "}
              <span style={{ color: "#FF6B2B" }}>move</span> your business{" "}
              <span style={{ color: "#4F8EF7" }}>forward</span>
            </h1>

            <p className="text-base sm:text-lg mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Watch real scenarios showing how teams manage clients, projects, billing,
              automation and collaboration inside Flowlio.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <button className="cta-primary" onClick={() => openModal(OVERVIEW_VIDEO_ID, "Flowlio Product Tour")}>
                <Play size={13} fill="white" /> Watch overview
              </button>
              <a href="#videos" className="cta-ghost-dark">
                Explore all videos <ArrowRight size={14} />
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6">
              {[
                { icon: Clock, label: "+24h", sub: "saved weekly", color: "#FF6B2B" },
                { icon: Zap, label: "312", sub: "tasks automated", color: "#4F8EF7" },
                { icon: Users, label: "14", sub: "active clients", color: "#10B981" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <Icon size={16} color={s.color} />
                    <div>
                      <div className="text-sm font-black text-white">{s.label}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{s.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — dashboard + floating badges */}
          <div className="flex-1 relative flex items-center justify-center w-full">
            {/* Floating badges */}
            <div className="float-badge absolute -top-4 left-4 z-20 hidden lg:block">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: "rgba(16,24,45,0.92)", border: "1px solid rgba(255,107,43,0.25)", backdropFilter: "blur(16px)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
                <TrendingUp size={12} color="#FF6B2B" /> +18% revenue this month
              </div>
            </div>
            <div className="float-badge-2 absolute top-8 -right-2 z-20 hidden lg:block">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: "rgba(16,24,45,0.92)", border: "1px solid rgba(16,185,129,0.25)", backdropFilter: "blur(16px)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
                <Check size={12} color="#10B981" /> Invoice sent automatically
              </div>
            </div>
            <div className="float-badge-3 absolute bottom-10 -left-2 z-20 hidden lg:block">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: "rgba(16,24,45,0.92)", border: "1px solid rgba(79,142,247,0.25)", backdropFilter: "blur(16px)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
                <Bot size={12} color="#4F8EF7" /> AI drafted your update
              </div>
            </div>

            <HeroDashboard onPlay={() => openModal(OVERVIEW_VIDEO_ID, "Flowlio Product Tour")} />
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to top, #06091A, transparent)" }} />
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. EXAMPLE WORKFLOWS — light section, 4 cards
      ══════════════════════════════════════════════════════════════════ */}
      <section id="workflows" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
            <div>
              <span className="pill-badge pill-light mb-4 inline-flex">Example Workflows</span>
              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-gray-900 mt-3" style={{ letterSpacing: "-0.02em" }}>
                Watch <span style={{ color: "#FF6B2B" }}>flows</span>, not features
              </h2>
              <p className="text-base text-gray-500 mt-3 max-w-lg">
                Real-world scenarios showing how teams use Flowlio every day to get things done.
              </p>
            </div>
            <a href="#use-cases" className="cta-ghost-light flex-shrink-0 self-start sm:self-end">
              View all workflows <ArrowRight size={14} />
            </a>
          </div>

          {/* 4 workflow cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: "From lead to paid invoice", desc: "The complete process from new lead to project delivery and invoice payment.", pills: ["CRM","Projects","Invoices"], uc: useCases[0], color: { from: "#1e1060", to: "#3b0764" } },
              { title: "Managing a remote team", desc: "Assign tasks, track time, collaborate and keep everyone aligned.", pills: ["Tasks","Time Tracking","Reports"], uc: useCases[1], color: { from: "#052e16", to: "#064e3b" } },
              { title: "Running a creative agency", desc: "Manage clients, approvals, revisions and deliver exceptional work.", pills: ["Client Portal","Approvals","Files"], uc: useCases[3], color: { from: "#1e3a5f", to: "#1e40af" } },
              { title: "Automating repetitive work", desc: "Save hours every week with automations, recurring tasks and smart workflows.", pills: ["Automation","AI","Notifications"], uc: useCases[4], color: { from: "#3b1515", to: "#7f1d1d" } },
            ].map((wf) => (
              <div
                key={wf.title}
                className="flow-card cursor-pointer group"
                onClick={() => openModal(wf.uc.videoId, wf.title)}
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${wf.color.from} 0%, ${wf.color.to} 100%)` }}>
                    {/* Fake UI dots */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center gap-2 px-5 py-4 opacity-30">
                      {[90,70,80,55,75].map((w, j) => (
                        <div key={j} className="rounded" style={{ height: 3, width: `${w}%`, background: "rgba(255,255,255,0.8)" }} />
                      ))}
                    </div>
                  </div>
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/90 shadow-xl group-hover:scale-110 transition-transform">
                      <Play size={16} color="#FF6B2B" fill="#FF6B2B" className="ml-0.5" />
                    </div>
                  </div>
                  {/* Duration */}
                  <div className="absolute bottom-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}>
                    {wf.uc.duration}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5 leading-tight">{wf.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{wf.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {wf.pills.map((p) => (
                      <span key={p} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F1F5F9", color: "#475569", fontSize: 10, fontWeight: 600 }}>{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. VIDEO LIBRARY — dark, filterable
      ══════════════════════════════════════════════════════════════════ */}
      <section id="videos" className="py-24 px-6 dark-grid" style={{ background: "#060A18" }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <span className="pill-badge pill-dark mb-4 inline-flex"><BarChart3 size={9} /> Video Library</span>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-3">
              <h2 className="text-3xl sm:text-4xl font-black text-white" style={{ letterSpacing: "-0.02em" }}>
                All use case videos
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Sort by:</span>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white font-semibold" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Popular <ChevronRight size={12} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none mb-8 pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                style={
                  activeCategory === cat
                    ? { background: "#FF6B2B", color: "#fff", boxShadow: "0 4px 12px rgba(255,107,43,0.35)" }
                    : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid — variable sizes */}
          {filtered.length === 0 ? (
            <p className="text-center py-20 text-gray-500">No videos in this category yet.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
              {filtered.map((feat, i) => {
                const isFeatured = i === 0 || i === 4;
                const hasReal = !feat.videoId.includes("_VIDEO_") && !feat.videoId.startsWith("USECASE");
                return (
                  <div
                    key={feat.id}
                    className={`video-card-dark ${isFeatured ? "col-span-2 row-span-1" : ""}`}
                    onClick={() => openModal(feat.videoId, feat.title)}
                  >
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                      {hasReal ? (
                        <img
                          src={`https://img.youtube.com/vi/${feat.videoId}/hqdefault.jpg`}
                          alt={feat.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <MockThumb category={feat.category} duration={feat.duration} />
                      )}
                      {/* Hover play */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,107,43,0.9)", boxShadow: "0 0 24px rgba(255,107,43,0.5)" }}>
                          <Play size={14} color="white" fill="white" className="ml-0.5" />
                        </div>
                      </div>
                      {/* Duration */}
                      <div className="absolute bottom-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.75)", color: "#fff" }}>
                        {feat.duration}
                      </div>
                    </div>

                    <div className="p-3.5">
                      <h3 className="text-xs font-bold text-white mb-1.5 line-clamp-1">{feat.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(255,107,43,0.12)", color: "#FF6B2B", fontSize: 10 }}>
                          {feat.category}
                        </span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>
                          {(Math.floor(Math.random() * 10) + 2).toFixed(1)}K views
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* "More videos coming soon" tile */}
              <div className="video-card-dark flex flex-col items-center justify-center p-6 text-center" style={{ minHeight: 160 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Sparkles size={16} color="rgba(255,255,255,0.4)" />
                </div>
                <div className="text-sm font-bold text-white mb-1">More videos coming soon</div>
                <div className="text-xs text-gray-500 mb-4">Have a suggestion for a video?</div>
                <button className="text-xs font-bold px-4 py-2 rounded-lg transition-all" style={{ background: "rgba(255,107,43,0.1)", border: "1px solid rgba(255,107,43,0.25)", color: "#FF6B2B" }}>
                  Request a video
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. INTERACTIVE PREVIEW — white, split
      ══════════════════════════════════════════════════════════════════ */}
      <section id="demo" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-14">
          {/* Left */}
          <div className="flex-none max-w-xs lg:max-w-[300px]">
            <span className="pill-badge pill-light mb-5 inline-flex"><Monitor size={9} /> Interactive Preview</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-4 leading-tight" style={{ letterSpacing: "-0.02em" }}>
              Explore Flowlio before you even create an account
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Click around a live demo environment and see how everything works together.
            </p>
            <div className="space-y-3 mb-8">
              {["No signup required", "Real data & interactions", "Updated regularly"].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,107,43,0.1)", border: "1px solid rgba(255,107,43,0.2)" }}>
                    <Check size={11} color="#FF6B2B" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{item}</span>
                </div>
              ))}
            </div>
            <button className="cta-primary" onClick={() => navigate("/pricing")}>
              Launch live demo <ArrowRight size={14} />
            </button>
          </div>

          {/* Right — browser app */}
          <div className="flex-1 w-full">
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: "1px solid #E5E7EB" }}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 h-10 border-b bg-gray-50" style={{ borderColor: "#E5E7EB" }}>
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-3 h-6 rounded-md bg-white border border-gray-200 flex items-center gap-2 px-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF6B2B,#FF4500)" }} />
                  <span className="text-xs text-gray-400">app.flowlioapp.com</span>
                </div>
              </div>

              {/* App header with tabs */}
              <div className="flex items-center border-b bg-white overflow-x-auto scrollbar-none" style={{ borderColor: "#E5E7EB" }}>
                {DEMO_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="relative flex-shrink-0 px-5 py-3.5 text-sm font-semibold transition-colors"
                      style={{ color: isActive ? "#FF6B2B" : "#9CA3AF" }}
                    >
                      {tab.label}
                      {isActive && <div className="tab-active-line" />}
                    </button>
                  );
                })}
              </div>

              <div className="bg-white min-h-[380px]">
                {PANEL_MAP[activeTab]}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. INDUSTRY USE CASES — light bg, 6 cards
      ══════════════════════════════════════════════════════════════════ */}
      <section id="use-cases" className="py-24 px-6" style={{ background: "#F8FAFC" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
            <div>
              <span className="pill-badge pill-light mb-4 inline-flex"><Users size={9} /> Use Cases by Industry</span>
              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-gray-900 mt-3" style={{ letterSpacing: "-0.02em" }}>
                Built for teams like yours
              </h2>
              <p className="text-base text-gray-500 mt-3 max-w-lg">
                See how different teams use Flowlio to streamline their work and grow.
              </p>
            </div>
            <button className="cta-ghost-light flex-shrink-0 self-start sm:self-end">
              View all industries <ArrowRight size={14} />
            </button>
          </div>

          {/* 6 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {INDUSTRIES.map((ind, idx) => {
              const Icon = ind.icon;
              const uc = useCases[idx] ?? useCases[0];
              return (
                <div
                  key={ind.id}
                  className="industry-card"
                  style={{
                    background: `linear-gradient(160deg, ${ind.from} 0%, ${ind.to} 100%)`,
                    border: "1px solid rgba(255,255,255,0.08)",
                    minHeight: 200,
                  }}
                  onClick={() => openModal(uc.videoId, ind.label)}
                >
                  <div className="flex-1">
                    <Icon size={22} color="rgba(255,255,255,0.9)" className="mb-3" />
                    <h3 className="text-sm font-black text-white leading-tight mb-2">{ind.label}</h3>
                    <p className="text-xs mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {uc.description.substring(0, 70)}…
                    </p>
                    <div className="text-2xl font-black text-white">{ind.metric}</div>
                    <div className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>{ind.metricLabel}</div>
                    <button
                      className="text-xs font-bold flex items-center gap-1.5 mb-4"
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      See workflow <ChevronRight size={11} />
                    </button>
                  </div>

                  {/* Mini dashboard preview bar */}
                  <div className="rounded-t-xl mt-auto overflow-hidden" style={{ background: "rgba(0,0,0,0.25)", padding: "8px 10px 0" }}>
                    <div className="space-y-1.5">
                      {[80,60,75].map((w, j) => (
                        <div key={j} className="rounded" style={{ height: 4, width: `${w}%`, background: "rgba(255,255,255,0.2)" }} />
                      ))}
                      <div className="grid grid-cols-3 gap-1 pt-1">
                        {[0,1,2].map((k) => (
                          <div key={k} className="rounded" style={{ height: 18, background: "rgba(255,255,255,0.1)" }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. EVERYTHING YOU NEED — dark, module row
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#060A18" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14 gap-4">
            <div>
              <span className="pill-badge pill-dark mb-4 inline-flex"><Sparkles size={9} /> Why Flowlio</span>
              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white mt-3" style={{ letterSpacing: "-0.02em" }}>
                Everything you need.{" "}
                <span style={{ color: "#FF6B2B" }}>In perfect flow.</span>
              </h2>
              <p className="text-sm text-gray-500 mt-3 max-w-lg">
                A quick list of the core modules that power your business.
              </p>
            </div>
            {/* Arrow navigation */}
            <div className="flex items-center gap-2 self-start sm:self-end">
              <button
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                onClick={() => setModuleIdx(Math.max(0, moduleIdx - 1))}
                aria-label="Previous"
              >
                <ChevronLeft size={16} color="rgba(255,255,255,0.6)" />
              </button>
              <button
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                onClick={() => setModuleIdx(Math.min(MODULES.length - 6, moduleIdx + 1))}
                aria-label="Next"
              >
                <ChevronRight size={16} color="rgba(255,255,255,0.6)" />
              </button>
            </div>
          </div>

          {/* Module cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.label}
                  className="p-5 rounded-2xl group cursor-pointer transition-all"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = `${mod.bg}`;
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${mod.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                  }}
                >
                  <div className="module-icon-wrap" style={{ background: `${mod.color}18`, border: `1px solid ${mod.color}30` }}>
                    <Icon size={20} color={mod.color} />
                  </div>
                  <div className="text-sm font-bold text-white mb-1.5">{mod.label}</div>
                  <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{mod.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. TRUST & SCALE — dark, icon row
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6" style={{ background: "#04070F", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <div className="pill-badge pill-dark mb-3 inline-flex"><Shield size={9} /> Trust & Scale</div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-3" style={{ letterSpacing: "-0.015em" }}>
                Enterprise grade.{" "}
                <span style={{ color: "rgba(255,255,255,0.45)" }}>Startup friendly.</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-6">
              {[
                { icon: TrendingUp, label: "99.99%", sub: "Uptime",            color: "#10B981" },
                { icon: Zap,        label: "Real-time", sub: "Data Sync",      color: "#4F8EF7" },
                { icon: Globe2,     label: "Google",    sub: "Calendar",       color: "#FBBF24" },
                { icon: Bot,        label: "AI Powered", sub: "Smart Insights", color: "#8B5CF6" },
                { icon: Shield,     label: "Bank-level", sub: "Security",      color: "#F87171" },
                { icon: Users,      label: "Scales",    sub: "with you",       color: "#FF6B2B" },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <div key={t.label} className="flex flex-col items-center text-center gap-1.5">
                    <Icon size={20} color={t.color} />
                    <div className="text-sm font-bold text-white">{t.label}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{t.sub}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. CTA BANNER — orange gradient
      ══════════════════════════════════════════════════════════════════ */}
      <section
        className="py-14 px-6"
        style={{ background: "linear-gradient(135deg, #FF6B2B 0%, #FF4500 50%, #E83A00 100%)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ letterSpacing: "-0.015em" }}>
              Ready to streamline your workflow?
            </h2>
            <p className="text-sm text-white/75">
              Join thousands of teams already using Flowlio to get more done.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <button
              onClick={() => navigate("/pricing")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
              style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}
            >
              Get started for free <ArrowRight size={14} />
            </button>
            <button
              onClick={() => openModal(OVERVIEW_VIDEO_ID, "Flowlio Product Tour")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}
            >
              Book a demo
            </button>
          </div>
        </div>
      </section>

      <Footer />

      <VideoModal
        isOpen={modal.isOpen}
        videoId={modal.videoId}
        title={modal.title}
        onClose={closeModal}
      />
    </>
  );
};

export default ShowcasePage;
