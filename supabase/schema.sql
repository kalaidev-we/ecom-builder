create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  github_username text not null unique,
  github_token text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  repo_name text not null,
  template_id text not null default 'minimal',
  deployed_url text,
  created_at timestamp with time zone not null default now()
);

alter table stores
  add column if not exists template_id text not null default 'minimal';

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  name text not null,
  price numeric not null check (price > 0),
  image_url text,
  description text,
  created_at timestamp with time zone not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  customer_email text not null,
  created_at timestamp with time zone not null default now()
);
