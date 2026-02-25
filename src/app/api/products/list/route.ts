import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getOrCreateStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getOrCreateStore(user.id);
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ store, products: products ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


