import { cn } from "@/lib/utils";
import React from "react";

function SettingsSection({
  disabled = false,
  title,
  children,
}: {
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(" px-8 pb-4 pt-2  transition-all", disabled && "bg-border/50")}>
      <h3 className=" text-2xl font-semibold ">{title}</h3>
      {children}
    </div>
  );
}

export default SettingsSection;
