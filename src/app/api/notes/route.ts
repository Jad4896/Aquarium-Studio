import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tankId, title, tag, tagColor, body: noteBody, dateLabel, isPinned } = body;

    const note = await prisma.stickyNote.create({
      data: {
        tankId,
        title,
        tag: tag || "general",
        tagColor: tagColor || "#00d2be",
        body: noteBody,
        dateLabel: dateLabel || "Pinned",
        isPinned: isPinned !== undefined ? isPinned : true,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Failed to create note:", error);
    return NextResponse.json({ error: "Failed to create sticky note" }, { status: 500 });
  }
}
