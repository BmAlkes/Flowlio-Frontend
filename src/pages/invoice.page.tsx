import { ReadyToBill } from "@/components/invoices/ReadyToBill";
import { InvoiceHeader } from "@/components/invoices/invoiceheader";
import { Box } from "@/components/ui/box";
import { useDataScope } from "@/hooks/useDataScope";







const InvoicePage = () => {
  const scope = useDataScope();
  return (
    <Box className="px-2">
      <ReadyToBill />
      <InvoiceHeader key={scope} />
    </Box>
  );
};

export default InvoicePage;
