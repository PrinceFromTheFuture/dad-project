import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { filesize } from "filesize";
import { CloudUpload, EllipsisVertical, Package, Plus, PlusCircle, Store } from "lucide-react";
import React from "react";
import LastSessions from "./_components/LastSessions";
import { NewSession } from "./_components/NewSession";

export const dynamic = "force-dynamic";

function page() {
  return (
    <div className=" w-full py-28 flex-col flex justify-center items-center">
      <div className=" bg-primary/5 mb-3 p-1 px-4 text-sm   rounded-lg text-primary">
        Built by Amir Waisblay
      </div>
      <div className="text-3xl font-bold mb-2">View Your Sessions 🙌</div>
      <div className="text-lg    text-center font-medium  text-muted-foreground">
        You can view your sessions add new start by clicking the new session
      </div>
      <div className=" flex gap-4 mt-5 justify-between items-center">
        <Button variant={"outline"} className=" cursor-pointer" size={"lg"}>
          View last sessions
        </Button>
        <NewSession
          trigger={
            <Button size={"lg"} className="flex cursor-pointer">
              <PlusCircle />
              Create new
            </Button>
          }
        />
      </div>
      <div className=" mt-12 w-full flex flex-col justify-center items-center">
        <LastSessions />
      </div>
    </div>
  );
}

export default page;
