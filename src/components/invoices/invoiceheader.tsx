import { FC, useState, useCallback } from "react";
import { PageWrapper } from "../common/pagewrapper";
import { Center } from "../ui/center";
import { Stack } from "../ui/stack";
import { Box } from "../ui/box";
import { InvoiceTable } from "./invoicetable";
import { RecurringInvoiceTable } from "./recurringinvoicetable";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown, CirclePlus, Receipt, Repeat } from "lucide-react";
import { Button } from "../ui/button";
import { InvoiceCreationModal } from "./invoicecreationmodal";
import { Invoice } from "@/hooks/usefetchinvoices";
import { toast } from "sonner";
import { useGenerateInvoicePDF } from "@/hooks/usegenerateinvoicepdf";
import { useUser } from "@/providers/user.provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export const InvoiceHeader: FC = () => {
  const { data: userData } = useUser();
  const isClient = userData?.user?.role === "client";
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [tableState, setTableState] = useState<{
    selectedRows: Invoice[];
    currentPageRows: Invoice[];
    selectedRowIds: string[];
  }>({
    selectedRows: [],
    currentPageRows: [],
    selectedRowIds: [],
  });

  const { generatePDF } = useGenerateInvoicePDF();

  const handleTableStateChange = useCallback(
    (state: {
      selectedRows: Invoice[];
      currentPageRows: Invoice[];
      selectedRowIds: string[];
    }) => {
      setTableState(state);
    },
    []
  );

  const handleCreateInvoice = () => {
    setIsCreateModalOpen(true);
  };

  const handleExportSelected = async () => {
    if (tableState.selectedRows.length === 0) {
      toast.error("Please select at least one invoice to export");
      return;
    }

    const result = await generatePDF({
      invoices: tableState.selectedRows,
      exportType: "selected",
    });

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleExportCurrentPage = async () => {
    if (tableState.currentPageRows.length === 0) {
      toast.error("No invoices on current page to export");
      return;
    }

    const result = await generatePDF({
      invoices: tableState.currentPageRows,
      exportType: "currentPage",
    });

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-foreground text-2xl max-sm:text-xl font-medium">
            Invoices
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-muted-foreground`}>
            {activeTab === "all" 
              ? "View and Download All Generated Invoices with Ease"
              : "Manage and Monitor Your Automated Recurring Billing Templates"}
          </h1>
        </Stack>

        {!isClient && (
          <Center className="gap-3">
            <Button
              onClick={handleCreateInvoice}
              className="bg-[#1797b9] hover:bg-[#1797b9]/80 text-white rounded-full px-6 py-4 flex items-center gap-2"
            >
              <CirclePlus className="w-4 h-4" />
              {activeTab === "all" ? "Create Invoice" : "Create Template"}
            </Button>
            {activeTab === "all" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Center className="bg-black text-white cursor-pointer hover:bg-black/80 hover:text-white rounded-full w-36 h-10 justify-between items-center">
                    <h1 className="text-[14px] px-4">Export</h1>
                    <Center className="bg-[#3e3e3f] rounded-tr-full rounded-br-full h-10 w-10">
                      <ChevronDown className="size-4" />
                    </Center>
                  </Center>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="p-1">
                  <DropdownMenuCheckboxItem
                    className="p-2 cursor-pointer"
                    onClick={handleExportSelected}
                    disabled={tableState.selectedRows.length === 0}
                  >
                    Export Selected ({tableState.selectedRows.length})
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="p-2 cursor-pointer"
                    onClick={handleExportCurrentPage}
                    disabled={tableState.currentPageRows.length === 0}
                  >
                    Export Current Page ({tableState.currentPageRows.length})
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </Center>
        )}
      </Center>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Box className="px-4 mb-6">
          <TabsList className="bg-gray-100/50 p-1 rounded-full border border-border">
            <TabsTrigger 
              value="all" 
              className="rounded-full px-6 flex items-center gap-2 data-[state=active]:bg-[#1797b9] data-[state=active]:text-white"
            >
              <Receipt className="size-4" />
              All Invoices
            </TabsTrigger>
            {!isClient && (
              <TabsTrigger 
                value="recurring" 
                className="rounded-full px-6 flex items-center gap-2 data-[state=active]:bg-[#1797b9] data-[state=active]:text-white"
              >
                <Repeat className="size-4" />
                Recurring Templates
              </TabsTrigger>
            )}
          </TabsList>
        </Box>

        <TabsContent value="all" className="mt-0 outline-none">
          <InvoiceTable onTableStateChange={handleTableStateChange} />
        </TabsContent>

        {!isClient && (
          <TabsContent value="recurring" className="mt-0 outline-none">
            <RecurringInvoiceTable />
          </TabsContent>
        )}
      </Tabs>

      <InvoiceCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </PageWrapper>
  );
};
