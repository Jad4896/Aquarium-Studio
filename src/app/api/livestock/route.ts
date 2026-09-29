import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tankId,
      type,
      name,
      species,
      category,
      growthType,
      zone,
      lighting,
      aggressiveness,
      temperament,
      diet,
      interestingFact,
      notes,
      primaryPhotoUrl,
      primaryVideoUrl,
      beforePhotoUrl,
      afterPhotoUrl,
    } = body;

    const livestock = await prisma.livestock.create({
      data: {
        tankId,
        type: type || "CORAL",
        name,
        species: species || "",
        category: category || "LPS",
        growthType: growthType || null,
        zone: zone || null,
        lighting: lighting || null,
        aggressiveness: aggressiveness || null,
        temperament: temperament || null,
        diet: diet || null,
        interestingFact: interestingFact || null,
        notes: notes || null,
        primaryPhotoUrl: primaryPhotoUrl || null,
        primaryVideoUrl: primaryVideoUrl || null,
        beforePhotoUrl: beforePhotoUrl || primaryPhotoUrl || null,
        afterPhotoUrl: afterPhotoUrl || primaryPhotoUrl || null,
      },
    });

    // If initial photo provided, also add as media entry
    if (primaryPhotoUrl) {
      await prisma.livestockMedia.create({
        data: {
          livestockId: livestock.id,
          url: primaryPhotoUrl,
          mediaType: "image",
          caption: "Initial specimen addition",
          isBefore: true,
        },
      });
    }

    if (primaryVideoUrl) {
      await prisma.livestockMedia.create({
        data: {
          livestockId: livestock.id,
          url: primaryVideoUrl,
          mediaType: "video",
          caption: "Initial specimen video",
        },
      });
    }

    return NextResponse.json({ success: true, livestock });
  } catch (error) {
    console.error("Failed to add livestock:", error);
    return NextResponse.json({ error: "Failed to add livestock" }, { status: 500 });
  }
}
