-- ==========================================
-- EKTHAU DATABASE MIGRATION SCRIPT
-- Project: Ekthau Photo & Video Sharing Platform
-- ==========================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES

-- Table: profiles (Host profiles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- Table: events
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
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
alter table public.events enable row level security;

-- Table: event_settings
create table if not exists public.event_settings (
  event_id uuid primary key references public.events(id) on delete cascade,
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
alter table public.event_settings enable row level security;

-- Table: guest_sessions
create table if not exists public.guest_sessions (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  display_name text,
  device_id text,
  session_token_hash text not null,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  expires_at timestamptz not null
);
alter table public.guest_sessions enable row level security;

-- Table: media
create table if not exists public.media (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  guest_session_id uuid references public.guest_sessions(id) on delete set null,
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
alter table public.media enable row level security;
create index if not exists media_event_status_created_idx on public.media (event_id, status, created_at desc);
create unique index if not exists media_event_content_hash_idx on public.media (event_id, content_hash) where content_hash is not null;

-- Table: media_processing
create table if not exists public.media_processing (
  id uuid primary key default uuid_generate_v4(),
  media_id uuid references public.media(id) on delete cascade not null,
  job_type text not null,
  status text default 'queued',
  attempts int default 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);
alter table public.media_processing enable row level security;

-- Table: orders
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan text not null,
  amount decimal(10,2) not null,
  currency text default 'NPR',
  provider text,
  provider_reference text,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.orders enable row level security;

-- Table: downloads
create table if not exists public.downloads (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  media_id uuid references public.media(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  status text default 'pending',
  created_at timestamptz default now(),
  completed_at timestamptz
);
alter table public.downloads enable row level security;

-- Table: moderation_reports
create table if not exists public.moderation_reports (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  media_id uuid references public.media(id) on delete cascade not null,
  reporter_type text not null,
  reason text,
  status text default 'pending',
  created_at timestamptz default now()
);
alter table public.moderation_reports enable row level security;

-- Table: usage_meter
create table if not exists public.usage_meter (
  event_id uuid primary key references public.events(id) on delete cascade,
  storage_bytes bigint default 0,
  photo_count int default 0,
  video_count int default 0,
  guest_count int default 0,
  contributor_count int default 0,
  updated_at timestamptz default now()
);
alter table public.usage_meter enable row level security;


-- 3. TRIGGERS

-- Auto-create profile on auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do update set
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- Profiles RLS
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- Events RLS
drop policy if exists "Hosts can view their own events" on public.events;
create policy "Hosts can view their own events" on public.events for select using (auth.uid() = owner_id);

drop policy if exists "Hosts can insert their own events" on public.events;
create policy "Hosts can insert their own events" on public.events for insert with check (auth.uid() = owner_id);

drop policy if exists "Hosts can update their own events" on public.events;
create policy "Hosts can update their own events" on public.events for update using (auth.uid() = owner_id);

drop policy if exists "Hosts can delete their own events" on public.events;
create policy "Hosts can delete their own events" on public.events for delete using (auth.uid() = owner_id);

-- Event Settings RLS
drop policy if exists "Hosts can view their event settings" on public.event_settings;
create policy "Hosts can view their event settings" on public.event_settings for select using (
  exists (select 1 from public.events where events.id = event_settings.event_id and events.owner_id = auth.uid())
);

drop policy if exists "Hosts can insert their event settings" on public.event_settings;
create policy "Hosts can insert their event settings" on public.event_settings for insert with check (
  exists (select 1 from public.events where events.id = event_settings.event_id and events.owner_id = auth.uid())
);

drop policy if exists "Hosts can update their event settings" on public.event_settings;
create policy "Hosts can update their event settings" on public.event_settings for update using (
  exists (select 1 from public.events where events.id = event_settings.event_id and events.owner_id = auth.uid())
);

-- Guest Sessions RLS
drop policy if exists "Hosts can view guest sessions for their events" on public.guest_sessions;
create policy "Hosts can view guest sessions for their events" on public.guest_sessions for select using (
  exists (select 1 from public.events where events.id = guest_sessions.event_id and events.owner_id = auth.uid())
);

-- Media RLS
drop policy if exists "Hosts can view media for their events" on public.media;
create policy "Hosts can view media for their events" on public.media for select using (
  exists (select 1 from public.events where events.id = media.event_id and events.owner_id = auth.uid())
);

drop policy if exists "Hosts can update media for their events" on public.media;
create policy "Hosts can update media for their events" on public.media for update using (
  exists (select 1 from public.events where events.id = media.event_id and events.owner_id = auth.uid())
);

drop policy if exists "Hosts can delete media for their events" on public.media;
create policy "Hosts can delete media for their events" on public.media for delete using (
  exists (select 1 from public.events where events.id = media.event_id and events.owner_id = auth.uid())
);

-- Usage Meter RLS
drop policy if exists "Hosts can view usage for their events" on public.usage_meter;
create policy "Hosts can view usage for their events" on public.usage_meter for select using (
  exists (select 1 from public.events where events.id = usage_meter.event_id and events.owner_id = auth.uid())
);

-- Media Processing RLS
drop policy if exists "Hosts can view media processing status for their events" on public.media_processing;
create policy "Hosts can view media processing status for their events" on public.media_processing for select using (
  exists (
    select 1 from public.media 
    join public.events on events.id = media.event_id 
    where media.id = media_processing.media_id and events.owner_id = auth.uid()
  )
);

-- Orders RLS
drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "Users can create their own orders" on public.orders;
create policy "Users can create their own orders" on public.orders for insert with check (auth.uid() = user_id);

-- Downloads RLS
drop policy if exists "Users can view their downloads" on public.downloads;
create policy "Users can view their downloads" on public.downloads for select using (auth.uid() = user_id);

drop policy if exists "Users can insert downloads" on public.downloads;
create policy "Users can insert downloads" on public.downloads for insert with check (auth.uid() = user_id);

-- Moderation Reports RLS
drop policy if exists "Hosts can view reports for their events" on public.moderation_reports;
create policy "Hosts can view reports for their events" on public.moderation_reports for select using (
  exists (select 1 from public.events where events.id = moderation_reports.event_id and events.owner_id = auth.uid())
);

drop policy if exists "Anyone can submit a moderation report" on public.moderation_reports;
create policy "Anyone can submit a moderation report" on public.moderation_reports for insert with check (
  exists (select 1 from public.events where events.id = moderation_reports.event_id and events.status = 'active')
);


-- 5. RPC FUNCTIONS (SECURITY DEFINER)

-- RPC to get public event info for joining
create or replace function public.get_public_event_info(p_slug text)
returns json
language plpgsql
security definer
as $$
declare
  v_event record;
  v_settings record;
begin
  select * into v_event from public.events where public_slug = p_slug and status = 'active' and expires_at > now();
  
  if not found then
    raise exception 'Event not found or expired';
  end if;

  select * into v_settings from public.event_settings where event_id = v_event.id;

  return json_build_object(
    'id', v_event.id,
    'name', v_event.name,
    'event_date', v_event.event_date,
    'location', v_event.location,
    'cover_image_path', v_event.cover_image_path,
    'allow_anonymous', coalesce(v_settings.allow_anonymous, true)
  );
end;
$$;

-- RPC to join an event (creates a guest session)
create or replace function public.join_event(p_slug text, p_display_name text, p_device_id text, p_session_token_hash text)
returns json
language plpgsql
security definer
as $$
declare
  v_event record;
  v_session_id uuid;
  v_current_guests int;
begin
  select * into v_event from public.events where public_slug = p_slug and status = 'active' and expires_at > now();
  
  if not found then
    raise exception 'Event not found or expired';
  end if;

  -- Verify guest limits
  select count(*) into v_current_guests from public.guest_sessions where event_id = v_event.id;
  if v_current_guests >= v_event.guest_limit then
    raise exception 'Event has reached its guest limit';
  end if;

  insert into public.guest_sessions (event_id, display_name, device_id, session_token_hash, expires_at)
  values (v_event.id, p_display_name, p_device_id, p_session_token_hash, v_event.expires_at)
  returning id into v_session_id;

  return json_build_object(
    'session_id', v_session_id,
    'event_id', v_event.id,
    'expires_at', v_event.expires_at
  );
end;
$$;

-- RPC to get event gallery for a guest (only approved media)
create or replace function public.get_guest_gallery(p_event_id uuid, p_session_token_hash text, p_limit int, p_offset int)
returns json
language plpgsql
security definer
as $$
declare
  v_session record;
  v_media json;
begin
  -- Validate session
  select * into v_session from public.guest_sessions 
  where event_id = p_event_id and session_token_hash = p_session_token_hash and expires_at > now();
  
  if not found then
    raise exception 'Invalid or expired session';
  end if;

  select json_agg(row_to_json(m)) into v_media
  from (
    select id, storage_path, thumbnail_path, mime_type, width, height, duration_ms, uploaded_at
    from public.media
    where event_id = p_event_id and status = 'approved' and deleted_at is null
    order by created_at desc
    limit p_limit offset p_offset
  ) m;

  return coalesce(v_media, '[]'::json);
end;
$$;

-- RPC to record uploaded media metadata
create or replace function public.record_uploaded_media(
  p_event_id uuid, 
  p_session_token_hash text, 
  p_storage_path text, 
  p_mime_type text, 
  p_size_bytes bigint,
  p_width int default null,
  p_height int default null,
  p_duration_ms int default null,
  p_content_hash text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_session record;
  v_settings record;
  v_event record;
  v_media_id uuid;
  v_initial_status text;
begin
  -- Validate session
  select * into v_session from public.guest_sessions 
  where event_id = p_event_id and session_token_hash = p_session_token_hash and expires_at > now();
  
  if not found then
    raise exception 'Invalid or expired session';
  end if;

  select * into v_event from public.events where id = p_event_id;
  select * into v_settings from public.event_settings where event_id = p_event_id;

  -- Determine initial status based on moderation settings
  if v_settings is not null and v_settings.moderation_required then
    v_initial_status := 'pending';
  else
    v_initial_status := 'approved';
  end if;

  -- Check storage limit
  if (select coalesce(storage_bytes, 0) + p_size_bytes from public.usage_meter where event_id = p_event_id) > v_event.storage_limit_bytes then
    raise exception 'Event storage limit exceeded';
  end if;

  insert into public.media (
    event_id, guest_session_id, storage_path, mime_type, size_bytes, 
    width, height, duration_ms, content_hash, status, uploaded_at
  ) values (
    p_event_id, v_session.id, p_storage_path, p_mime_type, p_size_bytes,
    p_width, p_height, p_duration_ms, p_content_hash, v_initial_status, now()
  ) returning id into v_media_id;

  -- Atomically update usage meter
  insert into public.usage_meter (event_id, storage_bytes, photo_count, video_count, updated_at)
  values (
    p_event_id, 
    p_size_bytes, 
    case when p_mime_type like 'video/%' then 0 else 1 end,
    case when p_mime_type like 'video/%' then 1 else 0 end,
    now()
  )
  on conflict (event_id) do update set
    storage_bytes = public.usage_meter.storage_bytes + excluded.storage_bytes,
    photo_count = public.usage_meter.photo_count + excluded.photo_count,
    video_count = public.usage_meter.video_count + excluded.video_count,
    updated_at = now();

  return v_media_id;
end;
$$;

-- Optimization Indexes
create index if not exists idx_guest_sessions_lookup on public.guest_sessions (event_id, session_token_hash, expires_at);
create index if not exists idx_events_owner_created on public.events (owner_id, created_at desc);
