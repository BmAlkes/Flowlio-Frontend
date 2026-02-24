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
  UserPlus,
  Briefcase,
} from "lucide-react";
import { AITaskCreator } from "../task management/AITaskCreator";
import { Textarea } from "../ui/textarea";
import { useCreateTask } from "@/hooks/usecreatetask";
import { useWeeklyProjectSummary } from "@/hooks/useWeeklyProjectSummary";
import { useCreateClient } from "@/hooks/usecreateclient";
import { useCreateProject } from "@/hooks/usecreateproject";
import { useUser } from "@/providers/user.provider";
import { Loader2, Sparkles } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { useProjectInsights } from "@/hooks/useProjectInsights";

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
  const weeklySummary = useWeeklyProjectSummary();
  const createClient = useCreateClient();
  const createProject = useCreateProject();
  const { data: userData } = useUser();
  const projectInsights = useProjectInsights();

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
        handleWeeklySummary();
      },
      available: true,
    },
    {
      id: "create-client",
      title: "Create Client",
      description: "Create clients from natural language input",
      icon: <UserPlus className="w-5 h-5" />,
      action: () => {
        setActiveOption("create-client");
        addBotMessage(
          "Great! Let me help you create a client. Please describe the client details:"
        );
      },
      available: true,
    },
    {
      id: "create-project",
      title: "Create Project",
      description: "Create projects from natural language input",
      icon: <Briefcase className="w-5 h-5" />,
      action: () => {
        setActiveOption("create-project");
        addBotMessage(
          "Great! Let me help you create a project. Please describe the project details:"
        );
      },
      available: true,
    },
    {
      id: "insights",
      title: "AI Insights Dashboard",
      description: "Risk detection, delays, and priority insights",
      icon: <TrendingUp className="w-5 h-5" />,
      action: () => {
        handleInsightsDashboard();
      },
      available: true,
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

  const handleWeeklySummary = async () => {
    // Show loading message
    const loadingMessageId = Date.now().toString();
    const loadingMessage: Message = {
      id: loadingMessageId,
      type: "bot",
      content: (
        <Flex className="items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>
            ⏳ Generating your weekly project summary... This may take a moment.
          </span>
        </Flex>
      ),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, loadingMessage]);
    setActiveOption("weekly-summary");

    try {
      const response = await weeklySummary.refetch();

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessageId));

      if (response.data?.success && response.data.data) {
        const summaryData = response.data.data;

        // Format the summary nicely
        const summaryContent = (
          <Stack className="gap-3 text-sm">
            {/* Executive Summary */}
            <Box className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                📊 Executive Summary
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">
                {summaryData.summary}
              </p>
            </Box>

            {/* Metrics */}
            <Box className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                📈 Key Metrics
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Total Projects:</span>
                  <span className="font-semibold ml-2">
                    {summaryData.metrics.totalProjects}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Active Projects:</span>
                  <span className="font-semibold ml-2">
                    {summaryData.metrics.activeProjects}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Tasks:</span>
                  <span className="font-semibold ml-2">
                    {summaryData.metrics.totalTasks}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-semibold ml-2 text-green-600">
                    {summaryData.metrics.completedTasks}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">In Progress:</span>
                  <span className="font-semibold ml-2 text-blue-600">
                    {summaryData.metrics.inProgressTasks}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Hours:</span>
                  <span className="font-semibold ml-2">
                    {summaryData.metrics.totalHours.toFixed(1)}h
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Billable Hours:</span>
                  <span className="font-semibold ml-2 text-green-600">
                    {summaryData.metrics.billableHours.toFixed(1)}h
                  </span>
                </div>
              </div>
            </Box>

            {/* Highlights */}
            {summaryData.highlights && summaryData.highlights.length > 0 && (
              <Box className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-2">
                  ✨ Key Highlights
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {summaryData.highlights.map(
                    (highlight: string, idx: number) => (
                      <li key={idx}>{highlight}</li>
                    )
                  )}
                </ul>
              </Box>
            )}

            {/* Project Breakdown */}
            {summaryData.projectBreakdown &&
              summaryData.projectBreakdown.length > 0 && (
                <Box className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    📋 Project Breakdown
                  </h4>
                  <Stack className="gap-2">
                    {summaryData.projectBreakdown.slice(0, 5).map(
                      (
                        project: {
                          projectName: string;
                          projectNumber: string;
                          summary: string;
                          progress: number;
                          tasksCompleted: number;
                          hoursSpent: number;
                        },
                        idx: number
                      ) => (
                        <Box
                          key={idx}
                          className="bg-white p-2 rounded border border-purple-100"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">
                              {project.projectName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {project.projectNumber}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            {project.summary}
                          </p>
                          <div className="flex gap-3 text-xs text-gray-500">
                            <span>Progress: {project.progress}%</span>
                            <span>Completed: {project.tasksCompleted}</span>
                            <span>Hours: {project.hoursSpent.toFixed(1)}h</span>
                          </div>
                        </Box>
                      )
                    )}
                  </Stack>
                </Box>
              )}

            {/* Recommendations */}
            {summaryData.recommendations &&
              summaryData.recommendations.length > 0 && (
                <Box className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">
                    💡 Recommendations
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {summaryData.recommendations.map(
                      (rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      )
                    )}
                  </ul>
                </Box>
              )}

            {/* Period */}
            <Box className="text-xs text-gray-500 text-center pt-2 border-t">
              Period: {new Date(summaryData.period.start).toLocaleDateString()}{" "}
              - {new Date(summaryData.period.end).toLocaleDateString()}
            </Box>
          </Stack>
        );

        addBotMessage(summaryContent);

        // Reset after showing summary
        setTimeout(() => {
          setActiveOption(null);
          addBotMessage("What else can I help you with?");
          setTimeout(() => {
            addBotMessage(renderOptions());
          }, 500);
        }, 5000);
      } else {
        addBotMessage(
          "❌ Sorry, I couldn't generate the weekly summary. Please try again later."
        );
      }
    } catch (error: any) {
      // Remove loading message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessageId));

      console.error("Error generating weekly summary:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error occurred";
      addBotMessage(
        `❌ Sorry, I encountered an error while generating the weekly summary:\n\n${errorMessage}\n\nPlease try again later.`
      );
    }
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

  const handleGenerateClient = async () => {
    if (!userInput.trim()) {
      addBotMessage("⚠️ Please describe the client details.");
      return;
    }

    addBotMessage("⏳ Analyzing your request with AI...");

    try {
      // Use AI conversation to extract client data
      const response = await axios.post("/ai/conversation", {
        userInput: `Extract client information from this description and return ONLY a valid JSON object with this exact structure (no other text):
{
  "name": "client name",
  "email": "email@example.com",
  "phone": "phone number or null",
  "businessIndustry": "industry or null",
  "address": "address or null"
}

Description: ${userInput}`,
        conversationHistory: [],
      });

      if (response.data?.success && response.data?.data?.response) {
        let clientData;
        try {
          // Try to extract JSON from AI response
          const jsonMatch = response.data.data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            clientData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No JSON found in response");
          }
        } catch {
          addBotMessage(
            "❌ Could not parse AI response. Please try describing the client more clearly with name and email."
          );
          return;
        }

        await handleClientGenerated(clientData);
        setUserInput("");
      } else {
        addBotMessage(
          "❌ Failed to generate client data. Please try again with a clearer description."
        );
      }
    } catch (error: any) {
      console.error("Error generating client:", error);
      addBotMessage(
        `❌ Error: ${
          error?.response?.data?.message || error?.message || "Unknown error"
        }`
      );
    }
  };

  const handleClientGenerated = async (clientData: {
    name: string;
    email: string;
    phone?: string;
    businessIndustry?: string;
    address?: string;
  }) => {
    if (!clientData.name || !clientData.email) {
      addBotMessage(
        "⚠️ I need at least the client's name and email. Please provide these details."
      );
      return;
    }

    addBotMessage("⏳ Creating client... Please wait.");

    try {
      const result = await createClient.mutateAsync({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        businessIndustry: clientData.businessIndustry,
        address: clientData.address,
      });

      addBotMessage(
        `✅ Client Created Successfully!\n\n👤 Name: ${
          result.data.name
        }\n📧 Email: ${result.data.email}\n${
          result.data.phone ? `📞 Phone: ${result.data.phone}\n` : ""
        }Status: ${
          result.data.status
        }\n\nYour client has been added to the system.`
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
      console.error("Error creating client:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error occurred";
      addBotMessage(
        `❌ Sorry, I encountered an error while creating the client:\n\n${errorMessage}\n\nPlease try again or create it manually from the Clients page.`
      );
    }
  };

  const handleInsightsDashboard = async () => {
    addBotMessage(
      "⏳ Analyzing your projects and tasks... This may take a moment."
    );

    try {
      const response = await projectInsights.refetch();

      if (response.data?.success && response.data.data) {
        const insights = response.data.data;

        const insightsContent = (
          <Stack className="gap-3 text-sm">
            {/* Summary */}
            <Box className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                📊 Project Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Total Projects:</span>
                  <span className="font-semibold ml-2">
                    {insights.summary.totalProjects}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Tasks:</span>
                  <span className="font-semibold ml-2">
                    {insights.summary.totalTasks}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-semibold ml-2 text-green-600">
                    {insights.summary.completedTasks}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">In Progress:</span>
                  <span className="font-semibold ml-2 text-blue-600">
                    {insights.summary.inProgressTasks}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Overdue Tasks:</span>
                  <span className="font-semibold ml-2 text-red-600">
                    {insights.summary.overdueTasks}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Hours Tracked:</span>
                  <span className="font-semibold ml-2">
                    {insights.summary.totalHoursTrackedFormatted ||
                      `${Math.floor(
                        insights.summary.totalHoursTracked / 60
                      )}h ${insights.summary.totalHoursTracked % 60}m`}
                  </span>
                </div>
              </div>
            </Box>

            {/* Risk Analysis */}
            {insights.riskAnalysis.highRiskProjects.length > 0 && (
              <Box className="bg-red-50 p-3 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">
                  ⚠️ High Risk Projects (
                  {insights.riskAnalysis.highRiskProjects.length})
                </h4>
                <Stack className="gap-2">
                  {insights.riskAnalysis.highRiskProjects
                    .slice(0, 3)
                    .map((project) => (
                      <Box
                        key={project.projectId}
                        className="bg-white p-2 rounded border border-red-100"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">
                            {project.projectName}
                          </span>
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded">
                            Risk: {project.riskScore}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <div>Progress: {project.progress}%</div>
                          <div>Overdue Tasks: {project.overdueTasks}</div>
                          {project.reasons.length > 0 && (
                            <div className="text-red-600 mt-1">
                              {project.reasons[0]}
                            </div>
                          )}
                        </div>
                      </Box>
                    ))}
                </Stack>
              </Box>
            )}

            {/* Urgent Tasks */}
            {insights.priorityInsights.urgentTasks.length > 0 && (
              <Box className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2">
                  🔥 Urgent Tasks (
                  {insights.priorityInsights.urgentTasks.length})
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                  {insights.priorityInsights.urgentTasks
                    .slice(0, 5)
                    .map((task) => {
                      // Handle negative days (shouldn't happen but safety check)
                      const days = Math.max(0, task.daysUntilDue);
                      return (
                        <li key={task.taskId}>
                          {task.title} (Due in {days} day{days !== 1 ? "s" : ""}
                          )
                        </li>
                      );
                    })}
                </ul>
              </Box>
            )}

            {/* Overdue Tasks */}
            {insights.priorityInsights.overdueTasks.length > 0 && (
              <Box className="bg-red-50 p-3 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">
                  ❌ Overdue Tasks (
                  {insights.priorityInsights.overdueTasks.length})
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                  {insights.priorityInsights.overdueTasks
                    .slice(0, 5)
                    .map((task) => (
                      <li key={task.taskId}>
                        {task.title} ({task.daysOverdue} day
                        {task.daysOverdue !== 1 ? "s" : ""} overdue)
                      </li>
                    ))}
                </ul>
              </Box>
            )}

            {/* Recommendations */}
            {insights.priorityInsights.recommendations.length > 0 && (
              <Box className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">
                  💡 Recommendations
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                  {insights.priorityInsights.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </Box>
            )}

            {/* Timeline Predictions */}
            <Box className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">
                📅 Timeline Status
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <span className="text-gray-600">On Track:</span>
                  <span className="font-semibold ml-2 text-green-600">
                    {insights.timelinePredictions.projectsOnTrack}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">At Risk:</span>
                  <span className="font-semibold ml-2 text-orange-600">
                    {insights.timelinePredictions.projectsAtRisk}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Delayed:</span>
                  <span className="font-semibold ml-2 text-red-600">
                    {insights.timelinePredictions.projectsDelayed}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Avg Completion:</span>
                  <span className="font-semibold ml-2">
                    {insights.timelinePredictions.averageCompletionTime} days
                  </span>
                </div>
              </div>

              {/* Show which projects are at risk */}
              {insights.delayPredictions.projectsAtRisk.length > 0 && (
                <div className="mt-2 pt-2 border-t border-purple-200">
                  <p className="text-xs font-semibold text-purple-800 mb-1">
                    Projects At Risk:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-700">
                    {insights.delayPredictions.projectsAtRisk.map((project) => (
                      <li key={project.projectId}>
                        {project.projectName}
                        {project.daysRemaining !== undefined && (
                          <span className="text-orange-600 ml-1">
                            ({project.daysRemaining} days left,{" "}
                            {project.progress}% done)
                          </span>
                        )}
                        {project.daysOverdue !== undefined && (
                          <span className="text-red-600 ml-1">
                            ({project.daysOverdue} days overdue,{" "}
                            {project.progress}% done)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Box>
          </Stack>
        );

        addBotMessage(insightsContent);

        // Reset after showing insights
        setTimeout(() => {
          setActiveOption(null);
          addBotMessage("What else can I help you with?");
          setTimeout(() => {
            addBotMessage(renderOptions());
          }, 500);
        }, 5000);
      } else {
        addBotMessage(
          "❌ Sorry, I couldn't generate the insights. Please try again later."
        );
      }
    } catch (error: any) {
      console.error("Error generating insights:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error occurred";
      addBotMessage(
        `❌ Sorry, I encountered an error while generating insights:\n\n${errorMessage}\n\nPlease try again later.`
      );
    }
  };

  const handleGenerateProject = async () => {
    if (!userInput.trim()) {
      addBotMessage("⚠️ Please describe the project details.");
      return;
    }

    addBotMessage("⏳ Analyzing your request with AI...");

    try {
      // Use AI conversation to extract project data
      const response = await axios.post("/ai/conversation", {
        userInput: `Extract project information from this description and return ONLY a valid JSON object with this exact structure (no other text):
{
  "name": "project name",
  "projectNumber": "project number or null",
  "description": "description or null",
  "startDate": "YYYY-MM-DD or null",
  "endDate": "YYYY-MM-DD or null",
  "address": "address or null"
}

Description: ${userInput}`,
        conversationHistory: [],
      });

      if (response.data?.success && response.data?.data?.response) {
        let projectData;
        try {
          // Try to extract JSON from AI response
          const jsonMatch = response.data.data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            projectData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No JSON found in response");
          }
        } catch {
          addBotMessage(
            "❌ Could not parse AI response. Please try describing the project more clearly with at least the project name."
          );
          return;
        }

        await handleProjectGenerated(projectData);
        setUserInput("");
      } else {
        addBotMessage(
          "❌ Failed to generate project data. Please try again with a clearer description."
        );
      }
    } catch (error: any) {
      console.error("Error generating project:", error);
      addBotMessage(
        `❌ Error: ${
          error?.response?.data?.message || error?.message || "Unknown error"
        }`
      );
    }
  };

  const handleProjectGenerated = async (projectData: {
    name: string;
    projectNumber?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    address?: string;
  }) => {
    if (!projectData.name) {
      addBotMessage(
        "⚠️ I need at least the project name. Please provide this detail."
      );
      return;
    }

    const organizationId =
      userData?.user?.organizationId ||
      (window as any).__ORGANIZATION_ID__ ||
      localStorage.getItem("organizationId");

    if (!organizationId) {
      addBotMessage("❌ Organization ID not found. Please refresh the page.");
      return;
    }

    addBotMessage("⏳ Creating project... Please wait.");

    try {
      const result = await createProject.mutateAsync({
        name: projectData.name,
        projectNumber: projectData.projectNumber,
        description: projectData.description,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        address: projectData.address,
        organizationId: organizationId,
      });

      addBotMessage(
        `✅ Project Created Successfully!\n\n📁 Name: ${
          result.data.name
        }\n🔢 Project Number: ${result.data.projectNumber}\n${
          result.data.description
            ? `📝 Description: ${result.data.description}\n`
            : ""
        }Status: ${result.data.status}\nProgress: ${
          result.data.progress
        }%\n\nYour project has been added to the system.`
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
      console.error("Error creating project:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error occurred";
      addBotMessage(
        `❌ Sorry, I encountered an error while creating the project:\n\n${errorMessage}\n\nPlease try again or create it manually from the Projects page.`
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
          ) : activeOption === "create-client" ? (
            <Box className="p-4 border-t border-gray-200 bg-white">
              <Box className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <Flex className="items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    AI Client Creator
                  </h3>
                </Flex>
                <Stack className="gap-3">
                  <Box>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Describe the client in natural language:
                    </label>
                    <Textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          e.preventDefault();
                          handleGenerateClient();
                        }
                      }}
                      placeholder="e.g., 'Create a client named John Doe, email john@example.com, phone 123-456-7890, works in Technology industry'"
                      className="min-h-[100px] bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                      disabled={createClient.isPending}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Press{" "}
                      <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                        Ctrl + Enter
                      </kbd>{" "}
                      to generate
                    </p>
                  </Box>
                  {createClient.isPending ? (
                    <Flex className="items-center gap-2 text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">
                        AI is analyzing your request...
                      </span>
                    </Flex>
                  ) : (
                    <Flex className="gap-2">
                      <Button
                        onClick={handleGenerateClient}
                        disabled={!userInput.trim() || createClient.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Client
                      </Button>
                      <Button
                        onClick={() => {
                          setActiveOption(null);
                          setUserInput("");
                          addBotMessage("What else can I help you with?");
                          setTimeout(() => {
                            addBotMessage(renderOptions());
                          }, 500);
                        }}
                        variant="outline"
                        disabled={createClient.isPending}
                      >
                        Cancel
                      </Button>
                    </Flex>
                  )}
                  <Box className="bg-white/60 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600">
                      <strong>💡 Tips:</strong> Include client name, email,
                      phone, industry, and address for better results.
                    </p>
                  </Box>
                </Stack>
              </Box>
            </Box>
          ) : activeOption === "create-project" ? (
            <Box className="p-4 border-t border-gray-200 bg-white">
              <Box className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <Flex className="items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    AI Project Creator
                  </h3>
                </Flex>
                <Stack className="gap-3">
                  <Box>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Describe the project in natural language:
                    </label>
                    <Textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          e.preventDefault();
                          handleGenerateProject();
                        }
                      }}
                      placeholder="e.g., 'Create a project called Website Redesign, project number PRJ-001, start date 2024-01-15, end date 2024-03-15, description: Complete redesign of company website'"
                      className="min-h-[100px] bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                      disabled={createProject.isPending}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Press{" "}
                      <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                        Ctrl + Enter
                      </kbd>{" "}
                      to generate
                    </p>
                  </Box>
                  {createProject.isPending ? (
                    <Flex className="items-center gap-2 text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">
                        AI is analyzing your request...
                      </span>
                    </Flex>
                  ) : (
                    <Flex className="gap-2">
                      <Button
                        onClick={handleGenerateProject}
                        disabled={!userInput.trim() || createProject.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Project
                      </Button>
                      <Button
                        onClick={() => {
                          setActiveOption(null);
                          setUserInput("");
                          addBotMessage("What else can I help you with?");
                          setTimeout(() => {
                            addBotMessage(renderOptions());
                          }, 500);
                        }}
                        variant="outline"
                        disabled={createProject.isPending}
                      >
                        Cancel
                      </Button>
                    </Flex>
                  )}
                  <Box className="bg-white/60 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600">
                      <strong>💡 Tips:</strong> Include project name, number,
                      dates, description, and address for better results.
                    </p>
                  </Box>
                </Stack>
              </Box>
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
