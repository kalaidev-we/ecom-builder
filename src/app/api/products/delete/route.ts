import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getOrCreateStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface Body {
  productId?: string;
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Body;
    if (!body.productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const store = await getOrCreateStore(user.id);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", body.productId)
      .eq("store_id", store.id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


