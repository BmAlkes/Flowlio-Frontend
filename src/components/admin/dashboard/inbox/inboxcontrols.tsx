import { useGlobalNotifications } from "@/providers/notifications.provider";
import { ComponentWrapper } from "@/components/common/componentwrapper";
import { Trash2, RefreshCcw, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { Box } from "@/components/ui/box";

export const InboxControls = () => {
  const { markAllAsRead, clearAll } = useGlobalNotifications();

  return (
    <ComponentWrapper className="mt-6 p-5 shadow-none">
      <Flex className="justify-between max-md:flex-col max-md:items-start">
        <Box>
          <h1 className="text-3xl font-medium capitalize">Inbox</h1>
          <p className="text-gray-500 mt-1 max-md:text-sm">
            Manage and track all your notifications and messages in one place.
          </p>
        </Box>

        <Flex className="gap-2 max-md:mt-4">
          <Button variant="outline" size="sm" className="text-gray-600">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600"
            onClick={markAllAsRead}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border border-red-300"
            onClick={clearAll}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </Flex>
      </Flex>
    </ComponentWrapper>
  );
};
