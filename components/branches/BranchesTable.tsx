"use client";
import React, { useEffect, useState } from "react";
import Tabs from "../costume/Tabs";
import BranchRow from "./BranchRow";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BranchReport } from "@/types";

type SortingKey = "id" | "fileSize" | "date" | "name" | "agents" | "operations";
type SortDirection = "asc" | "desc";
function BranchesTable({ branches: initialData }: { branches: BranchReport[] }) {
  const [searchQ, setSearchQ] = useState("");
  const [sortValue, setSortValue] = useState<SortingKey>("id");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [branches, setBranches] = useState<BranchReport[]>(initialData);

  const sorter = (key: SortingKey, dir: SortDirection) => {
    const compare = {
      id: (a: BranchReport, b: BranchReport) => Number(a.id) - Number(b.id),
      name: (a: BranchReport, b: BranchReport) => a.name.localeCompare(b.name),
      date: (a: BranchReport, b: BranchReport) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      fileSize: (a: BranchReport, b: BranchReport) => Number(a.fileSize) - Number(b.fileSize),
      agents: (a: BranchReport, b: BranchReport) => a.totalAgents - b.totalAgents,
      operations: (a: BranchReport, b: BranchReport) => a.totalOperations - b.totalOperations,
    }[key];

    const sorted = [...branches].sort(compare);
    return dir === "asc" ? sorted : sorted.reverse();
  };

  const handleSort = (key: SortingKey) => {
    if (key === sortValue) {
      // toggle direction if clicking same key
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortValue(key);
      setSortDir("asc");
    }
  };

  useEffect(() => {
    setBranches(sorter(sortValue, sortDir));
  }, [sortValue, sortDir]);

  return (
    <div className=" flex flex-col  gap-4  ">
      <div className=" flex gap-2 mb-2  ">
        <Input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          className="w-[250px]"
          placeholder="Search"
        />
        <Button variant={"outline"} className=" cursor-pointer">
          Search
        </Button>
      </div>
      <div className="  flex justify-between  px-8 text-sm text-muted-foreground text-left  items-center">
        <div className="  flex-1  flex gap-1 items-center cursor-pointer" onClick={() => handleSort("id")}>
          ID
          <ChevronDown className={cn(" transition-all size-4", sortValue === "id" && "rotate-180")} />
        </div>
        <div className="  flex-4   flex gap-1 items-center cursor-pointer" onClick={() => handleSort("name")}>
          Branch Name
          <ChevronDown className={cn(" transition-all size-4", sortValue === "name" && "rotate-180")} />
        </div>

        <div className=" flex-3  flex gap-1 items-center cursor-pointer" onClick={() => handleSort("date")}>
          Date
          <ChevronDown className={cn(" transition-all size-4", sortValue === "date" && "rotate-180")} />
        </div>

        <div
          className=" flex-2  flex gap-1 items-center cursor-pointer"
          onClick={() => handleSort("fileSize")}
        >
          File Size
          <ChevronDown className={cn(" transition-all size-4", sortValue === "fileSize" && "rotate-180")} />
        </div>
        <div className=" flex-2  flex gap-1 items-center cursor-pointer" onClick={() => handleSort("agents")}>
          Agents
          <ChevronDown className={cn(" transition-all size-4", sortValue === "agents" && "rotate-180")} />
        </div>
        <div
          className=" flex-2  flex gap-1 items-center cursor-pointer"
          onClick={() => handleSort("operations")}
        >
          Operations
          <ChevronDown className={cn(" transition-all size-4", sortValue === "operations" && "rotate-180")} />
        </div>
        <div className=" w-20 pl-4    ">Actions</div>
      </div>
      {branches.map((branch) => {
        return <BranchRow branch={branch} key={branch.fileSize} />;
      })}
    </div>
  );
}

export default BranchesTable;
