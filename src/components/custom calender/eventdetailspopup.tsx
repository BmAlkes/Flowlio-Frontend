import { useState } from "react";
import { Center } from "../ui/center";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { Button } from "../ui/button";
import { CopyCheck, Trash2, X } from "lucide-react";
import GoogleMeetIcon from "/dashboard/google-meet.svg";
import WhatsappIcon from "/dashboard/whatsapp-icon.svg";
import OutlookIcon from "/dashboard/google-drive.svg";
import { CalendarEvent as CustomEvent, formatHour } from "./calendarUtils";
import { cn } from "@/lib/utils";

export const EventDetailsPopup = ({
  event,
  onClose,
  onMouseEnter,
  onMouseLeave,
  position,
  onDelete,
}: {
  event: CustomEvent;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  position: { top: number; left: number };
  onDelete?: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedEvent, setCopiedEvent] = useState(false);
  const handleCopy = async () => {
    if (event.meetLink) {
      await navigator.clipboard.writeText(event.meetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };
  const handleCopyNumber = async () => {
    if (event.whatsappNumber) {
      await navigator.clipboard.writeText(event.whatsappNumber);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 1200);
    }
  };
  const handleCopyEvent = async () => {
    if (event.outlookEvent) {
      await navigator.clipboard.writeText(event.outlookEvent.toString());
      setCopiedEvent(true);
      setTimeout(() => setCopiedEvent(false), 1200);
    }
  };
  return (
    <Box
      className="absolute z-[9999] rounded-xl transition-all duration-300 ease-in-out transform"
      style={{
        top: position.top,
        left: position.left,
        background: "white",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Box
        className="relative bg-white p-4 rounded-xl min-w-[260px] h-auto shadow-xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <Center className="justify-between mb-4">
          <Flex className="gap-2 items-center">
            {/* Calendar type dot */}
            <span
              className={cn(
                "w-3 h-3 rounded-full",
                event.calendarType === "education"
                  ? "bg-[#6ee7b7]"
                  : event.calendarType === "meeting"
                  ? "bg-[#818cf8]"
                  : event.calendarType === "personal"
                  ? "bg-[#f472b6]"
                  : "bg-[#f472b6]"
              )}
            ></span>
            <h3 className="font-normal text-[18px] capitalize">
              {event.title.length > 18
                ? event.title.slice(0, 18) + "..."
                : event.title}
            </h3>
          </Flex>

          <Flex className="gap-0">
            <Button
              className="bg-transparent border-none rounded-full cursor-pointer w-6 h-6 p-4"
              variant="ghost"
              size="icon"
              title="Delete"
              onClick={onDelete}
            >
              <Trash2 className="size-4 text-red-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Close"
              onClick={onClose}
              className="w-6 h-6 p-4 bg-white cursor-pointer text-black border-none rounded-full"
            >
              <X className="size-4" />
            </Button>
          </Flex>
        </Center>

        <Flex className="mb-2 gap-2 items-center">
          {/* Platform icon */}
          {event.platform === "google_meet" && (
            <img src={GoogleMeetIcon} alt="Google Meet" className="size-4" />
          )}
          {event.platform === "whatsapp" && (
            <img src={WhatsappIcon} alt="WhatsApp" className="size-4" />
          )}
          {event.platform === "outlook" && (
            <img src={OutlookIcon} alt="Outlook" className="size-4" />
          )}
          <span className="font-medium">
            {event.platform && event.platform !== "none"
              ? event.platform
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())
              : "No Platform"}
          </span>
        </Flex>

        <Box className="mb-4 text-sm text-gray-500">
          {event.date
            ? new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
            : ""}
          <br />
          {formatHour(event.startHour)} - {formatHour(event.endHour)}
        </Box>

        {/* Description */}
        {event.description && (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">
              Description:
            </p>
            <Box className="mb-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                {event.description}
              </p>
            </Box>
          </>
        )}

        {/* Google Meet Copy Link */}
        {event.platform === "google_meet" && event.meetLink ? (
          <Flex className="mb-4 flex-col gap-2 items-start">
            <Flex className="gap-2 items-center justify-between w-full">
              <span className="text-xs text-gray-500 truncate max-w-[120px]">
                {event.meetLink}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="p-1 text-black rounded"
                onClick={handleCopy}
                title="Copy link"
              >
                {copied ? (
                  <CopyCheck className="size-4 text-green-500" />
                ) : (
                  <svg
                    className="cursor-pointer"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="#aaa"
                      strokeWidth="2"
                      d="M8 17H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
                    />
                    <rect
                      width="10"
                      height="10"
                      x="12"
                      y="12"
                      rx="2"
                      stroke="#aaa"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </Button>
            </Flex>

            <Flex
              className="items-center justify-between w-full gap-2 bg-gray-200 hover:bg-gray-200/90 text-black px-4 py-2 rounded-lg text-base font-normal shadow-md cursor-pointer"
              style={{ width: "100%" }}
            >
              <a
                href={event.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                Join with Google Meet
                <img
                  src={GoogleMeetIcon}
                  alt="Google Meet"
                  className="size-6 ml-2"
                />
              </a>
            </Flex>
          </Flex>
        ) : event.platform === "whatsapp" && event.whatsappNumber ? (
          <Flex className="gap-2 items-center justify-between w-full">
            <span className="text-xs text-gray-500 truncate max-w-[120px]">
              {event.whatsappNumber}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="p-1 text-black rounded cursor-pointer"
              title="Copy number"
              onClick={handleCopyNumber}
            >
              {copiedNumber ? (
                <CopyCheck className="size-4 text-green-500" />
              ) : (
                <svg
                  className="cursor-pointer"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="#aaa"
                    strokeWidth="2"
                    d="M8 17H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
                  />
                  <rect
                    width="10"
                    height="10"
                    x="12"
                    y="12"
                    rx="2"
                    stroke="#aaa"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </Button>
          </Flex>
        ) : event.platform === "outlook" && event.outlookEvent ? (
          <Flex className="gap-2 items-center justify-between w-full">
            <span className="text-xs text-gray-500 truncate max-w-[120px]">
              {event.outlookEvent}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="p-1 text-black rounded cursor-pointer"
              title="Copy event"
              onClick={handleCopyEvent}
            >
              {copiedEvent ? (
                <CopyCheck className="size-4 text-green-500" />
              ) : (
                <svg
                  className="cursor-pointer"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="#aaa"
                    strokeWidth="2"
                    d="M8 17H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
                  />
                  <rect
                    width="10"
                    height="10"
                    x="12"
                    y="12"
                    rx="2"
                    stroke="#aaa"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </Button>
          </Flex>
        ) : null}
      </Box>
    </Box>
  );
};
