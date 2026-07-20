import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { PageWrapper } from "@/components/common/pagewrapper";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Flex } from "@/components/ui/flex";
import { ColumnDef } from "@tanstack/react-table";
import { ReusableTable } from "@/components/reusable/reusabletable";
import { format } from "date-fns";
import { useState } from "react";
import { Download, CheckCircle2, XCircle, Clock, FileText, Upload, PenLine, Trash2, Lock, Loader2, BadgeCheck } from "lucide-react";
import { GeneralModal } from "@/components/common/generalmodal";
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
  signedName?: string | null;
  signatureImage?: string | null;
  signedIp?: string | null;
}

const OrgProposalsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewingSignature, setViewingSignature] = useState<Proposal | null>(null);

  const { data: featureAccess, isLoading: checkingAccess } = useHasFeatureAccess("proposalsAccess");
  const hasAccess = featureAccess?.data?.hasAccess ?? true;

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

  const statusConfig: Record<string, { label: string; className: string; icon: typeof Clock; dot: string }> = {
    pending: {
      label: t("proposal.statusPending"),
      className: "text-orange-700 bg-orange-50 border-orange-200",
      icon: Clock,
      dot: "bg-orange-500",
    },
    approved: {
      label: t("proposal.statusApproved"),
      className: "text-green-700 bg-green-50 border-green-200",
      icon: CheckCircle2,
      dot: "bg-green-500",
    },
    rejected: {
      label: t("proposal.statusRejected"),
      className: "text-red-700 bg-red-50 border-red-200",
      icon: XCircle,
      dot: "bg-red-500",
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
      toast.error(t("proposal.downloadError") + (err?.message ? `: ${err.message}` : ""));
    } finally {
      setDownloadingId(null);
    }
  };

  const columns: ColumnDef<Proposal>[] = [
    {
      accessorKey: "projectTitle",
      header: () => <Box className="text-foreground px-3">{t("proposal.colProjectTitle")}</Box>,
      cell: ({ row }) => (
        <Box className="px-3 font-medium text-foreground">{row.original.projectTitle}</Box>
      ),
    },
    {
      accessorKey: "clientName",
      header: () => <Box className="text-foreground">{t("proposal.colClient")}</Box>,
      cell: ({ row }) => (
        <Box className="text-muted-foreground">{row.original.clientName}</Box>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => <Box className="text-foreground">{t("proposal.colSentOn")}</Box>,
      cell: ({ row }) => (
        <Box className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </Box>
      ),
    },
    {
      accessorKey: "status",
      header: () => <Box className="text-foreground">{t("proposal.colStatus")}</Box>,
      cell: ({ row }) => {
        const cfg = statusConfig[row.original.status] || statusConfig.pending;
        return (
          <Flex className="gap-0">
            <Box className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${cfg.className}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </Box>
          </Flex>
        );
      },
    },
    {
      accessorKey: "approvedAt",
      header: () => <Box className="text-foreground">{t("proposal.colResponseDate")}</Box>,
      cell: ({ row }) => {
        const date = row.original.approvedAt || row.original.rejectedAt;
        return (
          <Box className="text-sm text-muted-foreground">
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
            <div className="flex items-center gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-8 h-8 p-0 rounded-lg border-border hover:bg-muted"
                      onClick={() => handleDownload(proposal)}
                      disabled={isDownloadingThis}
                    >
                      {isDownloadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("proposal.tooltipDownload")}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {proposal.status === "approved" && proposal.signedName && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-8 h-8 p-0 rounded-lg border-border hover:bg-emerald-50 hover:border-emerald-200"
                        onClick={() => setViewingSignature(proposal)}
                      >
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View signature</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {isConfirming ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    className="bg-red-500 hover:bg-red-600 border-none h-8 px-2.5 rounded-lg text-white text-xs"
                    onClick={() => deleteMutation.mutate(proposal.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t("proposal.confirmDelete")}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border h-8 px-2.5 rounded-lg text-xs"
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
                        className="w-8 h-8 p-0 rounded-lg border-border hover:bg-red-50 hover:border-red-200"
                        onClick={() => setConfirmDeleteId(proposal.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
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

  return (
    <PageWrapper className="mt-6">
      {/* ── Header ── */}
      <Flex className="items-center justify-between px-6 py-5 flex-wrap gap-3">
        <Box>
          <h1 className="text-2xl font-semibold text-foreground">{t("proposal.pageTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("proposal.pageSubtitle")}</p>
        </Box>

        <Flex className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsUploadModalOpen(true)}
            className="gap-2 h-9 rounded-lg text-sm"
          >
            <Upload className="w-4 h-4" />
            {t("proposal.uploadProposal")}
          </Button>
          <Button
            onClick={() => setIsProposalModalOpen(true)}
            className="gap-2 h-9 rounded-lg bg-foreground hover:bg-foreground/90 text-background text-sm"
          >
            <PenLine className="w-4 h-4" />
            {t("proposal.aiGenerator")}
          </Button>
        </Flex>
      </Flex>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-3 px-6 mb-6">
        {[
          { label: t("proposal.statsTotalSent"), value: totalProposals, border: "border-s-slate-400" },
          { label: t("proposal.statsPending"), value: pending, border: "border-s-orange-400" },
          { label: t("proposal.statsApproved"), value: approved, border: "border-s-green-500" },
          { label: t("proposal.statsRejected"), value: rejected, border: "border-s-red-400" },
        ].map((s) => (
          <Box
            key={s.label}
            className={`rounded-xl border border-border bg-card p-4 border-s-[3px] ${s.border}`}
          >
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Box>
        ))}
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        <Box className="flex justify-center p-10 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </Box>
      ) : proposals.length === 0 ? (
        <Box className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <FileText className="w-10 h-10 opacity-20" />
          <p className="text-base font-medium">{t("proposal.emptyTitle")}</p>
          <p className="text-sm text-center max-w-xs">{t("proposal.emptyDesc")}</p>
        </Box>
      ) : (
        <Box className="mx-6 mb-10">
          <ReusableTable
            data={proposals}
            columns={columns}
            searchClassName="rounded-lg"
            filterClassName="rounded-lg"
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

      <GeneralModal open={!!viewingSignature} onOpenChange={(open) => !open && setViewingSignature(null)}>
        {viewingSignature && (
          <Box className="space-y-4">
            <Box>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-600" /> Proof of Acceptance
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {viewingSignature.projectTitle}
              </p>
            </Box>

            <Box className="space-y-2 text-sm">
              <Flex className="justify-between">
                <span className="text-muted-foreground">Signed by</span>
                <span className="font-medium text-foreground">{viewingSignature.signedName}</span>
              </Flex>
              <Flex className="justify-between">
                <span className="text-muted-foreground">Signed on</span>
                <span className="font-medium text-foreground">
                  {viewingSignature.approvedAt
                    ? format(new Date(viewingSignature.approvedAt), "MMM d, yyyy 'at' h:mm a")
                    : "—"}
                </span>
              </Flex>
              {viewingSignature.signedIp && (
                <Flex className="justify-between">
                  <span className="text-muted-foreground">IP address</span>
                  <span className="font-medium text-foreground font-mono text-xs">
                    {viewingSignature.signedIp}
                  </span>
                </Flex>
              )}
            </Box>

            {viewingSignature.signatureImage && (
              <Box>
                <p className="text-xs text-muted-foreground mb-1.5">Drawn signature</p>
                <Box className="border border-border rounded-lg bg-white p-2">
                  <img
                    src={viewingSignature.signatureImage}
                    alt="Client signature"
                    className="max-h-32 mx-auto"
                  />
                </Box>
              </Box>
            )}

            <Flex className="justify-end pt-2">
              <Button variant="outline" onClick={() => setViewingSignature(null)}>
                Close
              </Button>
            </Flex>
          </Box>
        )}
      </GeneralModal>
    </PageWrapper>
  );
};

export default OrgProposalsPage;
