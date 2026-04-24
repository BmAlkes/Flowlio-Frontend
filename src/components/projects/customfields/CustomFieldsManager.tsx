import { useState, useRef } from "react";
import {
  useFetchCustomFields,
  useCreateCustomField,
  useDeleteCustomField,
  CustomFieldType,
} from "@/hooks/usecustomfields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#EF4444", // Red
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#6B7280", // Gray
];

const DEFAULT_COLOR = PRESET_COLORS[0];

interface CustomFieldsManagerProps {
  entityType?: "project" | "client";
}

export const CustomFieldsManager = ({
  entityType = "project",
}: CustomFieldsManagerProps) => {
  const { data: customFieldsData, isLoading } =
    useFetchCustomFields(entityType);
  const { mutate: createField, isPending: isCreating } = useCreateCustomField();
  const { mutate: deleteField, isPending: isDeleting } = useDeleteCustomField();

  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>("text");
  const [newFieldOptions, setNewFieldOptions] = useState<any[]>([]); // Using any[] temporarily if types aren't fully synced in the component's internal state
  const [optionInput, setOptionInput] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const handleAddField = () => {
    if (!newFieldName.trim()) {
      toast.error("Field name is required");
      return;
    }

    if (newFieldType === "select" && newFieldOptions.length === 0) {
      toast.error("At least one option is required for Select type");
      return;
    }

    createField(
      {
        name: newFieldName,
        type: newFieldType,
        options: newFieldType === "select" ? newFieldOptions : undefined,
        entityType: entityType,
      },
      {
        onSuccess: () => {
          toast.success("Custom field created");
          setNewFieldName("");
          setNewFieldType("text");
          setNewFieldOptions([]);
        },
        onError: () => {
          toast.error("Failed to create custom field");
        },
      },
    );
  };

  const handleDeleteField = (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this field? Data associated with this field will remain but will be hidden.",
      )
    ) {
      deleteField(id, {
        onSuccess: () => toast.success("Field deleted"),
        onError: () => toast.error("Failed to delete field"),
      });
    }
  };

  const addOption = () => {
    if (optionInput.trim()) {
      setNewFieldOptions([
        ...newFieldOptions,
        { label: optionInput.trim(), color: selectedColor },
      ]);
      setOptionInput("");
      // Cycle through preset colors for the next one, or just keep the same
      const nextColorIndex =
        (PRESET_COLORS.indexOf(selectedColor) + 1) % PRESET_COLORS.length;
      setSelectedColor(PRESET_COLORS[nextColorIndex]);
    }
  };

  const removeOption = (index: number) => {
    setNewFieldOptions(newFieldOptions.filter((_, i) => i !== index));
  };

  return (
    <Box className="space-y-6">
      <Box className="space-y-4 border p-4 rounded-md bg-muted/50">
        <h3 className="font-medium text-sm">Add New Custom Field</h3>
        <Flex className="gap-4 items-end flex-wrap">
          <Box className="flex-1 min-w-[200px]">
            <Label className="text-xs mb-1.5 block">Field Name</Label>
            <Input
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="e.g. Budget, Priority"
              className="bg-card h-9"
            />
          </Box>
          <Box className="w-[150px]">
            <Label className="text-xs mb-1.5 block">Type</Label>
            <Select
              value={newFieldType}
              onValueChange={(val) => setNewFieldType(val as CustomFieldType)}
            >
              <SelectTrigger className="h-9 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="boolean">Checkbox</SelectItem>
              </SelectContent>
            </Select>
          </Box>
          <Button
            onClick={handleAddField}
            disabled={isCreating}
            className="h-9 bg-black hover:bg-black/90 text-white cursor-pointer"
          >
            {isCreating ? (
              "Adding..."
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" /> Add Field
              </>
            )}
          </Button>
        </Flex>

        {newFieldType === "select" && (
          <Box className="mt-2 pl-4 border-l-2 border-border">
            <Label className="text-xs mb-1.5 block">Options</Label>
            <Flex className="gap-2 mb-2">
              {/* Inline color picker - avoids Radix portal conflicts with parent Dialog */}
              <Box className="relative" ref={colorPickerRef}>
                <button
                  type="button"
                  className="w-8 h-8 rounded-md border border-border cursor-pointer flex-shrink-0"
                  style={{ backgroundColor: selectedColor }}
                  title="Pick color"
                  onClick={(e) => { e.stopPropagation(); setColorPickerOpen((o) => !o); }}
                />
                {colorPickerOpen && (
                  <div
                    className="absolute left-0 top-10 z-[9999] bg-card border border-border rounded-md shadow-lg p-2 w-48"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="grid grid-cols-5 gap-1 mb-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="w-7 h-7 rounded-sm border border-border cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onClick={(e) => { e.stopPropagation(); setSelectedColor(color); setColorPickerOpen(false); }}
                        />
                      ))}
                    </div>
                    <Input
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      placeholder="#HEX"
                      className="h-7 text-[10px] px-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </Box>
              <Input
                value={optionInput}
                onChange={(e) => setOptionInput(e.target.value)}
                placeholder="Option label"
                className="bg-card h-8 text-sm"
                onKeyDown={(e) => e.key === "Enter" && addOption()}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={addOption}
                type="button"
                className="h-8"
              >
                Add
              </Button>
            </Flex>
            <Flex className="flex-wrap gap-2">
              {newFieldOptions.map((opt, i) => (
                <span
                  key={i}
                  className="bg-card border rounded-full px-3 py-1 text-xs flex items-center gap-2"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        typeof opt === "string" ? "#gray" : opt.color,
                    }}
                  />
                  {typeof opt === "string" ? opt : opt.label}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeOption(i)}
                  />
                </span>
              ))}
            </Flex>
          </Box>
        )}
      </Box>

      <Box className="space-y-2">
        <h3 className="font-medium text-sm">Existing Fields</h3>
        {isLoading ? (
          <Box className="text-sm text-muted-foreground">Loading fields...</Box>
        ) : customFieldsData?.data.length === 0 ? (
          <Box className="text-sm text-muted-foreground italic">
            No custom fields defined.
          </Box>
        ) : (
          <div className="border rounded-md divide-y">
            {customFieldsData?.data.map((field) => (
              <Flex
                key={field.id}
                className="p-3 items-center justify-between bg-card first:rounded-t-md last:rounded-b-md capitalize"
              >
                <Box>
                  <div className="font-medium text-sm">{field.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {field.type}
                  </div>
                  {field.type === "select" && (
                    <Flex className="text-xs text-muted-foreground mt-1 gap-2 flex-wrap">
                      Options:{" "}
                      {field.options?.map((opt, idx) => (
                        <Flex
                          key={idx}
                          className="items-center gap-1 px-1.5 py-0.5 bg-muted/50 rounded border border-border"
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: opt.color }}
                          />
                          <span>{opt.label}</span>
                        </Flex>
                      ))}
                    </Flex>
                  )}
                </Box>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteField(field.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 cursor-pointer"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Flex>
            ))}
          </div>
        )}
      </Box>
    </Box>
  );
};
