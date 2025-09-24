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
import { agents } from "../../../agents";
import { AgentView } from "@/types";

// Define Agent interface

// Sample data structure for agents
const initialData: AgentView[] = agents.map((a) => {
  return {
    branch: "ירושלים",
    name: a.name,
    responsibility: a.responsibility,
    nationalId: a.id,
    operations: 100,
  };
});

// Define column structure for the table
const columns: ColumnDef<AgentView>[] = [
  {
    accessorKey: "nationalId",
    header: ({ column }) => (
      <div
        className="flex gap-1 items-center max-w-[1px] select-none cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        National ID
        <ChevronDown className={cn("transition-all size-4", column.getIsSorted() && "rotate-180")} />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div
        className="flex gap-1 items-center max-w-[1px] select-none cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ChevronDown className={cn("transition-all size-4", column.getIsSorted() && "rotate-180")} />
      </div>
    ),
  },
  {
    accessorKey: "operations",
    header: ({ column }) => (
      <div
        className="flex gap-1 items-center cursor-pointer max-w-[1px]"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Operations
        <ChevronDown className={cn("transition-all size-4", column.getIsSorted() && "rotate-180")} />
      </div>
    ),
  },
  {
    accessorKey: "branch",
    header: ({ column }) => (
      <div
        className="flex gap-1 items-center max-w-[1px] select-none cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Branch
        <ChevronDown className={cn("transition-all size-4", column.getIsSorted() && "rotate-180")} />
      </div>
    ),
  },
  {
    accessorKey: "responsibility",
    header: ({ column }) => (
      <div
        className="flex gap-1 items-center max-w-[1px] select-none cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Main Responsibility
        <ChevronDown className={cn("transition-all size-4", column.getIsSorted() && "rotate-180")} />
      </div>
    ),
  },
];

interface AgentsTableProps {
  agents: AgentView[];
}

function AgentsTable({ agents }: AgentsTableProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: agents,
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
        row.getValue("name").toString().toLowerCase().includes(search) ||
        //@ts-ignore

        row.getValue("nationalId").toString().toLowerCase().includes(search)
      );
    },
  });

  return (
    <div className="flex flex-col gap-4 ">
      <div className="flex gap-2 mb-2">
        <Input
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="w-[250px]"
          placeholder="Search by name or national ID..."
        />
        <Button variant="outline">Search</Button>
      </div>
      <div className=" flex justify-between w-full  items-end">
        <div className=" text-lg font-medium">Session Agents</div>
        <div className="text-sm text-muted-foreground">{agents.length} agents in session</div>
      </div>
      <div className="rounded-md border">
        <Table className="">
          <TableHeader className="">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap max-w-[1px]">
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
            className=" cursor-pointer select-none"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            className=" cursor-pointer select-none"
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

export default AgentsTable;
