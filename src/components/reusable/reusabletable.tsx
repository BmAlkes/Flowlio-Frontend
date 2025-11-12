import {
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  getSortedRowModel,
  VisibilityState,
  getCoreRowModel,
  useReactTable,
  SortingState,
  flexRender,
  ColumnDef,
  Row,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import * as React from "react";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { Stack } from "@/components/ui/stack";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { ListFilter, Search } from "lucide-react";
import { Input } from "../ui/input";
import { CalendarComponent } from "../ui/calendercomp";

// Define the props interface for the reusable table
export interface ReusableTableProps<TData> {
  data: TData[];
  enableSorting?: boolean;
  searchClassName?: string;
  filterClassName?: string;
  columns: ColumnDef<TData>[];
  enableSuperAdminTable?: boolean;
  enableCompanyDetailsTable?: boolean;
  enableGlobalFilter?: boolean;
  enableMyTaskTable?: boolean;
  enableSubscriptionsTable?: boolean;
  enableColumnFilters?: boolean;
  defaultSorting?: SortingState;
  enablePaymentLinksCalender?: boolean;
  onRowClick?: (row: Row<TData>) => void;
  onTableStateChange?: (state: {
    rowSelection: Record<string, boolean>;
  }) => void;
  defaultColumnVisibility?: VisibilityState;
  defaultColumnFilters?: ColumnFiltersState;
  // Optional external filters to control table filtering from parent
  externalColumnFilters?: ColumnFiltersState;
}

export const ReusableTable = <TData,>({
  data,
  columns,
  enablePaymentLinksCalender = false,
  enableGlobalFilter = true,
  enableSuperAdminTable = false,
  enableCompanyDetailsTable = false,
  enableSubscriptionsTable = false,
  enableMyTaskTable = false,
  searchClassName,
  filterClassName,
  onTableStateChange,
  // onRowClick,
  defaultColumnVisibility = {},
  defaultSorting = [],
  defaultColumnFilters = [],
  externalColumnFilters,
}: ReusableTableProps<TData>) => {
  const [sorting, setSorting] = React.useState<SortingState>(defaultSorting);
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(defaultColumnFilters);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(defaultColumnVisibility);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (
      row: Row<TData>,
      _columnId: string,
      filterValue: string
    ) => {
      const search = filterValue.toLowerCase();
      return Object.values(row.original as Record<string, unknown>).some(
        (value) => String(value).toLowerCase().includes(search)
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
  });

  // Call onTableStateChange when row selection changes
  React.useEffect(() => {
    if (onTableStateChange) {
      onTableStateChange({ rowSelection });
    }
  }, [rowSelection, onTableStateChange]);

  // Sync external filters into internal state when provided
  React.useEffect(() => {
    if (externalColumnFilters) {
      setColumnFilters(externalColumnFilters);
    }
  }, [externalColumnFilters]);

  const [range, setRange] = React.useState<{ from?: Date; to?: Date }>({});
  React.useEffect(() => {
    if (range.from && range.to) {
      setColumnFilters([
        {
          id: "startDate",
          value: range,
        },
      ]);
    } else {
      setColumnFilters([]); // Clear filters to show all projects
    }
  }, [range]);

  return (
    <Box
      className={cn(
        "rounded-xl w-full py-0",
        enableCompanyDetailsTable ? "px-0" : "px-4",
        enableSubscriptionsTable ? "px-0" : "px-4",
        enableMyTaskTable && "px-0"
      )}
    >
      <Stack className="gap-4">
        {enableGlobalFilter && (
          <Flex className="justify-between max-sm:items-start flex-col lg:flex-row items-center w-full gap-4">
            <Flex className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5.5 w-5.5 text-gray-300 font-light" />
              <Input
                type="search"
                placeholder="Search"
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className={cn(
                  "w-full md:w-115 lg:w-80 xl:w-[400px] py-4 pl-10 bg-white h-10  placeholder:text-black  placeholder:text-[15px] border border-gray-100  focus:outline-none active:border-gray-200 focus:ring-0 focus:ring-offset-0",
                  searchClassName
                )}
              />
            </Flex>

            <Flex className="max-md:w-full justify-between">
              {enablePaymentLinksCalender && (
                <CalendarComponent range={range} setRange={setRange} />
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    aria-haspopup="dialog"
                    className={cn(
                      "cursor-pointer bg-white border border-gray-200 h-10 text-black shadow-none",
                      filterClassName
                    )}
                  >
                    <ListFilter />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Flex>
          </Flex>
        )}
      </Stack>

      <Box
        className={cn(
          "rounded-md border overflow-hidden",
          enableCompanyDetailsTable
            ? "rounded-t-none border-none"
            : "rounded-md",
          enableSuperAdminTable ? "mt-0" : "mt-6",
          enableSubscriptionsTable ? "mt-4" : "mt-6",
          enableMyTaskTable && "mt-4"
        )}
      >
        <Table>
          <TableHeader className="bg-[#F3F5F5] rounded-md">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};
