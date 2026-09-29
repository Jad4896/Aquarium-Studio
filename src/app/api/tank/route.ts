import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedId = searchParams.get("id");

    const whereClause = requestedId ? { id: requestedId } : {};

    let tank = await prisma.tank.findFirst({
      where: whereClause,
      include: {
        parameters: {
          orderBy: { date: "desc" },
        },
        livestock: {
          include: {
            media: {
              orderBy: { date: "desc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        tasks: {
          orderBy: { intervalDays: "asc" },
        },
        notes: {
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        },
        milestones: {
          orderBy: { date: "desc" },
        },
        timeline: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!tank) {
      // Fallback to first tank or create
      tank = await prisma.tank.findFirst({
        include: {
          parameters: { orderBy: { date: "desc" } },
          livestock: { include: { media: { orderBy: { date: "desc" } } } },
          tasks: { orderBy: { intervalDays: "asc" } },
          notes: { orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] },
          milestones: { orderBy: { date: "desc" } },
          timeline: { orderBy: { date: "desc" } },
        },
      });
    }

    if (!tank) {
      tank = await prisma.tank.create({
        data: {
          name: "Main Reef",
          volumeLiters: 80,
          purpose: "Mixed Reef (Soft, LPS, SPS)",
        },
        include: {
          parameters: true,
          livestock: { include: { media: true } },
          tasks: true,
          notes: true,
          milestones: true,
          timeline: true,
        },
      });
    }

    const saltFormulas = await prisma.saltFormula.findMany({
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ tank, saltFormulas });
  } catch (error) {
    console.error("Failed to fetch tank:", error);
    return NextResponse.json({ error: "Failed to load tank data" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (
      updateData.displayVolumeLiters !== undefined ||
      updateData.sumpVolumeLiters !== undefined ||
      updateData.hasSump !== undefined ||
      updateData.refugiumVolumeLiters !== undefined ||
      updateData.hasRefugium !== undefined
    ) {
      const hasSump = Boolean(updateData.hasSump);
      const hasRefugium = Boolean(updateData.hasRefugium);
      const displayVol =
        parseFloat(updateData.displayVolumeLiters) ||
        parseFloat(updateData.volumeLiters) ||
        80;
      const sumpVol = hasSump ? parseFloat(updateData.sumpVolumeLiters) || 0 : 0;
      const refugiumVol = hasRefugium ? parseFloat(updateData.refugiumVolumeLiters) || 0 : 0;
      
      updateData.hasSump = hasSump;
      updateData.hasRefugium = hasRefugium;
      updateData.displayVolumeLiters = displayVol;
      updateData.sumpVolumeLiters = sumpVol;
      updateData.refugiumVolumeLiters = refugiumVol;
      updateData.volumeLiters = displayVol + sumpVol + refugiumVol;

      if (updateData.sumpChambers !== undefined) {
        updateData.sumpChambers = parseInt(updateData.sumpChambers) || 3;
      }
    }

    const tank = await prisma.tank.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, tank });
  } catch (error) {
    console.error("Failed to update tank:", error);
    return NextResponse.json({ error: "Failed to update tank" }, { status: 500 });
  }
}
