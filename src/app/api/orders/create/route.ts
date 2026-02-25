import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface Body {
  storeId?: string;
  productId?: string;
  customerEmail?: string;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    if (!body.storeId || !body.productId || !body.customerEmail) {
      return NextResponse.json({ error: "Missing order fields" }, { status: 400, headers: corsHeaders });
    }

    const email = body.customerEmail.trim().toLowerCase();
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400, headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        store_id: body.storeId,
        product_id: body.productId,
        customer_email: email,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Order creation failed");
    }

    return NextResponse.json({ orderId: data.id }, { status: 201, headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}
