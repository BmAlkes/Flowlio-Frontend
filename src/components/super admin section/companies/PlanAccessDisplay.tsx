import { ComponentWrapper } from "@/components/common/componentwrapper";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import {
  Check,
  X,
  Users,
  FolderKanban,
  HardDrive,
  CheckSquare,
} from "lucide-react";
import { PlanFeatures } from "@/hooks/useGetCompanyDetails";

interface PlanAccessDisplayProps {
  planName: string;
  features: PlanFeatures | null | undefined;
}

export const PlanAccessDisplay: React.FC<PlanAccessDisplayProps> = ({
  planName,
  features,
}) => {
  if (!features) {
    return (
      <ComponentWrapper className="w-full bg-white border border-gray-200 shadow-none">
        <Box className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Plan Access & Features
          </h2>
          <p className="text-gray-500">No plan features configured</p>
        </Box>
      </ComponentWrapper>
    );
  }

  const formatStorage = (gb: number) => {
    if (gb >= 1000) return `${(gb / 1000).toFixed(1)} TB`;
    return `${gb} GB`;
  };

  const limits = [
    {
      icon: Users,
      label: "Maximum Users",
      value:
        features.maxUsers !== undefined && features.maxUsers > 0
          ? features.maxUsers
          : "Unlimited",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: FolderKanban,
      label: "Maximum Projects",
      value:
        features.maxProjects !== undefined && features.maxProjects > 0
          ? features.maxProjects
          : "Unlimited",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: HardDrive,
      label: "Maximum Storage",
      value:
        features.maxStorage !== undefined && features.maxStorage > 0
          ? formatStorage(features.maxStorage)
          : "Unlimited",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: CheckSquare,
      label: "Maximum Tasks per User",
      value:
        features.maxTasks !== undefined && features.maxTasks > 0
          ? features.maxTasks
          : "Unlimited",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const featureAccess = [
    {
      key: "aiAssist",
      label: "AI Assist",
      description: "AI-powered assistance features",
    },
    {
      key: "prioritySupport",
      label: "Priority Support",
      description: "Priority customer support",
    },
    {
      key: "calendarAccess",
      label: "Calendar Access",
      description: "Calendar and event management",
    },
    {
      key: "taskManagement",
      label: "Task Management",
      description: "Create and manage tasks",
    },
    {
      key: "timeTracking",
      label: "Time Tracking",
      description: "Track time and generate reports",
    },
  ];

  return (
    <ComponentWrapper className="w-full bg-white border border-gray-200 shadow-none">
      <Box className="p-6">
        <Flex className="justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Plan Access & Features
          </h2>
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
            {planName}
          </span>
        </Flex>

        <Stack className="gap-6">
          {/* Usage Limits Section */}
          <Box>
            <h3 className="text-md font-semibold mb-4 text-gray-700 flex items-center gap-2">
              <span>Usage Limits</span>
              <span className="text-xs font-normal text-gray-500">
                (What users can create)
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {limits.map((limit, index) => {
                const Icon = limit.icon;
                return (
                  <Flex
                    key={index}
                    className={`items-center gap-4 p-4 ${limit.bgColor} rounded-lg border border-gray-200 hover:shadow-sm transition-shadow`}
                  >
                    <div className={`p-2 rounded-lg bg-white ${limit.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Flex className="flex-col flex-1">
                      <span className="text-xs text-gray-600 mb-1">
                        {limit.label}
                      </span>
                      <span className="text-lg font-bold text-gray-800">
                        {limit.value}
                      </span>
                    </Flex>
                  </Flex>
                );
              })}
            </div>
          </Box>

          {/* Feature Access Section */}
          <Box>
            <h3 className="text-md font-semibold mb-4 text-gray-700 flex items-center gap-2">
              <span>Feature Access</span>
              <span className="text-xs font-normal text-gray-500">
                (What users can access)
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {featureAccess.map((feature) => {
                const isEnabled = features[feature.key] === true;
                return (
                  <Flex
                    key={feature.key}
                    className={`items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isEnabled
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    {isEnabled ? (
                      <div className="p-1.5 rounded-full bg-green-100">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-full bg-red-100">
                        <X className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                    <Flex className="flex-col flex-1">
                      <span
                        className={`text-sm font-medium ${
                          isEnabled ? "text-gray-800" : "text-gray-500"
                        }`}
                      >
                        {feature.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {feature.description}
                      </span>
                    </Flex>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        isEnabled
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </Flex>
                );
              })}
            </div>
          </Box>

          {/* Custom Features Section */}
          {features.customFeatures && features.customFeatures.length > 0 && (
            <Box>
              <h3 className="text-md font-semibold mb-3 text-gray-700">
                Custom Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {features.customFeatures.map(
                  (feature: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200 font-medium"
                    >
                      {feature}
                    </span>
                  )
                )}
              </div>
            </Box>
          )}
        </Stack>
      </Box>
    </ComponentWrapper>
  );
};
