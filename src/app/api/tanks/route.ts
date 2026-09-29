import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tanks = await prisma.tank.findMany({
      select: {
        id: true,
        name: true,
        tankType: true,
        volumeLiters: true,
        hasSump: true,
        displayVolumeLiters: true,
        sumpVolumeLiters: true,
        formFactor: true,
        purpose: true,
        aquascapeStyle: true,
        createdAt: true,
        _count: {
          select: {
            parameters: true,
            livestock: true,
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ tanks });
  } catch (error) {
    console.error("Failed to fetch tanks:", error);
    return NextResponse.json({ error: "Failed to fetch tanks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      tankType,
      volumeLiters,
      hasSump,
      displayVolumeLiters,
      sumpVolumeLiters,
      formFactor,
      purpose,
      cycle,
      setupDate,
      equipment,
      lighting,
      aquascapeStyle,
      salinityTarget,
      tempTarget,
      phTarget,
      dkhTarget,
      caTarget,
      mgTarget,
      no3Target,
      po4Target,
      ammoniaTarget,
      nitriteTarget,
      ghTarget,
      khTarget,
      tdsTarget,
    } = body;

    const isFw = tankType === "FRESHWATER";
    const hasSumpVal = Boolean(hasSump);
    const displayVol = parseFloat(displayVolumeLiters) || parseFloat(volumeLiters) || (isFw ? 40 : 80);
    const sumpVol = hasSumpVal ? (parseFloat(sumpVolumeLiters) || 0) : 0;
    const totalVol = hasSumpVal ? (displayVol + sumpVol) : displayVol;

    const tank = await prisma.tank.create({
      data: {
        name: name || (isFw ? "Planted Tank" : "Display Reef"),
        tankType: isFw ? "FRESHWATER" : "SALTWATER",
        volumeLiters: totalVol,
        hasSump: hasSumpVal,
        displayVolumeLiters: displayVol,
        sumpVolumeLiters: sumpVol,
        formFactor: formFactor || "auto",
        purpose: purpose || (isFw ? "High-Tech Planted Aquascape" : "Mixed Reef"),
        aquascapeStyle: aquascapeStyle || (isFw ? "nature" : "mixed"),
        cycle: cycle || "Cycled with live bacteria",
        setupDate: setupDate || new Date().toISOString().slice(0, 10),
        equipment: equipment || "Filtration, heater, lighting",
        lighting: lighting || "LED Photoperiod 8h schedule",
        salinityTarget: salinityTarget || (isFw ? "0.000" : "1.025 - 1.026"),
        tempTarget: tempTarget || (isFw ? "22.0 - 25.0" : "25.0 - 26.0"),
        phTarget: phTarget || (isFw ? "6.4 - 7.2" : "8.1 - 8.4"),
        dkhTarget: dkhTarget || (isFw ? "1.0 - 4.0" : "7.8 - 9.0"),
        caTarget: caTarget || "400 - 450",
        mgTarget: mgTarget || "1300 - 1400",
        no3Target: no3Target || (isFw ? "5.0 - 15.0" : "5.0 - 15.0"),
        po4Target: po4Target || "0.03 - 0.08",
        ammoniaTarget: ammoniaTarget || "0.0 ppm",
        nitriteTarget: nitriteTarget || "0.0 ppm",
        ghTarget: ghTarget || "4.0 - 8.0 dGH",
        khTarget: khTarget || "1.0 - 4.0 dKH",
        tdsTarget: tdsTarget || "120 - 180 ppm",
        sitterTitle: `${isFw ? "🌿" : "🐠"} ${name || (isFw ? "Planted Tank" : "Reef")} Care Instructions`,
        sitterContact: "Tank Owner (+1-555-0199)",
      },
    });

    // Starter flora (freshwater) or sessile corals (saltwater) tailored to the chosen preset style. No fish or inverts.
    const chosenStyle = aquascapeStyle || (isFw ? "nature" : "mixed");
    if (isFw) {
      if (chosenStyle === "iwagumi") {
        await prisma.livestock.createMany({
          data: [
            {
              tankId: tank.id,
              name: "Monte Carlo Carpet",
              species: "Micranthemum tweediei",
              type: "CORAL",
              category: "Carpeting Plant",
              zone: "Foreground Substrate",
              diet: "Substrate root tabs & pressurized CO2",
              notes: "Dense bright green miniature carpet hugging dragon stones.",
            },
            {
              tankId: tank.id,
              name: "Dwarf Hairgrass",
              species: "Eleocharis parvula",
              type: "CORAL",
              category: "Carpeting Plant",
              zone: "Midground Accents",
              diet: "Liquid macro & micro fertilizers",
              notes: "Fine lawn-like grass softening stone crevices.",
            },
          ],
        });
      } else {
        await prisma.livestock.createMany({
          data: [
            {
              tankId: tank.id,
              name: "Anubias Nana Petite",
              species: "Anubias barteri var. nana 'Petite'",
              type: "CORAL",
              category: "Epiphyte",
              zone: "Hardscape Mount",
              diet: "Water column liquid trace",
              notes: "Hardy epiphyte with dark green miniature leaves attached to driftwood or stone.",
            },
            {
              tankId: tank.id,
              name: "Java Fern",
              species: "Microsorum pteropus",
              type: "CORAL",
              category: "Epiphyte",
              zone: "Midground Hardscape",
              diet: "Liquid macro & micro fertilizers",
              notes: "Undemanding, robust aquatic fern with flowing green fronds.",
            },
            {
              tankId: tank.id,
              name: "Amazon Sword",
              species: "Echinodorus grisebachii",
              type: "CORAL",
              category: "Rosette Plant",
              zone: "Background Substrate",
              diet: "Root nutrient tabs in substrate",
              notes: "Lush bright green centerpiece background plant.",
            },
          ],
        });
      }
    } else {
      if (chosenStyle === "sps") {
        await prisma.livestock.createMany({
          data: [
            {
              tankId: tank.id,
              name: "Green Slimer Acropora",
              species: "Acropora yongei",
              type: "CORAL",
              category: "SPS",
              zone: "Upper Reef Pinnacle / High PAR",
              diet: "High light photosynthesis, micro-plankton",
              notes: "Classic high-energy SPS staghorn with bright neon green corallites.",
            },
            {
              tankId: tank.id,
              name: "Montipora Digitata",
              species: "Montipora digitata",
              type: "CORAL",
              category: "SPS",
              zone: "Mid-to-Upper Live Rock / High Flow",
              diet: "Dissolved amino acids and reef roids",
              notes: "Hardy branching SPS with velvety polyp extension.",
            },
          ],
        });
      } else if (chosenStyle === "lagoon") {
        await prisma.livestock.createMany({
          data: [
            {
              tankId: tank.id,
              name: "Pink Birdsnest",
              species: "Seriatopora hystrix",
              type: "CORAL",
              category: "SPS",
              zone: "Mid-level Coral Island",
              diet: "Phytoplankton & liquid amino acids",
              notes: "Delicate needle-thin pink branches forming an intricate compact thicket.",
            },
            {
              tankId: tank.id,
              name: "Pulsing Xenia",
              species: "Xenia elongata",
              type: "CORAL",
              category: "Softie",
              zone: "Isolated Rock / Moderate Flow",
              diet: "Absorbs organic compounds directly from water",
              notes: "Mesmerizing rhythmic pulsing hand-like polyps.",
            },
          ],
        });
      } else {
        await prisma.livestock.createMany({
          data: [
            {
              tankId: tank.id,
              name: "Green Star Polyps (GSP)",
              species: "Pachyclavularia violacea",
              type: "CORAL",
              category: "Softie",
              zone: "Isolated Rock Island / Moderate Flow",
              diet: "Photosynthetic, absorbs dissolved organics",
              notes: "Vibrant metallic green grass-like polyps encrusting over live rock.",
            },
            {
              tankId: tank.id,
              name: "Watermelon Zoanthids",
              species: "Zoanthus sp.",
              type: "CORAL",
              category: "Softie",
              zone: "Mid-level Live Rock",
              diet: "Reef roids and liquid amino acids",
              notes: "Hardy colonial polyps displaying rich pink centers with neon green skirts.",
            },
            {
              tankId: tank.id,
              name: "Green Rhodactis Mushroom",
              species: "Rhodactis inchoata",
              type: "CORAL",
              category: "Softie",
              zone: "Lower Rock Ledge / Gentle Flow",
              diet: "Direct feeding of thawed mysis & marine copepods",
              notes: "Neon metallic green mantle vesicles with excellent bounce under blue LEDs.",
            },
          ],
        });
      }
    }

    const fullTank = await prisma.tank.findUnique({
      where: { id: tank.id },
      include: {
        livestock: { include: { media: true } },
        parameters: true,
        tasks: true,
        notes: true,
        milestones: true,
        timeline: true,
      },
    });

    return NextResponse.json({ success: true, tank: fullTank || tank });
  } catch (error) {
    console.error("Failed to create tank:", error);
    return NextResponse.json({ error: "Failed to create tank" }, { status: 500 });
  }
}
