import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tankId, title, caption, photoUrl, videoUrl, date } = body;

    const milestone = await prisma.tankMilestone.create({
      data: {
        tankId,
        title,
        caption: caption || null,
        photoUrl: photoUrl || null,
        videoUrl: videoUrl || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ success: true, milestone });
  } catch (error) {
    console.error("Failed to create milestone:", error);
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}
