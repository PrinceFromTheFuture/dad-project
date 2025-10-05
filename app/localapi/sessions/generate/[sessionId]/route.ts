import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { generateReportFile } from "./generateReportFiles";


const reportSchema = z.object({
  mergeAllBranches: z.boolean(),
  branch: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const rawBody = await req.json();
  const body = reportSchema.safeParse(rawBody);
  
  if (!body.success) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  try {
    const { buffer, filename, contentType } = await generateReportFile(sessionId, body.data);

    return new NextResponse(buffer, {
      status: 202,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "attachment",
        "file-name": filename,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
  }
}
