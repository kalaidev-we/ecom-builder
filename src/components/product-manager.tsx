"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ensureGuestSession } from "@/lib/client-session";
import { Product, Store } from "@/types";

interface ProductsResponse {
  store: Store | null;
  products: Product[];
}

const emptyForm = {
  name: "",
  price: "",
  image_url: "",
  description: "",
};

export const ProductManager = () => {
  const [data, setData] = useState<ProductsResponse>({ store: null, products: [] });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      await ensureGuestSession();
      const response = await fetch("/api/products/list");
      if (!response.ok) throw new Error("Failed to load products");
      const payload = (await response.json()) as ProductsResponse;
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const canSubmit = useMemo(() => form.name.trim() !== "" && Number(form.price) > 0, [form]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      image_url: form.image_url.trim() || null,
      description: form.description.trim() || null,
      storeName: "My GitCommerce Store",
    };

    try {
      await ensureGuestSession();
      const endpoint = editingId ? "/api/products/update" : "/api/products/create";
      const response = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...payload, productId: editingId } : payload),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Unable to save product");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price.toString(),
      image_url: product.image_url ?? "",
      description: product.description ?? "",
    });
  };

  const handleDelete = async (productId: string) => {
    setError(null);
    try {
      await ensureGuestSession();
      const response = await fetch("/api/products/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!response.ok) throw new Error("Unable to delete product");
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {error ? <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <form className="grid gap-3 rounded-xl border border-slate-200 p-4" onSubmit={handleSubmit}>
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Product name"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <input
          value={form.price}
          onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
          placeholder="Price"
          type="number"
          min="0.01"
          step="0.01"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <input
          value={form.image_url}
          onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))}
          placeholder="Image URL"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <textarea
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          placeholder="Description"
          className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : editingId ? "Update product" : "Add product"}
          </button>
          {editingId ? (
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="space-y-2">
        {data.products.length === 0 ? (
          <p className="text-sm text-slate-600">No products yet.</p>
        ) : (
          data.products.map((product) => (
            <article key={product.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-sm text-slate-600">${product.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700"
                    onClick={() => void handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
