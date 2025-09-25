import { Button } from "@/components/ui/button";
import React from "react";
import SettingsSection from "./_components/SettingsSection";
import Setting from "./_components/Setting";
import { Switch } from "@/components/ui/switch";

function page() {
  return (
    <div className=" p-6 bg-border/50 min-h-full">
      <h1 className=" text-2xl mb-3">Application Settings</h1>
      <div className=" rounded-xl p-6 bg-background w-full min-h-4/5 flex  ">
        <div className=" w-[175px] bg-amber-150 flex flex-col justify-start">
          <Button className=" w-min bg-primary/5 text-primary cursor-pointer" variant={"ghost"}>
            General
          </Button>
          <Button className="w-min cursor-pointer " variant={"ghost"}>
            Another Setting
          </Button>
        </div>
        <div className=" border-l w-full">
          <SettingsSection title="test section">
            <Setting
              title="Enable Unread Notification Badge"
              description="Shows a red badge on the app icon when you have unread message"
            >
              <Switch />
            </Setting>
            <Setting
              title="Enable Unread Notification Badge"
              description="Shows a red badge on the app icon when you have unread message"
            >
              <Switch />
            </Setting>
            <Setting
              title="Enable Unread Notification Badge"
              description="Shows a red badge on the app icon when you have unread message"
            >
              <Switch />
            </Setting>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}

export default page;
