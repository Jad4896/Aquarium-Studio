import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const totalTanks = await prisma.tank.count();
    if (totalTanks <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the only remaining tank in database." },
        { status: 400 }
      );
    }

    await prisma.tank.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete tank:", error);
    return NextResponse.json({ error: "Failed to delete tank" }, { status: 500 });
  }
}
