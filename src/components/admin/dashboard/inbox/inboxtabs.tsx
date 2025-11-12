import { type Notification } from "@/providers/notifications.provider";
import { useInboxTabs, type Tabs } from "@/hooks/useinboxtabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flex } from "@/components/ui/flex";
import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const InboxTabs: FC<{
  children: (step: Tabs) => ReactNode;
  notifications: Notification[];
}> = ({ children, notifications }) => {
  const { tabRefs, stepperProps, tabs } = useInboxTabs();
  const { step, goToStep } = stepperProps;

  return (
    <>
      <Flex className="rounded-md bg-gray-100/50 border p-1 overflow-auto hidden-scroll">
        {tabs.map((tab, key) => (
          <Button
            key={key}
            onClick={() => goToStep(tab)}
            ref={(el) => (tabRefs.current[tab] = el)}
            className={cn(
              "text-black capitalize bg-transparent shadow-none hover:bg-transparent p-2 py-1.5 pr-1.5 size-fit!",
              tab === step && "shadow-sm bg-white"
            )}
          >
            {tab}
            <Badge
              className={cn(
                "ml-2 bg-gray-500 text-white",
                tab === "unread" && "bg-blue-500 text-white"
              )}
            >
              {tab === "all" && notifications.length}

              {tab === "unread" &&
                notifications.filter((n) => !n.isRead).length}

              {/* {tab === "tasks" &&
                notifications.filter((n) => n.type === "task").length}

              {tab === "issues" &&
                notifications.filter((n) => n.type === "issue").length} */}

              {tab === "message" &&
                notifications.filter((n) => n.type === "message").length}
            </Badge>
          </Button>
        ))}
      </Flex>
      {children(step)}
    </>
  );
};
