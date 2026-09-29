import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tankId, title, intervalDays, desc } = body;

    const task = await prisma.maintenanceTask.create({
      data: {
        tankId,
        title,
        intervalDays: parseInt(intervalDays, 10) || 7,
        lastCompleted: new Date(),
        desc: desc || null,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
