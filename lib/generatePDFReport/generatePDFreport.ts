import { Setting } from "@/payload-types";
import { Agent } from "@/types";
import { PDFDocument, PDFFont, rgb } from "pdf-lib";
import registerFonts from "./registerFont";
import { CONFIG } from "./conf";
import { initializePage } from "./initilizePage";
import { drawAgent } from "./drawAgent";



async function generatePDFreport(agents: Agent[]): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const cursor = {
    x: CONFIG.dimensions.page.width - CONFIG.dimensions.mainContentSideMargin,
    y:
      CONFIG.dimensions.page.height -
      CONFIG.dimensions.mainContentTopMargin -
      CONFIG.dimensions.agentBoxMargin,
  };
  const { medium, semiBold } = await registerFonts(document);

  const page = document.addPage([2100, 2970]);
  await initializePage({ page, pageTitle: "דוח בדיקות", font: semiBold, document });

  for (const agent of agents) {
    await drawAgent({ page, font: { medium, semiBold }, document, cursor, agent });
  }
  return (await document.save()) as Uint8Array;
}
export default generatePDFreport;
