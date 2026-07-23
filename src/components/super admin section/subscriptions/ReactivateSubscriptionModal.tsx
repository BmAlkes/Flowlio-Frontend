import { FC, useState } from "react";
import { GeneralModal } from "@/components/common/generalmodal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Box } from "@/components/ui/box";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useReactivateSubscription } from "@/hooks/usereactivatesubscription";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReactivateSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  companyName: string;
  onReactivated?: () => void;
}

export const ReactivateSubscriptionModal: FC<
  ReactivateSubscriptionModalProps
> = ({ open, onOpenChange, subscriptionId, companyName, onReactivated }) => {
  const [notes, setNotes] = useState("");
  const reactivateSubscription = useReactivateSubscription();

  const handleReactivate = async () => {
    try {
      await reactivateSubscription.mutateAsync({
        subscriptionId,
        data: {
          paymentCollected: true,
          paymentMethod: "Manual",
          notes: notes.trim() || undefined,
        },
      });
      toast.success("Subscription reactivated successfully");
      onReactivated?.();
      onOpenChange(false);
      setNotes("");
    } catch (err: any) {
      toast.error("Failed to reactivate subscription", {
        description:
          err?.response?.data?.message || err?.message || "Unknown error",
      });
    }
  };

  return (
    <GeneralModal
      open={open}
      onOpenChange={onOpenChange}
      contentProps={{ className: "max-w-md" }}
    >
      <DialogHeader>
        <DialogTitle>Reactivate Subscription</DialogTitle>
        <DialogDescription>
          This will reactivate the subscription for <strong>{companyName}</strong>{" "}
          and extend the period by one billing cycle. Only do this after
          confirming payment was received.
        </DialogDescription>
      </DialogHeader>

      <Box className="py-4">
        <Label htmlFor="reactivate-notes" className="text-sm font-medium mb-1.5 block">
          Notes (Optional)
        </Label>
        <Textarea
          id="reactivate-notes"
          placeholder="Add any notes about this reactivation..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </Box>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={reactivateSubscription.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleReactivate}
          disabled={reactivateSubscription.isPending}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {reactivateSubscription.isPending && (
            <Loader2 className="h-4 w-4 me-2 animate-spin" />
          )}
          Reactivate
        </Button>
      </DialogFooter>
    </GeneralModal>
  );
};
