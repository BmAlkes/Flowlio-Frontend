import { Plus, UserPlus, FolderPlus, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Create Client",
      icon: UserPlus,
      route: "/dashboard/client-management/create-client",
      description: "Add a new client to your organization",
    },
    {
      label: "Create Project",
      icon: FolderPlus,
      route: "/dashboard/project/create-project",
      description: "Start a new project",
    },
    {
      label: "Create Task",
      icon: CheckSquare,
      route: "/dashboard/task-management/create-task",
      description: "Create a new task",
    },
  ];

  const handleActionClick = (route: string) => {
    navigate(route);
  };

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full bg-[#1797B9] hover:bg-white/90 hover:text-gray-500 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                )}
                aria-label="Quick Actions"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent className="mt-2">
            <p>Quick Actions</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-74">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.route}
              onClick={() => handleActionClick(action.route)}
              className="cursor-pointer flex items-start gap-3 py-3 px-3 hover:bg-accent"
            >
              <div className="mt-0.5">
                <Icon className="h-5 w-5 text-[#1797B9]" />
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="font-medium text-sm">{action.label}</span>
                <span className="text-xs text-muted-foreground">
                  {action.description}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
