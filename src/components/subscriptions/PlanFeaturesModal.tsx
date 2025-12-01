import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { CheckCircle } from "lucide-react";

interface PlanFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: string | number;
  planDescription?: string;
  features?: any[];
}

export const PlanFeaturesModal = ({
  isOpen,
  onClose,
  planName,
  planPrice,
  planDescription,
  features = [],
}: PlanFeaturesModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            {planName} Plan Features
          </DialogTitle>
          <DialogDescription className="text-base">
            <Box className="mt-2">
              <Box className="text-3xl font-bold text-[#1797B9] mb-1">
                ${planPrice}
              </Box>
              {planDescription && (
                <Box className="text-gray-600 mt-2">{planDescription}</Box>
              )}
            </Box>
          </DialogDescription>
        </DialogHeader>

        <Box className="mt-6">
          <Box className="text-lg font-semibold mb-4 text-gray-900">
            What's Included:
          </Box>
          {(() => {
            // Convert features to displayable array
            let displayFeatures: string[] = [];

            if (features) {
              // If features is an array
              if (Array.isArray(features)) {
                displayFeatures = features.map((f: any) =>
                  typeof f === "string" ? f : f.name || f.title || String(f)
                );
              }
              // If features is an object
              else if (typeof features === "object") {
                const featureObj = features as any;

                // Add limits
                if (featureObj.maxUsers) {
                  displayFeatures.push(
                    `Up to ${featureObj.maxUsers} user${
                      featureObj.maxUsers > 1 ? "s" : ""
                    }`
                  );
                }
                if (featureObj.maxProjects) {
                  displayFeatures.push(
                    `Up to ${featureObj.maxProjects} project${
                      featureObj.maxProjects > 1 ? "s" : ""
                    }`
                  );
                }
                if (featureObj.maxStorage) {
                  displayFeatures.push(`${featureObj.maxStorage} GB storage`);
                }
                if (featureObj.maxTasks) {
                  displayFeatures.push(
                    `Up to ${featureObj.maxTasks} task${
                      featureObj.maxTasks > 1 ? "s" : ""
                    } per user`
                  );
                }

                // Add boolean features
                if (featureObj.aiAssist) {
                  displayFeatures.push("AI Assist");
                }
                if (featureObj.prioritySupport) {
                  displayFeatures.push("Priority Support");
                }
                if (featureObj.calendarAccess) {
                  displayFeatures.push("Calendar Access");
                }
                if (featureObj.taskManagement) {
                  displayFeatures.push("Task Management");
                }
                if (featureObj.timeTracking) {
                  displayFeatures.push("Time Tracking");
                }

                // Add custom features if they exist
                if (
                  featureObj.customFeatures &&
                  Array.isArray(featureObj.customFeatures)
                ) {
                  displayFeatures.push(...featureObj.customFeatures);
                }
              }
            }

            return displayFeatures.length > 0 ? (
              <Stack className="gap-3">
                {displayFeatures.map((feature: string, index: number) => (
                  <Box
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <Box className="text-gray-700">{feature}</Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box className="text-gray-500 text-center py-8">
                No features available for this plan.
              </Box>
            );
          })()}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
