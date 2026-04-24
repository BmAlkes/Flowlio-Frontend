import { ComponentWrapper } from "@/components/common/componentwrapper";
import { Box, type BoxProps } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import type { FC } from "react";
import { useFetchOrganizationActivities } from "@/hooks/useFetchOrganizationActivities";
// import { useDeleteActivity } from "@/hooks/useDeleteActivity";
import { formatDistanceToNow } from "date-fns";
import { Center } from "@/components/ui/center";
import { useTranslation } from "react-i18next";
import { ListSkeleton } from "@/components/skeletons";

export const RecentActivities: FC<BoxProps> = ({ className, ...props }) => {
  const { t } = useTranslation();
  const { data: activitiesResponse, isLoading, isFetching } =
    useFetchOrganizationActivities();
  // const { mutate: deleteActivity } = useDeleteActivity();

  const activitiesContent = activitiesResponse?.data?.activities || [];
  const loading = isLoading || isFetching;

  return (
    <ComponentWrapper className={cn("rounded-lg", className)} {...props}>
      <Stack className="p-3 relative overflow-hidden">
        <Flex className="justify-between items-center mb-2">
          <h1 className="text-lg font-medium">
            {" "}
            {t("dashboard.recentActivities")}
          </h1>
          {/* Clear All Activities button - Commented out as requested */}
          {/* {activitiesContent.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 border-red-200 text-xs"
              onClick={() => {
                activitiesContent.forEach((activity) => {
                  deleteActivity({
                    id: activity.id,
                    source: "recent",
                  });
                });
                toast.success("Clearing all activities...");
              }}
              disabled={isLoading}
            >
              Clear All Activities
            </Button>
          )} */}
        </Flex>

        <Box className="w-full h-0.5 bg-muted rounded-full absolute top-14 left-0"></Box>
        <Box className="max-h-[21rem] overflow-auto scroll space-y-5 mt-5">
          {loading ? (
            <ListSkeleton rows={5} />
          ) : activitiesContent.length > 0 ? (
            activitiesContent.map(({ id, activity, date, user }) => {
              const dateObj = typeof date === "string" ? new Date(date) : date;
              const timeAgo = formatDistanceToNow(dateObj, { addSuffix: true });

              return (
                <Link key={id} to={"#"} className="group block">
                  <Flex className="items-start pl-1">
                    <Box className="size-2.5 group-hover:size-3.5 transition-all ease-in border outline outline-slate-300 group-hover:outline-slate-400 outline-offset-1 bg-slate-200 group-hover:bg-primary rounded-full mt-[6.5px]" />
                    <Stack className="gap-0">
                      <Flex>
                        <h2 className="font-medium text-[13px]">{user}</h2>
                        <p className="text-xs text-slate-500 ml-2">{timeAgo}</p>
                      </Flex>
                      <p className="text-sm text-slate-500 group-hover:text-foreground">
                        {activity}
                      </p>
                    </Stack>
                  </Flex>
                </Link>
              );
            })
          ) : (
            <Center className="py-8">
              <p className="text-sm text-muted-foreground">
                {t("dashboard.noRecentActivities")}
              </p>
            </Center>
          )}
        </Box>
      </Stack>
    </ComponentWrapper>
  );
};
