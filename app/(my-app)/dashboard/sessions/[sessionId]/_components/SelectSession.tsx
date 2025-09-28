"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatSessionDate } from "@/lib/utils";
import { Session } from "@/payload-types";
import { useRouter } from "next/navigation";
import React from "react";

function SelectSession({ sessions, defaultSessionId }: { sessions: Session[]; defaultSessionId: string }) {
  const router = useRouter();

  return (
    <Select
      onValueChange={(val) => {
        router.push(`/dashboard/sessions/${val}`);
      }}
      defaultValue={defaultSessionId}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select month" />
      </SelectTrigger>
      <SelectContent>
        {sessions.map((session) => (
          <SelectItem value={session.id} key={session.id}>
            {formatSessionDate(session.year!, session.month!)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default SelectSession;
