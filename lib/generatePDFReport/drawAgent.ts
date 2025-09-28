import fs from "fs";
import { CONFIG } from "./conf";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import { initializePage } from "./initilizePage";
import { opacity } from "pdfkit";
interface PdfConfig {
  page: PDFPage;
  font: PDFFont;
  document: PDFDocument;
  agent: {
    id: string;
    name: string;
    responsibility: string;
    operations: { category: string; repeated: number }[];
  };
  cursor: { x: number; y: number };
}
const getPage = (doc: PDFDocument) => doc.getPage(doc.getPageCount() - 1);

export async function drawAgent({ font, document, cursor, agent }: PdfConfig) {
  // Calculate box height based on number of operations
  const numberOfOperations = agent.operations.length;
  const boxHeight = 400;
  //
  //CONFIG.agentDimensions.baseHight +
  //numberOfOperations * CONFIG.agentDimensions.operation +
  //CONFIG.dimensions.agentBoxMargin;

  // Check if we need a new page
  if (cursor.y - 400 < CONFIG.dimensions.mainContentTopMargin) {
    document.addPage([CONFIG.dimensions.page.width, CONFIG.dimensions.page.height]);
    await initializePage({
      page: getPage(document),
      pageTitle: "דוח בדיקות",
      font,
      document,
    });
    cursor.y = CONFIG.dimensions.page.height;
  }
  const page = getPage(document);

  // Move cursor down for the next agent (subtract from y since we're working from top)
  console.log(cursor.y);
  const data = {
    x: cursor.x,
    y: cursor.y - CONFIG.dimensions.mainContentTopMargin - 400,
    color: CONFIG.colors.primary,
    opacity: numberOfOperations / 10 + 0.1 > 1 ? 1 : numberOfOperations / 10 + 0.1,
    width: 700,
    height: 400,
  };
  page.drawRectangle(data);
  cursor.y -= 400;
  console.log(cursor.y);
}
