-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Table: profiles (Host profiles)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table profiles enable row level security;

-- Table: events
create table events (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id) on delete cascade not null,
  public_slug text unique not null,
  name text not null,
  event_type text not null,
  event_date date not null,
  location text,
  cover_image_path text,
  plan text default 'Free',
  status text default 'active',
  storage_limit_bytes bigint default 2147483648, -- 2GB
  guest_limit int default 30,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table events enable row level security;

-- Table: event_settings
create table event_settings (
  event_id uuid primary key references events(id) on delete cascade,
  allow_anonymous boolean default true,
  allow_video boolean default true,
  moderation_required boolean default false,
  allow_guest_gallery boolean default true,
  allow_downloads boolean default true,
  max_video_size bigint default 52428800, -- 50MB
  max_video_duration int default 60, -- 60s
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table event_settings enable row level security;

-- Table: guest_sessions
create table guest_sessions (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  display_name text,
  device_id text,
  session_token_hash text not null,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  expires_at timestamptz not null
);
alter table guest_sessions enable row level security;

-- Table: media
create table media (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  guest_session_id uuid references guest_sessions(id) on delete set null,
  storage_path text not null,
  thumbnail_path text,
  mime_type text not null,
  size_bytes bigint not null,
  width int,
  height int,
  duration_ms int,
  content_hash text,
  status text default 'pending', -- pending, approved, deleted
  uploaded_at timestamptz,
  created_at timestamptz default now(),
  deleted_at timestamptz
);
alter table media enable row level security;
create index media_event_status_created_idx on media (event_id, status, created_at desc);
create unique index media_event_content_hash_idx on media (event_id, content_hash) where content_hash is not null;

-- Table: media_processing
create table media_processing (
  id uuid primary key default uuid_generate_v4(),
  media_id uuid references media(id) on delete cascade not null,
  job_type text not null,
  status text default 'queued',
  attempts int default 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);
alter table media_processing enable row level security;

-- Table: orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  plan text not null,
  amount decimal(10,2) not null,
  currency text default 'NPR',
  provider text,
  provider_reference text,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table orders enable row level security;

-- Table: downloads
create table downloads (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  media_id uuid references media(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  status text default 'pending',
  created_at timestamptz default now(),
  completed_at timestamptz
);
alter table downloads enable row level security;

-- Table: moderation_reports
create table moderation_reports (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  media_id uuid references media(id) on delete cascade not null,
  reporter_type text not null,
  reason text,
  status text default 'pending',
  created_at timestamptz default now()
);
alter table moderation_reports enable row level security;

-- Table: usage_meter (Materialized view or simple tracking table)
create table usage_meter (
  event_id uuid primary key references events(id) on delete cascade,
  storage_bytes bigint default 0,
  photo_count int default 0,
  video_count int default 0,
  guest_count int default 0,
  contributor_count int default 0,
  updated_at timestamptz default now()
);
alter table usage_meter enable row level security;
