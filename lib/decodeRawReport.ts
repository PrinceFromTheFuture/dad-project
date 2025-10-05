import { Agent, Operation } from "@/types";
import fs from "fs";

function decodeRawReport(data: string) {
  // Constants
  const TABLE_START_BOUNDARY = "---------  --------------- ------------ -------------------- --------   -------------------------";
  const TABLE_END_BOUNDARY = "=========";
  const ROW_SEPARATOR_SIMPLE = "---------";
  const AGENT_BLOCK_SPLITTER = '(סה"כ לפקיד)ה';
  const EXCLUDE_TOKEN = "zehut";
  const TOTAL_FOR_SITE_LABEL = 'סה"כ לאתר';
  const SECOND_LOCATION_SPLIT_PREFIX = '-סה"כ ל';
  const VIRTUAL_LABEL = "וירטואלי";
  const BRANCH_NAME = "משרד ראשי";

  const nationalIdDecoder = [
    { key: "Z", value: "0" },
    { key: "B", value: "2" },
    { key: "C", value: "3" },
    { key: "I", value: "9" },
  ];
  let rawReport: string = data;

  nationalIdDecoder.forEach((decoder) => {
    rawReport = rawReport.replaceAll(decoder.key, decoder.value);
  });


  var allAgents: Agent[] = [];
  const knownIssues = [TABLE_START_BOUNDARY, TABLE_END_BOUNDARY];
  const dataSliced = rawReport.slice(rawReport.indexOf(knownIssues[0]) + knownIssues[0].length, rawReport.indexOf(knownIssues[1]));

  let agentBlockSplitter = AGENT_BLOCK_SPLITTER;
  let agentCount = 0;
  const agents = dataSliced.split(agentBlockSplitter).filter((str) => !str.includes(EXCLUDE_TOKEN));
  for (const agent of agents) {
    if (agentCount === agents.length - 1) break;
    let formattedAgent: string;

    // annoying middle calculation is needed to be removed
    if (agent.includes(TOTAL_FOR_SITE_LABEL)) {
      const removedSimpleSeparator = agent.replaceAll(ROW_SEPARATOR_SIMPLE, "");
      formattedAgent = removedSimpleSeparator.slice(
        removedSimpleSeparator.lastIndexOf(TOTAL_FOR_SITE_LABEL) + TOTAL_FOR_SITE_LABEL.length,
        agent.length
      );
    } else {
      formattedAgent = agent;
    }

    let formattedAgentHeader = formattedAgent.slice(0, formattedAgent.indexOf(ROW_SEPARATOR_SIMPLE));

    //meaning the agent has two locations
    if (agent.includes(VIRTUAL_LABEL) && agent.includes(BRANCH_NAME)) {
      let secondPart = formattedAgent.slice(
        formattedAgent.indexOf(SECOND_LOCATION_SPLIT_PREFIX) + SECOND_LOCATION_SPLIT_PREFIX.length,
        formattedAgent.length
      );
      let thirdPart = secondPart.slice(0, secondPart.indexOf(ROW_SEPARATOR_SIMPLE));

      formattedAgentHeader = [formattedAgentHeader, thirdPart]
        .join("\n")
        .split("\n")
        .filter((row) => row.trim() !== "")
        .join("\n");
    }

    const filterNonEmpty = (arr: string[]) => arr.filter((str) => str.trim() !== "");

    const agentRows = filterNonEmpty(formattedAgentHeader.split("\n"));

    const headerRow = agentRows[0];

    const headerParts = filterNonEmpty(headerRow.replaceAll(VIRTUAL_LABEL, "     ").replaceAll(BRANCH_NAME, "     ").split("  "));

    let agentMainResponsibility = headerParts[3];

    if (agentMainResponsibility == undefined) {
      agentMainResponsibility = 'משרד ראשי"';
    }
    const agentName = headerParts[1];
    const agentNameTokens = filterNonEmpty(headerParts[2].split(" "));
    const agentId = agentNameTokens.at(-1)!;

    const headerOperationCount = Number(headerParts[0]);
    const headerOperationCat = agentNameTokens.slice(0, agentNameTokens.length - 1).join(" ");

    const parsedOperations = getOperationsFromAgentRows(agentRows, agentId);
    parsedOperations.push({ category: headerOperationCat, repeated: headerOperationCount });

    const map = new Map();

    for (const item of parsedOperations) {
      if (map.has(item.category)) {
        // Merge objects by `cat`, summing their `count` values

        map.get(item.category).repeated += item.repeated;
      } else {
        map.set(item.category, { ...item }); // clone so we don’t mutate the original
      }
    }

    const data: Operation[] = Array.from(map.values());

    const agentRecord: Agent = {
      id: agentId,
      name: agentName,
      responsibility: agentMainResponsibility,
      operations: data,
    };

    allAgents.push(agentRecord);

    agentCount++;
  }

  function getOperationsFromAgentRows(rows: string[], id: string) {
    const parsed = rows
      .slice(1)
      .map((operationStr) => {
        const formated = operationStr.replaceAll(BRANCH_NAME, "");
        const operation = formated.split("  ").filter((str) => str.trim().length > 0);

        if (operation.length < 3) return undefined;

        const operationObj: Operation = {
          category: operation[1],
          repeated: Number(operation[0]),
        };
        return operationObj;
      })
      .filter((op) => op !== undefined);
    const makeSureThereAreNoDulpcated: Operation[] = [];
    for (const operartion of parsed) {
      const opssibleRepetion = makeSureThereAreNoDulpcated.find((op) => op.category === operartion.category);
      if (!opssibleRepetion) {
        makeSureThereAreNoDulpcated.push(operartion);
        continue;
      }
      if (!opssibleRepetion.repeated) {
      }
    }

    const defenet: Operation[] = [];
    const test: string[] = [];

    for (const op of parsed) {
      if (test.find((t) => t === JSON.stringify(op))) continue;
      defenet.push(op);
      test.push(JSON.stringify(op));
    }

    return defenet;
  }
  return { allAgents };
}

export default decodeRawReport;
