import { supabase } from "@/lib/supabase";
import { Store } from "@/types";

const sanitizeRepoName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const getOrCreateStore = async (
  userId: string,
  input?: { storeName?: string; repoName?: string; templateId?: string },
): Promise<Store> => {
  const { data: existingStore } = await supabase
    .from("stores")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingStore) {
    const nextName = input?.storeName?.trim();
    const nextRepo = input?.repoName ? sanitizeRepoName(input.repoName) : undefined;
    const nextTemplate = input?.templateId?.trim();

    if (nextName || nextRepo || nextTemplate) {
      const { data, error } = await supabase
        .from("stores")
        .update({
          ...(nextName ? { name: nextName } : {}),
          ...(nextRepo ? { repo_name: nextRepo } : {}),
          ...(nextTemplate ? { template_id: nextTemplate } : {}),
        })
        .eq("id", existingStore.id)
        .select("*")
        .single();

      if (error || !data) {
        throw new Error("Unable to update store");
      }
      return data as Store;
    }

    return existingStore as Store;
  }

  const { data, error } = await supabase
    .from("stores")
    .insert({
      user_id: userId,
      name: input?.storeName?.trim() || "My GitCommerce Store",
      repo_name: sanitizeRepoName(input?.repoName || `gitcommerce-${Date.now()}`),
      template_id: input?.templateId?.trim() || "minimal",
      deployed_url: null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to create store");
  }

  return data as Store;
};
