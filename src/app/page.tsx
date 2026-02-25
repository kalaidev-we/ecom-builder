export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12">
      <section className="w-full rounded-3xl border border-brand-100 bg-white/90 p-8 shadow-xl shadow-sky-100 backdrop-blur md:p-12">
        <p className="mb-4 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-700">
          GitCommerce SaaS
        </p>
        <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
          Build first. Analyze second. Connect GitHub last.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-slate-600 md:text-lg">
          You can now create products and review analysis before OAuth. GitHub connection happens
          only when you deploy.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/build"
            className="inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Start Build
          </a>
          <a
            href="/analysis"
            className="inline-flex items-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Open Analysis
          </a>
          <a
            href="/deploy"
            className="inline-flex items-center rounded-xl border border-brand-300 bg-brand-50 px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            Final Step: Deploy
          </a>
        </div>
      </section>
    </main>
  );
}
