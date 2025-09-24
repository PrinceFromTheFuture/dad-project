import { Button } from "@/components/ui/button";
import getPayload from "@/lib/getPayload";
import dayjs from "dayjs";
import { Box, CloudUpload, EllipsisVertical, Store } from "lucide-react";
import Link from "next/link";
import React from "react";

// Force dynamic rendering for this component
export const revalidate = 0;

async function LastSessions() {
  const payload = await getPayload();
  const { docs: sessions } = await payload.find({ collection: "sessions" });
  const { docs: reports } = await payload.find({ collection: "reports", depth: 0 });
  if (sessions.length === 0) {
    return;
  }
  return (
    <div className=" w-2/3">
      <div className=" flex gap-2 items-center w-full text-xl font-medium mb-6  px-4">
        <div>Last Sessions</div>
      </div>

      <div className=" flex px-8 mb-2 text-sm text-muted-foreground justify-between items-center">
        <div className=" flex-1">id</div>
        <div className=" flex-4">name</div>
        <div className=" flex-3">create at</div>
        <div className=" flex-2">reports in session</div>
        <div className=" w-20"></div>
      </div>
      <div className=" flex flex-col gap-4 ">
        {sessions.map((session) => {
          const sessionsReports = reports.filter((rep) => rep.session === session.id);
          return (
            <Link
              href={`/dashboard/sessions/${session.id}`}
              className=" p-3    px-8 border rounded-lg cursor-pointer flex justify-between  items-center"
            >
              <div className="  text-muted-foreground flex-1 ">#234</div>
              <div className="  flex-4 flex gap-3 ">
                <div className="bg-border   flex aspect-square size-10  items-center justify-center rounded-md">
                  <Store className="size-4 " />
                </div>
                <div>
                  <div className=" text-sm truncate font-medium">{session.nickname}</div>
                  <div className=" text-xs truncate text-muted-foreground">Branch Name</div>
                </div>
              </div>
              <div className=" text-sm  flex-3 text-muted-foreground">
                {dayjs().format("DD/MM/YYYY HH:mm")}
              </div>
              <div className=" text-sm  flex-2 text-muted-foreground">{sessionsReports.length}</div>
              <div className=" text-muted-foreground  flex gap-2 ">
                <Button className=" aspect-square size-8 cursor-pointer " variant={"ghost"}>
                  <EllipsisVertical className=" size-4" />
                </Button>
                <Button
                  className=" aspect-square size-8 cursor-pointer bg-primary/20 text-primary"
                  variant={"default"}
                >
                  <CloudUpload className=" size-4" />
                </Button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default LastSessions;
