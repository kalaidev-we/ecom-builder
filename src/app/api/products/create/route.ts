import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getOrCreateStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface Body {
  name?: string;
  price?: number;
  image_url?: string | null;
  description?: string | null;
  storeName?: string;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Body;
    if (!body.name || typeof body.price !== "number" || body.price <= 0) {
      return NextResponse.json({ error: "Invalid product payload" }, { status: 400 });
    }

    const store = await getOrCreateStore(user.id, { storeName: body.storeName });
    const { data, error } = await supabase
      .from("products")
      .insert({
        store_id: store.id,
        name: body.name.trim(),
        price: body.price,
        image_url: body.image_url ?? null,
        description: body.description ?? null,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create product");
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


