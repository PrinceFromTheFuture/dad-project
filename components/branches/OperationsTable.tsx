"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { operations } from "../../../operations"; // Assuming operations data is imported
import { OperationView } from "@/types";

// Define column structure for the table
const columns: ColumnDef<OperationView>[] = [
  {
    accessorKey: "agentId",
    header: ({ column }) => (
      <div
        className="flex gap-1 items-center max-w-[5px]  select-none cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Agent ID
        <ChevronDown className={cn("transition-all size-4", column.getIsSorted() && "rotate-180")} />
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <div
        className="flex gap-1 items-center max-w-[5px]  select-none cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category
        <ChevronDown className={cn("transition-all size-4", column.getIsSorted() && "rotate-180")} />
      </div>
    ),
  },
  {
    accessorKey: "repeated",
    header: ({ column }) => (
      <div
        className="flex gap-1 items-center max-w-[5px]  select-none cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Repeated
        <ChevronDown className={cn("transition-all size-4", column.getIsSorted() && "rotate-180")} />
      </div>
    ),
  },
  {
    accessorKey: "branch",
    header: ({ column }) => (
      <div
        className="flex gap-1  items-center max-w-[5px]  select-none cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Branch
        <ChevronDown className={cn("transition-all size-4", column.getIsSorted() && "rotate-180")} />
      </div>
    ),
  },
];

interface OperationsTableProps {
  operations: OperationView[];
}

function OperationsTable({ operations }: OperationsTableProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: operations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      globalFilter: searchQuery,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchQuery,
    globalFilterFn: (row, columnId, filterValue: string) => {
      const search = filterValue.toLowerCase();
      return (
        //@ts-ignore
        row.getValue("category").toString().toLowerCase().includes(search) ||
        //@ts-ignore
        row.getValue("agentId").toString().toLowerCase().includes(search)
      );
    },
  });

  return (
    <div className="flex flex-col gap-4   ">
      <div className="flex gap-2 mb-2">
        <Input
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="w-[250px]"
          placeholder="Search by category or agent ID..."
        />
        <Button variant="outline">Search</Button>
      </div>
      <div className="flex justify-between w-full items-end ">
        <div className="text-lg font-medium">Operations</div>
        <div className="text-sm text-muted-foreground">{operations.length} operations recorded</div>
      </div>
      <div className="rounded-md border   ">
        <Table className=" ">
          <TableHeader className=" ">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className=" " key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="  max-w-[5px]">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className=" ">
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className=" ">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="cursor-pointer select-none"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer select-none"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default OperationsTable;
