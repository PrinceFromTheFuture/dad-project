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
  const boxHeight = CONFIG.agentDimensions.baseHight + numberOfOperations * CONFIG.agentDimensions.operation + CONFIG.dimensions.agentBoxMargin;

  // Check if we need a new page
  if (cursor.y - boxHeight < CONFIG.dimensions.mainContentTopMargin) {
    document.addPage([CONFIG.dimensions.page.width, CONFIG.dimensions.page.height]);
    await initializePage({
      page: getPage(document),
      pageTitle: "דוח בדיקות",
      font,
      document,
    });
    cursor.y = CONFIG.dimensions.page.height - CONFIG.dimensions.mainContentTopMargin;
  }

  cursor.y -= CONFIG.dimensions.agentBoxMargin;

  console.log(cursor.y);

  const page = getPage(document);

  page.drawRectangle({
    x: cursor.x,
    y: cursor.y - boxHeight,
    color: CONFIG.colors.primary,
    opacity: numberOfOperations / 10 + 0.1 > 1 ? 1 : numberOfOperations / 10 + 0.1,
    width: 700,
    height: boxHeight,
  });

  cursor.y -= boxHeight;
}
