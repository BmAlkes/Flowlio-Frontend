import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  useSupportTicketMessages,
  useCreateSupportTicketMessage,
} from "@/hooks/useUniversalSupportTickets";
import { useUser } from "@/providers/user.provider";

interface TicketThreadProps {
  ticketId: string;
  status: string;
  isReadOnly?: boolean;
}

export const TicketThread = ({
  ticketId,
  status,
  isReadOnly = false,
}: TicketThreadProps) => {
  const { data: messagesData, isLoading } = useSupportTicketMessages(ticketId);
  const createMessageMutation = useCreateSupportTicketMessage();
  const [replyMessage, setReplyMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: user } = useUser();
  const isLocked = status === "closed" || status === "resolved" || isReadOnly;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesData]);

  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    createMessageMutation.mutate(
      { ticketId, message: replyMessage },
      {
        onSuccess: () => setReplyMessage(""),
      },
    );
  };

  return (
    <Box
      className={`space-y-4 ${isLocked ? "cursor-not-allowed opacity-90" : ""}`}
    >
      <Flex className="items-center justify-between mb-4">
        <Flex className="items-center gap-2">
          <MessageSquare className="size-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-foreground">
            Conversation History
          </h3>
        </Flex>
      </Flex>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <div className="h-10 bg-muted animate-pulse rounded-lg w-3/4"></div>
          <div className="h-10 bg-blue-50 animate-pulse rounded-lg w-3/4 self-end"></div>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className={`${isLocked ? "pointer-events-none" : ""} space-y-4 h-[200px] overflow-y-auto pr-2 custom-scrollbar border-y border-border/20 py-2`}
        >
          {messagesData?.data?.length === 0
            ? !isLocked && (
                <div className="bg-muted/50 rounded-lg p-6 text-center border border-dashed border-border">
                  <p className="text-sm text-muted-foreground italic">
                    No replies yet. Start the conversation below.
                  </p>
                </div>
              )
            : messagesData?.data?.map((msg) => {
                const isMe = msg.senderId === user?.user?.id;
                const initials = msg.senderName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className="size-8 border border-border flex-shrink-0">
                      <AvatarImage src={msg.sender?.image || ""} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm border ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-none border-blue-500"
                          : "bg-muted text-foreground rounded-bl-none border-border"
                      }`}
                    >
                      <div className="flex justify-between items-center gap-4 mb-1">
                        <span
                          className={`font-bold text-[10px] uppercase tracking-wider opacity-80 ${isMe ? "text-blue-100" : "text-blue-600"}`}
                        >
                          {msg.senderName} • {msg.senderRole}
                        </span>
                        <span
                          className={`text-[9px] opacity-70 ${isMe ? "text-blue-100" : "text-muted-foreground"}`}
                        >
                          {formatDistanceToNow(new Date(msg.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })}
        </div>
      )}

      {!isLocked && (
        <Box className="mt-4 relative group">
          <Textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your reply here..."
            className="min-h-[100px] pr-12 focus-visible:ring-blue-500 rounded-xl bg-background border-border group-hover:border-blue-300 transition-colors shadow-sm"
          />
          <Button
            size="sm"
            onClick={handleSendReply}
            disabled={!replyMessage.trim() || createMessageMutation.isPending}
            className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 h-9 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            {createMessageMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Flex className="items-center gap-2">
                <span className="hidden sm:inline">Send Reply</span>
                <Send className="size-3.5" />
              </Flex>
            )}
          </Button>
        </Box>
      )}

      {isLocked && status !== "open" && status !== "in_progress" && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3 mt-4">
          <CheckCircle2 className="size-5 text-green-500" />
          <p className="text-sm text-green-800 font-medium">
            This ticket is resolved. Discussion has been finalized.
          </p>
        </div>
      )}
    </Box>
  );
};
