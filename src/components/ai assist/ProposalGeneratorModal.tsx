import React, { useState } from "react";
import { X, FileText, Loader2, Download, Sparkles, ChevronRight, Bell, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { axios } from "@/configs/axios.config";
import { generatePdfBlob } from "@/lib/generatePdf";
import { ProposalPDF, type ProposalData } from "./ProposalPDF";
import { useFetchClients } from "@/hooks/usefetchclients";
import { useTranslation } from "react-i18next";

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

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  pt: "Portuguese",
  es: "Spanish",
  he: "Hebrew",
};

export const ProposalGeneratorModal: React.FC<ProposalGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
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
      setError(t("proposal.errorRequired"));
      return;
    }

    setStep("generating");
    setError("");
    setIsSaved(false);

    const currentLang = i18n.language?.split("-")[0] || "en";
    const language = LANGUAGE_NAMES[currentLang] || "English";

    try {
      const response = await axios.post("/ai/generate-proposal", {
        projectTitle: form.projectTitle,
        clientName: form.clientName,
        companyName: form.companyName,
        projectDescription: form.projectDescription,
        budget: form.budget,
        timeline: form.timeline,
        additionalRequirements: form.additionalRequirements,
        language,
      });

      if (response.data?.success && response.data?.data) {
        const generatedData = { ...response.data.data, language };
        setProposalData(generatedData);
        setStep("ready");

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
        err?.response?.data?.message || t("proposal.errorFailed")
      );
      setStep("form");
    }
  };

  const handleDownload = async () => {
    if (!proposalData) return;
    setIsDownloading(true);
    try {
      const blob = await generatePdfBlob(<ProposalPDF data={proposalData} />);
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
    } catch (err: any) {
      console.error("PDF generation error:", err);
      const msg = t("proposal.errorPdf") + (err?.message ? `: ${err.message}` : "");
      setError(msg);
      toast.error(msg);
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
                {t("proposal.title")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("proposal.subtitle")}
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
                {t("proposal.fillDetails")}
              </p>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      {t("proposal.projectTitle")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="projectTitle"
                      value={form.projectTitle}
                      onChange={handleChange}
                      placeholder={t("proposal.projectTitlePlaceholder")}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      {t("proposal.clientName")}
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
                      <option value="">{t("proposal.selectClient")}</option>
                      {isLoadingClients ? (
                        <option value="" disabled>{t("proposal.loadingClients")}</option>
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
                    {t("proposal.companyName")}
                  </label>
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder={t("proposal.companyNamePlaceholder")}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    {t("proposal.description")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="projectDescription"
                    value={form.projectDescription}
                    onChange={handleChange}
                    placeholder={t("proposal.descriptionPlaceholder")}
                    rows={4}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      {t("proposal.budget")}
                    </label>
                    <input
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      placeholder={t("proposal.budgetPlaceholder")}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      {t("proposal.timeline")}
                    </label>
                    <input
                      name="timeline"
                      value={form.timeline}
                      onChange={handleChange}
                      placeholder={t("proposal.timelinePlaceholder")}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0c89af]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    {t("proposal.additionalRequirements")}
                  </label>
                  <textarea
                    name="additionalRequirements"
                    value={form.additionalRequirements}
                    onChange={handleChange}
                    placeholder={t("proposal.additionalRequirementsPlaceholder")}
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
                  {t("proposal.generate")}
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
                {t("proposal.generating")}
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                {t("proposal.generatingDesc")}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{t("proposal.generatingSections")}</span>
              </div>
            </div>
          )}

          {/* ── READY STEP ── */}
          {step === "ready" && proposalData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="p-2 rounded-lg bg-green-100">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    {t("proposal.ready")}
                  </p>
                  <p className="text-xs text-green-600">
                    {t("proposal.readyDesc")}
                  </p>
                </div>
              </div>

              {isSaved && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">{t("proposal.savedNotified")}</span>{" "}
                    {t("proposal.savedDesc", { clientName: proposalData?.clientName })}
                  </p>
                </div>
              )}
              {!isSaved && selectedClientId && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <Bell className="w-4 h-4 text-yellow-600 shrink-0" />
                  <p className="text-xs text-yellow-700">
                    {t("proposal.savingNotifying")}
                  </p>
                </div>
              )}
              {!selectedClientId && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                  <p className="text-xs text-orange-700">
                    {t("proposal.notSavedWarning")}
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-4 bg-[#0c89af] text-white">
                  <p className="text-xs text-[#d0eef8] font-medium uppercase tracking-wider mb-1">
                    {t("proposal.professionalProposal")}
                  </p>
                  <h3 className="text-base font-bold">{proposalData.projectTitle}</h3>
                  <p className="text-xs text-[#d0eef8] mt-1">
                    {t("proposal.preparedFor")} {proposalData.clientName} · {t("proposal.by")} {proposalData.companyName}
                  </p>
                </div>

                <div className="p-4 space-y-3">
                  {[
                    { label: t("proposal.sections.executiveSummary"), done: !!proposalData.executiveSummary },
                    { label: t("proposal.sections.projectOverview"), done: !!proposalData.projectOverview },
                    { label: t("proposal.sections.scopeOfWork"), done: !!(proposalData.scopeOfWork?.length) },
                    { label: t("proposal.sections.methodology"), done: !!proposalData.approach },
                    { label: t("proposal.sections.timeline"), done: !!proposalData.timeline },
                    { label: t("proposal.sections.investment"), done: !!proposalData.investment },
                    { label: t("proposal.sections.whyUs"), done: !!(proposalData.whyUs?.length) },
                    { label: t("proposal.sections.terms"), done: !!(proposalData.terms?.length) },
                    { label: t("proposal.sections.nextSteps"), done: !!(proposalData.nextSteps?.length) },
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
                  {t("proposal.generateNew")}
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
                  {isDownloading ? t("proposal.preparingPdf") : t("proposal.downloadPdf")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
