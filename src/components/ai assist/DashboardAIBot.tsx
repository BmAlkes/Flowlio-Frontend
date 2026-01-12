import { useState, useRef, useEffect } from "react";
import { Box } from "../ui/box";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import { Stack } from "../ui/stack";
import {
  FileText,
  TrendingUp,
  CheckCircle2,
  X,
  Send,
  Minimize2,
} from "lucide-react";
import { AITaskCreator } from "../task management/AITaskCreator";
import { Textarea } from "../ui/textarea";
import { useCreateTask } from "@/hooks/usecreatetask";

interface Message {
  id: string;
  type: "bot" | "user";
  content: string | React.ReactNode;
  timestamp?: Date;
}

interface AIOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  available: boolean;
}

export const DashboardAIBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const createTask = useCreateTask();

  const aiOptions: AIOption[] = [
    {
      id: "task-creator",
      title: "AI Task Creator",
      description: "Create tasks from natural language input",
      icon: <CheckCircle2 className="w-5 h-5" />,
      action: () => {
        setActiveOption("task-creator");
        addBotMessage(
          "Great! Let me help you create a task. Please describe what you need:"
        );
      },
      available: true,
    },
    {
      id: "weekly-summary",
      title: "Weekly Project Summary",
      description: "Get AI-generated weekly project summaries",
      icon: <FileText className="w-5 h-5" />,
      action: () => {
        addBotMessage(
          "Weekly Project Summary feature is coming soon! Stay tuned. 🚀"
        );
      },
      available: false,
    },
    {
      id: "insights",
      title: "AI Insights Dashboard",
      description: "Risk detection, delays, and priority insights",
      icon: <TrendingUp className="w-5 h-5" />,
      action: () => {
        addBotMessage(
          "AI Insights Dashboard feature is coming soon! Stay tuned. 🚀"
        );
      },
      available: false,
    },
  ];

  const addBotMessage = (content: string | React.ReactNode) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize messages when bot opens - show greeting and options directly
  useEffect(() => {
    if (isOpen && messages.length === 0 && !isMinimized) {
      const greeting: Message = {
        id: "1",
        type: "bot",
        content:
          "Hello! 👋 I'm Flowlio AI Assistant. How can I help you today?",
        timestamp: new Date(),
      };
      setMessages([greeting]);

      // Show options after a short delay
      setTimeout(() => {
        const optionsContent = (
          <Stack className="gap-2 mt-2">
            {aiOptions.map((option) => (
              <Box
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  option.available
                    ? "border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400"
                    : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                }`}
              >
                <Flex className="items-center gap-3">
                  <Box
                    className={`p-2 rounded-lg ${
                      option.available
                        ? "bg-blue-200 text-blue-700"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {option.icon}
                  </Box>
                  <Stack className="flex-1 gap-0.5">
                    <Flex className="items-center gap-2">
                      <h4 className="font-semibold text-sm text-gray-800">
                        {option.title}
                      </h4>
                      {!option.available && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                          Soon
                        </span>
                      )}
                    </Flex>
                    <p className="text-xs text-gray-600">
                      {option.description}
                    </p>
                  </Stack>
                </Flex>
              </Box>
            ))}
          </Stack>
        );

        const optionsMessage: Message = {
          id: "2",
          type: "bot",
          content: optionsContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, optionsMessage]);
      }, 300);
    }
  }, [isOpen, isMinimized, messages.length]);

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    addUserMessage(userInput);
    setUserInput("");

    // Simple response logic
    setTimeout(() => {
      if (userInput.toLowerCase().includes("task")) {
        setActiveOption("task-creator");
        addBotMessage(
          "I can help you create a task! Please describe what you need:"
        );
      } else {
        addBotMessage(
          "I understand! Here are some things I can help you with:"
        );
        // Show options after a delay
        setTimeout(() => {
          addBotMessage(renderOptions());
        }, 500);
      }
    }, 500);
  };

  const handleOptionClick = (option: AIOption) => {
    addUserMessage(`I want to use ${option.title}`);
    if (option.available) {
      option.action();
    } else {
      option.action();
    }
  };

  const renderOptions = () => {
    return (
      <Stack className="gap-2 mt-2">
        {aiOptions.map((option) => (
          <Box
            key={option.id}
            onClick={() => handleOptionClick(option)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              option.available
                ? "border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400"
                : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
            }`}
          >
            <Flex className="items-center gap-3">
              <Box
                className={`p-2 rounded-lg ${
                  option.available
                    ? "bg-blue-200 text-blue-700"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {option.icon}
              </Box>
              <Stack className="flex-1 gap-0.5">
                <Flex className="items-center gap-2">
                  <h4 className="font-semibold text-sm text-gray-800">
                    {option.title}
                  </h4>
                  {!option.available && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                      Soon
                    </span>
                  )}
                </Flex>
                <p className="text-xs text-gray-600">{option.description}</p>
              </Stack>
            </Flex>
          </Box>
        ))}
      </Stack>
    );
  };

  const handleTaskGenerated = async (taskData: {
    title: string;
    description?: string;
    projectId?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    estimatedHours?: number;
  }) => {
    console.log("Task data received:", taskData);

    // Check if projectId is required
    if (!taskData.projectId) {
      addBotMessage(
        "⚠️ I need to know which project this task belongs to. Please mention the project name in your description (e.g., 'Create landing page for Project Alpha')."
      );
      return;
    }

    addBotMessage("⏳ Creating your task... Please wait.");

    try {
      console.log("Creating task with data:", {
        title: taskData.title,
        projectId: taskData.projectId,
        assignedTo: taskData.assignedTo,
        startDate: taskData.startDate,
        endDate: taskData.endDate,
      });

      // Create task directly
      const result = await createTask.mutateAsync({
        title: taskData.title,
        description: taskData.description,
        projectId: taskData.projectId,
        assignedTo: taskData.assignedTo,
        startDate: taskData.startDate,
        endDate: taskData.endDate,
      });

      console.log("Task created successfully:", result);

      // Success message with task details
      addBotMessage(
        `✅ Task Created Successfully!\n\n📋 Title: ${taskData.title}\n${
          taskData.description
            ? `📝 Description: ${taskData.description}\n`
            : ""
        }🎯 Status: Created\n\nYour task has been added to the system and will appear in your Task Management section.`
      );

      // Reset after success
      setTimeout(() => {
        setActiveOption(null);
        addBotMessage("What else can I help you with?");
        setTimeout(() => {
          addBotMessage(renderOptions());
        }, 500);
      }, 3000);
    } catch (error: any) {
      console.error("Error creating task:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error occurred";
      addBotMessage(
        `❌ Sorry, I encountered an error while creating your task:\n\n${errorMessage}\n\nPlease check:\n- Project ID is valid\n- All required fields are filled\n- Or try creating it manually from the Task Management page.`
      );
    }
  };

  if (!isOpen) {
    return (
      <Box
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="w-20 h-20 fixed bottom-12 right-0 z-50 cursor-pointer bg-transparent"
      >
        <img
          src="/dashboard/botgif.gif"
          alt="AI Bot"
          className="rounded-full bg-transparent"
        />
      </Box>
    );
  }

  return (
    <Box
      className={`fixed right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? "w-80 h-10 bottom-4" : "w-96 h-[600px] bottom-0"
      } flex flex-col`}
    >
      {/* Header */}
      <Flex className="items-center justify-between p-2 border-b border-gray-200 bg-gradient-to-r from-[#1797B9] to-[#78cbe2] rounded-t-2xl">
        <Flex className="items-center gap-3">
          <Box className="relative">
            <img
              src="/dashboard/botgif.gif"
              alt="AI Bot"
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <Box className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white"></Box>
          </Box>
          <Stack className="gap-0">
            <h3 className="text-white font-semibold text-sm">Flowlio AI</h3>
            <p className="text-white/80 text-xs">Online</p>
          </Stack>
        </Flex>
        <Flex className="gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              setActiveOption(null);
              setMessages([]);
            }}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </Flex>
      </Flex>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <Box className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <Stack className="gap-3">
              {messages.map((message) => (
                <Flex
                  key={message.id}
                  className={`justify-${
                    message.type === "user" ? "end" : "start"
                  }`}
                >
                  <Box
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.type === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {typeof message.content === "string" ? (
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    ) : (
                      message.content
                    )}
                    {message.timestamp && (
                      <p
                        className={`text-xs mt-1 ${
                          message.type === "user"
                            ? "text-blue-100"
                            : "text-gray-400"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </Box>
                </Flex>
              ))}
              <div ref={messagesEndRef} />
            </Stack>
          </Box>

          {/* Input Area */}
          {activeOption === "task-creator" ? (
            <Box className="p-4 border-t border-gray-200 bg-white">
              <AITaskCreator
                onTaskGenerated={handleTaskGenerated}
                onClose={() => {
                  setActiveOption(null);
                  addBotMessage("What else can I help you with?");
                  setTimeout(() => {
                    addBotMessage(renderOptions());
                  }, 500);
                }}
              />
            </Box>
          ) : (
            <Box className="p-4 border-t border-gray-200 bg-white">
              <Flex className="gap-2">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="min-h-[60px] max-h-[120px] resize-none bg-gray-50 border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                  rows={2}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-[60px] px-4 rounded-lg"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </Flex>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
