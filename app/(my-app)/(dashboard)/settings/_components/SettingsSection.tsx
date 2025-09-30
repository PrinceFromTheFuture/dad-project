import { cn } from "@/lib/utils";
import React from "react";

function SettingsSection({ disabled = false, title, children }: { disabled?: boolean; title: string; children: React.ReactNode }) {
  return (
    <div className={cn(" relative px-8 pb-4 pt-2  transition-all")}>
      {disabled && <div className=" inset-0 absolute bg-black/20" />}
      <h3 className=" text-2xl font-semibold ">{title}</h3>
      {children}
    </div>
  );
}

export default SettingsSection;
