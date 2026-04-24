import { GeneralModal } from "../common/generalmodal";
import { TicketThread } from "./ticketthread";
import { Box } from "../ui/box";
import { Badge } from "../ui/badge";
import { Flex } from "../ui/flex";
import { 
  getPriorityColor, 
  getStatusColor, 
  type UniversalSupportTicket 
} from "@/hooks/useUniversalSupportTickets";
import { format } from "date-fns";
import { Hash, Calendar, Circle, AlertCircle } from "lucide-react";

interface SupportChatModalProps {
  ticket: UniversalSupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SupportChatModal = ({ ticket, isOpen, onClose }: SupportChatModalProps) => {
  if (!ticket) return null;

  return (
    <GeneralModal open={isOpen} onOpenChange={onClose} contentProps={{ className: "max-w-3xl" }}>
      <Box className="space-y-4">
        <Flex className="flex-col gap-1 border-b border-border pb-4 pr-10">
          <Flex className="items-center justify-between w-full">
            <Flex className="items-center gap-2">
              <Hash className="size-4 text-blue-500" />
              <span className="text-sm font-bold text-blue-600 tracking-wider">
                {ticket.ticketNumber}
              </span>
            </Flex>
            <Flex className="gap-2">
              <Badge variant="outline" className={`capitalize rounded-full px-3 py-0.5 border-none ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </Badge>
              <Badge variant="outline" className={`capitalize rounded-full px-3 py-0.5 border-none ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </Badge>
            </Flex>
          </Flex>
          
          <h2 className="text-2xl font-bold text-foreground leading-tight capitalize">
            {ticket.subject}
          </h2>

          <Flex className="items-center gap-4 text-xs text-muted-foreground mt-1">
            <Flex className="items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>Created on {format(new Date(ticket.createdon), "PPP")}</span>
            </Flex>
            <Flex className="items-center gap-1.5">
              <Circle className="size-2 fill-green-500 text-green-500" />
              <span>By {ticket.submittedbyName}</span>
            </Flex>
          </Flex>
        </Flex>

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
          <Box>
            <Flex className="items-center gap-2 mb-2 text-muted-foreground">
              <AlertCircle className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-widest">Initial Description</span>
            </Flex>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>
          </Box>
          <Box className="space-y-3 border-l border-border/50 pl-4 max-md:border-l-0 max-md:pl-0 max-md:border-t max-md:pt-4">
            <Box>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Client / Organization</span>
              {(() => {
                const clientValue = ticket.client;
                const isId = clientValue && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientValue);
                const displayClient = ticket.clientOrganization?.name || (isId || clientValue === "General" ? "" : clientValue) || "-";
                return <p className="text-xs font-medium text-foreground">{displayClient}</p>;
              })()}
            </Box>
            <Box>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Assigned To</span>
              <p className="text-xs font-medium text-foreground">
                {ticket.assignedUser?.name || ticket.assignedOrganization?.name || ticket.assignedto || "Unassigned"}
              </p>
            </Box>
          </Box>
        </Box>

        <Box className="pt-4">
          <TicketThread ticketId={ticket.id} status={ticket.status} />
        </Box>
      </Box>
    </GeneralModal>
  );
};
