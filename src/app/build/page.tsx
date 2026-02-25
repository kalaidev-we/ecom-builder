import { ProductManager } from "@/components/product-manager";
import { TemplateSelector } from "@/components/template-selector";

export default function BuildPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Step 1</p>
        <h1 className="text-3xl font-black text-slate-900">Build Your Store</h1>
        <p className="mt-2 text-slate-600">
          Add products and choose a template first. GitHub connection is only required at deploy.
        </p>
      </header>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Template</h2>
        <TemplateSelector />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Products</h2>
        <ProductManager />
      </section>
    </main>
  );
}
