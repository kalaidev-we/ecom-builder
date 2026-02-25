import { ProductManager } from "@/components/product-manager";

export default function DashboardProductsPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Products</h2>
      <ProductManager />
    </section>
  );
}
