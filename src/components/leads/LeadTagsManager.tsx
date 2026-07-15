import { useState } from "react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLeadTags, useCreateLeadTag, useDeleteLeadTag } from "@/hooks/useLeadExtras";
import { toast } from "sonner";
import { Plus, X, Loader2 } from "lucide-react";

const COLORS = ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280"];

export const LeadTagsManager = () => {
  const { data: tags = [], isLoading } = useLeadTags();
  const createTag = useCreateLeadTag();
  const deleteTag = useDeleteLeadTag();

  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const handleCreate = () => {
    if (!name.trim()) return;
    createTag.mutate(
      { name: name.trim(), color },
      {
        onSuccess: () => { setName(""); toast.success("Tag created"); },
        onError: (e) => toast.error("Failed to create tag", { description: e.message }),
      }
    );
  };

  return (
    <Box>
      <h2 className="text-lg font-semibold mb-1">Manage Tags</h2>
      <p className="text-sm text-muted-foreground mb-5">Create tags to categorise and filter your leads.</p>

      {/* Create */}
      <Flex className="gap-2 mb-5">
        <Input
          placeholder="Tag name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="flex-1 h-9"
        />
        <Flex className="gap-1 shrink-0">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full border-2 transition-all"
              style={{ backgroundColor: c, borderColor: color === c ? "#000" : "transparent" }}
            />
          ))}
        </Flex>
        <Button size="sm" onClick={handleCreate} disabled={createTag.isPending || !name.trim()} className="h-9 gap-1">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </Flex>

      {/* List */}
      {isLoading ? (
        <Flex className="justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></Flex>
      ) : tags.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No tags yet. Create one above.</p>
      ) : (
        <Flex className="flex-wrap gap-2">
          {tags.map((tag) => (
            <Flex
              key={tag.id}
              className="items-center gap-1.5 ps-3 pe-1.5 py-1.5 rounded-full border border-border bg-card text-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
              <span className="font-medium text-foreground">{tag.name}</span>
              {tag.leadCount != null && (
                <span className="text-xs text-muted-foreground">({tag.leadCount})</span>
              )}
              <button
                type="button"
                onClick={() => deleteTag.mutate(tag.id, {
                  onSuccess: () => toast.success(`Tag "${tag.name}" deleted`),
                  onError: (e) => toast.error("Failed", { description: e.message }),
                })}
                className="w-5 h-5 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground hover:text-red-500" />
              </button>
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  );
};
