import { cn } from "@/lib/utils";
import React from "react";

function Setting({
  title,
  children,
  description,
}: {
  description: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(" w-full  py-5 border-b transition-all")}>
      <div className=" flex justify-between items-center">
        <div>
            <h4 className=" text mb-1 font-medium">{title}</h4>
            <h6 className=" text-muted-foreground text-sm">{description}</h6>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Setting;
