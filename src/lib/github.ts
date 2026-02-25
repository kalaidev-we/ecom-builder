import { ensureEnv, env } from "@/lib/env";

interface GithubUserResponse {
  login: string;
}

const githubRequest = async <T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
};

export const exchangeCodeForToken = async (code: string) => {
  ensureEnv(["githubClientId", "githubClientSecret"]);
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange GitHub OAuth code");
  }

  const payload = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? "No GitHub token returned");
  }

  return payload.access_token;
};

export const getGithubUser = async (token: string): Promise<GithubUserResponse> => {
  return githubRequest<GithubUserResponse>("/user", token);
};

export const createRepo = async (token: string, repoName: string) => {
  try {
    return await githubRequest<{ name: string; html_url: string }>(
      "/user/repos",
      token,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: repoName,
          private: false,
          auto_init: true,
        }),
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown GitHub error";
    if (!message.includes("422")) {
      throw error;
    }
    const githubUser = await getGithubUser(token);
    return githubRequest<{ name: string; html_url: string }>(
      `/repos/${githubUser.login}/${repoName}`,
      token,
    );
  }
};

export const uploadFile = async (
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
) => {
  let sha: string | undefined;

  try {
    const currentFile = await githubRequest<{ sha: string }>(
      `/repos/${owner}/${repo}/contents/${path}`,
      token,
    );
    sha = currentFile.sha;
  } catch {
    sha = undefined;
  }

  return githubRequest(
    `/repos/${owner}/${repo}/contents/${path}`,
    token,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Deploy ${path}`,
        content: Buffer.from(content).toString("base64"),
        sha,
      }),
    },
  );
};

export const enablePages = async (token: string, owner: string, repo: string) => {
  try {
    return await githubRequest(`/repos/${owner}/${repo}/pages`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: {
          branch: "main",
          path: "/",
        },
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown GitHub error";
    if (message.includes("409") || message.includes("422")) {
      return null;
    }
    throw error;
  }
};
