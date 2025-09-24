import dayjs from "dayjs";
import { filesize } from "filesize";
import { CloudUpload, EllipsisVertical, Folder, Store } from "lucide-react";
import { Button } from "../ui/button";
import { BranchReport } from "@/types";

const BranchRow = ({ branch }: { branch: BranchReport }) => {
  return (
    <div className=" p-3  px-8 border rounded-lg cursor-pointer flex justify-between  items-center">
      <div className="  text-muted-foreground flex-1 ">
        #{branch.id.slice(-5, -1)}
      </div>
      <div className="  flex-4 flex gap-3 ">
        <div className="bg-border   flex aspect-square size-10  items-center justify-center rounded-md">
          <Store className="size-4 " />
        </div>
        <div>
          <div className=" text-sm truncate font-medium">{branch.name}</div>
          <div className=" text-xs truncate text-muted-foreground">Branch Name</div>
        </div>
      </div>
      <div className=" text-sm  flex-3 text-muted-foreground">
        {dayjs(branch.createdAt).format("DD/MM/YYYY HH:mm")}
      </div>
      <div className=" text-sm  flex-2 text-muted-foreground">{filesize(branch.fileSize)}</div>
      <div className=" text-sm  flex-2 text-muted-foreground">{branch.totalAgents}</div>
      <div className=" text-sm  flex-2 text-muted-foreground">{branch.totalOperations}</div>
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
    </div>
  );
};
export default BranchRow;
