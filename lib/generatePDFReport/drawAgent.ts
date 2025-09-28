import fs from "fs";
import { CONFIG } from "./conf";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import { initializePage } from "./initilizePage";
interface Agent {
  id: string;
  name: string;
  responsibility: string;
  operations: { category: string; repeated: number }[];
}
interface PdfConfig {
  page: PDFPage;
  font: { medium: PDFFont; semiBold: PDFFont };
  document: PDFDocument;
  agent: Agent;
  cursor: { x: number; y: number };
}
const getPage = (doc: PDFDocument) => doc.getPage(doc.getPageCount() - 1);

export async function drawAgent({ font, document, cursor, agent }: PdfConfig) {
  // Calculate box height based on number of operations
  const numberOfOperations = agent.operations.length;
  const boxHeight = CONFIG.agentDimensions.baseHight + numberOfOperations * CONFIG.agentDimensions.operation;

  await adjustLayout(cursor, boxHeight, document, font.semiBold);

  const page = getPage(document);

  await drawHeader(page, font, cursor, boxHeight, document, agent);
  const localCursor = { ...cursor, y: cursor.y - CONFIG.dimensions.agentBoxMargin - 50 };
  agent.operations.forEach((operation, index) => {
    drawOperations(page, font, localCursor, operation, index % 2 === 0);
  });
  drawSum(
    page,
    font,
    localCursor,
    agent.operations.reduce((a, b) => a + b.repeated, 0)
  );
  // Move cursor down for the next agent (subtract from y since we're working from top)

  cursor.y -= boxHeight + CONFIG.dimensions.agentBoxMargin;
}

async function drawOperations(
  page: PDFPage,
  font: { medium: PDFFont; semiBold: PDFFont },
  cursor: { x: number; y: number },
  operation: Agent["operations"][number],
  boxVarient: boolean
) {
  boxVarient = !boxVarient;
  cursor.y -= 50;

  if (!boxVarient) {
    page.drawRectangle({
      x: CONFIG.dimensions.mainContentSideMargin,
      y: cursor.y,
      width: (CONFIG.dimensions.innerWidth * 3) / 4,
      height: 50,
      color: CONFIG.colors.secondary,
    });
    page.drawRectangle({
      x: CONFIG.dimensions.mainContentSideMargin,
      y: cursor.y + 49,
      width: CONFIG.dimensions.innerWidth,
      height: 2,
      color: CONFIG.colors.border,
    });
    page.drawRectangle({
      x: CONFIG.dimensions.mainContentSideMargin,
      y: cursor.y - 1,
      width: CONFIG.dimensions.innerWidth,
      height: 2,
      color: CONFIG.colors.border,
    });
  }

  page.drawText(operation.category, {
    x:
      CONFIG.dimensions.mainContentSideMargin +
      CONFIG.dimensions.innerWidth +
      -font.medium.widthOfTextAtSize(operation.category, CONFIG.font.sizes.regular) -
      100,
    y: cursor.y + 18,
    font: font.medium,
    size: CONFIG.font.sizes.regular,
    color: CONFIG.colors.textSecondary,
  });

  page.drawText(operation.repeated.toLocaleString("en-US"), {
    x:
      CONFIG.dimensions.mainContentSideMargin +
      CONFIG.dimensions.innerWidth +
      -font.medium.widthOfTextAtSize(operation.repeated.toLocaleString("en-US"), CONFIG.font.sizes.regular) -
      550,
    y: cursor.y + 18,
    font: font.medium,
    size: CONFIG.font.sizes.regular,
    color: CONFIG.colors.textSecondary,
  });
}

async function drawSum(
  page: PDFPage,
  font: { medium: PDFFont; semiBold: PDFFont },
  cursor: { x: number; y: number },
  sum: number
) {
  cursor.y -= 50;

  page.drawRectangle({
    x: CONFIG.dimensions.mainContentSideMargin,
    y: cursor.y,
    width: CONFIG.dimensions.innerWidth,
    height: 50,
    color: CONFIG.colors.primary,
  });

  page.drawText("סך הכל", {
    x:
      CONFIG.dimensions.mainContentSideMargin +
      CONFIG.dimensions.innerWidth +
      -font.semiBold.widthOfTextAtSize("סך הכל", CONFIG.font.sizes.regular) -
      100,
    y: cursor.y + 18,
    font: font.semiBold,
    size: CONFIG.font.sizes.regular,
    color: CONFIG.colors.background,
  });

  page.drawText(sum.toLocaleString("en-US"), {
    x:
      CONFIG.dimensions.mainContentSideMargin +
      CONFIG.dimensions.innerWidth +
      -font.semiBold.widthOfTextAtSize(sum.toLocaleString("en-US"), CONFIG.font.sizes.regular) -
      550,
    y: cursor.y + 18,
    font: font.semiBold,
    size: CONFIG.font.sizes.regular,
    color: CONFIG.colors.background,
  });
}

async function drawHeader(
  page: PDFPage,
  font: { medium: PDFFont; semiBold: PDFFont },
  cursor: { x: number; y: number },
  boxHeight: number,
  document: PDFDocument,
  agent: Agent
) {

  const user = await fetch(CONFIG.static.user.buffer).then((res) => res.arrayBuffer());
  page.drawImage(await document.embedPng(user), {
    x: cursor.x - CONFIG.static.user.width - 42,
    y: cursor.y - CONFIG.static.user.hight,
    width: CONFIG.static.user.width,
    height: CONFIG.static.user.hight,
  });

  page.drawText(agent.name, {
    x:
      cursor.x -
      CONFIG.static.user.width -
      54 -
      font.semiBold.widthOfTextAtSize(agent.name, CONFIG.font.sizes.large),
    y: cursor.y - font.semiBold.heightAtSize(CONFIG.font.sizes.large) + 5,
    font: font.semiBold,
    color: CONFIG.colors.primary,
    size: CONFIG.font.sizes.large,
  });

  page.drawText(`#${agent.id}`, {
    x:
      cursor.x -
      font.medium.widthOfTextAtSize(`#${agent.id}`, CONFIG.font.sizes.regular) -
      CONFIG.static.user.width -
      61,
    y: cursor.y - font.medium.heightAtSize(CONFIG.font.sizes.regular) - 32,
    font: font.medium,
    color: CONFIG.colors.textSecondary,
    size: CONFIG.font.sizes.regular,
  });

  const responsibilityLabelWidth = font.semiBold.widthOfTextAtSize(
    agent.responsibility,
    CONFIG.font.sizes.regular
  );
  page.drawText(agent.responsibility, {
    x: CONFIG.dimensions.mainContentSideMargin + 40,
    y: cursor.y - CONFIG.dimensions.agentBoxMargin + 6,
    font: font.semiBold,
    color: CONFIG.colors.primary,
    size: CONFIG.font.sizes.regular,
  });
  page.drawRectangle({
    x: CONFIG.dimensions.mainContentSideMargin,
    y: cursor.y - CONFIG.dimensions.agentBoxMargin - 10,
    color: CONFIG.colors.primary,
    opacity: 0.2,
    width: responsibilityLabelWidth + 80,
    height: font.semiBold.heightAtSize(CONFIG.font.sizes.regular) + 20,
  });
}

async function adjustLayout(
  cursor: { x: number; y: number },
  boxHeight: number,
  document: PDFDocument,
  font: PDFFont
) {
  // Check if we need a new page
  if (cursor.y - boxHeight - CONFIG.dimensions.agentBoxMargin + 20 < CONFIG.dimensions.mainContentTopMargin) {
    document.addPage([CONFIG.dimensions.page.width, CONFIG.dimensions.page.height]);
    await initializePage({
      page: getPage(document),
      pageTitle: "דוח בדיקות",
      font,
      document,
    });
    cursor.y =
      CONFIG.dimensions.page.height -
      CONFIG.dimensions.mainContentTopMargin -
      CONFIG.dimensions.agentBoxMargin;
  }
}
