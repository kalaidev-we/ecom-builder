import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { generateSite } from "@/lib/generator";
import { templates } from "@/lib/templates";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

interface PreviewPageProps {
  params: {
    templateId: string;
  };
}

const buildPreviewHtml = (files: Record<string, string>) => {
  let html = files["index.html"];
  html = html.replace(
    '<link rel="stylesheet" href="./style.css" />',
    `<style>${files["style.css"]}</style>`,
  );
  html = html.replace(
    '<script src="./script.js"></script>',
    `<script>${files["script.js"]}</script>`,
  );
  return html;
};

const demoProducts: Product[] = [
  {
    id: "demo-1",
    store_id: "demo-store",
    name: "Demo Product One",
    price: 49,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    description: "Premium demo product for preview mode.",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    store_id: "demo-store",
    name: "Demo Product Two",
    price: 79,
    image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    description: "Another product to showcase template cards.",
    created_at: new Date().toISOString(),
  },
];

export default async function TemplatePreviewPage({ params }: PreviewPageProps) {
  const template = templates.find((entry) => entry.id === params.templateId);
  if (!template) {
    notFound();
  }

  const files = await generateSite({
    templateId: template.id,
    store: {
      id: "demo-store",
      name: "Preview Storefront",
    },
    products: demoProducts,
    apiBaseUrl: env.appUrl,
  });

  const previewHtml = buildPreviewHtml(files);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">{template.name} Template Preview</h1>
        <p className="mt-1 text-sm text-slate-600">{template.description}</p>
      </header>
      <iframe
        title={`${template.name} preview`}
        srcDoc={previewHtml}
        className="h-[780px] w-full rounded-xl border border-slate-200 bg-white"
      />
    </main>
  );
}
