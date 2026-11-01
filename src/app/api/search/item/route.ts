import { NextRequest, NextResponse } from "next/server";
import { resolveKnowledgeItem, resolveKnowledgeItemsBatch } from "@/lib/content-resolver";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = (searchParams.get("id") || "").trim().slice(0, 120);
  const category = (searchParams.get("category") || "").trim().slice(0, 60);

  if (!id) {
    return NextResponse.json(
      { error: "Query param 'id' is required" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const item = await resolveKnowledgeItem(id, category || undefined);
    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404, headers: { "Cache-Control": "public, s-maxage=60" } }
      );
    }

    return NextResponse.json(item, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800, max-age=3600",
        "CDN-Cache-Control": "public, s-maxage=604800",
      },
    });
  } catch (error) {
    console.error("[search/item] Error resolving item:", error);
    return NextResponse.json(
      { error: "Failed to resolve item content" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];

    if (ids.length === 0) {
      return NextResponse.json({ items: {} });
    }

    const clampedIds = ids.slice(0, 50).filter((id) => typeof id === "string" && id.length > 0);
    const items = await resolveKnowledgeItemsBatch(clampedIds);

    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
          "CDN-Cache-Control": "public, s-maxage=604800",
        },
      }
    );
  } catch (error) {
    console.error("[search/item] Batch resolve error:", error);
    return NextResponse.json(
      { error: "Failed to batch resolve items" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
