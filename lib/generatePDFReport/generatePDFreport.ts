import { Setting } from "@/payload-types";
import { Agent } from "@/types";
import { PDFDocument, PDFFont, rgb } from "pdf-lib";
import registerFonts from "./registerFont";
import { CONFIG } from "./conf";
import { initializePage } from "./initilizePage";
import { drawAgent } from "./drawAgent";
const sort = (agents: Agent[], sorting: Setting["sorting"]) => {
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

async function generatePDFreport(sorting: Setting["sorting"], reportURL: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}${reportURL}`);
  const unsorted: Agent[] = await res.json();
  const agents = sort(unsorted, sorting);

  const document = await PDFDocument.create();
  const cursor = { x: 0, y: 2970 };
  const { medium, semiBold } = await registerFonts(document);

  const page = document.addPage([2100, 2970]);
  await initializePage({ page, pageTitle: "דוח בדיקות", font: semiBold, document });
  const fontSize = 30;

  for (const agent of agents.slice(0, 100)) {
    await drawAgent({ page, font: medium, document, cursor, agent });
  }
  return await document.save();
}
export default generatePDFreport;
