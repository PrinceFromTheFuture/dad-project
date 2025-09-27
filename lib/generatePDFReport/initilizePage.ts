import fs from 'fs'
import PDFDocument from "pdfkit";
import { CONFIG } from "./conf";

interface PdfConfig {
  doc: PDFKit.PDFDocument;
  pageTitle: string;
  pageNo: number;
  titleNo: number;
}
interface Point {
  x: number;
  y: number;
}

export function initializePage({ doc, pageTitle }: PdfConfig): void {
  // Draw top and bottom borders
  doc
    .rect(
      CONFIG.dimensions.mainContentSideMargin,
      CONFIG.dimensions.mainContentTopMargin,
      CONFIG.dimensions.innerWidth,
      CONFIG.dimensions.borderHeight
    )
    .fill(CONFIG.colors.primary);

  doc
    .rect(
      CONFIG.dimensions.mainContentSideMargin,
      doc.page.height - CONFIG.dimensions.mainContentTopMargin,
      CONFIG.dimensions.innerWidth,
      CONFIG.dimensions.borderHeight
    )
    .fill(CONFIG.colors.primary);

  // Draw page title
  doc.font(CONFIG.font.bold).fontSize(CONFIG.font.sizes.large);

  const circleRadius = 35;
  const circleCenter: Point = {
    x: CONFIG.dimensions.mainContentSideMargin + circleRadius + CONFIG.dimensions.featureMargin,
    y: CONFIG.dimensions.mainContentTopMargin - CONFIG.dimensions.featureMargin - circleRadius,
  };

  doc.circle(circleCenter.x, circleCenter.y, circleRadius).fill("#D9D9D9");
  doc.fillColor("#000000");

  doc.text(pageTitle, circleCenter.x + circleRadius + CONFIG.dimensions.innerBoxMargin, circleCenter.y - circleRadius / 2);
  doc.font(CONFIG.font.bold).fontSize(CONFIG.font.sizes.regular);

  const textWidth = doc.widthOfString("2");
  const textHeight = doc.currentLineHeight();

  doc.text("2", circleCenter.x - textWidth / 2, circleCenter.y - textHeight / 2 + 3);

  doc.font(CONFIG.font.regular).fontSize(CONFIG.font.sizes.regular);

  // Add logo if it exists
  if (fs.existsSync(CONFIG.logo.path)) {
    doc.image(
      CONFIG.logo.path,
      doc.page.width / 2 - CONFIG.logo.width / 2,
      doc.page.height - CONFIG.dimensions.mainContentTopMargin + CONFIG.dimensions.mainContentSideMargin / 2,
      { width: CONFIG.logo.width }
    );
  } else {
    console.warn("Logo file not found at ${CONFIG.logo.path}");
  }
}
