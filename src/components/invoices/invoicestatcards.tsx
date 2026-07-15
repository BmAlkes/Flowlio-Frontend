import { FC, useMemo } from "react";
import { FileText, DollarSign, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Invoice } from "@/hooks/usefetchinvoices";

const isOverdue = (invoice: Invoice) =>
  invoice.status.toLowerCase() !== "paid" &&
  !!invoice.dueDate &&
  new Date(invoice.dueDate) < new Date();

interface InvoiceStatCardsProps {
  invoices: Invoice[];
}

export const InvoiceStatCards: FC<InvoiceStatCardsProps> = ({ invoices }) => {
  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter((i) => i.status.toLowerCase() === "paid");
    const overdue = invoices.filter(isOverdue);
    const pending = invoices.filter(
      (i) => i.status.toLowerCase() !== "paid" && !isOverdue(i),
    );

    const sum = (list: Invoice[]) =>
      list.reduce((acc, i) => acc + (parseFloat(i.amount) || 0), 0);

    return {
      total,
      paidCount: paid.length,
      paidAmount: sum(paid),
      pendingCount: pending.length,
      pendingAmount: sum(pending),
      overdueCount: overdue.length,
      overdueAmount: sum(overdue),
    };
  }, [invoices]);

  const cards = [
    {
      label: "Total Invoices",
      value: stats.total,
      sub: "All time",
      icon: FileText,
      iconBg: "bg-blue-100 dark:bg-blue-500/25",
      iconColor: "text-blue-600 dark:text-blue-300",
      cardBg: "bg-blue-50/50 dark:bg-blue-500/10",
    },
    {
      label: "Paid Invoices",
      value: stats.paidCount,
      sub: `$${stats.paidAmount.toFixed(2)}`,
      icon: DollarSign,
      iconBg: "bg-green-100 dark:bg-green-500/25",
      iconColor: "text-green-600 dark:text-green-300",
      cardBg: "bg-green-50/50 dark:bg-green-500/10",
    },
    {
      label: "Pending Invoices",
      value: stats.pendingCount,
      sub: `$${stats.pendingAmount.toFixed(2)}`,
      icon: Clock,
      iconBg: "bg-amber-100 dark:bg-amber-500/25",
      iconColor: "text-amber-600 dark:text-amber-300",
      cardBg: "bg-amber-50/50 dark:bg-amber-500/10",
    },
    {
      label: "Overdue Invoices",
      value: stats.overdueCount,
      sub: `$${stats.overdueAmount.toFixed(2)}`,
      icon: AlertCircle,
      iconBg: "bg-rose-100 dark:bg-rose-500/25",
      iconColor: "text-rose-600 dark:text-rose-300",
      cardBg: "bg-rose-50/50 dark:bg-rose-500/10",
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 px-4 mb-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "rounded-2xl border border-border/60 p-4 flex items-start justify-between gap-3",
            card.cardBg,
          )}
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground/90">{card.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
            <p className="text-xs text-muted-foreground/90 mt-0.5">{card.sub}</p>
          </div>
          <div className={cn("p-2.5 rounded-xl shrink-0", card.iconBg)}>
            <card.icon className={cn("h-5 w-5", card.iconColor)} />
          </div>
        </div>
      ))}
    </div>
  );
};
