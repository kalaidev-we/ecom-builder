"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { TemplateDefinition } from "@/lib/templates";

interface TemplateListResponse {
  templates: TemplateDefinition[];
  selectedTemplateId: string;
}

export const TemplateSelector = () => {
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("minimal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/templates/list");
      if (!response.ok) {
        throw new Error("Failed to load templates");
      }
      const payload = (await response.json()) as TemplateListResponse;
      setTemplates(payload.templates);
      setSelectedTemplateId(payload.selectedTemplateId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
  }, []);

  const selectTemplate = async (templateId: string) => {
    setSaving(templateId);
    setError(null);
    try {
      const response = await fetch("/api/templates/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to save template");
      }

      setSelectedTemplateId(templateId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      {error ? <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((template) => {
          const isSelected = selectedTemplateId === template.id;
          const isSaving = saving === template.id;
          return (
            <article key={template.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-base font-semibold text-slate-900">{template.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{template.description}</p>
              <div className="mt-4 flex gap-2">
                <a
                  href={`/preview/${template.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Preview
                </a>
                <button
                  type="button"
                  disabled={isSaving || isSelected}
                  onClick={() => void selectTemplate(template.id)}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSelected ? "Selected" : isSaving ? "Saving..." : "Select"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
