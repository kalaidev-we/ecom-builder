import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getOrCreateStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface Body {
  productId?: string;
  name?: string;
  price?: number;
  image_url?: string | null;
  description?: string | null;
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Body;
    if (!body.productId || !body.name || typeof body.price !== "number" || body.price <= 0) {
      return NextResponse.json({ error: "Invalid product payload" }, { status: 400 });
    }

    const store = await getOrCreateStore(user.id);
    const { data, error } = await supabase
      .from("products")
      .update({
        name: body.name.trim(),
        price: body.price,
        image_url: body.image_url ?? null,
        description: body.description ?? null,
      })
      .eq("id", body.productId)
      .eq("store_id", store.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to update product");
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


