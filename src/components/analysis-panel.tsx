"use client";

import { useEffect, useMemo, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ensureGuestSession } from "@/lib/client-session";
import { Product, Store } from "@/types";

interface ProductsResponse {
  store: Store | null;
  products: Product[];
}

export const AnalysisPanel = () => {
  const [data, setData] = useState<ProductsResponse>({ store: null, products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await ensureGuestSession();
        const response = await fetch("/api/products/list");
        if (!response.ok) {
          throw new Error("Unable to load analysis data");
        }
        const payload = (await response.json()) as ProductsResponse;
        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const analytics = useMemo(() => {
    const count = data.products.length;
    const revenueIfAllSold = data.products.reduce((sum, product) => sum + Number(product.price || 0), 0);
    const avgPrice = count ? revenueIfAllSold / count : 0;
    return { count, revenueIfAllSold, avgPrice };
  }, [data.products]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      {error ? <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Products</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.count}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Average Price</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">${analytics.avgPrice.toFixed(2)}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Catalog Value</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">${analytics.revenueIfAllSold.toFixed(2)}</p>
        </article>
      </div>
      <p className="text-sm text-slate-600">
        Next step: connect GitHub only when you are ready to deploy.
      </p>
    </div>
  );
};
