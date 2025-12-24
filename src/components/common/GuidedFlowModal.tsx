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
}

export const GuidedFlowModal = ({
  open,
  onOpenChange,
  title,
  description,
  nextAction,
  onSkip,
}: GuidedFlowModalProps) => {
  const navigate = useNavigate();

  const handleNextAction = () => {
    onOpenChange(false);
    navigate(nextAction.route);
  };

  const handleSkip = () => {
    onOpenChange(false);
    onSkip?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <Box className="flex items-center gap-3 mb-2">
            <Box className="rounded-full bg-green-100 p-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </Box>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </Box>
          <DialogDescription className="text-base text-gray-600 pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <Box className="py-4">
          <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Suggested Next Step:
            </p>
            <p className="text-sm text-blue-700">{nextAction.label}</p>
            {nextAction.description && (
              <p className="text-xs text-blue-600 mt-1">
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
              Skip for now
            </Button>
            <Button
              onClick={handleNextAction}
              className="bg-[#1797B9] hover:bg-[#1797B9]/90 text-white flex-1 sm:flex-initial cursor-pointer"
            >
              {nextAction.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Flex>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
