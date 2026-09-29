import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tankId, title, category, date, description, photoUrl } = body;

    const event = await prisma.timelineEvent.create({
      data: {
        tankId,
        title,
        category: category || "Livestock",
        date: date ? new Date(date) : new Date(),
        description: description || null,
        photoUrl: photoUrl || null,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Failed to create timeline event:", error);
    return NextResponse.json({ error: "Failed to create timeline event" }, { status: 500 });
  }
}
