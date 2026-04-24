import { FC } from "react";
import { UniversalSupportTicket } from "@/components/common/UniversalSupportTicket";
import { useTranslation } from "react-i18next";

export const SupportTicketsHeader: FC = () => {
  const { t } = useTranslation();
  return (
    <UniversalSupportTicket
      title={t("superadmin.support.title", "Support Tickets")}
      description={t("superadmin.support.subtitle", "Manage and resolve customer issues quickly and efficiently across all organizations.")}
    />
  );
};
