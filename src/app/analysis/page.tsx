import { AnalysisPanel } from "@/components/analysis-panel";

export default function AnalysisPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Step 2</p>
        <h1 className="text-3xl font-black text-slate-900">Analysis</h1>
        <p className="mt-2 text-slate-600">
          Review your product catalog metrics before deployment.
        </p>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <AnalysisPanel />
      </section>
    </main>
  );
}
