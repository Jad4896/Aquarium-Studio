import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function handleUpdateNote(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.tag !== undefined) data.tag = body.tag;
    if (body.tagColor !== undefined) data.tagColor = body.tagColor;
    if (body.body !== undefined) data.body = body.body;
    if (body.dateLabel !== undefined) data.dateLabel = body.dateLabel;
    if (body.isPinned !== undefined) data.isPinned = Boolean(body.isPinned);

    const note = await prisma.stickyNote.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Failed to update note:", error);
    return NextResponse.json({ error: "Failed to update sticky note" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdateNote(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdateNote(request, context);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.stickyNote.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
