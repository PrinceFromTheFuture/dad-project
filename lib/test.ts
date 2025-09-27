import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Configuration constants
const CONFIG = {
  colors: {
    primary: "#4B5947",
    secondary: "#F3F5F3",
    border: "#C7D9C3",
    background: "#F8F7F7",
  },
  dimensions: {
    page: { width: 2100, height: 2970 },
    featureMargin: 43,
    mainContentSideMargin: 120,
    mainContentTopMargin: 200,
    borderHeight: 3,
    innerWidth: 1860,
    innerBoxMargin: 20,
    titleBoxWidth: 580,
    contentBoxWidth: 1100,
  },
  font: {
    regular: "./calibri-regular.ttf",
    bold: "./calibri-bold.ttf",
    sizes: { regular: 36, large: 48 },
  },
  logo: {
    path: "./logo.png",
    width: 200,
  },
} as const;

// Interfaces

interface Software {
  sections: {
    title: string;
    childSections: {
      title: string;
      grandChildSections: {
        title: string;
        greatGrandChildSection?: {
          title: string;
          content: string;
        }[];
      }[];
    }[];
  }[];
}
interface Point {
  x: number;
  y: number;
}

interface SectionDimensions {
  tl: Point;
  tr: Point;
  bl: Point;
  br: Point;
}

interface PdfConfig {
  doc: PDFKit.PDFDocument;
  cursor: Point;
  pageTitle: string;
  pageNo: number;
  titleNo: number;
}

/**
 * Initializes a new PDF page with borders and a centered logo.
 * @param config - PDF configuration including document and cursor
 */
function initializePage({ doc, pageTitle, cursor }: PdfConfig): void {
  cursor.x = CONFIG.dimensions.mainContentSideMargin;
  cursor.y = CONFIG.dimensions.mainContentTopMargin + CONFIG.dimensions.featureMargin;

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

  doc.text(
    pageTitle,
    circleCenter.x + circleRadius + CONFIG.dimensions.innerBoxMargin,
    circleCenter.y - circleRadius / 2
  );
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

/**
 * Calculates dimensions for a section based on content height.
 * @param doc - PDF document instance
 * @param cursor - Current cursor position
 * @param content - Section content or title
 * @returns Calculated section dimensions
 */
function calculateSectionDimensions(
  doc: PDFDocument.PDFDocument,
  cursor: Point,
  content: string
): SectionDimensions {
  const predictedContentHeight = doc.heightOfString(content, {
    width: CONFIG.dimensions.contentBoxWidth,
    align: "left",
  });

  return {
    tl: { ...cursor },
    tr: { x: cursor.x + CONFIG.dimensions.innerWidth, y: cursor.y },
    bl: { x: cursor.x, y: cursor.y + CONFIG.dimensions.innerBoxMargin * 2 + predictedContentHeight },
    br: {
      x: cursor.x + CONFIG.dimensions.innerWidth,
      y: cursor.y + CONFIG.dimensions.innerBoxMargin * 2 + predictedContentHeight,
    },
  };
}

/**
 * Creates a great-grandchild section with title and content.
 * @param params - Section creation parameters
 */
function createGreatGrandchildSection({
  doc,
  sectionDimensions,
  cursor,
  title,
  content,
}: {
  doc: PDFDocument.PDFDocument;
  sectionDimensions: SectionDimensions;
  cursor: Point;
  title: string;
  content?: string;
}): void {
  doc
    .rect(
      cursor.x + CONFIG.dimensions.titleBoxWidth,
      sectionDimensions.tr.y,
      CONFIG.dimensions.innerWidth - CONFIG.dimensions.titleBoxWidth,
      sectionDimensions.br.y - sectionDimensions.tr.y
    )
    .fill(CONFIG.colors.secondary);

  // Draw borders
  doc
    .rect(cursor.x, sectionDimensions.tr.y, CONFIG.dimensions.innerWidth, CONFIG.dimensions.borderHeight)
    .fill(CONFIG.colors.border);
  doc
    .rect(cursor.x, sectionDimensions.br.y, CONFIG.dimensions.innerWidth, CONFIG.dimensions.borderHeight)
    .fill(CONFIG.colors.border);

  // Add title and content
  doc.fillColor("#000000");

  doc.text(title, sectionDimensions.tl.x + 36, sectionDimensions.tl.y + 26, {
    width: CONFIG.dimensions.titleBoxWidth,
    align: "left",
  });

  if (content) {
    doc.text(
      content,
      CONFIG.dimensions.titleBoxWidth + CONFIG.dimensions.mainContentSideMargin + 156,
      sectionDimensions.tl.y + 26,
      {
        width: CONFIG.dimensions.contentBoxWidth,
        align: "left",
      }
    );
  }
}

/**
 * Creates a grandchild section with title only.
 * @param params - Section creation parameters
 */
function createGrandchildSection({
  doc,
  sectionDimensions,
  cursor,
  title,
}: {
  doc: PDFDocument.PDFDocument;
  sectionDimensions: SectionDimensions;
  cursor: Point;
  title: string;
}): void {
  doc
    .rect(
      cursor.x,
      cursor.y,
      CONFIG.dimensions.innerWidth / 2,
      sectionDimensions.br.y - sectionDimensions.tr.y
    )
    .fill(CONFIG.colors.secondary);

  doc.fillColor("#000000");

  doc.text(title, sectionDimensions.tl.x + 36, sectionDimensions.tl.y + 26, {
    width: CONFIG.dimensions.titleBoxWidth,
    align: "left",
  });
}

/**
 * Creates a grandchild section with title only.
 * @param params - Section creation parameters
 */
function createChildSection({
  doc,
  sectionDimensions,
  cursor,
  title,
}: {
  doc: PDFDocument.PDFDocument;
  sectionDimensions: SectionDimensions;
  cursor: Point;
  title: string;
}): void {
  doc
    .rect(
      cursor.x,
      cursor.y,
      (CONFIG.dimensions.innerWidth / 4) * 3,
      sectionDimensions.br.y - sectionDimensions.tr.y
    )
    .fill(CONFIG.colors.primary);

  doc.fillColor("#ffffff");

  doc.text(title, sectionDimensions.tl.x + 36, sectionDimensions.tl.y + 26, {
    width: CONFIG.dimensions.titleBoxWidth,
    align: "left",
  });
}

/**
 * Creates a section with overflow checking.
 * @param params - Section creation parameters
 */
function createSection({
  doc,
  cursor,
  title,
  content,
  mode,
}: {
  doc: PDFDocument.PDFDocument;
  cursor: Point;
  title: string;
  content?: string;
  mode: "childSection" | "grandChildSection" | "greatGrandChildSection";
}): void {
  const sectionDimensions = calculateSectionDimensions(doc, cursor, content || title);

  // Check for page overflow
  if (sectionDimensions.bl.y > CONFIG.dimensions.page.height - CONFIG.dimensions.mainContentTopMargin) {
    doc.addPage();
    initializePage({ doc, pageTitle: title, cursor, pageNo: 1, titleNo: 2 });
    createSection({ doc, cursor, title, content, mode });
    return;
  }

  if (mode === "childSection") {
    createChildSection({ doc, sectionDimensions, cursor, title });
  } else if (mode === "grandChildSection") {
    createGrandchildSection({ doc, sectionDimensions, cursor, title });
  } else if (mode === "greatGrandChildSection") {
    createGreatGrandchildSection({ doc, sectionDimensions, cursor, title, content });
  }

  cursor.y = sectionDimensions.br.y + CONFIG.dimensions.featureMargin;
}

/**
 * Generates a PDF document from section data.
 * @param outputPath - Path to save the PDF
 * @param sections - Array of section data
 */
function generatePdf(outputPath: string, software: Software): void {
  // Validate inputs
  if (!outputPath.endsWith(".pdf")) {
    throw new Error("Output path must have a .pdf extension");
  }
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  if (!fs.existsSync(CONFIG.font.regular) || !fs.existsSync(CONFIG.font.bold)) {
    throw new Error(`Font file not found at `);
  }

  const doc = new PDFDocument({ size: [CONFIG.dimensions.page.width, CONFIG.dimensions.page.height] });
  doc.pipe(fs.createWriteStream(outputPath));
  doc.font(CONFIG.font.regular).fontSize(CONFIG.font.sizes.regular);

  const cursor: Point = { x: 0, y: 0 };
  initializePage({ doc, pageTitle: "Document", cursor, pageNo: 1, titleNo: 1 });

  software.sections.forEach((section) => {
    let pageTitle = section.title;
    doc.addPage();
    initializePage({ doc, cursor, pageNo: 1, pageTitle, titleNo: 1 });
    section.childSections.forEach((childSection) => {
      createSection({
        doc,
        cursor,
        title: childSection.title,
        mode: "childSection",
      });
      childSection.grandChildSections.forEach((grandChildSection) => {
        createSection({
          doc,
          cursor,
          title: grandChildSection.title,
          mode: "grandChildSection",
        });
        if (!grandChildSection.greatGrandChildSection) return;
        grandChildSection.greatGrandChildSection.forEach((greatGrandChildSection) => {
          createSection({
            doc,
            cursor,
            title: greatGrandChildSection.title,
            content: greatGrandChildSection.content,
            mode: "greatGrandChildSection",
          });
        });
      });
    });
  });

  doc.end();
}

// Sample data
const software: Software = {
  sections: [
    {
      title: "one two 3",
      childSections: [
        {
          title: "2.2 Main features",
          grandChildSections: [
            { title: "fds" },
            {
              title: "2.21 Active order preview",
              greatGrandChildSection: [
                {
                  title: "2.21A Customer Name",
                  content:
                    " The system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions.",
                },
                {
                  title: "2.21A Customer Name",
                  content:
                    " The system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions.",
                },
                {
                  title: "2.21A Customer Name",
                  content:
                    " The system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions.",
                },
                {
                  title: "2.21A Customer Name",
                  content:
                    " The system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions.",
                },
                {
                  title: "2.21A Customer Name",
                  content:
                    " The system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions.",
                },
                {
                  title: "2.21A Customer Name",
                  content:
                    " The system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions.",
                },
                {
                  title: "2.21A Customer Name",
                  content:
                    " The system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions he system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "OCD",
      childSections: [
        {
          title: "2.2 Main features",
          grandChildSections: [
            { title: "fds" },
            {
              title: "2.21 Active order preview",
              greatGrandChildSection: [
                {
                  title: "2.21A Customer Name",
                  content:
                    " The system is designed to work seamlessly with the restaurant's current technological setup, avoiding major disruptions.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Execute PDF generation
try {
  generatePdf("file.pdf", software);
  console.log("PDF generated successfully");
} catch (error) {
  console.error("Error generating PDF:", error);
}