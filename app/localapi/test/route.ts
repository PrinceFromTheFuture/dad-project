import { NextResponse } from "next/server";
import generatePDFreport from "@/lib/generatePDFReport/generatePDFreport";
// GET handler for testing

export async function GET() {
  try {
    const test = await generatePDFreport("name", "/api/media/file/b0acea5e-10f8-43b9-b125-b161e9bb25e1.json");
    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Content-Length": test.byteLength.toString(),
    });

    return new NextResponse(test, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new NextResponse(`Error generating PDF: ${error.message}`, { status: 500 });
  }
}
