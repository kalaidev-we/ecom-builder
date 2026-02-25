export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">GitCommerce Dashboard</h1>
        <nav className="flex gap-2 text-sm font-semibold">
          <a className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50" href="/build">
            Build
          </a>
          <a className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50" href="/analysis">
            Analysis
          </a>
          <a className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50" href="/deploy">
            Deploy
          </a>
          <a className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50" href="/dashboard">
            Overview
          </a>
          <a
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
            href="/dashboard/products"
          >
            Products
          </a>
          <a className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50" href="/dashboard/deploy">
            Deploy
          </a>
          <a
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
            href="/dashboard/templates"
          >
            Templates
          </a>
        </nav>
      </header>
      {children}
    </div>
  );
}
