import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { PageWrapper } from "@/components/common/pagewrapper";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { ColumnDef } from "@tanstack/react-table";
import { ReusableTable } from "@/components/reusable/reusabletable";
import { format } from "date-fns";
import { useState } from "react";
import { Download, CheckCircle2, XCircle, Clock, FileText, Users, Upload, Sparkles, Trash2, Lock, Loader2 } from "lucide-react";
import { useHasFeatureAccess } from "@/hooks/usePlanAccess";
import { useNavigate } from "react-router";
import { generatePdfBlob } from "@/lib/generatePdf";
import { ProposalPDF, type ProposalData } from "@/components/ai assist/ProposalPDF";
import { ProposalGeneratorModal } from "@/components/ai assist/ProposalGeneratorModal";
import { ProposalUploadModal } from "@/components/proposals/ProposalUploadModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface Proposal {
  id: string;
  projectTitle: string;
  clientName: string;
  companyName: string;
  status: "pending" | "approved" | "rejected";
  proposalData: ProposalData & {
    isManual?: boolean;
    fileUrl?: string;
    fileName?: string;
  };
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

const OrgProposalsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: featureAccess, isLoading: checkingAccess } = useHasFeatureAccess("proposalsAccess");
  const hasAccess = featureAccess?.data?.hasAccess ?? true;

  if (checkingAccess) {
    return (
      <Center className="min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Center>
    );
  }

  if (!hasAccess) {
    return (
      <Box className="px-2">
        <Center className="min-h-[60vh] flex-col gap-4 p-8">
          <div className="p-4 rounded-full bg-red-100">
            <Lock className="w-12 h-12 text-red-600" />
          </div>
          <Stack className="gap-2 text-center max-w-md">
            <h2 className="text-2xl font-semibold text-foreground">Proposals Not Available</h2>
            <p className="text-muted-foreground">
              {featureAccess?.data?.reason || "Proposals is not included in your current plan. Upgrade to access this feature."}
            </p>
            <Button onClick={() => navigate("/dashboard/subscription")} className="mt-4">
              View Plans & Upgrade
            </Button>
          </Stack>
        </Center>
      </Box>
    );
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/proposals/${id}`),
    onSuccess: () => {
      toast.success(t("proposal.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["org-proposals"] });
      setConfirmDeleteId(null);
    },
    onError: () => {
      toast.error(t("proposal.deleteError"));
      setConfirmDeleteId(null);
    },
  });

  const statusConfig = {
    pending: {
      label: t("proposal.statusPending"),
      className: "text-white bg-[#F98618] rounded-full",
      icon: Clock,
    },
    approved: {
      label: t("proposal.statusApproved"),
      className: "text-white bg-[#00A400] rounded-full",
      icon: CheckCircle2,
    },
    rejected: {
      label: t("proposal.statusRejected"),
      className: "text-white bg-[#EF5350] rounded-full",
      icon: XCircle,
    },
  };

  const { data, isLoading } = useQuery({
    queryKey: ["org-proposals"],
    queryFn: async () => {
      const res = await axios.get("/proposals/organization");
      return res.data?.data as Proposal[];
    },
  });

  const proposals = data || [];

  const totalProposals = proposals.length;
  const approved = proposals.filter((p) => p.status === "approved").length;
  const pending = proposals.filter((p) => p.status === "pending").length;
  const rejected = proposals.filter((p) => p.status === "rejected").length;

  const handleDownload = async (proposal: Proposal) => {
    if (proposal.proposalData?.isManual && proposal.proposalData?.fileUrl) {
      window.open(proposal.proposalData.fileUrl, "_blank");
      return;
    }

    setDownloadingId(proposal.id);
    try {
      const pdfData: ProposalData = {
        ...proposal.proposalData,
        projectTitle: proposal.projectTitle,
        clientName: proposal.clientName,
        companyName: proposal.companyName,
        generatedAt: proposal.createdAt,
      };
      const blob = await generatePdfBlob(<ProposalPDF data={pdfData} />);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `proposal-${proposal.projectTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t("proposal.downloadSuccess"));
    } catch (err: any) {
      console.error("PDF download error:", err);
      toast.error(t("proposal.downloadError") + (err?.message ? `: ${err.message}` : ""));
    } finally {
      setDownloadingId(null);
    }
  };

  const columns: ColumnDef<Proposal>[] = [
    {
      accessorKey: "projectTitle",
      header: () => <Box className="text-center text-foreground">{t("proposal.colProjectTitle")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center font-medium">{row.original.projectTitle}</Box>
      ),
    },
    {
      accessorKey: "clientName",
      header: () => <Box className="text-center text-foreground">{t("proposal.colClient")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center">{row.original.clientName}</Box>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => <Box className="text-center text-foreground">{t("proposal.colSentOn")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center text-sm">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </Box>
      ),
    },
    {
      accessorKey: "status",
      header: () => <Box className="text-center text-foreground">{t("proposal.colStatus")}</Box>,
      cell: ({ row }) => {
        const cfg = statusConfig[row.original.status] || statusConfig.pending;
        const Icon = cfg.icon;
        return (
          <Center>
            <Box
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold w-28 justify-center ${cfg.className}`}
            >
              <Icon className="w-3 h-3" />
              {cfg.label}
            </Box>
          </Center>
        );
      },
    },
    {
      accessorKey: "approvedAt",
      header: () => <Box className="text-center text-foreground">{t("proposal.colResponseDate")}</Box>,
      cell: ({ row }) => {
        const date = row.original.approvedAt || row.original.rejectedAt;
        return (
          <Box className="text-center text-sm text-muted-foreground">
            {date ? format(new Date(date), "MMM d, yyyy") : "—"}
          </Box>
        );
      },
    },
    {
      id: "actions",
      header: () => <Box className="text-center text-foreground">{t("proposal.colActions")}</Box>,
      cell: ({ row }) => {
        const proposal = row.original;
        const isDownloadingThis = downloadingId === proposal.id;
        const isConfirming = confirmDeleteId === proposal.id;
        const isDeleting = deleteMutation.isPending && confirmDeleteId === proposal.id;
        return (
          <Center>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-[#0c89af] hover:bg-[#0a7a9e] border-none w-9 h-9 p-0 rounded-md"
                      onClick={() => handleDownload(proposal)}
                      disabled={isDownloadingThis}
                    >
                      {isDownloadingThis ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <Download className="text-white w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("proposal.tooltipDownload")}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {isConfirming ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    className="bg-red-500 hover:bg-red-600 border-none h-9 px-2 rounded-md text-white text-xs"
                    onClick={() => deleteMutation.mutate(proposal.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    ) : t("proposal.confirmDelete")}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border h-9 px-2 rounded-md text-xs"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    {t("common.cancel")}
                  </Button>
                </div>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-red-50 hover:bg-red-100 border-red-200 w-9 h-9 p-0 rounded-md"
                        onClick={() => setConfirmDeleteId(proposal.id)}
                      >
                        <Trash2 className="text-red-500 w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("proposal.tooltipDelete")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </Center>
        );
      },
    },
  ];

  return (
    <PageWrapper className="mt-6">
      <Stack className="gap-1 p-6 mb-2">
        <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Box className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0c89af]/10">
              <FileText className="w-5 h-5 text-[#0c89af]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{t("proposal.pageTitle")}</h1>
              <p className="text-muted-foreground text-sm">
                {t("proposal.pageSubtitle")}
              </p>
            </div>
          </Box>

          <Box className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(true)}
              className="gap-2 rounded-full border-[#0c89af] text-[#0c89af] hover:bg-[#0c89af]/5"
            >
              <Upload className="w-4 h-4" />
              {t("proposal.uploadProposal")}
            </Button>
            <Button
              onClick={() => setIsProposalModalOpen(true)}
              className="gap-2 rounded-full bg-[#0c89af] hover:bg-[#0a7a9e] text-white"
            >
              <Sparkles className="w-4 h-4" />
              {t("proposal.aiGenerator")}
            </Button>
          </Box>
        </Box>
      </Stack>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 mb-6">
        {[
          { label: t("proposal.statsTotalSent"), value: totalProposals, color: "bg-[#0c89af]/10 text-[#0c89af]" },
          { label: t("proposal.statsPending"), value: pending, color: "bg-orange-50 text-orange-600" },
          { label: t("proposal.statsApproved"), value: approved, color: "bg-green-50 text-green-600" },
          { label: t("proposal.statsRejected"), value: rejected, color: "bg-red-50 text-red-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl p-4 ${stat.color} border border-current/10`}
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs font-medium opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <Box className="flex justify-center p-10 text-muted-foreground">{t("proposal.loading")}</Box>
      ) : proposals.length === 0 ? (
        <Box className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Users className="w-12 h-12 opacity-30" />
          <p className="text-base font-medium">{t("proposal.emptyTitle")}</p>
          <p className="text-sm text-center max-w-xs">
            {t("proposal.emptyDesc")}
          </p>
        </Box>
      ) : (
        <Box className="rounded-xl border border-border overflow-hidden mx-6 mb-10 pt-4 bg-card">
          <ReusableTable
            data={proposals}
            columns={columns}
            searchClassName="rounded-full"
            filterClassName="rounded-full"
          />
        </Box>
      )}

      <ProposalGeneratorModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
      />

      <ProposalUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </PageWrapper>
  );
};

export default OrgProposalsPage;
