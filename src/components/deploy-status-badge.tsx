interface DeployStatusBadgeProps {
  deployedUrl: string | null;
  isDeploying?: boolean;
}

export const DeployStatusBadge = ({ deployedUrl, isDeploying }: DeployStatusBadgeProps) => {
  if (isDeploying) {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        Deploying
      </span>
    );
  }

  if (deployedUrl) {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
        Live
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
      Not Deployed
    </span>
  );
};
