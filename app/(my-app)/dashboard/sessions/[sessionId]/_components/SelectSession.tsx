"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Session } from "@/payload-types";
import dayjs from "dayjs";
import Link from "next/link";
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
            {dayjs().set("month", session.month!-1).set("years", session.year!).format("MMMM-YYYY")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default SelectSession;
