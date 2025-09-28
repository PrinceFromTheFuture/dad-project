import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

async function getFontBuffer(font: string) {
  return await fetch(`${process.env.NEXT_PUBLIC_URL}/fonts/${font}`).then((res) => res.arrayBuffer());
}

async function registerFonts(document: PDFDocument) {
  document.registerFontkit(fontkit);
  const fonts = { medium: "IBMPlexSansHebrew-Medium.ttf", semiBold: "IBMPlexSansHebrew-SemiBold.ttf" };
  const fontBuffers = {
    medium: await getFontBuffer(fonts.medium),
    semiBold: await getFontBuffer(fonts.semiBold),
  };

  const medium = await document.embedFont(fontBuffers.medium);
  const semiBold = await document.embedFont(fontBuffers.semiBold);
  return { medium, semiBold };
}

export default registerFonts;
