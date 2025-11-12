import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { ImageIcon, Download, RefreshCw, X } from "lucide-react";

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  generatedImage?: string;
  onRegenerate?: () => void;
}

export const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
  generatedImage,
  onRegenerate,
}) => {
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClose = () => {
    setPrompt("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Box className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <Flex className="justify-between items-center p-4 border-b border-gray-200">
          <Flex className="items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Generate Image with AI
            </h2>
          </Flex>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </Flex>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Input Section */}
          <Stack className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Describe the image you want to generate:
            </label>
            <div className="space-y-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., A beautiful sunset over mountains, a futuristic city skyline, a cute cat playing with yarn..."
                className="w-full"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Press Enter to generate, Shift+Enter for new line
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Flex className="items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Image...
                </Flex>
              ) : (
                <Flex className="items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Generate Image
                </Flex>
              )}
            </Button>
          </Stack>

          {/* Generated Image Section */}
          {generatedImage && (
            <Stack className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Generated Image:
              </label>
              <Box className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="w-full h-auto rounded-lg max-h-96 object-contain"
                />
              </Box>

              {/* Action Buttons */}
              <Flex className="gap-2">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                {onRegenerate && (
                  <Button
                    onClick={onRegenerate}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                )}
              </Flex>
            </Stack>
          )}

          {/* Tips */}
          <Box className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              💡 Tips for better results:
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Be specific about style, colors, and composition</li>
              <li>
                • Mention artistic style (photorealistic, cartoon, oil painting,
                etc.)
              </li>
              <li>• Include details about lighting, mood, and setting</li>
              <li>• Try different variations with the regenerate button</li>
            </ul>
          </Box>
        </div>

        {/* Footer */}
        <Flex className="justify-end gap-2 p-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </Flex>
      </Box>
    </div>
  );
};
