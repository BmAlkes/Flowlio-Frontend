import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FinancialOverviewData } from "@/hooks/useFetchFinancialOverview";
import { TeamProductivityItem } from "@/hooks/useFetchTeamProductivity";
import { ClientActivityReport } from "@/hooks/useFetchClientActivity";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const downloadBlob = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadCSV = (rows: object[], filename: string) => {
  const csv = Papa.unparse(rows);
  downloadBlob(csv, filename, "text/csv;charset=utf-8;");
};

const addPdfHeader = (doc: jsPDF, title: string) => {
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, doc.internal.pageSize.width, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Flowlio", 14, 13);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 22);
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Generated: ${date}`, doc.internal.pageSize.width - 14, 22, { align: "right" });
  doc.setTextColor(0, 0, 0);
};

// ─── FINANCIAL OVERVIEW ───────────────────────────────────────────────────────

export const exportFinancialCSV = (data: FinancialOverviewData) => {
  // Summary
  const summaryRows = [
    { Metric: "Total Revenue", Value: `$${Number(data.totalRevenue).toLocaleString()}` },
    { Metric: "Total Expenses", Value: `$${Number(data.totalExpenses).toLocaleString()}` },
    { Metric: "Net Profit", Value: `$${Number(data.netProfit).toLocaleString()}` },
  ];

  // Monthly timeline
  const timelineRows = data.timeline.map((t) => ({
    Month: t.month,
    "Revenue ($)": Number(t.revenue).toLocaleString(),
    "Expenses ($)": Number(t.expenses).toLocaleString(),
    "Net ($)": (Number(t.revenue) - Number(t.expenses)).toLocaleString(),
  }));

  // Category breakdown
  const categoryRows = data.categoryBreakdown.map((c) => ({
    Category: c.category,
    "Amount ($)": Number(c.amount).toLocaleString(),
  }));

  // Project performance
  const projectRows = data.projectPerformance.map((p) => ({
    "Project Name": p.name,
    "Budget ($)": Number(p.budget).toLocaleString(),
    "Spent ($)": Number(p.spent).toLocaleString(),
    "Usage (%)": Number(p.budget) > 0
      ? `${Math.round((Number(p.spent) / Number(p.budget)) * 100)}%`
      : "N/A",
  }));

  const combined = [
    { Section: "=== SUMMARY ===" },
    ...summaryRows,
    { Section: "" },
    { Section: "=== MONTHLY TIMELINE ===" },
    ...timelineRows,
    { Section: "" },
    { Section: "=== EXPENSE CATEGORIES ===" },
    ...categoryRows,
    { Section: "" },
    { Section: "=== PROJECT PERFORMANCE ===" },
    ...projectRows,
  ];

  downloadCSV(combined, `financial-overview-${new Date().toISOString().slice(0, 10)}.csv`);
};

export const exportFinancialPDF = (data: FinancialOverviewData) => {
  const doc = new jsPDF();
  addPdfHeader(doc, "Financial Overview Report");

  let y = 38;

  // Summary cards
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Total Revenue", `$${Number(data.totalRevenue).toLocaleString()}`],
      ["Total Expenses", `$${Number(data.totalExpenses).toLocaleString()}`],
      ["Net Profit", `$${Number(data.netProfit).toLocaleString()}`],
    ],
    headStyles: { fillColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Monthly Timeline
  doc.setFont("helvetica", "bold");
  doc.text("Monthly Revenue vs Expenses", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Month", "Revenue ($)", "Expenses ($)", "Net ($)"]],
    body: data.timeline.map((t) => [
      t.month,
      Number(t.revenue).toLocaleString(),
      Number(t.expenses).toLocaleString(),
      (Number(t.revenue) - Number(t.expenses)).toLocaleString(),
    ]),
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  if (y > 220) { doc.addPage(); y = 20; }

  // Project Performance
  doc.setFont("helvetica", "bold");
  doc.text("Project Performance", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Project", "Budget ($)", "Spent ($)", "Usage"]],
    body: data.projectPerformance.map((p) => [
      p.name,
      Number(p.budget).toLocaleString(),
      Number(p.spent).toLocaleString(),
      Number(p.budget) > 0
        ? `${Math.round((Number(p.spent) / Number(p.budget)) * 100)}%`
        : "N/A",
    ]),
    headStyles: { fillColor: [16, 185, 129] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`financial-overview-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// ─── TEAM PRODUCTIVITY ────────────────────────────────────────────────────────

export const exportProductivityCSV = (data: TeamProductivityItem[]) => {
  const rows = data.map((m) => ({
    "Team Member": m.userName,
    "Total Tasks": m.totalTasks,
    "Completed Tasks": m.completedTasks,
    "In Progress Tasks": m.inProgressTasks,
    "Pending Tasks": m.pendingTasks,
    "Completion Rate (%)": m.totalTasks > 0
      ? `${Math.round((m.completedTasks / m.totalTasks) * 100)}%`
      : "0%",
    "Hours Logged": (m.totalMinutes / 60).toFixed(1),
  }));
  downloadCSV(rows, `team-productivity-${new Date().toISOString().slice(0, 10)}.csv`);
};

export const exportProductivityPDF = (data: TeamProductivityItem[]) => {
  const doc = new jsPDF();
  addPdfHeader(doc, "Team Productivity Report");

  autoTable(doc, {
    startY: 36,
    head: [["Team Member", "Total", "Completed", "In Progress", "Completion %", "Hours"]],
    body: data.map((m) => [
      m.userName,
      m.totalTasks,
      m.completedTasks,
      m.inProgressTasks,
      m.totalTasks > 0
        ? `${Math.round((m.completedTasks / m.totalTasks) * 100)}%`
        : "0%",
      `${(m.totalMinutes / 60).toFixed(1)} hrs`,
    ]),
    headStyles: { fillColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`team-productivity-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// ─── CLIENT ACTIVITY ──────────────────────────────────────────────────────────

export const exportClientActivityCSV = (data: ClientActivityReport) => {
  const rows = data.clientStats.map((item) => ({
    "Client Name": item.client.name,
    "Email": item.client.email,
    "Status": item.client.status,
    "Industry": item.client.industry ?? "N/A",
    "Active Projects": item.projects.active,
    "Completed Projects": item.projects.completed,
    "Delayed Projects": item.projects.delayed,
    "Total Projects": item.projects.total,
    "Tasks Completed": item.tasks.completed,
    "Total Tasks": item.tasks.total,
    "Hours Tracked": item.hoursTracked,
  }));
  downloadCSV(rows, `client-activity-${new Date().toISOString().slice(0, 10)}.csv`);
};

export const exportClientActivityPDF = (data: ClientActivityReport) => {
  const doc = new jsPDF({ orientation: "landscape" });
  addPdfHeader(doc, "Client Activity & Project Status Report");

  autoTable(doc, {
    startY: 36,
    head: [["Client", "Status", "Active", "Completed", "Delayed", "Total Projects", "Tasks Done", "Hours"]],
    body: data.clientStats.map((item) => [
      item.client.name,
      item.client.status,
      item.projects.active,
      item.projects.completed,
      item.projects.delayed,
      item.projects.total,
      `${item.tasks.completed}/${item.tasks.total}`,
      `${item.hoursTracked} hrs`,
    ]),
    headStyles: { fillColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`client-activity-${new Date().toISOString().slice(0, 10)}.pdf`);
};
