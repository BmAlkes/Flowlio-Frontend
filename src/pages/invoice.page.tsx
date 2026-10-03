import { ReadyToBill } from "@/components/invoices/ReadyToBill";
import { InvoiceHeader } from "@/components/invoices/invoiceheader";
import { Box } from "@/components/ui/box";







const InvoicePage = () => {
  return (
    <Box className="px-2">
      <ReadyToBill />
      <InvoiceHeader />
    </Box>
  );
};

export default InvoicePage;
