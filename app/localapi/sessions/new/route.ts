// app/api/create-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { z } from "zod";
import decodeRawRepoert from "@/lib/decodeRawReport"; // Adjust path to your decodeRawRepoert function
import { v4 as uuidv4 } from "uuid";
import getPayload from "@/lib/getPayload";

// Define Zod schema for the request body (excluding files, which are handled separately)
const RequestBodySchema = z.object({
  nickname: z.string().min(1, "Session nickname is required"),
  month: z.number(),
  year: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse the multipart/form-data request
    const formData = await req.formData();

    // Extract fields from formData
    const formNickname = formData.get("nickname");
    const formMonth = formData.get("month");
    const formYear = formData.get("year");
    const files = formData.getAll("files"); // Expect multiple files

    if (files.length === 0) {
      return NextResponse.json({ error: "no files provided", details: "error" }, { status: 400 });
    }
    // Validate non-file fields with Zod
    const parsedBody = RequestBodySchema.safeParse({
      year: Number(formYear),
      nickname: formNickname,
      month: Number(formMonth),
    });

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const { month, nickname, year } = parsedBody.data;
    const payload = await getPayload();
    const { docs: branches } = await payload.find({ collection: "branches" });

    // Convert files to Buffers and pair with branchNames
    const rawReports = await Promise.all(
      files.map(async (file, index) => {
        if (!(file instanceof File)) {
          throw new Error(`Invalid file at index ${index}`);
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          branchId: branches.find((branch) => file.name.includes(branch.searchKey!))!,
          data: buffer,
        };
      })
    );

    // Create a new session
    const session = await payload.create({
      collection: "sessions",
      data: {
        nickname,
        month,
        year,
      },
    });

    // Process each raw report
    for (const rawReport of rawReports) {
      const rawReportUploadName = uuidv4();
      const agentsUploadName = uuidv4();

      // Decode the raw report
      const decoded = decodeRawRepoert(rawReport.data.toString()); // Assumes decodeRawRepoert accepts a Buffer
      const decodedJson = {
        agents: JSON.stringify(decoded.allAgents),
      };

      // Upload raw report to media collection
      const rawReportUpload = await payload.create({
        collection: "media",
        data: { name: rawReportUploadName },
        file: {
          data: rawReport.data,
          mimetype: "plain/text",
          name: `${rawReportUploadName}.txt`,
          size: rawReport.data.byteLength,
        },
      });
      // Upload agents JSON to media collection
      const agentsUpload = await payload.create({
        collection: "media",
        data: { name: agentsUploadName },
        file: {
          data: Buffer.from(decodedJson.agents),
          mimetype: "application/json",
          name: `${agentsUploadName}.json`,
          size: Buffer.byteLength(decodedJson.agents),
        },
      });

      // Create a report linking all uploaded media and session
      const report = await payload.create({
        collection: "reports",
        data: {
          agents: agentsUpload.id,
          branch: rawReport.branchId,
          rawReport: rawReportUpload.id,
          session: session.id,
        },
      });
    }

    return NextResponse.json(
      { message: "Session and reports created successfully", sessionId: session.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in create-session API:", error);
    //@ts-ignore
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
