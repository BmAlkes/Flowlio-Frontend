import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { Flex } from "../ui/flex";
import { useTranslation } from "react-i18next";

interface GuidedFlowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  nextAction: {
    label: string;
    route: string;
    description?: string;
  };
  onSkip?: () => void;
  skipLabel?: string;
}

export const GuidedFlowModal = ({
  open,
  onOpenChange,
  title,
  description,
  nextAction,
  onSkip,
  skipLabel,
}: GuidedFlowModalProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNextAction = () => {
    onOpenChange(false);
    navigate(nextAction.route);
  };

  const handleSkip = () => {
    onOpenChange(false);
    onSkip?.();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { onOpenChange(value); if (!value) onSkip?.(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <Box className="flex items-center gap-3 mb-2">
            <Box className="rounded-full bg-emerald-500/10 p-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </Box>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </Box>
          <DialogDescription className="text-base text-muted-foreground pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <Box className="py-4">
          <Box className="bg-sky-500/5 border border-sky-500/20 rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-1">
              {t("firstWork.nextStep")}
            </p>
            <p className="text-sm text-[#11718c] dark:text-[#55bdd9]">{nextAction.label}</p>
            {nextAction.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {nextAction.description}
              </p>
            )}
          </Box>
        </Box>

        <DialogFooter>
          <Flex className="flex-1 justify-end sm:flex-initial gap-2 max-sm:flex-col w-full">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1 sm:flex-initial cursor-pointer"
            >
              {skipLabel ?? t("firstWork.notNow")}
            </Button>
            <Button
              onClick={handleNextAction}
              className="bg-[#1797B9] hover:bg-[#1797B9]/90 text-white flex-1 sm:flex-initial cursor-pointer"
            >
              {nextAction.label}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Button>
          </Flex>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
