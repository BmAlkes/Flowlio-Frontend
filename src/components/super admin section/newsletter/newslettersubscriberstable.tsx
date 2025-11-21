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

export const NewsletterSubscribersTable = () => {
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    data: subscribersResponse,
    isLoading,
    error,
  } = useFetchNewsletterSubscribers(page, limit);

  const { data: statsResponse } = useFetchNewsletterStats();
  const deleteMutation = useDeleteNewsletterSubscriber();

  const subscribers = subscribersResponse?.data?.subscribers || [];
  const pagination = subscribersResponse?.data?.pagination;
  const stats = statsResponse?.data;

  const handleDelete = (subscriber: NewsletterSubscriber) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${subscriber.email} from the newsletter list?`
      )
    ) {
      deleteMutation.mutate(subscriber.id);
    }
  };

  const columns: ColumnDef<NewsletterSubscriber>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.email}</div>
      ),
    },
    {
      accessorKey: "subscribed",
      header: "Status",
      cell: ({ row }) => (
        <Flex className="items-center gap-2">
          {row.original.subscribed ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-green-600">Subscribed</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-600">Unsubscribed</span>
            </>
          )}
        </Flex>
      ),
    },
    {
      accessorKey: "subscribedAt",
      header: "Subscribed At",
      cell: ({ row }) => {
        const date = new Date(row.original.subscribedAt);
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(row.original)}
          disabled={deleteMutation.isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <FaRegTrashAlt className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Center className="px-4 py-6">
        <div className="text-gray-500">Loading subscribers...</div>
      </Center>
    );
  }

  if (error) {
    return (
      <Center className="px-4 py-6">
        <div className="text-red-500">
          Error loading subscribers. Please try again.
        </div>
      </Center>
    );
  }

  return (
    <Box className="px-4 pb-6">
      {/* Statistics Cards */}
      {stats && (
        <Flex className="gap-4 mb-6 max-sm:flex-col">
          <Box className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Total Subscribers</div>
            <div className="text-2xl font-semibold text-gray-900">
              {stats.total}
            </div>
          </Box>
          <Box className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Active</div>
            <div className="text-2xl font-semibold text-green-600">
              {stats.subscribed}
            </div>
          </Box>
          <Box className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Unsubscribed</div>
            <div className="text-2xl font-semibold text-red-600">
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
