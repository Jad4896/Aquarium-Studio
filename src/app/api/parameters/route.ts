import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tankId,
      date,
      salinity,
      temp,
      ph,
      alk,
      ca,
      mg,
      no3,
      po4,
      ammonia,
      nitrite,
      gh,
      kh,
      tds,
      wcLiters,
      mood,
      notes,
    } = body;

    const parseOptFloat = (val: any): number | null => {
      if (val === undefined || val === null || val === "") return null;
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    };

    const newParam = await prisma.waterParameter.create({
      data: {
        tankId,
        date: date ? new Date(date) : new Date(),
        temp: parseFloat(temp) || 25.0,
        ph: parseFloat(ph) || 7.0,
        no3: parseOptFloat(no3),
        wcLiters: parseOptFloat(wcLiters) || 0,
        mood: mood || "Thriving 😍",
        notes: notes || null,
        // Saltwater
        salinity: parseOptFloat(salinity),
        alk: parseOptFloat(alk),
        ca: parseOptFloat(ca),
        mg: parseOptFloat(mg),
        po4: parseOptFloat(po4),
        // Freshwater
        ammonia: parseOptFloat(ammonia),
        nitrite: parseOptFloat(nitrite),
        gh: parseOptFloat(gh),
        kh: parseOptFloat(kh),
        tds: parseOptFloat(tds),
      },
    });

    return NextResponse.json({ success: true, parameter: newParam });
  } catch (error) {
    console.error("Failed to add parameter log:", error);
    return NextResponse.json({ error: "Failed to create parameter log" }, { status: 500 });
  }
}
