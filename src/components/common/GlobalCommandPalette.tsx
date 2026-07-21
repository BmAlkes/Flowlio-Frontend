import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FolderOpen, ListTodo, UserPen, Users } from "lucide-react";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import { useFetchTasks } from "@/hooks/usefetchtasks";
import { useFetchClients } from "@/hooks/usefetchclients";
import { useLeads } from "@/hooks/useLeads";

/** Only mounted while the palette is open, so none of these lists are
 * fetched until the user actually opens it (Cmd/Ctrl+K). */
function CommandPaletteResults({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { data: projectsData } = useFetchProjects();
  const { data: tasksData } = useFetchTasks();
  const { data: clientsData } = useFetchClients();
  const { data: leadsData } = useLeads();

  const projects = projectsData?.data ?? [];
  const tasks = tasksData?.data ?? [];
  const clients = clientsData?.data ?? [];
  const leads = leadsData?.data ?? [];

  return (
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>

      {projects.length > 0 && (
        <CommandGroup heading="Projects">
          {projects.slice(0, 30).map((p) => (
            <CommandItem
              key={p.id}
              value={`project ${p.projectName} ${p.clientName}`}
              onSelect={() => onNavigate(`/dashboard/project/view/${p.id}`)}
            >
              <FolderOpen />
              <span>{p.projectName}</span>
              <span className="text-muted-foreground ms-2 text-xs">{p.clientName}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {tasks.length > 0 && (
        <CommandGroup heading="Tasks">
          {tasks.slice(0, 30).map((t) => (
            <CommandItem
              key={t.id}
              value={`task ${t.title} ${t.projectName}`}
              onSelect={() => onNavigate(`/dashboard/project/view/${t.projectId}`)}
            >
              <ListTodo />
              <span>{t.title}</span>
              <span className="text-muted-foreground ms-2 text-xs">{t.projectName}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {clients.length > 0 && (
        <CommandGroup heading="Clients">
          {clients.slice(0, 30).map((c) => (
            <CommandItem
              key={c.id}
              value={`client ${c.name} ${c.email}`}
              onSelect={() => onNavigate("/dashboard/client-management")}
            >
              <UserPen />
              <span>{c.name}</span>
              <span className="text-muted-foreground ms-2 text-xs">{c.email}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {leads.length > 0 && (
        <CommandGroup heading="Leads">
          {leads.slice(0, 30).map((l) => (
            <CommandItem
              key={l.id}
              value={`lead ${l.name} ${l.email}`}
              onSelect={() => onNavigate("/dashboard/leads")}
            >
              <Users />
              <span>{l.name}</span>
              <span className="text-muted-foreground ms-2 text-xs">{l.email}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </CommandList>
  );
}

export function GlobalCommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search Flowlio"
      description="Jump to any project, task, client, or lead"
    >
      <CommandInput placeholder="Search projects, tasks, clients, leads..." />
      {open && <CommandPaletteResults onNavigate={handleNavigate} />}
    </CommandDialog>
  );
}
