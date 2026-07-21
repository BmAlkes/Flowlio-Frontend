import { Button } from "@/components/ui/button";
import { RiSearch2Line } from "react-icons/ri";
import { OPEN_COMMAND_PALETTE_EVENT } from "@/components/common/GlobalCommandPalette";
import { useTranslation } from "react-i18next";

export const CommandPaletteTrigger: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="outline"
      className={`rounded-full h-[2.5rem] w-[200px] max-lg:w-full text-muted-foreground hover:bg-card! hover:text-muted-foreground border-none items-center justify-start gap-2 ${className ?? ""}`}
      onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))}
    >
      <RiSearch2Line />
      <span className="max-md:hidden flex-1 text-start">{t("horizontalnavbar.search")}</span>
      <kbd className="max-md:hidden text-[10px] font-mono border border-border rounded px-1.5 py-0.5 text-muted-foreground/70">
        ⌘K
      </kbd>
    </Button>
  );
};
