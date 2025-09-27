import { Setting } from "@/payload-types";
import { Agent } from "@/types";

async function generatePDFreport(sorting: Setting["sorting"], reportURL: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}${reportURL}`);
  const agents: Agent[] = await res.json();
  const sortedAgents =
    sorting === "name"
      ? agents.sort((a, b) => a.name.localeCompare(b.name))
      : agents.sort(
          (a, b) =>
            a.operations.reduce((a, b) => a + b.repeated, 0) -
            b.operations.reduce((a, b) => a + b.repeated, 0)
        );
  const sortedAgents2: Agent[] = sortedAgents.map((agent) => {
    return { ...agent, operations: agent.operations.sort((a, b) => a.repeated - b.repeated) };
  });
  
}
export default generatePDFreport;
