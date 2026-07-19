import { useMemo, useState } from "react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { GeneralModal } from "../common/generalmodal";
import { Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useFetchClients } from "@/hooks/usefetchclients";
import { useFetchClientProjects } from "@/hooks/useFetchClientProjects";
import { useAllTimeEntries } from "@/hooks/useAllTimeEntries";
import { useCreateInvoice } from "@/hooks/usecreateinvoice";
import { useMarkTimeEntriesInvoiced } from "@/hooks/usemarktimeentriesinvoiced";
import { useUser } from "@/providers/user.provider";

interface GenerateInvoiceFromTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export interface TaskTimeAggregate {
  taskTitle: string;
  minutes: number;
}

/** Sums tracked minutes per task, so the same task's multiple time entries
 * collapse into one invoice description line instead of one per entry. */
export function aggregateTimeEntriesByTask(
  entries: { taskId: string; taskTitle: string; duration?: number }[],
): TaskTimeAggregate[] {
  const map = new Map<string, TaskTimeAggregate>();
  for (const entry of entries) {
    const existing = map.get(entry.taskId);
    const minutes = entry.duration ?? 0;
    if (existing) {
      existing.minutes += minutes;
    } else {
      map.set(entry.taskId, { taskTitle: entry.taskTitle, minutes });
    }
  }
  return Array.from(map.values());
}

/** Rounds to cents the same way currency amounts should always be rounded —
 * floating point multiplication (hours * rate) can otherwise leave e.g. 149.99999999999997. */
export function computeInvoiceAmount(totalHours: number, hourlyRate: number): number {
  return Math.round(totalHours * hourlyRate * 100) / 100;
}

export const GenerateInvoiceFromTimeModal: React.FC<GenerateInvoiceFromTimeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: userData } = useUser();
  const organizationId = userData?.user?.organizationId;

  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState(startOfMonthISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [hourlyRate, setHourlyRate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clientsData } = useFetchClients();
  const { data: clientProjectsData } = useFetchClientProjects(clientId || undefined, organizationId);
  const { data: timeEntriesData } = useAllTimeEntries();
  const createInvoice = useCreateInvoice();
  const markInvoiced = useMarkTimeEntriesInvoiced();

  const eligibleEntries = useMemo(() => {
    if (!clientId) return [];
    const projectIds = new Set((clientProjectsData?.data?.projects ?? []).map((p) => p.id));
    if (projectIds.size === 0) return [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return (timeEntriesData?.data ?? []).filter((entry) => {
      if (entry.status !== "completed") return false;
      if (entry.invoicedAt) return false;
      if (!projectIds.has(entry.projectId)) return false;
      const entryDate = new Date(entry.startTime);
      return entryDate >= start && entryDate <= end;
    });
  }, [clientId, clientProjectsData, timeEntriesData, startDate, endDate]);

  const byTask = useMemo(() => aggregateTimeEntriesByTask(eligibleEntries), [eligibleEntries]);

  const totalMinutes = byTask.reduce((sum, t) => sum + t.minutes, 0);
  const totalHours = totalMinutes / 60;
  const rate = parseFloat(hourlyRate) || 0;
  const amount = computeInvoiceAmount(totalHours, rate);

  const description = useMemo(() => {
    if (byTask.length === 0) return "";
    const lines = byTask.map(
      (t) => `- ${t.taskTitle}: ${(t.minutes / 60).toFixed(2)}h`,
    );
    return `Time tracking (${startDate} to ${endDate}), ${totalHours.toFixed(2)}h total:\n${lines.join("\n")}`;
  }, [byTask, startDate, endDate, totalHours]);

  const resetAndClose = () => {
    setClientId("");
    setHourlyRate("");
    setDueDate("");
    setStartDate(startOfMonthISO());
    setEndDate(todayISO());
    onClose();
  };

  const handleSubmit = async () => {
    if (!clientId) return toast.error("Select a client");
    if (eligibleEntries.length === 0) return toast.error("No unbilled tracked hours found for this client in this period");
    if (rate <= 0) return toast.error("Enter an hourly rate greater than 0");

    setIsSubmitting(true);
    try {
      const result = await createInvoice.mutateAsync({
        clientId,
        amount,
        description,
        dueDate: dueDate || undefined,
      });

      markInvoiced.mutate(
        { entryIds: eligibleEntries.map((e) => e.id), invoiceId: result.data.id },
        {
          onError: () =>
            toast.warning(
              "Invoice created, but couldn't mark these hours as billed — they may show up again next time.",
            ),
        },
      );

      resetAndClose();
    } catch {
      // useCreateInvoice already toasts the error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GeneralModal open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <Box className="space-y-5">
        <Box>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" /> Generate Invoice from Time Tracking
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Sums unbilled tracked hours for a client's projects into a single invoice amount.
          </p>
        </Box>

        <Box>
          <label className="text-sm font-medium text-foreground">Client *</label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clientsData?.data?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Box>

        <Flex className="gap-3">
          <Box className="flex-1">
            <label className="text-sm font-medium text-foreground">From</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Box>
          <Box className="flex-1">
            <label className="text-sm font-medium text-foreground">To</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Box>
        </Flex>

        <Box>
          <label className="text-sm font-medium text-foreground">Hourly Rate *</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 50.00"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
          />
        </Box>

        <Box>
          <label className="text-sm font-medium text-foreground">Due Date</label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Box>

        {clientId && (
          <Box className="rounded-lg border border-border bg-muted/30 p-3">
            {byTask.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No unbilled completed time entries found for this client in this period.
              </p>
            ) : (
              <>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {totalHours.toFixed(2)}h across {byTask.length} task(s)
                </p>
                <Box className="space-y-1 mb-3">
                  {byTask.map((t) => (
                    <Flex key={t.taskTitle} className="justify-between text-xs text-foreground">
                      <span>{t.taskTitle}</span>
                      <span className="text-muted-foreground">{(t.minutes / 60).toFixed(2)}h</span>
                    </Flex>
                  ))}
                </Box>
                <Flex className="justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm font-medium text-foreground">Total amount</span>
                  <span className="text-lg font-bold text-foreground">${amount.toFixed(2)}</span>
                </Flex>
              </>
            )}
          </Box>
        )}

        <Flex className="justify-end gap-2 pt-2">
          <Button variant="outline" onClick={resetAndClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !clientId || byTask.length === 0 || rate <= 0}
            className="bg-[#1797b9] hover:bg-[#1797b9]/80 text-white"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
            Create Invoice
          </Button>
        </Flex>
      </Box>
    </GeneralModal>
  );
};
