import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ComponentWrapper } from "@/components/common/componentwrapper";
import { Flex } from "@/components/ui/flex";
import { Box } from "@/components/ui/box";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

import { Stack } from "@/components/ui/stack";
import { CircularProgress } from "@/components/ui/circularprogress";
import { Center } from "@/components/ui/center";

export type Stat = {
  icon: string;
  title: string;
  count: string;
  description: string;
  link: string;
};

export const Stats: FC<{
  className?: string;
  classNameDescription?: string;
  stats: Stat[];
  isSuperAdmin?: boolean;
  isViewer?: boolean;
  activeTimeData?: {
    elapsedTime: string; // formatted time like "1h 30m 45s"
    elapsedSeconds: number; // for circular progress calculation
    progressPercentage: number;
  };
  totalProductionHours?: number;
}> = ({
  classNameDescription,
  className,
  stats,
  isSuperAdmin,
  isViewer,
  activeTimeData,
  totalProductionHours = 0,
}) => {
  const { t } = useTranslation();
  const pathname = useLocation();
  return (
    <Box
      className={cn(
        "grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {stats.map((item, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <ComponentWrapper
                key={index}
                className={cn(
                  "px-2.5 py-3 relative overflow-hidden cursor-pointer",
                  index !== 3 || (isViewer && "bg-[#d5f6fc]")
                )}
              >
                <Link to={item.link} className="flex flex-col">
                  {pathname.pathname === "/viewer" && index === 3 ? (
                    <Flex className="flex-row items-center justify-between w-full gap-2">
                      <Center className="flex-col flex-1 items-start gap-4">
                        <Stack className="gap-0">
                          <h2 className="font-medium text-left">
                            {item.title}
                          </h2>
                          <p
                            className={cn(
                              "font-light text-gray-500 text-sm text-left",
                              classNameDescription
                            )}
                          >
                            {item.description}
                          </p>
                        </Stack>
                        <Box className="bg-black w-38 text-white p-2 rounded-sm text-xs font-light mt-2">
                          {t("dashboard.totalProduction")} :{" "}
                          {totalProductionHours.toFixed(1)}{" "}
                          {t("dashboard.hoursAbbreviation")}
                        </Box>
                      </Center>
                      <div className="flex flex-col">
                        <CircularProgress
                          value={activeTimeData?.progressPercentage ?? 0}
                          time={activeTimeData?.elapsedTime ?? "0:00:00"}
                          label={t("dashboard.totalHours")}
                        />
                      </div>
                    </Flex>
                  ) : (
                    <>
                      <Flex className="justify-between items-center">
                        <Stack className="gap-0">
                          <h2 className=" font-medium">{item.title}</h2>
                          <p
                            className={cn(
                              "font-light text-gray-500 text-sm",
                              classNameDescription
                            )}
                          >
                            {item.description}
                          </p>
                        </Stack>
                        <img
                          src={item.icon}
                          className="size-10"
                          alt={item.title}
                        />
                      </Flex>
                      <p className="text-2xl font-bold mt-5">
                        {item.count}{" "}
                        {index === 2 && (
                          <span
                            className={cn(
                              "text-gray-400 font-light",
                              (isSuperAdmin || isViewer) && "hidden"
                            )}
                          >
                            {t("dashboard.hoursAbbreviation")}
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </Link>

                {pathname.pathname === "/viewer" && index === 3 && null}
              </ComponentWrapper>
            </TooltipTrigger>
            <TooltipContent className="mb-2">
              <p>{t("dashboard.clickToView", { title: item.title })}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </Box>
  );
};
