"use client";
import React, { useEffect, useState } from "react";
import SettingsSection from "./SettingsSection";
import Setting from "./Setting";
import { Switch } from "@/components/ui/switch";
import { Branch, Role, Setting as SettingType } from "@/payload-types";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import UpdateSetting from "./UpdateSetting";
import { GLOBAL_SETTINGS_ID } from "@/app/(my-app)/constants";

function GeneralSettings({ branches, settings, roles }: { roles: Role[]; branches: Branch[]; settings: SettingType[] }) {
  const [selectedBranch, setSelectedBranch] = useState(branches[0].id);
  const [isSameForAllBranches, setIsSameForAllBranches] = useState(false);
  const onChnage = (branchId: string) => {
    setSelectedBranch(branchId);
  };
  const selectedBranchSetting = branches.find((b) => b.id === selectedBranch)!.settings as SettingType;

  return (
    <>
      <SettingsSection title="Sessions">
        <Setting
          title="Use The Same Settings For All Sessions "
          description="Enabaling this will enforce the same reports generations settings for all branches"
        >
          <Switch checked={isSameForAllBranches} onCheckedChange={setIsSameForAllBranches} />
        </Setting>
        {isSameForAllBranches && <UpdateSetting roles={roles} setting={settings.find((set) => set.id === GLOBAL_SETTINGS_ID)!} />}
      </SettingsSection>
      {!isSameForAllBranches && (
        <SettingsSection title="Branches ">
          <Setting varient="minimal" title="Choose the branch you want to change settings for ">
            <Select defaultValue={selectedBranch} onValueChange={onChnage}>
              <SelectTrigger className=" w-full">{branches.find((branch) => branch.id === selectedBranch)?.name}</SelectTrigger>
              <SelectContent>
                {branches.map((branch) => {
                  return (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </Setting>
          <UpdateSetting setting={selectedBranchSetting} roles={roles} />
        </SettingsSection>
      )}
    </>
  );
}

export default GeneralSettings;
