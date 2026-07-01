import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  useRevenue, useCreateRevenue, useUpdateRevenue, useDeleteRevenue,
  REVENUE_CATEGORIES, REVENUE_SOURCES, SOURCE_COLOR, CATEGORY_COLOR,
  type RevenueEntry, type RevenueCategory, type RevenueSource, type CreateRevenueData,
} from "@/hooks/useRevenue";
import type { ReportPeriod } from "@/hooks/useReports";
import { ReportControls } from "@/components/admin/reports/ReportControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, DollarSign, TrendingUp, Receipt, MoreHorizontal, Loader2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  borderRadius: "8px",
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  color: "hsl(var(--foreground))",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// ─── Entry Form ───────────────────────────────────────────────────────────────

interface EntryFormProps {
  open: boolean;
  onClose: () => void;
  editing?: RevenueEntry | null;
}

const EntryForm: React.FC<EntryFormProps> = ({ open, onClose, editing }) => {
  const create = useCreateRevenue();
  const update = useUpdateRevenue();

  const [form, setForm] = useState<CreateRevenueData>({
    date: editing?.date ?? format(new Date(), "yyyy-MM-dd"),
    amount: editing?.amount ?? 0,
    currency: editing?.currency ?? "USD",
    category: (editing?.category as RevenueCategory) ?? "service",
    source: (editing?.source as RevenueSource) ?? "manual",
    description: editing?.description ?? "",
    clientId: editing?.clientId ?? undefined,
    projectId: editing?.projectId ?? undefined,
  });

  React.useEffect(() => {
    if (editing) {
      setForm({
        date: editing.date,
        amount: editing.amount,
        currency: editing.currency,
        category: editing.category as RevenueCategory,
        source: editing.source as RevenueSource,
        description: editing.description ?? "",
      });
    } else {
      setForm({
        date: format(new Date(), "yyyy-MM-dd"),
        amount: 0,
        currency: "USD",
        category: "service",
        source: "manual",
        description: "",
      });
    }
  }, [editing, open]);

  const isPending = create.isPending || update.isPending;

  const handleSave = async () => {
    if (!form.date || !form.amount || form.amount <= 0) {
      toast.error("Date and amount are required");
      return;
    }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...form });
        toast.success("Entry updated");
      } else {
        await create.mutateAsync(form);
        toast.success("Revenue entry added");
      }
      onClose();
    } catch (e: any) {
      toast.error("Failed to save", { description: e?.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Entry" : "Add Revenue Entry"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Amount (USD) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">$</span>
                <Input
                  type="number" min="0" step="0.01" placeholder="0.00"
                  className="pl-7"
                  value={form.amount || ""}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as RevenueCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REVENUE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Source *</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v as RevenueSource })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REVENUE_SOURCES.filter((s) => s.value !== "invoice").map((s) =>
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Description</Label>
            <Input
              placeholder="e.g. Q2 consulting — Acme Corp"
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save changes" : "Add entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const RevenuePage: React.FC = () => {
  const [period, setPeriod] = useState<ReportPeriod>("30d");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RevenueEntry | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useRevenue({
    period,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    source: sourceFilter !== "all" ? sourceFilter : undefined,
    page,
    limit: 25,
  });

  const deleteEntry = useDeleteRevenue();

  const entries = data?.entries ?? [];
  const summary = data?.summary;
  const pagination = data?.pagination;

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this revenue entry?")) return;
    try {
      await deleteEntry.mutateAsync(id);
      toast.success("Entry deleted");
    } catch (e: any) {
      toast.error("Failed to delete", { description: e?.message });
    }
  };

  const openEdit = (entry: RevenueEntry) => {
    setEditing(entry);
    setFormOpen(true);
  };

  return (
    <div className="flex-1 space-y-5 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Revenue</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Track all income across invoices and manual entries.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add entry
        </Button>
      </div>

      <ReportControls
        period={period}
        onPeriodChange={(p) => { setPeriod(p); setPage(1); }}
        updatedAt={undefined}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      {/* KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-border bg-card">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Total Revenue</span>
                <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <DollarSign className="h-3.5 w-3.5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{fmt(summary.total)}</p>
              <p className="text-xs text-muted-foreground mt-1">{entries.length} entries</p>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Top Category</span>
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                </div>
              </div>
              {summary.byCategory[0] ? (
                <>
                  <p className="text-xl font-bold capitalize">{summary.byCategory[0].category}</p>
                  <p className="text-xs text-muted-foreground mt-1">{fmt(summary.byCategory[0].amount)}</p>
                </>
              ) : <p className="text-xl font-bold text-muted-foreground">—</p>}
            </CardContent>
          </Card>
          <Card className="border border-border bg-card">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">From Invoices</span>
                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <Receipt className="h-3.5 w-3.5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">
                {fmt(summary.bySource.find((s) => s.source === "invoice")?.amount ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {fmt(summary.total - (summary.bySource.find((s) => s.source === "invoice")?.amount ?? 0))} other
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {!isLoading && summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue over time */}
          <Card className="border border-border bg-card lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Revenue over time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={summary.byMonth}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), "Revenue"]} />
                  <Area dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* By category donut */}
          <Card className="border border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">By category</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.byCategory.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data</div>
              ) : (
                <div className="flex flex-col gap-3">
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={summary.byCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="amount" nameKey="category">
                        {summary.byCategory.map((c) => (
                          <Cell key={c.category} fill={CATEGORY_COLOR[c.category as RevenueCategory] ?? "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5">
                    {summary.byCategory.map((c) => (
                      <div key={c.category} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLOR[c.category as RevenueCategory] ?? "#94a3b8" }} />
                          <span className="text-muted-foreground capitalize">{c.category}</span>
                        </div>
                        <span className="font-medium tabular-nums">{fmt(c.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* By source bar */}
      {!isLoading && summary && summary.bySource.length > 0 && (
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Revenue by source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={summary.bySource} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => fmt(v)} />
                <YAxis dataKey="source" type="category" axisLine={false} tickLine={false} width={90} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), "Revenue"]} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[0,4,4,0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Entries table */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-semibold">Entries</CardTitle>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
                <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="All categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {REVENUE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1); }}>
                <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="All sources" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  {REVENUE_SOURCES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-64 w-full" /> : (
            <>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          No revenue entries for this period. Add your first entry or check your paid invoices.
                        </TableCell>
                      </TableRow>
                    ) : (
                      entries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(entry.date), "d MMM yyyy")}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium leading-none">{entry.description || "—"}</p>
                            {entry.clientName && (
                              <p className="text-xs text-muted-foreground mt-0.5">{entry.clientName}</p>
                            )}
                            {entry.invoiceNumber && (
                              <p className="text-xs text-muted-foreground mt-0.5">Invoice {entry.invoiceNumber}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs capitalize text-muted-foreground">{entry.category}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLOR[entry.source as RevenueSource] ?? "bg-gray-100 text-gray-600"}`}>
                              {entry.source.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {fmt(entry.amount)}
                          </TableCell>
                          <TableCell>
                            {entry.source !== "invoice" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(entry)}>
                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2 cursor-pointer text-rose-600" onClick={() => handleDelete(entry.id)}>
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-muted-foreground text-xs">
                    {(page - 1) * 25 + 1}–{Math.min(page * 25, pagination.total)} of {pagination.total}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <EntryForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} editing={editing} />
    </div>
  );
};

export default RevenuePage;
