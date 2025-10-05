import { Setting } from "@/payload-types";
import { Agent } from "@/types";
import { PDFDocument, PDFFont, rgb } from "pdf-lib";
import registerFonts from "./registerFont";
import { CONFIG } from "./conf";
import { initializePage } from "./initilizePage";
import { drawAgent } from "./drawAgent";

const getPage = (doc: PDFDocument) => doc.getPage(doc.getPageCount() - 1);

async function generatePDFreport(agents: Agent[], documentTitle: string): Promise<Uint8Array> {
  console.log(documentTitle);
  const document = await PDFDocument.create();
  const cursor = {
    x: CONFIG.dimensions.page.width - CONFIG.dimensions.mainContentSideMargin,
    y: CONFIG.dimensions.page.height - CONFIG.dimensions.mainContentTopMargin - CONFIG.dimensions.agentBoxMargin,
  };
  const { medium, semiBold } = await registerFonts(document);

  const page = document.addPage([2100, 2970]);
  await initializePage({ page, pageTitle: documentTitle, font: semiBold, document });

  let lastUsedAgentResponsibility = agents[0].responsibility;

  for (const agent of agents) {
    if (agent.responsibility !== lastUsedAgentResponsibility) {
      document.addPage([CONFIG.dimensions.page.width, CONFIG.dimensions.page.height]);
      await initializePage({
        page: getPage(document),
        pageTitle: documentTitle,
        font: semiBold,
        document,
      });
      cursor.y = CONFIG.dimensions.page.height - CONFIG.dimensions.mainContentTopMargin - CONFIG.dimensions.agentBoxMargin;
    }
    await drawAgent({ page, font: { medium, semiBold }, document, cursor, agent, pageTitle: documentTitle });
    lastUsedAgentResponsibility = agent.responsibility;
  }
  return (await document.save()) as Uint8Array;
}
export default generatePDFreport;
