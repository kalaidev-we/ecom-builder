export const env = {
  githubClientId: process.env.GITHUB_CLIENT_ID ?? "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "https://example.supabase.co",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "example-anon-key",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

export const ensureEnv = (keys: Array<keyof typeof env>) => {
  for (const key of keys) {
    if (!env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
};
