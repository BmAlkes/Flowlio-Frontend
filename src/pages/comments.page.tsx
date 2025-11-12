import {
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  SortingState,
  useReactTable,
  VisibilityState,
  getCoreRowModel,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Filter, PencilLine, Search, Trash2, DownloadIcon } from "lucide-react";
import { ComponentWrapper } from "@/components/common/componentwrapper";
import { CalendarComponent } from "@/components/ui/calendercomp";
import { UserProfile } from "@/components/common/userprofile";
import { Center } from "@/components/ui/center";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flex } from "@/components/ui/flex";
import { Box } from "@/components/ui/box";
import autoTable from "jspdf-autotable";
import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import * as React from "react";
import { jsPDF } from "jspdf";

const data: Data[] = Array.from({ length: 10 }, () => ({
  profilePic: faker.image.avatar(),
  comment: faker.lorem.sentence(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  task: faker.lorem.words(1),
}));

export type Data = {
  profilePic: string;
  comment: string;
  email: string;
  task: string;
  name: string;
};

export const columns = (): ColumnDef<Data>[] => [
  {
    accessorKey: "name",
    header: () => <Box className="text-black pl-5">Name</Box>,
    cell: ({ row }) => (
      <UserProfile
        avatarClassName="size-12"
        label={row.original.name}
        src={row.original.profilePic}
        description="Monday, June 14, 2025"
      />
    ),
  },

  {
    accessorKey: "comment",
    header: () => <Box className="text-center text-black">Comment</Box>,
    cell: ({ row }) => {
      return (
        <Center>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {row.original.comment.substring(0, 20).concat("...")}
              </TooltipTrigger>
              <TooltipContent>{row.original.comment}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Center>
      );
    },
  },
  {
    accessorKey: "task",
    header: () => <Box className="text-center text-black">Task</Box>,
    cell: ({ row }) => (
      <Box className="lowercase text-center">{row.original.task}</Box>
    ),
  },

  {
    accessorKey: "actions",
    header: () => <Box className="text-center text-black">Actions</Box>,
    cell: () => {
      return (
        <Center className="space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    // open comment form
                  }}
                  className="bg-green-100 border border-green-200 hover:bg-green-200"
                >
                  <PencilLine className="text-green-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="mb-2">
                <p>Edit Comment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  className="bg-red-200/50 border border-red-200 hover:bg-red-200"
                >
                  <Trash2 className="text-red-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="mb-2">
                <p>Delete Comment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Center>
      );
    },
  },
];

export const CommentsPage = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns: columns(),
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const generatePDF = () => {
    // Create new PDF document
    const doc = new jsPDF();
    let yPos = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;

    // Add title and date
    doc.setFontSize(20);
    doc.setTextColor(108, 117, 125);
    doc.text("Comments Report", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    doc.setFontSize(12);
    doc.text(
      `Generated on: ${format(new Date(), "PPP")}`,
      pageWidth / 2,
      yPos,
      { align: "center" }
    );
    yPos += 20;

    // Project Information
    doc.setFontSize(16);
    doc.setTextColor(108, 117, 125);
    doc.text("Project Information", margin, yPos);
    yPos += 10;

    const projectData = [
      ["Project Name", "Fire Station N8 Rebuild"],
      ["Project Number", "01-20002-00"],
      ["Location", "4845 Lee Highway, Arlington Virginia. 22207"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: projectData,
      theme: "plain",
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { cellWidth: 100 },
      },
      margin: { left: margin },
      didDrawPage: function (data: any) {
        yPos = data.cursor.y + 20;
      },
    });

    // Comments Table
    doc.setFontSize(16);
    doc.text("Comments Overview", margin, yPos);
    yPos += 10;

    const commentsHead = [["Name", "Comment", "Task", "Date"]];
    const commentsData = data.map((item) => [
      item.name,
      item.comment,
      item.task,
      format(new Date(), "PPP"), // Using current date as example
    ]);

    autoTable(doc, {
      startY: yPos,
      head: commentsHead,
      body: commentsData,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 80 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
      },
      margin: { left: margin, right: margin },
      didDrawPage: function (data: any) {
        yPos = data.cursor.y + 20;
        // Re-add the header on new pages
        if (data.pageCount > 1) {
          doc.setFontSize(16);
          doc.text("Comments Overview (continued)", margin, 20);
        }
      },
    });

    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(108, 117, 125);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    doc.save("Comments-Report.pdf");
  };

  return (
    <ComponentWrapper className="p-6 mt-6">
      <Box>
        <Flex className="justify-between max-md:flex-col items-start">
          <Box>
            <h1 className="text-3xl font-medium capitalize">
              Comments Management
            </h1>
            <p className="text-gray-500 mt-1">
              Track and manage comments efficiently across your project.
            </p>
          </Box>

          <Button
            className="bg-green-600 cursor-pointer hover:bg-green-500"
            size={"lg"}
            onClick={generatePDF}
          >
            <DownloadIcon />
            Download Report
          </Button>
        </Flex>
      </Box>
      <Box className="w-full mt-4">
        <Flex className="justify-between py-4 max-md:flex-col items-start">
          <Flex className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              value={
                (table.getColumn("company")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("company")?.setFilterValue(event.target.value)
              }
              className="pl-10 bg-white"
            />
          </Flex>

          <Flex className="max-md:w-full justify-between">
            <CalendarComponent />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto cursor-pointer">
                  <Filter />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
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
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </Flex>
        </Flex>

        <Box className="rounded-md border">
          <Table>
            <TableHeader className="bg-accent">
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
    </ComponentWrapper>
  );
};
