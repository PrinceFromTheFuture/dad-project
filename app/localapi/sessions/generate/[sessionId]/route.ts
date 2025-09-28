import generatePDFreport from "@/lib/generatePDFReport/generatePDFreport";
import getPayload from "@/lib/getPayload";
import { Branch, Media, Setting } from "@/payload-types";
import { Agent } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

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
  const callOptions = body.data;

  const payload = await getPayload();
  const session = await payload.findByID({ collection: "sessions", id: sessionId, depth: 10 });

  if (!session) {
    return NextResponse.json({ success: false, message: "session id is wrong" }, { status: 400 });
  }
  const { docs: reports } = await payload.find({
    collection: "reports",
    depth: 10,
    where: {
      session: {
        equals: sessionId,
      },
    },
  });

  if (callOptions.mergeAllBranches === false) {
    if (!callOptions.branch) {
      return NextResponse.json(
        {
          success: false,
          message: "you wanted to not mearge all branches in report but no branch id was provided",
        },
        { status: 400 }
      );
    }
    const report = reports.find((report) => (report.branch as Branch).id === callOptions.branch)!;
    const branch = report.branch! as Branch;
    const branchSettings = branch.settings as Setting;
    const reportData = report.agents as Media;
    if (branchSettings.mode === "unified") {
      const reportBytes = await generatePDFreport(branchSettings.sorting, reportData.url!);
      const headers = new Headers({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=example.pdf",
        "Content-Length": reportBytes.byteLength.toString(),
      });

      return new NextResponse(reportBytes, {
        status: 200,
        headers,
      });
    }
  }
  return NextResponse.json({ success: true });
}
