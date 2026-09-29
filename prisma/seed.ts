import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data to ensure clean idempotency
  await prisma.livestockMedia.deleteMany({});
  await prisma.livestock.deleteMany({});
  await prisma.waterParameter.deleteMany({});
  await prisma.maintenanceTask.deleteMany({});
  await prisma.stickyNote.deleteMany({});
  await prisma.tankMilestone.deleteMany({});
  await prisma.timelineEvent.deleteMany({});
  await prisma.saltFormula.deleteMany({});
  await prisma.tank.deleteMany({});

  // 1. Create Primary Tank: "Main Reef" (SALTWATER)
  const tank = await prisma.tank.create({
    data: {
      name: "Main Reef",
      tankType: "SALTWATER",
      volumeLiters: 80,
      purpose: "Mixed Reef (Soft, LPS, SPS)",
      cycle: "11 Days (CaribSea Arag-Alive)",
      setupDate: "2026-08-05",
      equipment: "3D Printed Drop-in AIO Filter, UV Sterilizer, Titanium Heater, Surface Skimmer Weir, Coral Propagation Mounts",
      lighting: "9h Photoperiod: 1h Ramp Blues, 7h Peak (80% Royal Blue, 15% White, 5% UV), 1h Moonlights",
      salinityTarget: "1.025 - 1.026",
      tempTarget: "25.0 - 26.0",
      phTarget: "8.1 - 8.4",
      dkhTarget: "7.8 - 9.0",
      caTarget: "400 - 450",
      mgTarget: "1300 - 1400",
      no3Target: "5.0 - 15.0",
      po4Target: "0.03 - 0.08",
      sitterTitle: "🐠 Main Reef Care & Emergency Instructions",
      sitterContact: "Reef Keeper (+1-555-0199)",
      sitterEmergency: "Call immediately on leak or equipment failure: +1-555-0199",
      sitterChecklist: JSON.stringify([
        "Check temperature reading on digital display (~25.5°C / 78°F).",
        "Ensure ATO reservoir has freshwater (RO/DI water ONLY, never saltwater).",
        "Feed fish once daily at lights-on (1/2 cube of frozen mysis shrimp thawed in cup).",
        "Check surface skimmer and overflow weir for normal quiet water level.",
        "Confirm protein skimmer cup is not overflowing."
      ]),
      sitterNotes: "Do NOT dose any additives unless contacted. In case of power loss, connect battery bubbler to main display."
    }
  });

  console.log(`Created Saltwater Tank: ${tank.name} (${tank.id})`);

  // 2. Create Secondary Tank: "Amazonia Nano Planted" (FRESHWATER)
  const fwTank = await prisma.tank.create({
    data: {
      name: "Amazonia Nano Planted",
      tankType: "FRESHWATER",
      volumeLiters: 40,
      purpose: "High-Tech Planted Aquascape & Caridina Shrimp",
      cycle: "4 Weeks Dark Start with ADA Amazonia Soil",
      setupDate: "2026-08-15",
      equipment: "Chihiros WRGB II Slim, Co2Art Inline Diffuser, Oase FiltoSmart 100 Thermo, Glass Lily Pipes, ADA Amazonia Ver. 2",
      lighting: "8h Photoperiod: 30m Ramp, 7h Peak 6500K High PAR (100 PAR at substrate), 30m Dusk",
      tempTarget: "22.0 - 24.5",
      phTarget: "6.2 - 6.8",
      no3Target: "5.0 - 15.0",
      ammoniaTarget: "0.0 ppm",
      nitriteTarget: "0.0 ppm",
      ghTarget: "4.0 - 6.0 dGH",
      khTarget: "0.5 - 2.0 dKH",
      tdsTarget: "120 - 140 ppm",
      salinityTarget: "0.000",
      dkhTarget: "1.0 - 2.0",
      caTarget: "20 - 40",
      mgTarget: "5 - 15",
      po4Target: "0.5 - 1.5",
      sitterTitle: "🌿 Amazonia Planted Tank Sitter Instructions",
      sitterContact: "Aquascaper (+1-555-0199)",
      sitterEmergency: "If CO2 bubble counter is stuck running fast, pull CO2 solenoid plug immediately: +1-555-0199",
      sitterChecklist: JSON.stringify([
        "Check digital temp display (~23.5°C).",
        "Verify drop checker is lime green (optimal 30 ppm dissolved CO2).",
        "Feed shrimp 2 pellets of Shrimp King Complete every second day.",
        "Check lily pipe outflow is skimming surface cleanly without vortex noise."
      ]),
      sitterNotes: "Top-off reservoir uses 0 TDS pure RO/DI water ONLY. Do not dose macro ferts if water change was performed."
    }
  });

  console.log(`Created Freshwater Tank: ${fwTank.name} (${fwTank.id})`);

  // 3. Salt Formulas (Targeting 38 grams per liter for Red Sea Blue Bucket at 35 ppt)
  await prisma.saltFormula.createMany({
    data: [
      { name: "Red Sea Blue Bucket", gramsPerLiter: 38.0, isDefault: true },
      { name: "Red Sea Coral Pro", gramsPerLiter: 38.5, isDefault: false },
      { name: "Aquaforest Reef Salt", gramsPerLiter: 39.0, isDefault: false },
      { name: "Tropic Marin Pro", gramsPerLiter: 37.5, isDefault: false },
      { name: "Instant Ocean / Reef Crystals", gramsPerLiter: 38.0, isDefault: false }
    ]
  });

  // 4. Primary Livestock on Main Reef:
  const livestockData = [
    {
      name: "Wall Frogspawn",
      species: "Fimbriaphyllia paradivisa",
      type: "CORAL",
      category: "LPS",
      zone: "Low-Mid / Gentle Flow",
      diet: "LPS micro-pellets and dissolved amino acids weekly",
      notes: "Flourishing tentacles with fluorescent tips. Maintain 6-inch perimeter from neighboring SPS.",
      primaryPhotoUrl: "/uploads/frogspawn-after.svg",
      beforePhotoUrl: "/uploads/frogspawn-before.svg",
      afterPhotoUrl: "/uploads/frogspawn-after.svg"
    },
    {
      name: "Plating Montipora",
      species: "Montipora capricornis",
      type: "CORAL",
      category: "SPS",
      zone: "Mid-level / Moderate Flow",
      diet: "Phytoplankton & broadcast coral amino acids",
      notes: "Darker mature center with healthy active neon growth rim expanding outward in horizontal tiers.",
      primaryPhotoUrl: "/uploads/montipora-after.svg",
      beforePhotoUrl: "/uploads/montipora-before.svg",
      afterPhotoUrl: "/uploads/montipora-after.svg"
    },
    {
      name: "Toadstool Leather",
      species: "Sarcophyton sp.",
      type: "CORAL",
      category: "Softie",
      zone: "Low-Mid Rockwork / Moderate Flow",
      diet: "Photosynthetic, absorbs dissolved organics",
      notes: "Loves gentle alternating current. Displays complete polyp extension throughout photoperiod.",
      primaryPhotoUrl: "/uploads/toadstool.svg",
      beforePhotoUrl: "/uploads/toadstool.svg",
      afterPhotoUrl: "/uploads/toadstool.svg"
    },
    {
      name: "Zoanthids",
      species: "Zoanthus sp. (Rasta Morph)",
      type: "CORAL",
      category: "Softie",
      zone: "Mid-level Coral Island",
      diet: "Reef roids and liquid amino acids",
      notes: "Vibrant multi-colored colony with green outer skirt, orange inner ring, and deep purple mouth.",
      primaryPhotoUrl: "/uploads/zoanthids.svg",
      beforePhotoUrl: "/uploads/zoanthids.svg",
      afterPhotoUrl: "/uploads/zoanthids.svg"
    },
    {
      name: "Green Rhodactis",
      species: "Rhodactis inchoata",
      type: "CORAL",
      category: "Softie",
      zone: "Lower Shaded Ledge",
      diet: "Direct feeding of thawed mysis & marine copepods",
      notes: "Neon metallic green mantle vesicles. Excellent bounce and rapid growth under actinic LEDs.",
      primaryPhotoUrl: "/uploads/rhodactis.svg",
      beforePhotoUrl: "/uploads/rhodactis.svg",
      afterPhotoUrl: "/uploads/rhodactis.svg"
    }
  ];

  for (const item of livestockData) {
    const created = await prisma.livestock.create({
      data: {
        tankId: tank.id,
        ...item
      }
    });

    if (item.beforePhotoUrl && item.afterPhotoUrl) {
      await prisma.livestockMedia.create({
        data: {
          livestockId: created.id,
          url: item.beforePhotoUrl,
          mediaType: "image",
          caption: "Initial specimen baseline",
          isBefore: true,
          date: new Date("2026-08-16")
        }
      });

      await prisma.livestockMedia.create({
        data: {
          livestockId: created.id,
          url: item.afterPhotoUrl,
          mediaType: "image",
          caption: "Recent mature development",
          isAfter: true,
          date: new Date("2026-09-25")
        }
      });
    }
  }

  // 4b. Freshwater Flora & Fauna for Amazonia Nano Planted
  const fwLivestockData = [
    {
      name: "Monte Carlo Carpet",
      species: "Micranthemum tweediei",
      type: "PLANT",
      category: "Carpeting",
      growthType: "Runners / Dense Mat Carpet",
      zone: "Foreground Substrate",
      lighting: "High PAR (80-120)",
      diet: "Root tabs + All-In-One liquid ferts",
      notes: "Lush green foreground carpet pearling with oxygen bubbles under pressurized CO2.",
      primaryPhotoUrl: "/uploads/montipora-after.svg",
      beforePhotoUrl: "/uploads/montipora-before.svg",
      afterPhotoUrl: "/uploads/montipora-after.svg"
    },
    {
      name: "Rotala H'ra",
      species: "Rotala rotundifolia 'H'ra'",
      type: "PLANT",
      category: "Stem",
      growthType: "Upright Stems with Lateral Shoots",
      zone: "Background",
      lighting: "High PAR (100+)",
      diet: "Water column liquid fertilizer",
      notes: "Intense red-orange foliage when trimmed frequently under high light and nitrate limitation.",
      primaryPhotoUrl: "/uploads/rhodactis.svg",
      beforePhotoUrl: "/uploads/rhodactis.svg",
      afterPhotoUrl: "/uploads/rhodactis.svg"
    },
    {
      name: "Bucephalandra Brownie Ghost",
      species: "Bucephalandra sp.",
      type: "PLANT",
      category: "Epiphyte",
      growthType: "Creeping Rhizome on hardscape",
      zone: "Midground Lava Rock",
      lighting: "Moderate PAR (40-60)",
      diet: "Liquid micronutrients & iron",
      notes: "Deep metallic purple-blue iridescent leaves with tiny white star speckles.",
      primaryPhotoUrl: "/uploads/zoanthids.svg",
      beforePhotoUrl: "/uploads/zoanthids.svg",
      afterPhotoUrl: "/uploads/zoanthids.svg"
    },
    {
      name: "Christmas Moss",
      species: "Vesicularia montagnei",
      type: "PLANT",
      category: "Moss",
      growthType: "Branching Triangular Fronds",
      zone: "Driftwood Mount",
      lighting: "Low-Medium PAR (30-50)",
      diet: "Liquid micro trace",
      notes: "Dense weeping triangular fronds providing shelter for baby shrimp shrimplets.",
      primaryPhotoUrl: "/uploads/toadstool.svg",
      beforePhotoUrl: "/uploads/toadstool.svg",
      afterPhotoUrl: "/uploads/toadstool.svg"
    }
  ];

  for (const item of fwLivestockData) {
    const created = await prisma.livestock.create({
      data: {
        tankId: fwTank.id,
        ...item
      }
    });

    if (item.beforePhotoUrl && item.afterPhotoUrl) {
      await prisma.livestockMedia.create({
        data: {
          livestockId: created.id,
          url: item.beforePhotoUrl,
          mediaType: "image",
          caption: "Specimen planting / introduction",
          isBefore: true,
          date: new Date("2026-08-16")
        }
      });

      await prisma.livestockMedia.create({
        data: {
          livestockId: created.id,
          url: item.afterPhotoUrl,
          mediaType: "image",
          caption: "Thriving dense growth",
          isAfter: true,
          date: new Date("2026-09-25")
        }
      });
    }
  }

  // 5. Stocking Timeline Events for Main Reef
  const timelineEvents = [
    {
      date: new Date("2026-08-16T12:00:00Z"),
      title: "Cycle Finished & First Stocking",
      category: "Livestock",
      description: "11-day cycle complete with CaribSea live sand and nitrifying bacteria. Added first Green Star Polyps and soft coral frags.",
      photoUrl: "/uploads/frogspawn-before.svg"
    },
    {
      date: new Date("2026-08-17T15:30:00Z"),
      title: "Softie & LPS Expansion",
      category: "Livestock",
      description: "Added Green & Orange Rhodactis Mushroom, Toadstool Leather coral, and Acan lord frags to lower rockwork.",
      photoUrl: "/uploads/toadstool.svg"
    },
    {
      date: new Date("2026-08-20T11:00:00Z"),
      title: "First SPS & Zoanthids Introduced",
      category: "Livestock",
      description: "Added Green Plating Montipora and Rasta Zoanthid colony. Secured plugs to rockscape.",
      photoUrl: "/uploads/montipora-before.svg"
    },
    {
      date: new Date("2026-08-23T14:00:00Z"),
      title: "Coral Placement Optimization",
      category: "Livestock",
      description: "Adjusted lighting photoperiod and positioned mushroom frags in lower PAR zone.",
    },
    {
      date: new Date("2026-08-24T16:00:00Z"),
      title: "Euphyllia Wall Frogspawn Addition",
      category: "Livestock",
      description: "Mounted Wall Frogspawn in lower-mid alternating current zone. Sweepers expanding nicely within 2 hours.",
      photoUrl: "/uploads/frogspawn-before.svg"
    },
    {
      date: new Date("2026-08-28T10:30:00Z"),
      title: "Coral Colony Growth Check",
      category: "Livestock",
      description: "Observed active encrusting on Zoanthid colony and vibrant polyp extension across all softies.",
      photoUrl: "/uploads/montipora-after.svg"
    },
    {
      date: new Date("2026-09-15T18:00:00Z"),
      title: "UV Sterilizer & Flow Upgrade",
      category: "Equipment",
      description: "Installed inline UV sterilizer to enhance water clarity and prevent bacterial water blooms.",
    },
    {
      date: new Date("2026-09-25T11:00:00Z"),
      title: "Month 2 Full Encrusting Milestone",
      category: "Milestone",
      description: "All corals encrusting onto rockwork. Plating Montipora displaying brilliant neon growth edge. System highly stable.",
      photoUrl: "/uploads/fts-month3.svg"
    }
  ];

  for (const ev of timelineEvents) {
    await prisma.timelineEvent.create({
      data: {
        tankId: tank.id,
        ...ev
      }
    });
  }
  console.log(`Created ${timelineEvents.length} stocking timeline events.`);

  // 6. Parameter History Logs (Main Reef)
  const paramLogs = [
    {
      date: new Date("2026-09-01T10:00:00Z"),
      salinity: 1.025,
      temp: 25.4,
      ph: 8.18,
      alk: 8.6,
      ca: 440,
      mg: 1360,
      no3: 13.5,
      po4: 0.06,
      wcLiters: 10,
      mood: "Happy 😊",
      notes: "Post-cycle baseline water test."
    },
    {
      date: new Date("2026-09-06T11:30:00Z"),
      salinity: 1.025,
      temp: 25.5,
      ph: 8.21,
      alk: 8.4,
      ca: 435,
      mg: 1355,
      no3: 12.0,
      po4: 0.05,
      wcLiters: 0,
      mood: "Thriving 😍",
      notes: "Coral frags settled and displaying good polyp extension."
    },
    {
      date: new Date("2026-09-11T14:15:00Z"),
      salinity: 1.026,
      temp: 25.6,
      ph: 8.24,
      alk: 8.3,
      ca: 430,
      mg: 1350,
      no3: 11.0,
      po4: 0.05,
      wcLiters: 10,
      mood: "Thriving 😍",
      notes: "Weekly 10L water change with 38g/L Red Sea salt."
    },
    {
      date: new Date("2026-09-16T09:45:00Z"),
      salinity: 1.025,
      temp: 25.5,
      ph: 8.23,
      alk: 8.2,
      ca: 428,
      mg: 1345,
      no3: 10.5,
      po4: 0.04,
      wcLiters: 0,
      mood: "Happy 😊",
      notes: "Stable consumption observed. Dosed micro elements."
    },
    {
      date: new Date("2026-09-21T16:00:00Z"),
      salinity: 1.025,
      temp: 25.5,
      ph: 8.25,
      alk: 8.3,
      ca: 432,
      mg: 1350,
      no3: 9.8,
      po4: 0.04,
      wcLiters: 10,
      mood: "Thriving 😍",
      notes: "Water change complete. Nitrate nicely controlled."
    },
    {
      date: new Date("2026-09-26T10:00:00Z"),
      salinity: 1.0255,
      temp: 25.6,
      ph: 8.28,
      alk: 8.3,
      ca: 435,
      mg: 1360,
      no3: 9.2,
      po4: 0.04,
      wcLiters: 0,
      mood: "Thriving 😍",
      notes: "All parameters locked in optimal ranges. Corals encrusting rapidly."
    }
  ];

  for (const log of paramLogs) {
    await prisma.waterParameter.create({
      data: {
        tankId: tank.id,
        ...log
      }
    });
  }

  // 6b. Parameter History Logs (Amazonia Nano Planted - FRESHWATER)
  const fwParamLogs = [
    {
      date: new Date("2026-09-02T10:00:00Z"),
      temp: 23.2,
      ph: 6.4,
      no3: 15.0,
      ammonia: 0.0,
      nitrite: 0.0,
      gh: 5.2,
      kh: 1.5,
      tds: 135,
      wcLiters: 20,
      mood: "Thriving 😍",
      notes: "Post-cycling 50% water change with pure RO/DI remineralized to 135 TDS with Bee Shrimp GH+."
    },
    {
      date: new Date("2026-09-08T11:00:00Z"),
      temp: 23.4,
      ph: 6.45,
      no3: 12.0,
      ammonia: 0.0,
      nitrite: 0.0,
      gh: 5.0,
      kh: 1.2,
      tds: 132,
      wcLiters: 0,
      mood: "Thriving 😍",
      notes: "Monte Carlo runners spreading across substrate. CO2 drop checker bright lime green (30 ppm)."
    },
    {
      date: new Date("2026-09-14T14:30:00Z"),
      temp: 23.5,
      ph: 6.5,
      no3: 11.5,
      ammonia: 0.0,
      nitrite: 0.0,
      gh: 5.0,
      kh: 1.0,
      tds: 130,
      wcLiters: 15,
      mood: "Thriving 😍",
      notes: "50% weekly water change. Dosed 1.5 mL APT Complete. Caridina shrimp grazing actively on biofilm."
    },
    {
      date: new Date("2026-09-19T09:15:00Z"),
      temp: 23.4,
      ph: 6.48,
      no3: 9.5,
      ammonia: 0.0,
      nitrite: 0.0,
      gh: 4.8,
      kh: 1.0,
      tds: 128,
      wcLiters: 0,
      mood: "Thriving 😍",
      notes: "Rotala H'ra tips turning brilliant ruby red. Bucephalandra putting out a new submersed leaf."
    },
    {
      date: new Date("2026-09-23T16:00:00Z"),
      temp: 23.6,
      ph: 6.52,
      no3: 10.0,
      ammonia: 0.0,
      nitrite: 0.0,
      gh: 5.0,
      kh: 1.2,
      tds: 130,
      wcLiters: 15,
      mood: "Thriving 😍",
      notes: "Water change and gentle vacuuming of Christmas moss. Two berried female Crystal Red Shrimp spotted!"
    },
    {
      date: new Date("2026-09-27T10:00:00Z"),
      temp: 23.5,
      ph: 6.5,
      no3: 8.5,
      ammonia: 0.0,
      nitrite: 0.0,
      gh: 5.0,
      kh: 1.0,
      tds: 130,
      wcLiters: 0,
      mood: "Thriving 😍",
      notes: "All freshwater plant and shrimp parameters fully stabilized in optimal targets. Zero algae detected."
    }
  ];

  for (const log of fwParamLogs) {
    await prisma.waterParameter.create({
      data: {
        tankId: fwTank.id,
        ...log
      }
    });
  }

  // Freshwater Maintenance Tasks
  const fwTasks = [
    {
      title: "50% RO/DI Water Change + Remineralize GH+",
      intervalDays: 7,
      lastCompleted: new Date("2026-09-23T16:00:00Z"),
      desc: "Prepare 15L of pure RO/DI water, add 2.2g SaltyShrimp Bee Shrimp Mineral GH+ to 130 TDS."
    },
    {
      title: "Dose Plant Fertilizer (Tropica / APT Complete)",
      intervalDays: 2,
      lastCompleted: new Date("2026-09-26T09:00:00Z"),
      desc: "Dose 1.5 mL of all-in-one liquid fertilizer at lights-on."
    },
    {
      title: "Trim Rotala Stems & Shape Bush",
      intervalDays: 14,
      lastCompleted: new Date("2026-09-20T11:00:00Z"),
      desc: "Trim top stem nodes with curved aquascaping scissors to promote dense lateral branching."
    },
    {
      title: "Clean Glass & Vacuum Moss Detritus",
      intervalDays: 7,
      lastCompleted: new Date("2026-09-24T10:00:00Z"),
      desc: "Wipe front glass with magnetic algae scraper and siphon detritus from Christmas moss."
    }
  ];

  for (const t of fwTasks) {
    await prisma.maintenanceTask.create({
      data: {
        tankId: fwTank.id,
        ...t
      }
    });
  }

  // Freshwater Sticky Notes
  const fwNotes = [
    {
      title: "🌿 RO/DI Remineralizer Recipe",
      tag: "recipe",
      tagColor: "#00d2be",
      dateLabel: "Pinned",
      isPinned: true,
      body: "Mix 1.5 grams of SaltyShrimp Bee Shrimp Mineral GH+ per 10 Liters of 0 TDS RO/DI water. Targets: 5.0 dGH, 0 dKH, 125-135 ppm TDS. Always verify with calibrated digital TDS pen."
    },
    {
      title: "🌱 All-In-One Plant Fertilizer Schedule",
      tag: "general",
      tagColor: "#2ecc71",
      dateLabel: "Weekly",
      isPinned: true,
      body: "Dose 1.5 mL of APT Complete on Monday, Wednesday, and Friday morning when CO2 turns on. Perform 50% reset water change every Sunday."
    },
    {
      title: "🦐 Caridina Shrimp Water Stability Warning",
      tag: "warning",
      tagColor: "#f39c12",
      dateLabel: "Rule",
      isPinned: true,
      body: "Caridina Crystal Red Shrimp require KH < 2.0 and stable TDS 120-140 ppm. Never use tap water or baking soda. Never allow TDS to spike above 160 ppm."
    }
  ];

  for (const n of fwNotes) {
    await prisma.stickyNote.create({
      data: {
        tankId: fwTank.id,
        ...n
      }
    });
  }

  // Freshwater Milestones & Timeline
  await prisma.tankMilestone.createMany({
    data: [
      {
        tankId: fwTank.id,
        title: "Iwagumi Hardscape & Dark Start",
        caption: "40L ultra-clear tank scape with Frodo stone, ADA Amazonia Ver. 2 soil, and 4-week dark start cycling.",
        photoUrl: "/uploads/fts-month1.svg",
        date: new Date("2026-08-15")
      },
      {
        tankId: fwTank.id,
        title: "Monte Carlo Full Carpet Established",
        caption: "Foreground substrate 100% covered in dense Monte Carlo carpet. Crystal Red Shrimp colony thriving.",
        photoUrl: "/uploads/fts-month3.svg",
        date: new Date("2026-09-25")
      }
    ]
  });

  await prisma.timelineEvent.createMany({
    data: [
      {
        tankId: fwTank.id,
        date: new Date("2026-08-15T10:00:00Z"),
        title: "Aquascape Setup & Dark Cycle",
        category: "Equipment",
        description: "Assembled Frodo stone hardscape, filled ADA Amazonia soil, filled with RO/DI and began dark cycle.",
        photoUrl: "/uploads/fts-month1.svg"
      },
      {
        tankId: fwTank.id,
        date: new Date("2026-09-01T12:00:00Z"),
        title: "Planting Day & High-Tech CO2 Start",
        category: "Livestock",
        description: "Planted Monte Carlo, Rotala H'ra stems, Bucephalandra Brownie Ghost, and Christmas moss. Started CO2 at 2 bps.",
        photoUrl: "/uploads/montipora-before.svg"
      },
      {
        tankId: fwTank.id,
        date: new Date("2026-09-12T14:00:00Z"),
        title: "Aquascape Stem Trimming & Bush Shaping",
        category: "Flora",
        description: "Trimmed Rotala rotundifolia tops and replanted into background to thicken stem density.",
        photoUrl: "/uploads/toadstool.svg"
      },
      {
        tankId: fwTank.id,
        date: new Date("2026-09-18T16:00:00Z"),
        title: "Monte Carlo Substrate Carpet Established",
        category: "Flora",
        description: "Confirmed rich green runners spreading across Amazonia soil with heavy active pearling.",
        photoUrl: "/uploads/frogspawn-before.svg"
      }
    ]
  });

  // 7. Maintenance Tasks
  const tasks = [
    {
      title: "Swap Filter Floss Pad",
      intervalDays: 3,
      lastCompleted: new Date("2026-09-24T12:00:00Z"),
      desc: "Replace mechanical filter floss pad in first weir chamber."
    },
    {
      title: "Empty & Wipe Skimmer Cup",
      intervalDays: 4,
      lastCompleted: new Date("2026-09-25T15:00:00Z"),
      desc: "Empty skimmate and brush neck collar clean."
    },
    {
      title: "10% Water Change (8 Liters)",
      intervalDays: 7,
      lastCompleted: new Date("2026-09-21T16:00:00Z"),
      desc: "Mix fresh 35 ppt saltwater (38g/L) and siphon rear chamber debris."
    },
    {
      title: "Test Full Parameter Suite",
      intervalDays: 7,
      lastCompleted: new Date("2026-09-26T10:00:00Z"),
      desc: "Salinity, pH, Alk, Ca, Mg, NO3, PO4."
    },
    {
      title: "Clean Wavemaker Propeller",
      intervalDays: 14,
      lastCompleted: new Date("2026-09-18T10:00:00Z"),
      desc: "Soak in citric acid to restore silent maximum turbulent flow."
    },
    {
      title: "Wipe UV Sterilizer Quartz Sleeve",
      intervalDays: 30,
      lastCompleted: new Date("2026-09-01T12:00:00Z"),
      desc: "Inspect and clean quartz sleeve to maintain sterilization clarity."
    }
  ];

  for (const t of tasks) {
    await prisma.maintenanceTask.create({
      data: {
        tankId: tank.id,
        ...t
      }
    });
  }

  // 8. Sticky Notes
  const notes = [
    {
      title: "🌊 35 ppt Salt Mix Recipe",
      tag: "recipe",
      tagColor: "#00d2be",
      dateLabel: "Pinned",
      isPinned: true,
      body: "Mix 38.0 grams per 1 Liter of RODI water (or 380g for 10L bucket) using Red Sea Blue Bucket for exact 35 ppt / 1.026 SG. Aerate and check temperature before introducing to display."
    },
    {
      title: "🧪 Live Phyto & Pod Dosing Routine",
      tag: "general",
      tagColor: "#ff6b35",
      dateLabel: "Weekly",
      isPinned: true,
      body: "Dose live Nannochloropsis phytoplankton 2-3x weekly.\nTurn OFF UV sterilizer and protein skimmer for 30 minutes when dosing live copepods."
    },
    {
      title: "⚠️ Safe Alk Swing Limit Warning",
      tag: "warning",
      tagColor: "#f39c12",
      dateLabel: "Rule",
      isPinned: true,
      body: "Never adjust Alkalinity by more than +1.0 dKH per 24 hours! Rapid swings cause rapid tissue necrosis (RTN) in SPS like Plating Montipora."
    },
    {
      title: "🧬 Micro-Trace Elements",
      tag: "trace",
      tagColor: "#9b59b6",
      dateLabel: "Bi-Weekly",
      isPinned: false,
      body: "1 drop of Lugol's Iodine solution and Manganese every two weeks to support coral pigmentation and softie expansion."
    }
  ];

  for (const n of notes) {
    await prisma.stickyNote.create({
      data: {
        tankId: tank.id,
        ...n
      }
    });
  }

  // 9. Tank Milestones
  await prisma.tankMilestone.createMany({
    data: [
      {
        tankId: tank.id,
        title: "Setup & First Stocking",
        caption: "11-day cycle complete with CaribSea live sand and nitrifying bacteria. First corals and frags added.",
        photoUrl: "/uploads/fts-month1.svg",
        date: new Date("2026-08-16")
      },
      {
        tankId: tank.id,
        title: "Mixed Reef Established",
        caption: "Wall Frogspawn, Plating Montipora, Toadstool, and Zoanthids all growing and showing rich color saturation.",
        photoUrl: "/uploads/fts-month3.svg",
        date: new Date("2026-09-25")
      }
    ]
  });

  console.log("Seeding finished successfully with multi-tank & stocking timeline!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
