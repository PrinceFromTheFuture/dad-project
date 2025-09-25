import { Button } from "@/components/ui/button";
import React from "react";
import SettingsSection from "./_components/SettingsSection";
import Setting from "./_components/Setting";
import { Switch } from "@/components/ui/switch";
import GeneralSettings from "./_components/GeneralSettings";
import getPayload from "@/lib/getPayload";

async function page() {
  const payload = await getPayload();
  const { docs: branches } = await payload.find({ collection: "branches", pagination: false });
  const { docs: settings } = await payload.find({ collection: "settings", depth: 10, pagination: false });
  const { docs: roles } = await payload.find({ collection: "roles", depth: 10, pagination: false });
  return (
    <div className=" p-6 py-12 bg-border/50 min-h-full">
      <h1 className=" text-2xl mb-3 ml-4">Application Settings</h1>
      <div className=" rounded-xl p-6 bg-background max-w-[1200px] min-h-4/5 flex  ">
        <div className=" w-[175px] bg-amber-150 flex flex-col justify-start">
          <Button className=" w-min bg-primary/5  text-primary cursor-pointer" variant={"ghost"}>
            General
          </Button>
          <Button className="w-min cursor-pointer " variant={"ghost"}>
            Another Setting
          </Button>
        </div>
        <div className=" border-l w-full">
          <GeneralSettings roles={roles} settings={settings} branches={branches} />
        </div>
      </div>
    </div>
  );
}

export default page;
