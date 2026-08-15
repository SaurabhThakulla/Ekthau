-- Profiles RLS
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

-- Events RLS
create policy "Hosts can view their own events" on events for select using (auth.uid() = owner_id);
create policy "Hosts can insert their own events" on events for insert with check (auth.uid() = owner_id);
create policy "Hosts can update their own events" on events for update using (auth.uid() = owner_id);
create policy "Hosts can delete their own events" on events for delete using (auth.uid() = owner_id);

-- Event Settings RLS
create policy "Hosts can view their event settings" on event_settings for select using (
  exists (select 1 from events where events.id = event_settings.event_id and events.owner_id = auth.uid())
);
create policy "Hosts can insert their event settings" on event_settings for insert with check (
  exists (select 1 from events where events.id = event_settings.event_id and events.owner_id = auth.uid())
);
create policy "Hosts can update their event settings" on event_settings for update using (
  exists (select 1 from events where events.id = event_settings.event_id and events.owner_id = auth.uid())
);

-- Guest Sessions RLS
-- Hosts can view guest sessions for their events
create policy "Hosts can view guest sessions for their events" on guest_sessions for select using (
  exists (select 1 from events where events.id = guest_sessions.event_id and events.owner_id = auth.uid())
);
-- Guests do not have direct DB access to guest_sessions; they will use RPCs or the API with service role for initial creation,
-- but once they have a session, we can validate via application logic or a custom claim if we were using custom JWTs.
-- Since they don't have accounts, all guest actions will use anon key.
-- We must restrict anon access heavily.
create policy "Anon can view their own guest session if they know the token hash" on guest_sessions for select using (
  -- In a real app, we'd pass the session token from the client, hash it, and query.
  -- RLS here for anon might be too permissive if we just do "true", so we rely on the token hash being unguessable.
  -- But we should NOT allow `select * from guest_sessions`.
  -- To be safe, anon cannot select from this table directly. They must use an RPC.
  false
);

-- Media RLS
-- Hosts can view all media for their events
create policy "Hosts can view media for their events" on media for select using (
  exists (select 1 from events where events.id = media.event_id and events.owner_id = auth.uid())
);
-- Hosts can update media (approve/reject)
create policy "Hosts can update media for their events" on media for update using (
  exists (select 1 from events where events.id = media.event_id and events.owner_id = auth.uid())
);
-- Hosts can delete media
create policy "Hosts can delete media for their events" on media for delete using (
  exists (select 1 from events where events.id = media.event_id and events.owner_id = auth.uid())
);

-- Guests (anon) inserting media: they must use an RPC to validate their session and quota, OR
-- if using direct insert, we must use a security definer function.
-- For MVP, we will use security definer RPCs for guest operations to prevent direct table access.
create policy "Anon cannot directly insert media" on media for insert with check (false);
create policy "Anon cannot directly select media" on media for select using (false);

-- Usage Meter RLS
create policy "Hosts can view usage for their events" on usage_meter for select using (
  exists (select 1 from events where events.id = usage_meter.event_id and events.owner_id = auth.uid())
);

-- Media Processing RLS
create policy "Hosts can view media processing status for their events" on media_processing for select using (
  exists (
    select 1 from media 
    join events on events.id = media.event_id 
    where media.id = media_processing.media_id and events.owner_id = auth.uid()
  )
);

-- Orders RLS
create policy "Users can view their own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can create their own orders" on orders for insert with check (auth.uid() = user_id);

-- Downloads RLS
create policy "Users can view their downloads" on downloads for select using (auth.uid() = user_id);
create policy "Users can insert downloads" on downloads for insert with check (auth.uid() = user_id);
create policy "Users can update their downloads" on downloads for update using (auth.uid() = user_id);

-- Moderation Reports RLS
create policy "Hosts can view reports for their events" on moderation_reports for select using (
  exists (select 1 from events where events.id = moderation_reports.event_id and events.owner_id = auth.uid())
);
create policy "Hosts can update reports for their events" on moderation_reports for update using (
  exists (select 1 from events where events.id = moderation_reports.event_id and events.owner_id = auth.uid())
);
create policy "Anyone can submit a moderation report" on moderation_reports for insert with check (
  exists (select 1 from events where events.id = moderation_reports.event_id and events.status = 'active')
);

