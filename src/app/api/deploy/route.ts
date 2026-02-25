import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { createRepo, enablePages, uploadFile } from "@/lib/github";
import { generateSite } from "@/lib/generator";
import { getOrCreateStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { env } from "@/lib/env";
import { isTemplateId } from "@/lib/templates";
import { DeployPayload } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as DeployPayload;
    const templateId = body.templateId?.trim();
    if (templateId && !isTemplateId(templateId)) {
      return NextResponse.json({ error: "Invalid templateId" }, { status: 400 });
    }

    const store = await getOrCreateStore(user.id, {
      storeName: body.storeName,
      repoName: body.repoName,
      templateId,
    });

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });

    if (productsError) {
      throw new Error(productsError.message);
    }

    const repo = await createRepo(user.github_token, store.repo_name);

    const generatedFiles = await generateSite({
      templateId: store.template_id || "minimal",
      store,
      products: products ?? [],
      apiBaseUrl: env.appUrl,
    });

    for (const [path, content] of Object.entries(generatedFiles)) {
      await uploadFile(user.github_token, user.github_username, repo.name, path, content);
    }

    await enablePages(user.github_token, user.github_username, repo.name);

    const deployedUrl = `https://${user.github_username}.github.io/${repo.name}`;

    const { error: updateError } = await supabase
      .from("stores")
      .update({
        deployed_url: deployedUrl,
        repo_name: repo.name,
        name: store.name,
        template_id: store.template_id || "minimal",
      })
      .eq("id", store.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({ deployedUrl, repo: repo.name });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deploy failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
