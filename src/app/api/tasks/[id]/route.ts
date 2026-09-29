import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function handleUpdateTask(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.action === "complete" || body.completed === true) {
      data.lastCompleted = body.lastCompleted ? new Date(body.lastCompleted) : new Date();
    }
    if (body.title !== undefined) data.title = body.title;
    if (body.intervalDays !== undefined) data.intervalDays = parseInt(body.intervalDays, 10);
    if (body.desc !== undefined) data.desc = body.desc;
    if (body.lastCompleted !== undefined && data.lastCompleted === undefined) {
      data.lastCompleted = new Date(body.lastCompleted);
    }

    const task = await prisma.maintenanceTask.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdateTask(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdateTask(request, context);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.maintenanceTask.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
