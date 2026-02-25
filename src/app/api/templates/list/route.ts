import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getOrCreateStore } from "@/lib/store";
import { templates } from "@/lib/templates";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getOrCreateStore(user.id);
    return NextResponse.json({
      templates,
      selectedTemplateId: store.template_id || "minimal",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load templates";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
