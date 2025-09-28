import { NextResponse } from "next/server";
import generatePDFreport from "@/lib/generatePDFReport/generatePDFreport";
// GET handler for testing

export async function GET() {
  try {
    const test = await generatePDFreport("name", "/api/media/file/32db450e-fd53-470d-b6ec-46f48e1d4824.json");
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
