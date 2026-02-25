import { DeployPanel } from "@/components/deploy-panel";

export default function DashboardDeployPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Deploy Store</h2>
      <DeployPanel />
    </section>
  );
}
