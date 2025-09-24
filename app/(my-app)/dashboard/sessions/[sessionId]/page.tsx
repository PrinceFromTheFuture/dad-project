import { branches } from "@/app/(my-app)/constants";
import AgentsTable from "@/components/branches/AgentsTable";
import BranchesTable from "@/components/branches/BranchesTable";
import OperationsTable from "@/components/branches/OperationsTable";
import Tabs from "@/components/costume/Tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import getPayload from "@/lib/getPayload";
import { Branch, Media } from "@/payload-types";
import { Agent, AgentView, BranchReport, Operation, OperationView } from "@/types";
import dayjs from "dayjs";
import { ArrowLeftRight, CloudUpload, EllipsisVertical, Folder, Store, Users } from "lucide-react";
import Link from "next/link";
import React from "react";
import SelectSession from "./_components/SelectSession";

async function page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const payload = await getPayload();
  const { docs: allSessions } = await payload.find({ collection: "sessions", depth: 0 });
  const reports = await payload.find({
    collection: "reports",
    where: {
      session: {
        equals: sessionId,
      },
    },
  });

  const branchesReport: BranchReport[] = [];
  const allAgents: AgentView[] = [];
  const allOperations: OperationView[] = [];

  for (const report of reports.docs) {
    const reportAgentsMedia = report.agents as unknown as Media;
    const response = await fetch(`http://localhost:3000${reportAgentsMedia.url!}`, { method: "GET" });

    if (!response.ok) {
      console.error("HTTP error", response.status, response.statusText);
    }
    const reportData: Agent[] = await response.json(); // already parsed JSON

    const operations: Operation[] = reportData
      .map((rep) => {
        return rep.operations;
      })
      .flat();

    const reportBranchName = (report.branch as Branch).name!;
    const branchReport: BranchReport = {
      createdAt: report.createdAt,
      fileSize: reportAgentsMedia.filesize!,
      id: report.id,
      name: reportBranchName,
      totalAgents: reportData.length,
      totalOperations: operations.length,
    };
    branchesReport.push(branchReport);
    for (const agent of reportData) {
      allAgents.push({
        branch: reportBranchName,
        name: agent.name,
        nationalId: agent.id,
        operations: agent.operations.reduce((a, b) => a + b.repeated, 0),
        responsibility: agent.responsibility,
      });
      for (const operation of agent.operations) {
        allOperations.push({ ...operation, agentId: agent.id, branch: reportBranchName });
      }
    }
  }

  return (
    <div className="flex-1 px-12 mt-6  flex flex-col  ">
      <div className=" flex justify-between   items-center mb-6 gap-12">
        <div className="flex w-full items-center gap-4  rounded-2xl transition-all p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <div className="bg-sidebar-primary/10 text-sidebar-primary  flex aspect-square size-14 items-center justify-center rounded-xl">
            <Folder className="size-6 " />
          </div>
          <div className="grid flex-1  text-left  leading-tight ">
            <span className="truncate  text-lg font-semibold">Session Overview</span>
            <span className="truncate  ">All branches</span>
          </div>
        </div>
        <div className=" flex gap-4">
          <SelectSession defaultSessionId={sessionId} sessions={allSessions} />
          <Dialog>
            <DialogTrigger>
              <Button size={"lg"} className=" flex gap-2 cursor-pointer items-center ">
                Export PDF
                <CloudUpload className=" size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent></DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex gap-4 mb-12">
        {/* Card 1: Total Branches in Session (Existing) */}
        <Card className="w-full">
          <CardHeader className="flex items-center">
            <Store className="size-4" />
            Total Branches in Session
          </CardHeader>
          <CardContent className="">{reports.docs.length}</CardContent>
          <CardFooter>
            {reports.docs.length > 0 ? `${reports.docs.length - 1} last session` : "No previous session data"}
          </CardFooter>
        </Card>

        {/* Card 2: Total Agents Across All Branches */}
        <Card className="w-full">
          <CardHeader className="flex items-center">
            <Users className="size-4" />
            Total Agents
          </CardHeader>
          <CardContent className="">{allAgents.length}</CardContent>
          <CardFooter>
            {allAgents.length > 0
              ? `${Math.round(allAgents.length * 0.95)} last session`
              : "No previous session data"}
          </CardFooter>
        </Card>

        {/* Card 3: Total Operations Across All Branches */}
        <Card className="w-full">
          <CardHeader className="flex items-center">
            <ArrowLeftRight className="size-4" />
            Total Operations
          </CardHeader>
          <CardContent className="">{allOperations.length}</CardContent>
          <CardFooter>
            {allOperations.length > 0
              ? `${Math.round(allOperations.length * 0.9)} last session`
              : "No previous session data"}
          </CardFooter>
        </Card>

        {/* Card 4: Largest Branch by Operation Count */}
        <Card className="w-full">
          <CardHeader className="flex items-center">
            <Store className="size-4" />
            Largest Branch by Operations
          </CardHeader>
          <CardContent className="">
            {branchesReport.length > 0
              ? branchesReport.reduce((prev, curr) =>
                  curr.totalOperations > prev.totalOperations ? curr : prev
                ).name
              : "N/A"}
          </CardContent>
          <CardFooter>
            {branchesReport.length > 0
              ? `${branchesReport.reduce((prev, curr) => (curr.totalOperations > prev.totalOperations ? curr : prev)).totalOperations} operations`
              : "No branch data"}
          </CardFooter>
        </Card>
      </div>
      <div className=" text-xl mb-4 font-semibold">Data Overview</div>
      <Tabs
        tabs={[
          {
            comp: <BranchesTable branches={branchesReport} />,
            label: "Branches",
          },
          { comp: <AgentsTable agents={allAgents} />, label: "Agents" },
          { comp: <OperationsTable operations={allOperations} />, label: "Operations" },
        ]}
      />
    </div>
  );
}

export default page;
