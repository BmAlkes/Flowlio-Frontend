import { useState } from "react";
import { Box } from "../ui/box";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Stack } from "../ui/stack";
import { Flex } from "../ui/flex";
import { useAITaskCreation } from "@/hooks/useAITaskCreation";
import { Sparkles, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface AITaskCreatorProps {
  onTaskGenerated: (taskData: {
    title: string;
    description?: string;
    projectId?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    estimatedHours?: number;
  }) => void;
  onClose?: () => void;
}

export const AITaskCreator = ({
  onTaskGenerated,
  onClose,
}: AITaskCreatorProps) => {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const aiTaskCreation = useAITaskCreation();

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please enter a task description");
      return;
    }

    try {
      const response = await aiTaskCreation.mutateAsync({
        userInput: input,
      });

      if (response.success && response.data) {
        // Don't show toast here - task is not created yet, just generated
        // The actual task creation will show success message
        onTaskGenerated({
          title: response.data.title,
          description: response.data.description,
          projectId: response.data.projectId,
          assignedTo: response.data.assignedTo,
          startDate: response.data.startDate,
          endDate: response.data.endDate,
          estimatedHours: response.data.estimatedHours,
        });

        setInput("");
        setIsExpanded(false);
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      // Error is already handled in the hook
      console.error("Failed to generate task:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        variant="outline"
        className="w-full border-dashed border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
      >
        <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
        <span className="text-blue-600 font-medium">Create Task with AI</span>
      </Button>
    );
  }

  return (
    <Box className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
      <Flex className="justify-between items-center mb-3">
        <Flex className="items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            AI Task Creator
          </h3>
        </Flex>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </Flex>

      <Stack className="gap-3">
        <Box>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Describe your task in natural language:
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., 'Create a landing page for Project Alpha, assign to John, due next Friday, estimated 8 hours'"
            className="min-h-[100px] bg-white border-gray-300 focus:border-blue-400 focus:ring-blue-400"
            disabled={aiTaskCreation.isPending}
          />
          <p className="text-xs text-gray-500 mt-1">
            Press{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              Ctrl + Enter
            </kbd>{" "}
            to generate
          </p>
        </Box>

        {aiTaskCreation.isPending ? (
          <Flex className="items-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI is analyzing your request...</span>
          </Flex>
        ) : (
          <Flex className="gap-2">
            <Button
              onClick={handleGenerate}
              disabled={!input.trim() || aiTaskCreation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Task
            </Button>
            <Button
              onClick={() => {
                setIsExpanded(false);
                setInput("");
              }}
              variant="outline"
              disabled={aiTaskCreation.isPending}
            >
              Cancel
            </Button>
          </Flex>
        )}

        <Box className="bg-white/60 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-gray-600">
            <strong>💡 Tips:</strong> Include details like project name,
            assignee, due date, and time estimates for better results.
          </p>
        </Box>
      </Stack>
    </Box>
  );
};
