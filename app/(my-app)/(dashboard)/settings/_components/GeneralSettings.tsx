"use client";
import React, { useEffect, useState } from "react";
import SettingsSection from "./SettingsSection";
import Setting from "./Setting";
import { Switch } from "@/components/ui/switch";
import { Branch, Role, Setting as SettingType } from "@/payload-types";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import UpdateSetting from "./UpdateSetting";
import { GLOBAL_SETTINGS_ID } from "@/app/(my-app)/constants";
import axios from "axios";
import { fetchRemoteSettings } from "./fetchRemoteSettings";

function GeneralSettings({ branches: initialBranches, settings, roles }: { roles: Role[]; branches: Branch[]; settings: SettingType[] }) {

  const [branches, setBranches] = useState(initialBranches);
  const [selectedBranch, setSelectedBranch] = useState(initialBranches[0].id);
  const [isSameForAllBranches, setIsSameForAllBranches] = useState(false);
  const [remoteSettings, setRemoteSettings] = useState<Record<string, SettingType>>({});
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  
  const onChnage = (branchId: string) => {
    setSelectedBranch(branchId);
    setRemoteError(null);
  };
  
  const selectedBranchData = branches.find((b) => b.id === selectedBranch)!;
  const selectedBranchSetting = selectedBranchData.settings as SettingType;
  const useRemoteSettings = selectedBranchData.useRemoteSettings || false;

  const handleRemoteSettingsToggle = async (checked: boolean) => {
    // Optimistic update: update UI immediately
    setBranches((prevBranches) =>
      prevBranches.map((branch) =>
        branch.id === selectedBranch
          ? { ...branch, useRemoteSettings: checked }
          : branch
      )
    );

    // If enabling remote settings, fetch them immediately
    if (checked) {
      setIsLoadingRemote(true);
      setRemoteError(null);
      try {
        const data = await fetchRemoteSettings(selectedBranchData.name);
        setRemoteSettings((prev) => ({ ...prev, [selectedBranch]: data }));
      } catch (error) {
        console.error("Error fetching remote settings:", error);
        setRemoteError("Failed to load remote settings");
      } finally {
        setIsLoadingRemote(false);
      }
    } else {
      // Clear remote settings when disabling
      setRemoteSettings((prev) => {
        const newSettings = { ...prev };
        delete newSettings[selectedBranch];
        return newSettings;
      });
    }

    // Update the database
    try {
      await axios.patch(`/api/branches/${selectedBranch}`, {
        useRemoteSettings: checked,
      });
    } catch (error) {
      console.error("Error updating remote settings toggle:", error);
      // Revert optimistic update on error
      setBranches((prevBranches) =>
        prevBranches.map((branch) =>
          branch.id === selectedBranch
            ? { ...branch, useRemoteSettings: !checked }
            : branch
        )
      );
      setRemoteError("Failed to update remote settings toggle");
    }
  };

  // Fetch remote settings when component mounts for branches that have it enabled
  useEffect(() => {
    const loadRemoteSettings = async () => {
      const branchesWithRemote = branches.filter((b) => b.useRemoteSettings);
      
      for (const branch of branchesWithRemote) {
        if (!remoteSettings[branch.id]) {
          try {
            const data = await fetchRemoteSettings(branch.name);
            setRemoteSettings((prev) => ({ ...prev, [branch.id]: data }));
          } catch (error) {
            console.error(`Error fetching remote settings for branch ${branch.id}:`, error);
          }
        }
      }
    };

    loadRemoteSettings();
  }, []);

  return (
    <>
      <SettingsSection title="Sessions">
        <Setting
          title="Use The Same Settings For All Sessions "
          description="Enabaling this will enforce the same reports generations settings for all branches"
        >
          <Switch className="" type="button" checked={isSameForAllBranches} onCheckedChange={setIsSameForAllBranches} />
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
          
          <Setting
            title="Use Remote Settings"
            description="Load settings from a remote URL instead of local database"
          >
            <Switch checked={useRemoteSettings} onCheckedChange={handleRemoteSettingsToggle} />
          </Setting>

          {isLoadingRemote && (
            <div className="text-sm text-muted-foreground py-2">Loading remote settings...</div>
          )}

          {remoteError && (
            <div className="text-sm text-destructive py-2">{remoteError}</div>
          )}

          <UpdateSetting 
            setting={useRemoteSettings && remoteSettings[selectedBranch] ? remoteSettings[selectedBranch] : selectedBranchSetting} 
            roles={roles} 
            disabled={useRemoteSettings}
          />
        </SettingsSection>
      )}
    </>
  );
}

export default GeneralSettings;
