import { cn } from "@/lib/utils";
import React from "react";

function Setting({
  title,
  children,
  description,
  varient = "default",
  addiotionalInfo,
}: {
  description?: string;
  varient?: "default" | "minimal";
  title: string;
  children: React.ReactNode;
  addiotionalInfo?: React.ReactNode;
}) {
  return (
    <div className={cn("w-full transition-all  py-5", varient === "default" && "  border-b ")}>
      <div className={cn(" ", varient === "default" && "flex justify-between items-center")}>
        <div>
          <h4 className={cn("  mb-1 font-medium", varient === "minimal" && "mb-2")}>{title}</h4>
          {varient === "default" && <h6 className=" text-muted-foreground text-sm">{description}</h6>}
        </div>
        {children}
      </div>
      {addiotionalInfo}
    </div>
  );
}

export default Setting;
