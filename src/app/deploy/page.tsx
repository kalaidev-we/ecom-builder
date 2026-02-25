import { DeployPanel } from "@/components/deploy-panel";

export default function DeployPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-8">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Step 3</p>
        <h1 className="text-3xl font-black text-slate-900">Deploy</h1>
        <p className="mt-2 text-slate-600">
          Final step: connect GitHub only when you are ready to publish.
        </p>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <DeployPanel />
      </section>
    </main>
  );
}
