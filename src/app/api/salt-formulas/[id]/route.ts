import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, gramsPerLiter, isDefault } = body;

    if (isDefault) {
      // Unset previous defaults
      await prisma.saltFormula.updateMany({
        where: { id: { not: id }, isDefault: true },
        data: { isDefault: false },
      });
    }

    const formula = await prisma.saltFormula.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(gramsPerLiter !== undefined ? { gramsPerLiter: parseFloat(gramsPerLiter) || 38.0 } : {}),
        ...(isDefault !== undefined ? { isDefault: Boolean(isDefault) } : {}),
      },
    });

    return NextResponse.json({ success: true, formula });
  } catch (error) {
    console.error("Failed to update salt formula:", error);
    return NextResponse.json({ error: "Failed to update salt formula" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.saltFormula.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete salt formula:", error);
    return NextResponse.json({ error: "Failed to delete salt formula" }, { status: 500 });
  }
}
