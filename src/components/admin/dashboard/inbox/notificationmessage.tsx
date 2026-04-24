import { format } from "date-fns";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckSquare } from "lucide-react";

interface NotificationMessageProps {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: "task" | "issue" | "message" | "system";
  sender?: string;
}

export const NotificationMessage: React.FC<NotificationMessageProps> = ({
  title,
  message,
  timestamp,
  isRead,
  type,
  sender,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-blue-100 text-blue-800";
      case "issue":
        return "bg-red-100 text-red-800";
      case "message":
        return "bg-green-100 text-green-800";
      default:
        return "bg-muted text-gray-800";
    }
  };

  return (
    <Box
      className={`p-4 border rounded-lg ${!isRead ? "bg-blue-50" : "bg-card"}`}
    >
      <Flex className="justify-between items-start gap-4">
        <Box className="flex-1">
          <Flex className="items-center gap-2 mb-1">
            <Badge className={`${getTypeColor(type)} capitalize`}>{type}</Badge>
            {!isRead && <Badge className="bg-blue-500 text-white">New</Badge>}
          </Flex>

          <h3 className="text-lg font-medium mb-1">{title}</h3>

          {sender && (
            <p className="text-sm text-muted-foreground mb-1">From: {sender}</p>
          )}

          <p className="text-muted-foreground mb-2">{message}</p>

          <p className="text-sm text-muted-foreground">
            {format(timestamp, "MMM dd, yyyy HH:mm")}
          </p>
        </Box>

        <Flex className="gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-blue-600"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
