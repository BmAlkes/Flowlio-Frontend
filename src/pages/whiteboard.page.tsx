import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWhiteboard } from "@/features/whiteboards/api";
import { WhiteboardEditor } from "@/features/whiteboards/WhiteboardEditor";

export default function WhiteboardPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: board, isLoading, isError } = useWhiteboard(id);

  useEffect(() => { document.title = `${board?.title ?? t("whiteboards.title")} - Flowlio`; }, [board?.title, t]);

  if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" aria-label={t("whiteboards.loading")} /></div>;
  if (isError || !board) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p role="alert" className="font-medium">{t("whiteboards.notFound")}</p>
        <Button asChild variant="outline"><Link to="/dashboard/whiteboards">{t("whiteboards.back")}</Link></Button>
      </div>
    );
  }
  // Keyed by id so switching boards starts a fresh editor.
  return <WhiteboardEditor key={board.id} board={board} />;
}
