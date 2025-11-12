import { FC } from "react";
import { UniversalSupportTicket } from "@/components/common/UniversalSupportTicket";

export const SubAdminSupportTickets: FC = () => {
  return (
    <UniversalSupportTicket
      title="Support Tickets"
      description="Manage and resolve customer issues within your organization."
    />
  );
};
