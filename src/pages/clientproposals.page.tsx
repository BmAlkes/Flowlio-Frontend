import { useState } from "react";
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
import { Download, CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ProposalPDF, type ProposalData } from "@/components/ai assist/ProposalPDF";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Proposal {
  id: string;
  projectTitle: string;
  clientName: string;
  companyName: string;
  status: "pending" | "approved" | "rejected";
  proposalData: ProposalData;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "text-white bg-[#F98618] rounded-full",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "text-white bg-[#00A400] rounded-full",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "text-white bg-[#EF5350] rounded-full",
    icon: XCircle,
  },
};

const ClientProposalsPage = () => {
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["client-proposals"],
    queryFn: async () => {
      const res = await axios.get("/proposals/client");
      return res.data?.data as Proposal[];
    },
  });

  const proposals = data || [];

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.put(`/proposals/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-proposals"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.put(`/proposals/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-proposals"] });
    },
  });

  const handleDownload = async (proposal: Proposal) => {
    setDownloadingId(proposal.id);
    try {
      const pdfData: ProposalData = {
        ...proposal.proposalData,
        projectTitle: proposal.projectTitle,
        clientName: proposal.clientName,
        companyName: proposal.companyName,
        generatedAt: proposal.createdAt,
      };
      const blob = await pdf(<ProposalPDF data={pdfData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `proposal-${proposal.projectTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const columns: ColumnDef<Proposal>[] = [
    {
      accessorKey: "projectTitle",
      header: () => <Box className="text-center text-foreground">Project</Box>,
      cell: ({ row }) => (
        <Box className="text-center font-medium">{row.original.projectTitle}</Box>
      ),
    },
    {
      accessorKey: "companyName",
      header: () => <Box className="text-center text-foreground">From</Box>,
      cell: ({ row }) => (
        <Box className="text-center text-muted-foreground">
          {row.original.companyName || "—"}
        </Box>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => <Box className="text-center text-foreground">Received</Box>,
      cell: ({ row }) => (
        <Box className="text-center text-sm">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </Box>
      ),
    },
    {
      accessorKey: "status",
      header: () => <Box className="text-center text-foreground">Status</Box>,
      cell: ({ row }) => {
        const cfg = statusConfig[row.original.status] || statusConfig.pending;
        const Icon = cfg.icon;
        return (
          <Center>
            <Box
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold ${cfg.className}`}
            >
              <Icon className="w-3 h-3" />
              {cfg.label}
            </Box>
          </Center>
        );
      },
    },
    {
      id: "actions",
      header: () => <Box className="text-center text-foreground">Actions</Box>,
      cell: ({ row }) => {
        const proposal = row.original;
        const isPending = proposal.status === "pending";
        const isApprovingThis = approveMutation.isPending && approveMutation.variables === proposal.id;
        const isRejectingThis = rejectMutation.isPending && rejectMutation.variables === proposal.id;
        const isDownloadingThis = downloadingId === proposal.id;

        return (
          <Center className="gap-2">
            {/* Download PDF */}
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
                <TooltipContent>Download PDF</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Approve */}
            {isPending && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-[#00A400] hover:bg-green-700 border-none w-9 h-9 p-0 rounded-md"
                      onClick={() => approveMutation.mutate(proposal.id)}
                      disabled={isApprovingThis || isRejectingThis}
                    >
                      {isApprovingThis ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <CheckCircle2 className="text-white w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Approve Proposal</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Center>
        );
      },
    },
  ];

  return (
    <PageWrapper className="mt-6">
      <Stack className="gap-1 p-6 mb-6">
        <Box className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#0c89af]/10">
            <FileText className="w-5 h-5 text-[#0c89af]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">My Proposals</h1>
            <p className="text-muted-foreground text-sm">
              Review and approve proposals sent to you by the agency.
            </p>
          </div>
        </Box>
      </Stack>

      {isLoading ? (
        <Box className="flex justify-center p-10 text-muted-foreground">Loading proposals...</Box>
      ) : proposals.length === 0 ? (
        <Box className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <FileText className="w-12 h-12 opacity-30" />
          <p className="text-base font-medium">No proposals yet</p>
          <p className="text-sm text-center max-w-xs">
            When your agency sends you a proposal, it will appear here for you to review.
          </p>
        </Box>
      ) : (
        <Box className="rounded-xl border border-border overflow-hidden">
          <ReusableTable
            data={proposals}
            columns={columns}
            searchClassName="rounded-full"
            filterClassName="rounded-full"
          />
        </Box>
      )}
    </PageWrapper>
  );
};

export default ClientProposalsPage;
