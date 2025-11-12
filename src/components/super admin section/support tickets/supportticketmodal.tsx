import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Calendar,
  User,
  Building,
  Clock,
  AlertTriangle,
  CheckCircle,
  Tag,
  FileText,
  ArrowLeft,
  Archive,
  Star,
  MessageSquare,
} from "lucide-react";
import type { UniversalSupportTicket } from "@/hooks/useUniversalSupportTickets";
import { GeneralModal } from "@/components/common/generalmodal";

interface SupportTicketModalProps {
  ticket: UniversalSupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onCloseTicket?: (id: string) => void;
}

export const SupportTicketModal = ({
  ticket,
  isOpen,
  onClose,
  onCloseTicket,
}: SupportTicketModalProps) => {
  if (!ticket) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <Archive className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleCloseTicket = () => {
    if (onCloseTicket) {
      onCloseTicket(ticket.id);
      onClose();
    }
  };

  return (
    <GeneralModal
      open={isOpen}
      onOpenChange={onClose}
      contentProps={{
        className:
          "max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0 w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw]",
      }}
    >
      <Box className="space-y-4">
        <Flex className="items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Support Ticket #{ticket.ticketNumber}
          </h2>
        </Flex>

        {/* Header Info */}
        <Flex className="items-center gap-4 flex-wrap">
          <Badge className={`${getPriorityColor(ticket.priority)} border`}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            {ticket.priority} Priority
          </Badge>
          <Badge className={`${getStatusColor(ticket.status)} border`}>
            {getStatusIcon(ticket.status)}
            <span className="ml-1 capitalize">{ticket.status}</span>
          </Badge>
          <Flex className="items-center gap-1 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            Created {format(ticket.createdon, "MMM dd, yyyy 'at' h:mm a")}
          </Flex>
        </Flex>

        <Separator />

        {/* Ticket Details */}
        <Box className="space-y-4">
          {/* Subject */}
          <Box className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              {ticket.subject}
            </h3>
            <Box className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed text-sm">
                Description:
              </p>
              <p className="text-gray-700 leading-relaxed text-sm">
                {ticket.description}
              </p>
            </Box>
          </Box>

          {/* Info Grid */}
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <Box className="space-y-4">
              <Flex className="items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <Box className="p-2 bg-blue-600 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </Box>
                <Box className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Submitted By
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    {ticket.submittedbyName}
                  </p>
                </Box>
              </Flex>

              <Flex className="items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                <Box className="p-2 bg-green-600 rounded-lg">
                  <Building className="w-5 h-5 text-white" />
                </Box>
                <Box>
                  <p className="text-sm font-semibold text-gray-900">Client</p>
                  <p className="text-sm text-gray-700">{ticket.client}</p>
                </Box>
              </Flex>

              <Flex className="items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <Box className="p-2 bg-purple-600 rounded-lg">
                  <Tag className="w-5 h-5 text-white" />
                </Box>
                <Box>
                  <p className="text-sm font-semibold text-gray-900">
                    Assigned To
                  </p>
                  <p className="text-sm text-gray-700">
                    {ticket.assignedUser?.name ||
                      ticket.assignedOrganization?.name ||
                      ticket.assignedto ||
                      "Unassigned"}
                  </p>
                  {/* {ticket.assignedUser?.email && (
                    <p className="text-xs text-gray-500 mt-1">
                      {ticket.assignedUser.email}
                    </p>
                  )} */}
                </Box>
              </Flex>
            </Box>

            {/* Right Column */}
            <Box className="space-y-4">
              <Flex className="items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                <Box className="p-2 bg-orange-600 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </Box>
                <Box>
                  <p className="text-sm font-semibold text-gray-900">
                    Last Updated
                  </p>
                  <p className="text-[11.5px] text-gray-700">
                    {format(ticket.updatedAt, "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </Box>
              </Flex>

              <Flex className="items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                <Box className="p-2 bg-indigo-600 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </Box>
                <Box>
                  <p className="text-sm font-semibold text-gray-900">
                    Ticket ID
                  </p>
                  <p className="text-sm text-gray-700 font-mono">
                    #{ticket.ticketNumber}
                  </p>
                </Box>
              </Flex>

              <Flex className="items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                <Box className="p-2 bg-yellow-600 rounded-lg">
                  <Star className="w-5 h-5 text-white" />
                </Box>
                <Box>
                  <p className="text-sm font-semibold text-gray-900">
                    Category
                  </p>
                  <p className="text-sm text-gray-700">Technical Support</p>
                </Box>
              </Flex>
            </Box>
          </Box>

          {/* User Information Section */}
          <Box className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Ticket Creator Information
            </h4>
            <Box className="bg-white p-3 rounded-lg border border-blue-200">
              <Flex className="items-center gap-3 mb-2">
                <Box className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </Box>
                <Box>
                  <p className="text-sm font-semibold text-gray-900">
                    {ticket.submittedbyName || ""}
                  </p>
                  <p className="text-xs text-gray-500">Ticket Creator</p>
                </Box>
              </Flex>
              <Box className="space-y-1 text-xs text-gray-600">
                <p>
                  <span className="font-medium">User ID:</span>{" "}
                  {ticket.submittedby.slice(0, 5)}
                </p>
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 capitalize">
                    {ticket.submittedbyRole || "User"}
                  </span>
                </p>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Separator />

          <Flex className="justify-between items-center">
            <Flex className="gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to List
              </Button>
            </Flex>

            <Flex className="gap-2">
              {ticket.status === "open" && (
                <Button
                  variant="outline"
                  onClick={handleCloseTicket}
                  className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <Archive className="w-4 h-4" />
                  Close Ticket
                </Button>
              )}
            </Flex>
          </Flex>
        </Box>
      </Box>
    </GeneralModal>
  );
};
