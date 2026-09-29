import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const formulas = await prisma.saltFormula.findMany({
      orderBy: { isDefault: "desc" },
    });
    return NextResponse.json({ formulas });
  } catch (error) {
    console.error("Failed to fetch salt formulas:", error);
    return NextResponse.json({ error: "Failed to fetch salt formulas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, gramsPerLiter, isDefault } = body;

    if (isDefault) {
      // Unset previous defaults
      await prisma.saltFormula.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const formula = await prisma.saltFormula.create({
      data: {
        name,
        gramsPerLiter: parseFloat(gramsPerLiter) || 38.0,
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ success: true, formula });
  } catch (error) {
    console.error("Failed to create salt formula:", error);
    return NextResponse.json({ error: "Failed to create salt formula" }, { status: 500 });
  }
}
