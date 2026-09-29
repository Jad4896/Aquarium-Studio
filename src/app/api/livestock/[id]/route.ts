import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. Add a new media item (general specimen photo/video or growth milestone)
    if (body.action === "add_media") {
      const isMilestone = Boolean(body.isMilestone || body.isBefore || body.isAfter);
      const mediaType = body.mediaType || "image";

      const media = await prisma.livestockMedia.create({
        data: {
          livestockId: id,
          url: body.url,
          mediaType,
          caption: body.caption || (isMilestone ? "Growth Milestone" : "Specimen Media"),
          isBefore: body.isBefore || false,
          isAfter: body.isAfter || false,
          isMilestone,
          date: body.date ? new Date(body.date) : new Date(),
        },
      });

      const currentLivestock = await prisma.livestock.findUnique({
        where: { id },
      });

      const updatePayload: Record<string, string> = {};
      if (body.isBefore) updatePayload.beforePhotoUrl = body.url;
      if (body.isAfter) updatePayload.afterPhotoUrl = body.url;

      if (body.setAsPrimary) {
        if (mediaType === "video") {
          updatePayload.primaryVideoUrl = body.url;
        } else {
          updatePayload.primaryPhotoUrl = body.url;
        }
      } else if (!isMilestone) {
        if (mediaType === "video" && !currentLivestock?.primaryVideoUrl) {
          updatePayload.primaryVideoUrl = body.url;
        } else if (mediaType === "image" && !currentLivestock?.primaryPhotoUrl) {
          updatePayload.primaryPhotoUrl = body.url;
        }
      }

      if (Object.keys(updatePayload).length > 0) {
        await prisma.livestock.update({
          where: { id },
          data: updatePayload,
        });
      }

      return NextResponse.json({ success: true, media });
    }

    // 2. Delete a media item
    if (body.action === "delete_media") {
      const mediaId = body.mediaId;
      if (!mediaId) {
        return NextResponse.json({ error: "mediaId is required" }, { status: 400 });
      }

      const mediaItem = await prisma.livestockMedia.findUnique({
        where: { id: mediaId },
      });

      if (mediaItem) {
        await prisma.livestockMedia.delete({
          where: { id: mediaId },
        });

        // Check if pointers need fallback or clearing
        const livestock = await prisma.livestock.findUnique({
          where: { id },
          include: { media: true },
        });

        if (livestock) {
          const updatePayload: Record<string, string | null> = {};

          if (livestock.primaryPhotoUrl === mediaItem.url) {
            const nextPhoto = livestock.media.find(
              (m) => m.id !== mediaId && m.mediaType === "image"
            );
            updatePayload.primaryPhotoUrl = nextPhoto ? nextPhoto.url : null;
          }

          if (livestock.primaryVideoUrl === mediaItem.url) {
            const nextVideo = livestock.media.find(
              (m) => m.id !== mediaId && m.mediaType === "video"
            );
            updatePayload.primaryVideoUrl = nextVideo ? nextVideo.url : null;
          }

          if (livestock.beforePhotoUrl === mediaItem.url) {
            const nextBefore = livestock.media.find(
              (m) => m.id !== mediaId && m.isBefore
            );
            updatePayload.beforePhotoUrl = nextBefore ? nextBefore.url : null;
          }

          if (livestock.afterPhotoUrl === mediaItem.url) {
            const nextAfter = livestock.media.find(
              (m) => m.id !== mediaId && m.isAfter
            );
            updatePayload.afterPhotoUrl = nextAfter ? nextAfter.url : null;
          }

          if (Object.keys(updatePayload).length > 0) {
            await prisma.livestock.update({
              where: { id },
              data: updatePayload,
            });
          }
        }
      }

      return NextResponse.json({ success: true });
    }

    // 3. Set Primary Media (Cover Photo or Cover Video)
    if (body.action === "set_primary_media") {
      const { url, mediaType } = body;
      const updatePayload: Record<string, string | null> = {};
      if (mediaType === "video") {
        updatePayload.primaryVideoUrl = url;
      } else {
        updatePayload.primaryPhotoUrl = url;
      }
      await prisma.livestock.update({
        where: { id },
        data: updatePayload,
      });
      return NextResponse.json({ success: true });
    }

    // 4. Set Growth Tag (Before / After flag)
    if (body.action === "set_growth_tag") {
      const { mediaId, isBefore, isAfter } = body;
      const targetMedia = await prisma.livestockMedia.findUnique({
        where: { id: mediaId },
      });
      if (!targetMedia) {
        return NextResponse.json({ error: "Media not found" }, { status: 404 });
      }

      if (isBefore) {
        await prisma.livestockMedia.updateMany({
          where: { livestockId: id, isBefore: true },
          data: { isBefore: false },
        });
        await prisma.livestockMedia.update({
          where: { id: mediaId },
          data: { isBefore: true, isMilestone: true },
        });
        await prisma.livestock.update({
          where: { id },
          data: { beforePhotoUrl: targetMedia.url },
        });
      } else if (isBefore === false) {
        await prisma.livestockMedia.update({
          where: { id: mediaId },
          data: { isBefore: false },
        });
        const current = await prisma.livestock.findUnique({ where: { id } });
        if (current?.beforePhotoUrl === targetMedia.url) {
          await prisma.livestock.update({
            where: { id },
            data: { beforePhotoUrl: null },
          });
        }
      }

      if (isAfter) {
        await prisma.livestockMedia.updateMany({
          where: { livestockId: id, isAfter: true },
          data: { isAfter: false },
        });
        await prisma.livestockMedia.update({
          where: { id: mediaId },
          data: { isAfter: true, isMilestone: true },
        });
        await prisma.livestock.update({
          where: { id },
          data: { afterPhotoUrl: targetMedia.url },
        });
      } else if (isAfter === false) {
        await prisma.livestockMedia.update({
          where: { id: mediaId },
          data: { isAfter: false },
        });
        const current = await prisma.livestock.findUnique({ where: { id } });
        if (current?.afterPhotoUrl === targetMedia.url) {
          await prisma.livestock.update({
            where: { id },
            data: { afterPhotoUrl: null },
          });
        }
      }

      return NextResponse.json({ success: true });
    }

    // 5. Regular Profile Data update
    const updated = await prisma.livestock.update({
      where: { id },
      data: {
        name: body.name,
        species: body.species,
        category: body.category,
        growthType: body.growthType,
        zone: body.zone,
        lighting: body.lighting,
        aggressiveness: body.aggressiveness,
        temperament: body.temperament,
        diet: body.diet,
        interestingFact: body.interestingFact,
        notes: body.notes,
        primaryPhotoUrl: body.primaryPhotoUrl,
        primaryVideoUrl: body.primaryVideoUrl,
        beforePhotoUrl: body.beforePhotoUrl,
        afterPhotoUrl: body.afterPhotoUrl,
      },
    });

    return NextResponse.json({ success: true, livestock: updated });
  } catch (error) {
    console.error("Failed to update livestock:", error);
    return NextResponse.json({ error: "Failed to update livestock" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.livestock.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete livestock:", error);
    return NextResponse.json({ error: "Failed to delete livestock" }, { status: 500 });
  }
}
