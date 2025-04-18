import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { ITEM_PER_PAGE } from "@/utils/constants";
import { PendingItem } from "@prisma/client";
import { CreateItemDto } from "@/utils/dtos";
import { createItemSchema } from "@/utils/validationSchemas";

/**
 *  @method  GET
 *  @route   ~/api/admin/pendingItems?pageNumber=1
 *  @desc    Get all my pending items
 *  @access  private (only user himself can get his items | SUPER_ADMIN and OWNER can return any users data)
 */
export async function GET(request: NextRequest) {
  try {
    const pageNumber = parseInt(
      request.nextUrl.searchParams.get("pageNumber") || "1"
    );
    if (isNaN(pageNumber) || pageNumber < 1) {
      return NextResponse.json(
        { message: "Invalid page number" },
        { status: 400 }
      );
    }

    const userFromToken = verifyToken(request);
    if (!userFromToken) {
      return NextResponse.json(
        { message: "Access denied, you are not authorized" },
        { status: 403 }
      );
    }
    if (!["ADMIN", "SUPER_ADMIN", "OWNER"].includes(userFromToken.role)) {
      return NextResponse.json(
        { message: "Access denied, only admins allowed" },
        { status: 403 }
      );
    }

    const userWithItems = await prisma.user.findUnique({
      where: { id: userFromToken.id },
      include: {
        pendingItems: {
          skip: ITEM_PER_PAGE * (pageNumber - 1),
          take: ITEM_PER_PAGE,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            image: true,
            developer: true,
          },
        },
      },
    });
    if (!userWithItems) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (
      !userWithItems.pendingItems ||
      userWithItems.pendingItems.length === 0
    ) {
      return NextResponse.json({ message: "No items found" }, { status: 404 });
    }

    return NextResponse.json(userWithItems.pendingItems, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 *  @method  POST
 *  @route   ~/api/admin/pendingItems?pageNumber=1
 *  @desc    Create New item
 *  @access  private (only user himself can create his items | OWNER can create any users data)
 */
export async function POST(request: NextRequest) {
  try {
    const userFromToken = verifyToken(request);
    if (!userFromToken) {
      return NextResponse.json(
        { message: "Access denied, you are not authorized" },
        { status: 403 }
      );
    }
    if (!["ADMIN", "SUPER_ADMIN", "OWNER"].includes(userFromToken.role)) {
      return NextResponse.json(
        { message: "Access denied, only admins allowed" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as CreateItemDto;
    const validation = createItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          message:
            validation.error.errors[0].path.join(".") +
            " " +
            validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const newPendingItem: PendingItem = await prisma.pendingItem.create({
      data: {
        status: "CREATE",
        title: body.title,
        description: body.description,
        image: body.image,
        developer: body.developer,
        version: body.version,
        androidVer: body.androidVer,

        itemType: body.itemType,
        categories: body.categories,

        OBB: body.OBB,
        Script: body.Script,

        linkAPK: body.linkAPK,
        linkOBB: body.OBB ? body.linkOBB : null,
        linkVideo: body.linkVideo,
        linkScript: body.Script ? body.linkScript : null,

        sizeFileAPK: body.sizeFileAPK,
        sizeFileOBB: body.OBB ? body.sizeFileOBB : null,
        sizeFileScript: body.Script ? body.sizeFileScript : null,

        appScreens: body.appScreens,
        keywords: body.keywords,

        isMod: body.isMod,
        typeMod: body.isMod ? body.typeMod : null,

        ratedFor: body.ratedFor,
        installs: body.installs,

        createdById: userFromToken.id,
      },
    });

    return NextResponse.json(newPendingItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
