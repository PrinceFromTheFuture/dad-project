import generatePDFreport from "@/lib/generatePDFReport/generatePDFreport";
import getPayload from "@/lib/getPayload";
import { Media, Session } from "@/payload-types";
import { Agent } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import zip from "jszip";
import { headers } from "next/headers";
import dayjs from "dayjs";
import { formatSessionDate } from "@/lib/utils";

interface Role {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
  searchKey: string;
  nameInHebrew: string;
  settings: Setting;
  updatedAt: string;
  createdAt: string;
}

interface Setting {
  id: string;
  mode: "unified" | "splited";
  categoriesGroups: {
    data: Role[];
    groupName: string;
    id: string;
  }[];
  sorting: "name" | "operations";
  updatedAt: string;
  createdAt: string;
}

interface Report {
  id: string;
  name: null;
  branch: Branch;
  rawReport: Media;
  agents: Media;
  session: Session;
  updatedAt: string;
  createdAt: string;
}

const sortAgents = (agents: Agent[], sorting: Setting["sorting"]) => {
  return (
    sorting === "name"
      ? agents.sort((a, b) => a.name.localeCompare(b.name))
      : agents.sort(
          (a, b) =>
            a.operations.reduce((a, b) => a + b.repeated, 0) -
            b.operations.reduce((a, b) => a + b.repeated, 0)
        )
  ).map((agent) => {
    return { ...agent, operations: agent.operations.sort((a, b) => a.repeated - b.repeated) };
  });
};

const getSessionData = async (sessionId: string) => {
  const payload = await getPayload();
  const session = await payload.findByID({ collection: "sessions", id: sessionId, depth: 10 });
  const { docs: sessionReports } = (await payload.find({
    collection: "reports",
    depth: 10,
    where: {
      session: {
        equals: sessionId,
      },
    },
    pagination: false,
  })) as { docs: Report[] };

  return { session, sessionReports };
};

const getAgentsFromUrl = async (url: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}${url}`);
  const data: Agent[] = await res.json();
  return data;
};

const getPDFFromReport = async (report: Report, documentTitle: string) => {
  const agents = await getAgentsFromUrl(report.agents.url!);
  const sortedAgents = sortAgents(agents, report.branch.settings.sorting);
  return (await generatePDFreport(sortedAgents, documentTitle)) as BodyInit;
};

const getPDFFromReportSplited = async (
  report: Report,
  sessionYearDate: { month: number; year: number },
) => {
  const reportsBytes: { bytes: BodyInit; fileName: string }[] = [];
  const agents = await getAgentsFromUrl(report.agents.url!);

  const agentsGroupedByRole: { [key: string]: Agent[] } = {};

  const branchCategoriesGroupsSettings = report.branch.settings.categoriesGroups;
  const branchCategoriesGroupsNames = branchCategoriesGroupsSettings.map((group) => group.groupName);

  agents.forEach((agent) => {
    const agentGroup = branchCategoriesGroupsSettings.find((group) =>
      group.data.map((role) => role.name).includes(agent.responsibility)
    );

    if (!agentGroup) return;
    if (typeof agentsGroupedByRole[agentGroup.groupName] === "undefined") {
      agentsGroupedByRole[agentGroup.groupName] = [];
    }
    agentsGroupedByRole[agentGroup.groupName]?.push(agent) || [];
  });

  for (const groupName of branchCategoriesGroupsNames) {
    if (!agentsGroupedByRole[groupName]) continue;
    const sortedAgents = sortAgents(agentsGroupedByRole[groupName], report.branch.settings.sorting);
    
    
    const filename = `${groupName} - ${report.branch.name} - ${formatSessionDate(sessionYearDate.year, sessionYearDate.month)}`;

    const reportBytes = (await generatePDFreport(sortedAgents, filename)) as BodyInit;

    reportsBytes.push({
      bytes: reportBytes,
      fileName: `${filename}.pdf`,
    });
  }
  return reportsBytes;
};

const getRportSettings = async (report: Report) => {};

const reportSchema = z.object({
  mergeAllBranches: z.boolean(),
  branch: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const rawBody = await req.json();
  const body = reportSchema.safeParse(rawBody);
  if (!body.success) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  const callOptions = body.data;

  const { session, sessionReports } = await getSessionData(sessionId);

  if (!session) {
    return NextResponse.json({ success: false, message: "session id is wrong" }, { status: 400 });
  }

  if (callOptions.mergeAllBranches === false) {
    if (!callOptions.branch) {
      return NextResponse.json(
        {
          success: false,
          message: "you wanted to not mearge all branches in report but no branch id was provided",
        },
        { status: 400 }
      );
    }

    const report = sessionReports.find((report) => (report.branch as Branch).id === callOptions.branch)!;
    if (report.branch.settings.mode === "unified") {
      const reportTitle = `${report.branch.name} - ${formatSessionDate(session.year!, session.month!)}`;

      const reportBytes = await getPDFFromReport(report, reportTitle);

      return new NextResponse(reportBytes, {
        status: 202,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment",
          "file-name": `${report.branch.name} - ${formatSessionDate(session.year!, session.month!)}.pdf`,
        },
      });
    } else if (report.branch.settings.mode === "splited") {
      const zippedReports = new zip();


      const reportsBytes = await getPDFFromReportSplited(
        report,
        {
          month: Number(session.month),
          year: Number(session.year),
        },
        "report.file"
      );

      reportsBytes.forEach((report) => {
        zippedReports.file(report.fileName, report.bytes);
      });
      const zipFile = await zippedReports.generateAsync({ type: "arraybuffer" });

      const headers = new Headers({
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment",
        "file-name": `${report.branch.name} - ${formatSessionDate(session.year!, session.month!)}.zip`,
      });

      return new NextResponse(zipFile, {
        status: 202,
        headers,
      });
    }
  } else if (callOptions.mergeAllBranches === true) {
    const zippedReports = new zip();

    for (const report of sessionReports) {
      if (report.branch.settings.mode === "unified") {
        const reportBytes = await getPDFFromReport(report);
        zippedReports.file(
          `${report.branch.name} - ${formatSessionDate(session.year!, session.month!)}.pdf`,
          reportBytes
        );
      } else if (report.branch.settings.mode === "splited") {
        const folder = zippedReports.folder(report.branch.name)!;
        const reportsBytes = await getPDFFromReportSplited(report, {
          month: Number(session.month),
          year: Number(session.year),
        });

        reportsBytes.forEach((report) => {
          folder.file(report.fileName, report.bytes);
        });
      }
    }
    const zipFile = await zippedReports.generateAsync({ type: "arraybuffer" });

    const headers = new Headers({
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment",
      "file-name": `Session Reports - ${formatSessionDate(session.year!, session.month!)}.zip`,
    });
    return new NextResponse(zipFile, {
      status: 202,
      headers,
    });
  }
}
