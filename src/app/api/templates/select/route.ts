import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getOrCreateStore } from "@/lib/store";
import { isTemplateId } from "@/lib/templates";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface SelectTemplateBody {
  templateId?: string;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as SelectTemplateBody;
    const templateId = body.templateId?.trim();

    if (!templateId || !isTemplateId(templateId)) {
      return NextResponse.json({ error: "Invalid templateId" }, { status: 400 });
    }

    const store = await getOrCreateStore(user.id);
    const { error } = await supabase
      .from("stores")
      .update({ template_id: templateId })
      .eq("id", store.id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ selectedTemplateId: templateId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to select template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
