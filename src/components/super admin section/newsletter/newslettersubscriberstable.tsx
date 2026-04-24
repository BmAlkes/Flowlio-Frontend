import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { ReusableTable } from "@/components/reusable/reusabletable";
import {
  useFetchNewsletterSubscribers,
  type NewsletterSubscriber,
} from "@/hooks/usefetchnewslettersubscribers";
import { useDeleteNewsletterSubscriber } from "@/hooks/usedeletenewslettersubscriber";
import { useFetchNewsletterStats } from "@/hooks/usefetchnewslettersubscribers";
import { FaRegTrashAlt } from "react-icons/fa";
import { CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TableSkeleton, CardSkeleton, ErrorState } from "@/components/skeletons";

export const NewsletterSubscribersTable = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    data: subscribersResponse,
    isLoading: isSubscribersLoading,
    isFetching: isSubscribersFetching,
    error,
  } = useFetchNewsletterSubscribers(page, limit);

  const { data: statsResponse, isLoading: isStatsLoading, isFetching: isStatsFetching } = useFetchNewsletterStats();

  const loading = isSubscribersLoading || isSubscribersFetching || isStatsLoading || isStatsFetching;
  const deleteMutation = useDeleteNewsletterSubscriber();

  const subscribers = subscribersResponse?.data?.subscribers || [];
  const pagination = subscribersResponse?.data?.pagination;
  const stats = statsResponse?.data;

  const handleDelete = (subscriber: NewsletterSubscriber) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${subscriber.email} from the newsletter list?`,
      )
    ) {
      deleteMutation.mutate(subscriber.id);
    }
  };

  const columns: ColumnDef<NewsletterSubscriber>[] = [
    {
      accessorKey: "email",
      header: t("superadmin.newsletter.table.email", "Email"),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.email}</div>
      ),
    },
    {
      accessorKey: "subscribed",
      header: t("superadmin.newsletter.table.status", "Status"),
      cell: ({ row }) => (
        <Flex className="items-center gap-2">
          {row.original.subscribed ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-green-600">{t("superadmin.newsletter.active", "Subscribed")}</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-600">{t("superadmin.newsletter.unsubscribed", "Unsubscribed")}</span>
            </>
          )}
        </Flex>
      ),
    },
    {
      accessorKey: "subscribedAt",
      header: t("superadmin.newsletter.table.subscribedAt", "Subscribed At"),
      cell: ({ row }) => {
        const date = new Date(row.original.subscribedAt);
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: t("superadmin.newsletter.table.createdAt", "Created At"),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      header: t("superadmin.newsletter.table.actions", "Actions"),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(row.original)}
          disabled={deleteMutation.isPending}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <FaRegTrashAlt className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (loading && subscribers.length === 0) {
    return (
      <Box className="px-4 py-4">
        <CardSkeleton count={3} className="mb-6 h-24" />
        <TableSkeleton rows={10} columns={5} withActions />
      </Box>
    );
  }

  if (error && subscribers.length === 0) {
    return (
      <Center className="px-4 py-10">
        <ErrorState
          title={t("common.error")}
          message={error.message || t("common.errorDescription", "Error loading subscribers. Please try again.")}
        />
      </Center>
    );
  }

  return (
    <Box className="px-4 pb-6">
      {/* Statistics Cards */}
      {stats && (
        <Flex className="gap-4 mb-6 max-sm:flex-col">
          <Box className="flex-1 bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">{t("superadmin.newsletter.totalSubscribers", "Total Subscribers")}</div>
            <div className="text-2xl font-semibold text-foreground">
              {stats.total}
            </div>
          </Box>
          <Box className="flex-1 bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">{t("superadmin.newsletter.active", "Active")}</div>
            <div className="text-2xl font-semibold text-green-600">
              {stats.subscribed}
            </div>
          </Box>
          <Box className="flex-1 bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">{t("superadmin.newsletter.unsubscribed", "Unsubscribed")}</div>
            <div className="text-2xl font-semibold text-destructive">
              {stats.unsubscribed}
            </div>
          </Box>
        </Flex>
      )}

      {/* Table */}
      <ReusableTable
        data={subscribers}
        columns={columns}
        pagination={
          pagination
            ? {
                pageIndex: pagination.page - 1,
                pageSize: pagination.limit,
                pageCount: pagination.totalPages,
                total: pagination.total,
                onPageChange: (newPage: number) => setPage(newPage + 1),
              }
            : undefined
        }
      />
    </Box>
  );
};
