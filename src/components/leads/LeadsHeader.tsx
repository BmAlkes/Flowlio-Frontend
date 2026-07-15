import { useState } from "react";
import { useNavigate } from "react-router";
import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { GeneralModal, useGeneralModalDisclosure } from "@/components/common/generalmodal";
import { CirclePlus, LayoutGrid, List, Settings2, Webhook, Download, Tag } from "lucide-react";
import { LeadsPipeline } from "./LeadsPipeline";
import { LeadsTable } from "./LeadsTable";
import { CreateLeadDialog } from "./CreateLeadDialog";
import { LeadFieldsManager } from "./LeadFieldsManager";
import { LeadTagsManager } from "./LeadTagsManager";
import { useExportLeads } from "@/hooks/useLeadExtras";
import { toast } from "sonner";

export const LeadsHeader = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "pipeline">("table");
  const [showCreate, setShowCreate] = useState(false);
  const fieldsModal = useGeneralModalDisclosure();
  const tagsModal = useGeneralModalDisclosure();
  const exportLeads = useExportLeads();

  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-foreground text-3xl max-sm:text-xl font-medium">Leads</h1>
          <p className="text-muted-foreground max-sm:text-sm max-w-[600px]">
            Manage your prospective clients through the sales pipeline
          </p>
        </Stack>

        <Flex className="gap-2 items-center flex-wrap">
          {/* View Toggle */}
          <Box className="bg-muted/50 p-1 rounded-full border border-border flex items-center me-2">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full h-8 px-4 flex items-center gap-2 ${view === "table" ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600" : "text-muted-foreground"}`}
              onClick={() => setView("table")}
            >
              <List className="w-4 h-4" />
              <span className="text-xs font-medium">Table</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full h-8 px-4 flex items-center gap-2 ${view === "pipeline" ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600" : "text-muted-foreground"}`}
              onClick={() => setView("pipeline")}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-xs font-medium">Pipeline</span>
            </Button>
          </Box>

          <Button
            variant="outline"
            className="rounded-full px-5 py-5 flex items-center gap-2 text-sm"
            onClick={() => navigate("/dashboard/leads/webhooks")}
          >
            <Webhook className="w-4 h-4" />
            Webhooks
          </Button>

          <Button
            variant="outline"
            className="rounded-full px-5 py-5 flex items-center gap-2 text-sm"
            onClick={() => tagsModal.onOpenChange(true)}
          >
            <Tag className="w-4 h-4" />
            Tags
          </Button>

          <Button
            variant="outline"
            className="rounded-full px-5 py-5 flex items-center gap-2 text-sm"
            onClick={() => {
              exportLeads.mutate({}, {
                onSuccess: () => toast.success("Leads exported successfully"),
                onError: (e) => toast.error("Export failed", { description: e.message }),
              });
            }}
            disabled={exportLeads.isPending}
          >
            <Download className="w-4 h-4" />
            {exportLeads.isPending ? "Exporting…" : "Export"}
          </Button>

          <Button
            variant="outline"
            className="bg-black text-white border border-border rounded-full px-5 py-5 flex items-center gap-2 hover:bg-muted/50"
            onClick={() => fieldsModal.onOpenChange(true)}
          >
            <Settings2 className="w-4 h-4" />
            Custom Fields
          </Button>

          <Button
            className="rounded-full px-5 py-5 flex items-center gap-2"
            onClick={() => setShowCreate(true)}
          >
            <CirclePlus className="w-5 h-5" />
            New Lead
          </Button>
        </Flex>
      </Center>

      <Box className="px-4">
        {view === "table" ? <LeadsTable /> : <LeadsPipeline />}
      </Box>

      <CreateLeadDialog open={showCreate} onClose={() => setShowCreate(false)} />

      <GeneralModal {...fieldsModal}>
        <Box className="p-1">
          <LeadFieldsManager />
        </Box>
      </GeneralModal>

      <GeneralModal {...tagsModal} contentProps={{ className: "max-w-lg" }}>
        <Box className="p-1">
          <LeadTagsManager />
        </Box>
      </GeneralModal>
    </PageWrapper>
  );
};
