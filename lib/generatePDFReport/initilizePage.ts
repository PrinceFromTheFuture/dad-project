import fs from "fs";
import { CONFIG } from "./conf";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";

interface PdfConfig {
  page: PDFPage;
  pageTitle: string;
  font: PDFFont;
  document: PDFDocument;
}

export async function initializePage({ page, pageTitle, font, document }: PdfConfig) {
  page.drawRectangle({
    x: CONFIG.dimensions.mainContentSideMargin,
    y: CONFIG.dimensions.page.height - CONFIG.dimensions.mainContentTopMargin - 3,
    width: CONFIG.dimensions.innerWidth,
    height: 3,
    color: CONFIG.colors.primary,
  });

  page.drawRectangle({
    x: CONFIG.dimensions.mainContentSideMargin,
    y: CONFIG.dimensions.mainContentTopMargin,
    width: CONFIG.dimensions.innerWidth,
    height: 3,
    color: CONFIG.colors.primary,
  });
  const logo = await fetch(CONFIG.logo.buffer).then((res) => res.arrayBuffer());
  page.drawImage(await document.embedPng(logo), {
    x: CONFIG.dimensions.page.width / 2 - CONFIG.logo.width / 2,
    y: CONFIG.dimensions.mainContentTopMargin / 2 - CONFIG.logo.hight / 2,
    width: CONFIG.logo.width,
    height: CONFIG.logo.hight,
  });

  page.drawCircle({
    color: rgb(0.86, 0.86, 0.86),
    x: CONFIG.dimensions.mainContentSideMargin + CONFIG.dimensions.innerWidth - 70,
    y: CONFIG.dimensions.page.height - CONFIG.dimensions.mainContentTopMargin + 65,
    size: 30,
  });
  page.drawText(pageTitle, {
    color: rgb(0, 0, 0),
    x:
      CONFIG.dimensions.mainContentSideMargin +
      CONFIG.dimensions.innerWidth -
      font.widthOfTextAtSize(pageTitle, 38) -
      130,
    y: CONFIG.dimensions.page.height - CONFIG.dimensions.mainContentTopMargin + 54,
    size: 38,
    font,
  });
  page.drawText("1", {
    color: rgb(0, 0, 0),
    x:
      CONFIG.dimensions.mainContentSideMargin +
      CONFIG.dimensions.innerWidth -
      font.widthOfTextAtSize("1", 28) -
      63,
    y: CONFIG.dimensions.page.height - CONFIG.dimensions.mainContentTopMargin + 54,
    size: 28,
    font: font,
  });
}
