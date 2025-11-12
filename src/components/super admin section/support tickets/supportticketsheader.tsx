import { FC } from "react";
import { UniversalSupportTicket } from "@/components/common/UniversalSupportTicket";

export const SupportTicketsHeader: FC = () => {
  return (
    <UniversalSupportTicket
      title="Support Tickets"
      description="Manage and resolve customer issues quickly and efficiently across all organizations."
    />
  );
};
