/**
 * Report File Generation Module
 *
 * This module handles the generation of PDF and ZIP files for session reports.
 * It supports two modes:
 * - Unified: Single PDF per branch
 * - Splited: Multiple PDFs grouped by role categories, packaged in a ZIP
 *
 * It can generate reports for:
 * - A single branch (PDF or ZIP)
 * - All branches merged into a single ZIP file
 */

import generatePDFreport from "@/lib/generatePDFReport/generatePDFreport";
import getPayload from "@/lib/getPayload";
import { Media, Session } from "@/payload-types";
import { Agent } from "@/types";
import zip from "jszip";
import { formatSessionDate } from "@/lib/utils";

/**
 * Hebrew month names mapping for report titles
 * Used to display month names in Hebrew in generated report filenames
 */
const hebrewMonths = {
  0: "ינואר", // January
  1: "פברואר", // February
  2: "מרץ", // March
  3: "אפריל", // April
  4: "מאי", // May
  5: "יוני", // June
  6: "יולי", // July
  7: "אוגוסט", // August
  8: "ספטמבר", // September
  9: "אוקטובר", // October
  10: "נובמבר", // November
  11: "דצמבר", // December
};

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Represents a role/responsibility category for agents
 */
interface Role {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}

/**
 * Represents a branch (organizational unit) with its settings
 */
interface Branch {
  id: string;
  name: string;
  searchKey: string;
  nameInHebrew: string;
  settings: Setting;
  updatedAt: string;
  createdAt: string;
}

/**
 * Branch settings that control report generation behavior
 * - mode: "unified" generates a single PDF, "splited" generates multiple PDFs by category
 * - categoriesGroups: Defines how agents are grouped in split mode
 * - sorting: Determines agent ordering in reports
 */
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

/**
 * Represents a report document associated with a branch and session
 * Contains references to raw report data and agent information
 */
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

/**
 * Options for generating report files
 * @property mergeAllBranches - If true, generates a ZIP with all branches; if false, generates for a single branch
 * @property branch - Required when mergeAllBranches is false; specifies which branch to generate
 */
export interface GenerateReportOptions {
  mergeAllBranches: boolean;
  branch?: string;
}

/**
 * Return type for generated report files
 * @property buffer - The file content as a buffer
 * @property filename - The suggested filename for download
 * @property contentType - MIME type (PDF or ZIP)
 */
export interface GeneratedFile {
  buffer: ArrayBuffer | BodyInit;
  filename: string;
  contentType: "application/pdf" | "application/zip";
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fetches session data and all associated reports from the database
 * @param sessionId - The ID of the session to retrieve
 * @returns Session object and array of reports for that session
 */
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

/**
 * Fetches agent data from a URL endpoint
 * @param url - The URL path to fetch agents from (relative to NEXT_PUBLIC_URL)
 * @returns Array of agent objects
 */
const getAgentsFromUrl = async (url: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}${url}`);
  const data: Agent[] = await res.json();
  return data;
};

/**
 * Generates a single unified PDF report for all agents in a report
 * Used when branch settings mode is "unified"
 * @param report - The report object containing agent data
 * @param documentTitle - The title to display in the PDF
 * @returns PDF file as a buffer
 */
const getPDFFromReport = async (report: Report, documentTitle: string) => {

  const agents = await getAgentsFromUrl(report.agents.url!);
  const sortedAgents = agents;
  return (await generatePDFreport(sortedAgents, documentTitle)) as BodyInit;
};

/**
 * Generates multiple PDF reports, one for each role category group
 * Used when branch settings mode is "splited"
 *
 * Process:
 * 1. Fetches all agents for the report
 * 2. Groups agents by their role categories based on branch settings
 * 3. Generates a separate PDF for each category group
 * 4. Returns array of PDF buffers with filenames
 *
 * @param report - The report object containing agent data and branch settings
 * @returns Array of objects containing PDF bytes and filenames
 */
const getPDFFromReportSplited = async (report: Report) => {
  const reportsBytes: { bytes: BodyInit; fileName: string }[] = [];
  const agents = await getAgentsFromUrl(report.agents.url!);

  // Dictionary to store agents grouped by their category group name
  const agentsGroupedByRole: { [key: string]: Agent[] } = {};

  const branchCategoriesGroupsSettings = report.branch.settings.categoriesGroups;
  const branchCategoriesGroupsNames = branchCategoriesGroupsSettings.map((group) => group.groupName);

  // Group agents by their role category
  agents.forEach((agent) => {
    // Find which category group this agent belongs to based on their responsibility
    const agentGroup = branchCategoriesGroupsSettings.find((group) =>
      group.data.map((role) => role.name).includes(agent.responsibility)
    );

    if (!agentGroup) return;
    if (typeof agentsGroupedByRole[agentGroup.groupName] === "undefined") {
      agentsGroupedByRole[agentGroup.groupName] = [];
    }
    agentsGroupedByRole[agentGroup.groupName]?.push(agent) || [];
  });

  // Generate a PDF for each category group
  let index = 1;

  for (const groupName of branchCategoriesGroupsNames) {
    // Skip if no agents in this group
    if (!agentsGroupedByRole[groupName]) continue;
    const sortedAgents = agentsGroupedByRole[groupName];

    // Create Hebrew filename with part number (e.g., "Part 1 of 3")
    const partName = `- חלק ${index} מתוך ${branchCategoriesGroupsNames.length}`;
    const filename = ` ${report.branch.nameInHebrew} - ${hebrewMonths[0]} ${report.session.year?.toString().split("").reverse().join("")} ${partName} `;

    // Generate PDF for this category group
    const reportBytes = (await generatePDFreport(sortedAgents, filename)) as BodyInit;

    reportsBytes.push({
      bytes: reportBytes,
      fileName: `${filename}.pdf`,
    });
    index++;
  }
  return reportsBytes;
};

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Main function to generate report files based on provided options
 *
 * Supports three scenarios:
 * 1. Single branch, unified mode: Returns a single PDF
 * 2. Single branch, splited mode: Returns a ZIP with multiple PDFs
 * 3. All branches merged: Returns a ZIP with all branch reports
 *
 * @param sessionId - The ID of the session to generate reports for
 * @param options - Configuration options for report generation
 * @returns Generated file with buffer, filename, and content type
 * @throws Error if session not found, branch not found, or invalid options
 */
export async function generateReportFile(
  sessionId: string,
  options: GenerateReportOptions
): Promise<GeneratedFile> {
  // Fetch session and all associated reports
  const { session, sessionReports } = await getSessionData(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  // ========================================
  // Scenario 1: Generate report for a single branch
  // ========================================
  if (options.mergeAllBranches === false) {
    if (!options.branch) {
      throw new Error("Branch ID is required when mergeAllBranches is false");
    }

    // Find the specific report for the requested branch
    const report = sessionReports.find((report) => (report.branch as Branch).id === options.branch)!;

    if (!report) {
      throw new Error("Report not found for the specified branch");
    }

    // Branch uses unified mode: Generate a single PDF with all agents
    if (report.branch.settings.mode === "unified") {
      // Create Hebrew title with branch name, month, and reversed year
      const reportTitle = `${report.branch.nameInHebrew} - ${hebrewMonths[0]} ${session.year!.toString().split("").reverse().join("")}`;
      const reportBytes = await getPDFFromReport(report, reportTitle);

      return {
        buffer: reportBytes,
        filename: `${report.branch.name} - ${formatSessionDate(session.year!, session.month!)}.pdf`,
        contentType: "application/pdf",
      };
    }
    // Branch uses splited mode: Generate multiple PDFs grouped by category, packaged in ZIP
    else if (report.branch.settings.mode === "splited") {
      const zippedReports = new zip();
      const reportsBytes = await getPDFFromReportSplited(report);

      // Add each PDF to the ZIP file
      reportsBytes.forEach((report) => {
        zippedReports.file(report.fileName, report.bytes as Buffer);
      });

      // Generate the final ZIP file
      const zipFile = await zippedReports.generateAsync({ type: "arraybuffer" });

      return {
        buffer: zipFile,
        filename: `${report.branch.name} - ${formatSessionDate(session.year!, session.month!)}.zip`,
        contentType: "application/zip",
      };
    }
  }
  // ========================================
  // Scenario 2: Generate reports for all branches, merged into one ZIP
  // ========================================
  else if (options.mergeAllBranches === true) {
    const zippedReports = new zip();

    // Iterate through all reports and add them to the ZIP
    for (const report of sessionReports) {
      // For unified branches: Add single PDF directly to ZIP root

      if (report.branch.settings.mode === "unified") {
        const reportBytes = await getPDFFromReport(
          report,
          `${report.branch.nameInHebrew} - ${hebrewMonths[0]} ${session.year!.toString().split("").reverse().join("")}`
        );
        zippedReports.file(
          `${report.branch.name} - ${formatSessionDate(session.year!, session.month!)}.pdf`,
          reportBytes as Buffer
        );
      }
      // For splited branches: Create a folder and add multiple PDFs inside
      else if (report.branch.settings.mode === "splited") {
        // Create a subfolder for this branch
        const folder = zippedReports.folder(report.branch.name)!;
        const reportsBytes = await getPDFFromReportSplited(report);

        // Add each category PDF to the branch folder
        reportsBytes.forEach((report) => {
          folder.file(report.fileName, report.bytes as Buffer);
        });
      }
    }

    // Generate the final ZIP file containing all branches
    const zipFile = await zippedReports.generateAsync({ type: "arraybuffer" });

    return {
      buffer: zipFile,
      filename: `Session Reports - ${formatSessionDate(session.year!, session.month!)}.zip`,
      contentType: "application/zip",
    };
  }

  // This should never be reached if options are valid
  throw new Error("Invalid options provided");
}
