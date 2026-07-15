import { FC, useMemo } from "react";
import { Link2, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentLink } from "@/hooks/usefetchpaymentlinks";

interface PaymentLinkStatCardsProps {
  paymentLinks: PaymentLink[];
}

export const PaymentLinkStatCards: FC<PaymentLinkStatCardsProps> = ({ paymentLinks }) => {
  const stats = useMemo(() => {
    const paid = paymentLinks.filter((p) => p.status === "paid");
    const unpaid = paymentLinks.filter((p) => p.status !== "paid");
    const sum = (list: PaymentLink[]) =>
      list.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);

    return {
      total: paymentLinks.length,
      totalAmount: sum(paymentLinks),
      paidCount: paid.length,
      paidAmount: sum(paid),
      unpaidCount: unpaid.length,
      unpaidAmount: sum(unpaid),
    };
  }, [paymentLinks]);

  const cards = [
    {
      label: "Total Links",
      value: stats.total,
      sub: `$${stats.totalAmount.toFixed(2)}`,
      icon: Link2,
      iconBg: "bg-blue-100 dark:bg-blue-500/25",
      iconColor: "text-blue-600 dark:text-blue-300",
      cardBg: "bg-blue-50/50 dark:bg-blue-500/10",
    },
    {
      label: "Paid",
      value: stats.paidCount,
      sub: `$${stats.paidAmount.toFixed(2)}`,
      icon: DollarSign,
      iconBg: "bg-green-100 dark:bg-green-500/25",
      iconColor: "text-green-600 dark:text-green-300",
      cardBg: "bg-green-50/50 dark:bg-green-500/10",
    },
    {
      label: "Unpaid",
      value: stats.unpaidCount,
      sub: `$${stats.unpaidAmount.toFixed(2)}`,
      icon: Clock,
      iconBg: "bg-amber-100 dark:bg-amber-500/25",
      iconColor: "text-amber-600 dark:text-amber-300",
      cardBg: "bg-amber-50/50 dark:bg-amber-500/10",
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 px-4 mb-5">
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
