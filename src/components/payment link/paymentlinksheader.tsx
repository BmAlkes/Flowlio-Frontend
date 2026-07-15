import { FC } from "react";
import { PageWrapper } from "../common/pagewrapper";
import { PaymentLinksTable } from "./paymentlinkstable";
import { Center } from "../ui/center";
import { Stack } from "../ui/stack";
import { Button } from "../ui/button";
import { CirclePlus } from "lucide-react";
import { useGeneralModalDisclosure } from "../common/generalmodal";
import { PaymentLinkFormModal } from "./paymentlinkformmodal";
import { PaymentLinkStatCards } from "./paymentlinkstatcards";
import { useFetchPaymentLinks } from "@/hooks/usefetchpaymentlinks";

const PaymentLinksHeader: FC = () => {
  const modalProps = useGeneralModalDisclosure();
  const { data: paymentLinksData } = useFetchPaymentLinks();

  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-foreground text-2xl max-sm:text-xl font-medium">
            Payment Links
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-muted-foreground`}>
            Simplify Transactions with Instant Payment Links
          </h1>
        </Stack>

        <Button
          onClick={() => modalProps.onOpenChange(true)}
          variant="outline"
          className="bg-black text-white border border-border  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
        >
          <CirclePlus className="size-5 text-white" />
          Create Links
        </Button>
      </Center>

      <PaymentLinkStatCards paymentLinks={paymentLinksData?.data ?? []} />

      <PaymentLinksTable />

      <PaymentLinkFormModal modalProps={modalProps} />
    </PageWrapper>
  );
};

export { PaymentLinksHeader };
