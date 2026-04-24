import { useState } from "react";
import {
  useFetchProjectTemplates,
  useCreateProjectTemplate,
  useUpdateProjectTemplate,
  useDeleteProjectTemplate,
} from "@/hooks/useProjectTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Trash2, Plus, Edit2, Check, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const ProjectTemplatesManager = () => {
  const { data: templatesData, isLoading } = useFetchProjectTemplates();
  const { mutate: createTemplate, isPending: isCreating } = useCreateProjectTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateProjectTemplate();
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteProjectTemplate();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setTasks([]);
    setNewTaskTitle("");
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleEdit = (template: any) => {
    setEditingId(template.id);
    setName(template.name);
    setDescription(template.description || "");
    setTasks(template.tasks || []);
    setIsAddingNew(false);
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Math.random().toString(36).substr(2, 9),
        title: newTaskTitle.trim(),
        description: "",
        order: tasks.length,
      },
    ]);
    setNewTaskTitle("");
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: string, value: any) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }

    const payload = {
      name,
      description,
      tasks: tasks.map((t, i) => ({
        title: t.title,
        description: t.description,
        estimatedHours: t.estimatedHours ? Number(t.estimatedHours) : undefined,
        order: i,
      })),
    };

    if (editingId) {
      updateTemplate(
        { id: editingId, data: payload },
        {
          onSuccess: () => resetForm(),
        }
      );
    } else {
      createTemplate(payload, {
        onSuccess: () => resetForm(),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplate(id);
    }
  };

  if (isLoading) return <Box className="p-4 text-center">Loading templates...</Box>;

  return (
    <Box className="space-y-6 max-w-4xl mx-auto p-4">
      <Flex className="justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Project Templates</h2>
        {!isAddingNew && !editingId && (
          <Button
            onClick={() => setIsAddingNew(true)}
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Create New Template
          </Button>
        )}
      </Flex>

      {(isAddingNew || editingId) && (
        <Card className="border-blue-100 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader className="bg-blue-50/50">
            <CardTitle>{editingId ? "Edit Template" : "Create New Template"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Stack className="gap-4">
              <Box>
                <Label>Template Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Website Development, Home Renovation"
                  className="mt-1.5"
                />
              </Box>
              <Box>
                <Label>Description (Optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this template is for..."
                  className="mt-1.5"
                />
              </Box>

              <Box className="border rounded-lg p-4 bg-muted/20">
                <Label className="text-lg font-semibold mb-4 block">Standard Tasks</Label>
                <Stack className="gap-3">
                  {tasks.map((task, index) => (
                    <Flex key={task.id || index} className="items-start gap-3 bg-card p-3 rounded-md border shadow-sm group">
                      <GripVertical className="w-4 h-4 text-muted-foreground mt-2 cursor-grab" />
                      <Box className="flex-1 space-y-2">
                        <Input
                          value={task.title}
                          onChange={(e) => updateTask(index, "title", e.target.value)}
                          placeholder="Task title"
                          className="font-medium border-none focus-visible:ring-1 p-0 h-auto text-base"
                        />
                        <Textarea
                          value={task.description}
                          onChange={(e) => updateTask(index, "description", e.target.value)}
                          placeholder="Task description (optional)"
                          className="text-sm border-none focus-visible:ring-1 p-0 h-auto min-h-0 resize-none overflow-hidden"
                          rows={1}
                          onInput={(e: any) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                        />
                        <Flex className="items-center gap-2">
                          <Label className="text-[10px] text-muted-foreground">Est. Hours:</Label>
                          <Input
                            type="number"
                            value={task.estimatedHours || ""}
                            onChange={(e) => updateTask(index, "estimatedHours", e.target.value)}
                            placeholder="0"
                            className="text-xs h-6 w-16 px-1 border-none bg-muted/50"
                          />
                        </Flex>
                      </Box>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTask(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </Flex>
                  ))}

                  <Flex className="gap-2 mt-2">
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Add a new task..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
                    />
                    <Button onClick={addTask} variant="secondary" type="button">
                      Add Task
                    </Button>
                  </Flex>
                </Stack>
              </Box>

              <Flex className="justify-end gap-3 pt-4">
                <Button variant="outline" onClick={resetForm} disabled={isCreating || isUpdating}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? "Saving..." : (editingId ? "Update Template" : "Save Template")}
                </Button>
              </Flex>
            </Stack>
          </CardContent>
        </Card>
      )}

      {!isAddingNew && !editingId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templatesData?.data.map((template) => (
            <Card key={template.id} className="group hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardHeader className="pb-3">
                <Flex className="justify-between items-start">
                  <Box>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {template.description || "No description provided."}
                    </p>
                  </Box>
                  <Box className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!template.isGlobal && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(template)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(template.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </Box>
                </Flex>
              </CardHeader>
              <CardContent>
                <Box className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {template.taskCount} tasks
                  </span>
                  {template.isGlobal && (
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      Global
                    </span>
                  )}
                </Box>
                
                <Accordion type="multiple" className="mt-4">
                  <AccordionItem value={`tasks-${template.id}`} className="border-none">
                    <AccordionTrigger className="py-2 text-xs hover:no-underline">
                      View standard tasks
                    </AccordionTrigger>
                    <AccordionContent>
                      <Stack className="gap-2 pt-2 border-t mt-2">
                        {template.tasks?.map((task: any, i: number) => (
                          <Flex key={i} className="gap-2 text-sm text-foreground/80 justify-between items-center">
                            <Box className="flex gap-2 items-center">
                              <span className="text-muted-foreground min-w-[1.5rem]">{i + 1}.</span>
                              <span>{task.title}</span>
                            </Box>
                            {task.estimatedHours && (
                              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                {task.estimatedHours}h
                              </span>
                            )}
                          </Flex>
                        ))}
                      </Stack>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
          
          {templatesData?.data.length === 0 && (
            <div className="col-span-full py-12 text-center bg-muted/20 rounded-xl border-2 border-dashed">
              <p className="text-muted-foreground italic">No templates found. Create your first template to save time on new projects!</p>
            </div>
          )}
        </div>
      )}
    </Box>
  );
};
