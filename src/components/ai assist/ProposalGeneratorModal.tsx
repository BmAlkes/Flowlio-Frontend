import React, { useState } from "react";
import { X, FileText, Loader2, Download, Sparkles, ChevronRight, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { axios } from "@/configs/axios.config";
import { pdf } from "@react-pdf/renderer";
import { ProposalPDF, type ProposalData } from "./ProposalPDF";
import { useFetchClients } from "@/hooks/usefetchclients";

interface ProposalGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "form" | "generating" | "ready";

interface FormData {
  projectTitle: string;
  clientName: string;
  companyName: string;
  projectDescription: string;
  budget: string;
  timeline: string;
  additionalRequirements: string;
}

const initialForm: FormData = {
  projectTitle: "",
  clientName: "",
  companyName: "",
  projectDescription: "",
  budget: "",
  timeline: "",
  additionalRequirements: "",
};

export const ProposalGeneratorModal: React.FC<ProposalGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>(initialForm);
  const [proposalData, setProposalData] = useState<ProposalData | null>(null);
  const [error, setError] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);

  const { data: clientsData, isLoading: isLoadingClients } = useFetchClients();
  const clients = clientsData?.data || [];

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleGenerate = async () => {
    if (!form.projectTitle.trim() || !form.projectDescription.trim()) {
      setError("Project title and description are required.");
      return;
    }

    setStep("generating");
    setError("");
    setIsSaved(false);

    try {
      const response = await axios.post("/ai/generate-proposal", {
        projectTitle: form.projectTitle,
        clientName: form.clientName,
        companyName: form.companyName,
        projectDescription: form.projectDescription,
        budget: form.budget,
        timeline: form.timeline,
        additionalRequirements: form.additionalRequirements,
      });

      if (response.data?.success && response.data?.data) {
        const generatedData = response.data.data;
        setProposalData(generatedData);
        setStep("ready");

        // Auto-save proposal to DB + notify client if a client was selected
        if (selectedClientId) {
          try {
            await axios.post("/proposals", {
              clientId: selectedClientId,
              projectTitle: form.projectTitle,
              clientName: form.clientName,
              companyName: form.companyName,
              proposalData: generatedData,
            });
            setIsSaved(true);
          } catch (saveErr) {
            console.warn("Could not save proposal to DB:", saveErr);
          }
        }
      } else {
        throw new Error("Failed to generate proposal");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to generate proposal. Please try again."
      );
      setStep("form");
    }
  };

  const handleDownload = async () => {
    if (!proposalData) return;
    setIsDownloading(true);
    try {
      const blob = await pdf(<ProposalPDF data={proposalData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `proposal-${proposalData.projectTitle
        .replace(/\s+/g, "-")
        .toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    setStep("form");
    setForm(initialForm);
    setProposalData(null);
    setError("");
    setSelectedClientId("");
    setIsSaved(false);
    onClose();
  };

  const handleGenerateNew = () => {
    setStep("form");
    setProposalData(null);
    setError("");
    setIsSaved(false);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-border rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-background rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0c89af]/10">
              <FileText className="w-5 h-5 text-[#0c89af]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                AI Proposal Generator
              </h2>
              <p className="text-xs text-muted-foreground">
                Generate a professional, PDF-ready proposal instantly
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5">
          {/* ── FORM STEP ── */}
          {step === "form" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Fill in the details below and let AI write a complete professional
                proposal for you.
              </p>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Required fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="projectTitle"
                      value={form.projectTitle}
                      onChange={handleChange}
                      placeholder="e.g. E-commerce Website Redesign"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Client Name
                    </label>
                    <select
                      name="clientName"
                      value={form.clientName}
                      onChange={(e) => {
                        const selected = clients.find(c => c.name === e.target.value);
                        setSelectedClientId(selected?.id || "");
                        handleChange(e);
                      }}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40"
                    >
                      <option value="">Select a client...</option>
                      {isLoadingClients ? (
                        <option value="" disabled>Loading clients...</option>
                      ) : (
                        clients.map((client) => (
                          <option key={client.id} value={client.name}>
                            {client.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Your Company Name
                  </label>
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Flowlio Agency"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Project Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="projectDescription"
                    value={form.projectDescription}
                    onChange={handleChange}
                    placeholder="Describe the project goals, requirements, and what you want to achieve..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Budget
                    </label>
                    <input
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      placeholder="e.g. $15,000 - $20,000"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Timeline
                    </label>
                    <input
                      name="timeline"
                      value={form.timeline}
                      onChange={handleChange}
                      placeholder="e.g. 8 weeks"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Additional Requirements
                  </label>
                  <textarea
                    name="additionalRequirements"
                    value={form.additionalRequirements}
                    onChange={handleChange}
                    placeholder="Any specific technologies, constraints, or special requirements..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleGenerate}
                  className="bg-[#0c89af] hover:bg-[#0a7a9e] text-white gap-2 rounded-lg px-5"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Proposal
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── GENERATING STEP ── */}
          {step === "generating" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#0c89af]/20 border-t-[#0c89af] animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#0c89af]" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Generating Your Proposal...
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                AI is crafting a professional, customized proposal based on your
                requirements. This may take 15–30 seconds.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Writing sections: executive summary, scope, timeline, pricing...</span>
              </div>
            </div>
          )}

          {/* ── READY STEP ── */}
          {step === "ready" && proposalData && (
            <div className="space-y-4">
              {/* Success banner */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="p-2 rounded-lg bg-green-100">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Proposal Generated Successfully!
                  </p>
                  <p className="text-xs text-green-600">
                    Your AI-generated proposal is ready to download as PDF.
                  </p>
                </div>
              </div>

              {/* Client notified badge */}
              {isSaved && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Saved & Client Notified!</span> The proposal has been sent to{" "}
                    <span className="font-semibold">{proposalData?.clientName}</span>'s portal for approval.
                  </p>
                </div>
              )}
              {!isSaved && selectedClientId && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <Bell className="w-4 h-4 text-yellow-600 shrink-0" />
                  <p className="text-xs text-yellow-700">
                    Saving proposal and notifying client...
                  </p>
                </div>
              )}

              {/* Proposal Preview */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-4 bg-[#0c89af] text-white">
                  <p className="text-xs text-[#d0eef8] font-medium uppercase tracking-wider mb-1">
                    Professional Proposal
                  </p>
                  <h3 className="text-base font-bold">{proposalData.projectTitle}</h3>
                  <p className="text-xs text-[#d0eef8] mt-1">
                    Prepared for {proposalData.clientName} · By {proposalData.companyName}
                  </p>
                </div>

                <div className="p-4 space-y-3">
                  {/* Sections list */}
                  {[
                    { label: "Executive Summary", done: !!proposalData.executiveSummary },
                    { label: "Project Overview", done: !!proposalData.projectOverview },
                    { label: "Scope of Work", done: !!(proposalData.scopeOfWork?.length) },
                    { label: "Methodology & Approach", done: !!proposalData.approach },
                    { label: "Project Timeline", done: !!proposalData.timeline },
                    { label: "Investment & Pricing", done: !!proposalData.investment },
                    { label: "Why Choose Us", done: !!(proposalData.whyUs?.length) },
                    { label: "Terms & Conditions", done: !!(proposalData.terms?.length) },
                    { label: "Next Steps", done: !!(proposalData.nextSteps?.length) },
                  ].map((section) => (
                    <div key={section.label} className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          section.done
                            ? "bg-green-100 text-green-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {section.done ? "✓" : "–"}
                      </div>
                      <span
                        className={`text-sm ${
                          section.done ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {section.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateNew}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate New
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="bg-[#0c89af] hover:bg-[#0a7a9e] text-white gap-2 rounded-lg px-5"
                >
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isDownloading ? "Preparing PDF..." : "Download PDF"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
