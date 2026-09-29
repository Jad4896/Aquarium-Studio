import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: any = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.caption !== undefined) data.caption = body.caption;
    if (body.photoUrl !== undefined) data.photoUrl = body.photoUrl;
    if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl;
    if (body.date !== undefined) data.date = new Date(body.date);

    const updated = await prisma.tankMilestone.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, milestone: updated });
  } catch (error) {
    console.error("Failed to update milestone:", error);
    return NextResponse.json(
      { error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.tankMilestone.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete milestone:", error);
    return NextResponse.json(
      { error: "Failed to delete milestone" },
      { status: 500 }
    );
  }
}
