import {
  Brain,
  Headset,
  MessageSquareText,
  Send,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Box } from "../ui/box";
import { useState, useRef } from "react";
import { Flex } from "../ui/flex";
import { Stack } from "../ui/stack";
import { Button } from "../ui/button";
import { Center } from "../ui/center";
import React from "react";
import { useAiAssistChatStore } from "@/store/aiassistchat.store";
import { useUser } from "@/providers/user.provider";
import { useEffect } from "react";
import { ImageGenerationModal } from "./ImageGenerationModal";

const content = [
  {
    iconStyleBox: "bg-blue-100 p-1 rounded-full w-fit",
    titleChild: "Ask me anything - from general knowledge to trivia!",
    iconStyle: "text-blue-500 p-1",
    title: "General Questions",
    Icon: MessageSquareText,
  },
  {
    titleChild: "Brainstorm ideas, write content, and solve problems.",
    iconStyleBox: "bg-purple-100 p-1 rounded-full w-fit",
    iconStyle: "text-purple-500 p-1",
    title: "Creative Writing",
    Icon: Headset,
  },
  {
    titleChild: "Get help with productivity, organization, and planning.",
    iconStyleBox: "bg-green-100 p-1 rounded-full w-fit",
    iconStyle: "text-green-500 p-1",
    title: "Productivity",
    Icon: Brain,
  },
];

export const AiAssistChat: React.FC<{ withoutWelcomeGrids?: boolean }> = ({
  withoutWelcomeGrids = false,
}) => {
  const {
    chats,
    activeChatId,
    addChat,
    setActiveChat,
    loadUserChats,
    sendAIRequest,
    isLoading,
    clearUserSession,
    generateImage,
  } = useAiAssistChatStore();
  const activeChat = chats.find((c) => c.id === activeChatId);
  const { data: session } = useUser();

  // Load user chats when component mounts or user changes
  useEffect(() => {
    if (session?.user?.id) {
      // Always load chats for the current user, even if userId is already set
      // This ensures we load the correct user's chats when switching users
      loadUserChats(session.user.id);
    } else {
      // If no session, clear the chats
      clearUserSession();
    }
  }, [session?.user?.id, loadUserChats, clearUserSession]);

  // Only show welcome grid if there are no messages and not explicitly hidden
  const showWelcome =
    !withoutWelcomeGrids && (!activeChat || activeChat.messages.length === 0);

  // Handler to send a message
  const handleSend = async (
    input: string,
    setInput: (v: string) => void,
    attachments?: File[]
  ) => {
    if (
      (!input.trim() && (!attachments || attachments.length === 0)) ||
      isLoading
    )
      return;

    let chatId = activeChatId;
    // If no active chat, create one
    if (!chatId) {
      chatId = addChat({ title: "New Chat", messages: [] });
      setActiveChat(chatId);
    }

    setInput("");

    // Send AI request with attachments
    await sendAIRequest(input, chatId, attachments);
  };

  return (
    <Center className="flex-col h-full min-h-[300px] w-full max-w-full p-2">
      {showWelcome ? <WelcomeContent /> : null}

      {/* New Chat Button - only show when not in welcome mode */}
      {/* {!showWelcome && activeChatId && (
        <Flex className="w-full justify-between items-center mb-4">
          <Button
            onClick={() => {
              const newChatId = addChat({ title: "New Chat", messages: [] });
              setActiveChat(newChatId);
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Chat
          </Button>
          <div className="text-sm text-gray-500">
            {activeChat?.messages?.length || 0} messages
          </div>
        </Flex>
      )} */}

      <ChatBox
        messages={activeChat?.messages || []}
        onSend={handleSend}
        showWelcome={showWelcome}
        activeChatId={activeChatId}
        generateImage={generateImage}
        isLoading={isLoading}
      />
    </Center>
  );
};

const WelcomeContent = () => {
  return (
    <Stack className="w-full max-w-3xl mx-auto items-center justify-center bg-gradient-to-r from-[#F2F2F2] to-[#f0f2f7] h-full p-2">
      <img
        src="/dashboard/ailogocircleicon.svg"
        alt="frame"
        className="size-20"
      />
      <h2 className="text-gray-500 text-sm mt-6">Hi there, 👋</h2>
      <h2 className="text-xl">What would you like to explore today?</h2>
      <p className="text-gray-600 text-sm text-center max-w-md">
        I'm Flowlio AI, powered by GPT-5! I can help you with absolutely
        anything - answer questions, analyze files (PDFs, images, documents),
        generate images with DALL-E. What would you like to explore today?
      </p>
      <Flex className="flex-wrap w-full gap-2 justify-center max-sm:flex-col overflow-hidden">
        {content.map((a, i) => (
          <Stack
            key={i}
            className="bg-zinc-100 border-1 border-gray-400 p-4 rounded-xl h-34  flex-1 w-56"
          >
            <Flex className={a.iconStyleBox}>
              <a.Icon className={a.iconStyle} />
            </Flex>
            <h1 className="font-semibold">{a.title}</h1>
            <Box className="text-gray-500 text-xs">{a.titleChild}</Box>
          </Stack>
        ))}
      </Flex>
    </Stack>
  );
};

const ChatBox: React.FC<{
  messages: {
    role: "user" | "ai";
    text: string;
    isLoading?: boolean;
    timestamp?: Date;
    attachments?: File[];
    imageUrl?: string;
  }[];
  onSend: (
    input: string,
    setInput: (v: string) => void,
    attachments?: File[]
  ) => void;
  showWelcome: boolean;
  activeChatId: string | null;
  generateImage: (prompt: string, chatId: string) => void;
  isLoading: boolean;
}> = ({
  messages,
  onSend,
  showWelcome,
  activeChatId,
  generateImage,
  isLoading: storeIsLoading,
}) => {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<
    string | undefined
  >();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // File handling functions
  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).slice(0, 5); // Limit to 5 files
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSendClick = () => {
    if (input.trim() || attachments.length > 0) {
      onSend(input, setInput, attachments);
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
    // Shift+Enter allows new lines (default behavior)

    // Auto-resize on input
    if (e.key === "Enter" && e.shiftKey) {
      setTimeout(() => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = "auto";
        target.style.height = Math.min(target.scrollHeight, 128) + "px";
      }, 0);
    }
  };

  const handleImageGenerate = async (prompt: string) => {
    if (!activeChatId) return;

    try {
      await generateImage(prompt, activeChatId);
      // The generated image URL will be handled by the store and displayed in the chat
      setIsImageModalOpen(false);
    } catch (error) {
      console.error("Failed to generate image:", error);
    }
  };

  const handleImageModalClose = () => {
    setIsImageModalOpen(false);
    setGeneratedImageUrl(undefined);
  };
  return (
    <Center
      className={`flex-col w-full max-w-3xl mx-auto mb-4 max-md:p-2 ${
        showWelcome ? "" : "flex-1 h-full"
      }`}
    >
      {/* Chat history */}
      {messages.length === 0 ? (
        <></>
      ) : (
        <Stack
          ref={chatRef}
          className={`w-full max-w-3xl mx-auto p-2 mb-4 rounded-md border border-gray-300 bg-white ${
            showWelcome
              ? "min-h-[200px] max-h-[400px]"
              : "flex-1 h-full min-h-[300px] max-h-[60vh]"
          } overflow-y-auto`}
          style={{ transition: "max-height 0.2s" }}
        >
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center w-full">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg, idx) => (
              <Flex
                key={idx}
                className={
                  msg.role === "user" ? "justify-end" : "justify-start"
                }
              >
                <Box
                  className={
                    msg.role === "user"
                      ? "bg-blue-100 text-blue-900 rounded-xl px-4 py-2 m-1 max-w-[70%]"
                      : "bg-gray-100 text-gray-800 rounded-xl px-4 py-2 m-1 max-w-[70%]"
                  }
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-3">
                      {msg.text === "Generating image..." ? (
                        <>
                          <div className="relative">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-200"></div>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-purple-600 font-medium">
                              🎨 Creating your image...
                            </span>
                            <span className="text-xs text-gray-400">
                              This may take 10-15 seconds
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          <span className="text-sm text-gray-500">
                            AI is thinking...
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="text-sm w-full max-sm:w-36 overflow-hidden break-words whitespace-pre-wrap">
                        {msg.text}
                      </div>
                      {msg.imageUrl && (
                        <div className="mt-2">
                          <div className="relative">
                            <img
                              src={msg.imageUrl}
                              alt="Generated image"
                              className="max-w-full h-auto rounded-lg border border-gray-200"
                              style={{ maxHeight: "400px" }}
                            />
                            <button
                              onClick={async () => {
                                try {
                                  // Fetch the image as a blob
                                  const response = await fetch(msg.imageUrl!);
                                  const blob = await response.blob();

                                  // Create a blob URL
                                  const blobUrl = URL.createObjectURL(blob);

                                  // Create download link
                                  const link = document.createElement("a");
                                  link.href = blobUrl;
                                  link.download = `generated-image-${Date.now()}.png`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);

                                  // Clean up blob URL
                                  URL.revokeObjectURL(blobUrl);
                                } catch (error) {
                                  console.error("Download failed:", error);
                                  // Fallback: open in new tab
                                  window.open(msg.imageUrl!, "_blank");
                                }
                              }}
                              className="absolute top-1 right-1 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-1.5 rounded-full shadow-lg border border-gray-200 transition-all duration-200 cursor-pointer"
                              title="Download image"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {msg.attachments.map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 bg-gray-200 rounded px-2 py-1 text-xs"
                            >
                              {file.type && file.type.startsWith("image/") ? (
                                <ImageIcon className="w-3 h-3" />
                              ) : (
                                <FileText className="w-3 h-3" />
                              )}
                              <span className="truncate max-w-20">
                                {file.name || "Unknown file"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {msg.timestamp && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </Box>
              </Flex>
            ))
          )}
        </Stack>
      )}

      {/* Input area */}
      <Stack
        className={`w-full max-w-3xl mx-auto p-2 mb-4 rounded-md border sticky bottom-0 bg-white ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs"
              >
                {file.type && file.type.startsWith("image/") ? (
                  <ImageIcon className="w-3 h-3" />
                ) : (
                  <FileText className="w-3 h-3" />
                )}
                <span className="truncate max-w-20">
                  {file.name || "Unknown file"}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={input}
          placeholder="Ask me anything... (Shift+Enter for new line)"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 bg-white border-none outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none resize-none min-h-[44px] max-h-32 rounded-md transition-all duration-200 focus:ring-2 focus:ring-blue-200"
          style={{
            boxShadow: "none !important",
            outline: "none !important",
            border: "none !important",
            fontFamily: "inherit",
            fontSize: "14px",
            lineHeight: "1.4",
          }}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = Math.min(target.scrollHeight, 128) + "px";
          }}
        />

        <Flex className="gap-0 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <Button
            variant={"ghost"}
            className="text-sm gap-1 text-gray-400"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4" />
            Upload Files
          </Button>
          <Button
            variant={"ghost"}
            className="text-sm gap-1 text-gray-400"
            onClick={() => setIsImageModalOpen(true)}
          >
            <ImageIcon className="size-4" />
            Generate Image
          </Button>
          <Button
            size="lg"
            className="ml-auto bg-[#0c89af] rounded-full h-9 w-9 cursor-pointer"
            onClick={handleSendClick}
            aria-label="Send"
            disabled={!input.trim() && attachments.length === 0}
          >
            <Send className="text-white" />
          </Button>
        </Flex>
      </Stack>

      <p className="text-sm text-gray-500 text-center w-full">
        Press{" "}
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
          Shift + Enter
        </kbd>{" "}
        for new line,{" "}
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to
        send
      </p>

      {/* Image Generation Modal */}
      <ImageGenerationModal
        isOpen={isImageModalOpen}
        onClose={handleImageModalClose}
        onGenerate={handleImageGenerate}
        isLoading={storeIsLoading}
        generatedImage={generatedImageUrl}
      />
    </Center>
  );
};
