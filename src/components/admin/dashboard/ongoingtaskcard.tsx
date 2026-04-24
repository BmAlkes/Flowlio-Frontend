import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { Box, type BoxProps } from "@/components/ui/box";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Stack } from "@/components/ui/stack";
import { PanelLeftOpen } from "lucide-react";
import { Flex } from "@/components/ui/flex";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { type FC } from "react";
import { useTranslation } from "react-i18next";

interface OngoingTaskCardProps extends BoxProps {
  assignees: Array<{ src: string; userName: string }>;
  createdAt: string | undefined;
  createdBy: string;
  taskName: string;
  progress?: number;
}

export const OngoingTaskCard: FC<OngoingTaskCardProps> = ({
  createdAt,
  assignees,
  createdBy,
  className,
  taskName,
  progress = 0,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <Link to={"/dashboard/task-management"}>
      <Box
        className={cn(
          "bg-card/50 border border-border rounded-xl p-3",
          className
        )}
        {...props}
      >
        <Stack className="bg-muted p-4 rounded-md gap-6">
          <Flex className="justify-between flex-wrap">
            <Box className="bg-foreground p-2 rounded-full">
              <PanelLeftOpen className="text-background size-4" />
            </Box>
            <p className="text-sm bg-background border border-border rounded-full py-1 px-2.5">
              {createdAt}
            </p>
          </Flex>

          <h1 className="text-xl font-semibold capitalize">
            {taskName.substring(0, 26).concat("...")}
          </h1>
          <Flex>
            <p className="text-sm text-muted-foreground">{t("dashboard.createdBy")}</p>
            <p className="capitalize text-sm">{createdBy}</p>
          </Flex>
        </Stack>

        <Flex className="mt-6 justify-between">
          <Badge
            className="border-blue-600 text-blue-600 rounded-sm py-1.5 px-3"
            variant="outline"
          >
            <Box className="bg-blue-600 p-1 rounded-full"></Box>
            {t("dashboard.ongoing")}
          </Badge>

          <Flex className="-space-x-5">
            {assignees.map(({ src, userName }, key) => (
              <TooltipProvider key={key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="relative hover:z-1 border-2 border-background size-10">
                      <AvatarImage src={src} alt={userName} />
                      <AvatarFallback>{userName}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="capitalize">{userName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </Flex>
        </Flex>

        <Progress value={progress} className="w-full min-h-0.5 mt-6" />
        <Flex className="justify-between mb-2">
          <h5 className="text-muted-foreground text-sm">{t("dashboard.progress")}</h5>
          <p className="text-sm">{progress}%</p>
        </Flex>
      </Box>
    </Link>
  );
};
