import { Agent, Operation } from "@/types";
import fs from "fs";


function decodeRawReport(rawReport:string) {
  // Constants
  const TABLE_START_BOUNDARY =
    "---------  --------------- ------------ -------------------- --------   -------------------------";
  const TABLE_END_BOUNDARY = "=========";
  const ROW_SEPARATOR_SIMPLE = "---------";
  const AGENT_BLOCK_SPLITTER = '(סה"כ לפקיד)ה';
  const EXCLUDE_TOKEN = "zehut";
  const TOTAL_FOR_SITE_LABEL = 'סה"כ לאתר';
  const SECOND_LOCATION_SPLIT_PREFIX = '-סה"כ ל';
  const VIRTUAL_LABEL = "וירטואלי";
  const MAIN_OFFICE_LABEL = "משרד ראשי";
  const DATA_AGENTS = "agents.ts";


  var allAgents: Agent[] = [];
  const knownIssues = [TABLE_START_BOUNDARY, TABLE_END_BOUNDARY];
  const dataSliced = rawReport.slice(
    rawReport.indexOf(knownIssues[0]) + knownIssues[0].length,
    rawReport.indexOf(knownIssues[1])
  );

  let agentBlockSplitter = AGENT_BLOCK_SPLITTER;
  let agentCount = 0;
  const agents = dataSliced.split(agentBlockSplitter).filter((str) => !str.includes(EXCLUDE_TOKEN));
  for (const agent of agents) {
    if (agentCount === agents.length - 1) break;
    let formattedAgent: string;

    // annoying middle calculation is needed to be removed
    if (agent.includes(TOTAL_FOR_SITE_LABEL)) {
      const removedSimpleSeparator = agent.replace(ROW_SEPARATOR_SIMPLE, "");
      formattedAgent = removedSimpleSeparator.slice(
        removedSimpleSeparator.lastIndexOf(TOTAL_FOR_SITE_LABEL) + TOTAL_FOR_SITE_LABEL.length,
        agent.length
      );
    } else {
      formattedAgent = agent;
    }

    let formattedAgentHeader = formattedAgent.slice(0, formattedAgent.indexOf(ROW_SEPARATOR_SIMPLE));

    //meaning the agent has two locations
    if (agent.includes(VIRTUAL_LABEL) && agent.includes(MAIN_OFFICE_LABEL)) {
      const secondPart = formattedAgent.slice(
        formattedAgent.indexOf(SECOND_LOCATION_SPLIT_PREFIX) + SECOND_LOCATION_SPLIT_PREFIX.length,
        formattedAgent.length
      );
      const thirdPart = secondPart.slice(0, secondPart.indexOf(ROW_SEPARATOR_SIMPLE));
      formattedAgentHeader = [formattedAgentHeader, thirdPart]
        .join("\n")
        .split("\n")
        .filter((row) => row.trim() !== "")
        .join("\n");
    }

    const filterNonEmpty = (arr: string[]) => arr.filter((str) => str.trim() !== "");
    const agentRows = filterNonEmpty(formattedAgentHeader.split("\n"));

    const headerRow = agentRows[0];
    const headerParts = filterNonEmpty(
      headerRow
        .replace(VIRTUAL_LABEL, "     ")
        .replace(MAIN_OFFICE_LABEL, "     ")
        .replace(VIRTUAL_LABEL, "    ")
        .split("  ")
    );

    let agentMainResponsibility = headerParts[3];
    if (agentMainResponsibility == undefined) {
      agentMainResponsibility = 'משרד ראשי"';
    }
    const agentName = headerParts[1];
    const agentNameTokens = filterNonEmpty(headerParts[2].split(" "));
    const agentId = agentNameTokens.at(-1)!;

    const headerOperationCount = Number(headerParts[0]);
    const headerOperationCat = agentNameTokens.slice(0, agentNameTokens.length - 1).join(" ");

    const parsedOperations = getOperationsFromAgentRows(agentRows);
    parsedOperations.push({ category: headerOperationCat, repeated: headerOperationCount });

    const agentRecord: Agent = {
      id: agentId,
      name: agentName,
      responsibility: agentMainResponsibility,
      operations:parsedOperations
    };

    allAgents.push(agentRecord);

    agentCount++;
  }

  function getOperationsFromAgentRows(rows: string[]) {
    const parsed = rows.slice(1).map((operationStr) => {
      const operation = operationStr.split("  ").filter((str) => str.trim().length > 0);
      const operationObj: Operation  = {
        category: operation[1],
        repeated: Number(operation[0]),
      };
      return operationObj;
    });
    const map = new Map();
    // Merge objects by `cat`, summing their `count` values

    for (const item of parsed) {
      if (map.has(item.category)) {
        map.get(item.category).category += item.repeated;
      } else {
        map.set(item.category, { ...item }); // clone so we don’t mutate the original
      }
    }
    const data: Operation[] = Array.from(map.values());
    return data;
  }

  fs.writeFileSync(DATA_AGENTS, `export const agents = ${JSON.stringify(allAgents)};`);
  fs.writeFileSync("agents.json", JSON.stringify(allAgents));
  return { allAgents };
}

export default decodeRawReport;
