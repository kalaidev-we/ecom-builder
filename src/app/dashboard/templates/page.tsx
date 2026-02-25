import { TemplateSelector } from "@/components/template-selector";

export default function DashboardTemplatesPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Store Templates</h2>
      <TemplateSelector />
    </section>
  );
}
