import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getCurrentUserById } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { DeployStatusBadge } from "@/components/deploy-status-badge";
import { Store } from "@/types";

const getStoreForUser = async (userId: string): Promise<Store | null> => {
  const { data } = await supabase.from("stores").select("*").eq("user_id", userId).maybeSingle();
  return (data as Store | null) ?? null;
};

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  const user = await getCurrentUserById(userId);

  if (!user) {
    redirect("/build");
  }

  const store = await getStoreForUser(user.id);

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Account</h2>
        <p className="mt-3 text-sm text-slate-600">
          Connected GitHub user: <span className="font-semibold text-slate-900">@{user.github_username}</span>
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Store Status</h2>
          <DeployStatusBadge deployedUrl={store?.deployed_url ?? null} />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          {store
            ? `Store: ${store.name}`
            : "No store has been created yet. Add products or deploy to initialize it."}
        </p>
        {store ? (
          <p className="mt-2 text-sm text-slate-600">
            Template: <span className="font-semibold text-slate-900">{store.template_id || "minimal"}</span>
          </p>
        ) : null}
        {store?.deployed_url ? (
          <a
            href={store.deployed_url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline"
          >
            Open live store
          </a>
        ) : null}
      </article>
    </section>
  );
}
