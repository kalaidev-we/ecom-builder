"use client";

import { useEffect, useState } from "react";
import { DeployStatusBadge } from "@/components/deploy-status-badge";
import { ensureGuestSession } from "@/lib/client-session";

interface DeployResponse {
  deployedUrl: string;
}

export const DeployPanel = () => {
  const [storeName, setStoreName] = useState("My GitCommerce Store");
  const [repoName, setRepoName] = useState("gitcommerce-store");
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>("minimal");
  const [needsGithubOAuth, setNeedsGithubOAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        await ensureGuestSession();
        const response = await fetch("/api/templates/list");
        if (!response.ok) return;
        const payload = (await response.json()) as { selectedTemplateId?: string };
        if (payload.selectedTemplateId) {
          setCurrentTemplateId(payload.selectedTemplateId);
        }
      } catch {
        // Keep default template indicator when request fails.
      }
    };
    void loadTemplate();
  }, []);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setNeedsGithubOAuth(false);
    setError(null);
    try {
      await ensureGuestSession();
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, repoName }),
      });

      const payload = (await response.json()) as DeployResponse & { error?: string };
      if (!response.ok) {
        if (response.status === 401) {
          setNeedsGithubOAuth(true);
        }
        throw new Error(payload.error ?? "Deploy failed");
      }

      setDeployedUrl(payload.deployedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected deploy error");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <DeployStatusBadge deployedUrl={deployedUrl} isDeploying={isDeploying} />
        {deployedUrl ? (
          <a href={deployedUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-700 hover:underline">
            Open deployed store
          </a>
        ) : null}
      </div>

      {error ? <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {needsGithubOAuth ? (
        <a
          href="/api/auth/github/login"
          className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Connect GitHub (Final Step)
        </a>
      ) : null}
      <p className="text-sm text-slate-600">
        Selected template: <span className="font-semibold text-slate-900">{currentTemplateId}</span>
      </p>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Store Name</span>
        <input
          value={storeName}
          onChange={(event) => setStoreName(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Repository Name</span>
        <input
          value={repoName}
          onChange={(event) => setRepoName(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <button
        type="button"
        disabled={isDeploying}
        onClick={() => void handleDeploy()}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeploying ? "Deploying..." : "Deploy to GitHub Pages"}
      </button>
    </div>
  );
};
