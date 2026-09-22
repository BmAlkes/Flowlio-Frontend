import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { GeneralModal, useGeneralModalDisclosure } from "@/components/common/generalmodal";
import { CirclePlus, LayoutGrid, List, Settings2, Webhook, Download, Tag, ContactRound } from "lucide-react";
import { LeadsPipeline } from "./LeadsPipeline";
import { LeadsTable } from "./LeadsTable";
import { CreateLeadDialog } from "./CreateLeadDialog";
import { LeadFieldsManager } from "./LeadFieldsManager";
import { LeadTagsManager } from "./LeadTagsManager";
import { useExportLeads } from "@/hooks/useLeadExtras";
import { toast } from "sonner";
import "./leads-layout.css";

export const LeadsHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "pipeline">("table");
  const [showCreate, setShowCreate] = useState(false);
  const fieldsModal = useGeneralModalDisclosure();
  const tagsModal = useGeneralModalDisclosure();
  const exportLeads = useExportLeads();

  return (
    <main className="leads-workspace">
      <header className="ld-heading">
        <div className="ld-heading-main">
          <span className="ld-heading-icon" aria-hidden="true"><ContactRound size={27} /></span>
          <div><h1>{t("leadsLayout.title")}</h1><p>{t("leadsLayout.description")}</p></div>
        </div>
        <Button className="ld-primary" onClick={() => setShowCreate(true)}><CirclePlus size={18} />{t("leadsLayout.newLead")}</Button>
      </header>
      <div className="ld-toolbar">
        <div className="ld-view-toggle" role="group" aria-label={t("leadsLayout.view")}>
          <Button variant="ghost" size="sm" aria-pressed={view === "table"} onClick={() => setView("table")}><List size={16} />{t("leadsLayout.table")}</Button>
          <Button variant="ghost" size="sm" aria-pressed={view === "pipeline"} onClick={() => setView("pipeline")}><LayoutGrid size={16} />{t("leadsLayout.pipeline")}</Button>
        </div>
        <div className="ld-tools">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/leads/webhooks")}><Webhook size={15} />Webhooks</Button>
          <Button variant="outline" size="sm" onClick={() => tagsModal.onOpenChange(true)}><Tag size={15} />{t("leadsLayout.tags")}</Button>
          <Button variant="outline" size="sm" onClick={() => fieldsModal.onOpenChange(true)}><Settings2 size={15} />{t("leadsLayout.fields")}</Button>
          <Button variant="outline" size="sm" disabled={exportLeads.isPending} onClick={() => exportLeads.mutate({}, {
            onSuccess: () => toast.success(t("leadsLayout.exported")),
            onError: error => toast.error(t("leadsLayout.exportError"), { description: error.message }),
          })}><Download size={15} />{t(`leadsLayout.${exportLeads.isPending ? "exporting" : "export"}`)}</Button>
        </div>
      </div>
      <div className="ld-content">{view === "table" ? <LeadsTable /> : <LeadsPipeline />}</div>
      <CreateLeadDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <GeneralModal {...fieldsModal}><div className="p-1"><LeadFieldsManager /></div></GeneralModal>
      <GeneralModal {...tagsModal} contentProps={{ className: "max-w-lg" }}><div className="p-1"><LeadTagsManager /></div></GeneralModal>
    </main>
  );
};
