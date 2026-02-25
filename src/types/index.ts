export type UUID = string;

export interface User {
  id: UUID;
  github_username: string;
  github_token: string;
  created_at: string;
}

export interface Store {
  id: UUID;
  user_id: UUID;
  name: string;
  repo_name: string;
  template_id: string;
  deployed_url: string | null;
  created_at: string;
}

export interface Product {
  id: UUID;
  store_id: UUID;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  created_at: string;
}

export interface Order {
  id: UUID;
  store_id: UUID;
  product_id: UUID;
  customer_email: string;
  created_at: string;
}

export interface DeployPayload {
  storeName?: string;
  repoName?: string;
  templateId?: string;
}
