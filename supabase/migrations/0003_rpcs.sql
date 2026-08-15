-- RPC to get public event info for joining
create or replace function get_public_event_info(p_slug text)
returns json
language plpgsql
security definer
as $$
declare
  v_event record;
  v_settings record;
begin
  select * into v_event from events where public_slug = p_slug and status = 'active' and expires_at > now();
  
  if not found then
    raise exception 'Event not found or expired';
  end if;

  select * into v_settings from event_settings where event_id = v_event.id;

  return json_build_object(
    'id', v_event.id,
    'name', v_event.name,
    'event_date', v_event.event_date,
    'location', v_event.location,
    'cover_image_path', v_event.cover_image_path,
    'allow_anonymous', v_settings.allow_anonymous
  );
end;
$$;

-- RPC to join an event (creates a guest session)
create or replace function join_event(p_slug text, p_display_name text, p_device_id text, p_session_token_hash text)
returns json
language plpgsql
security definer
as $$
declare
  v_event record;
  v_session_id uuid;
begin
  select * into v_event from events where public_slug = p_slug and status = 'active' and expires_at > now();
  
  if not found then
    raise exception 'Event not found or expired';
  end if;

  -- Verify guest limits (simple implementation, real one needs atomic counter)
  declare
    v_current_guests int;
  begin
    select count(*) into v_current_guests from guest_sessions where event_id = v_event.id;
    if v_current_guests >= v_event.guest_limit then
      raise exception 'Event has reached its guest limit';
    end if;
  end;

  insert into guest_sessions (event_id, display_name, device_id, session_token_hash, expires_at)
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
create or replace function get_guest_gallery(p_event_id uuid, p_session_token_hash text, p_limit int, p_offset int)
returns json
language plpgsql
security definer
as $$
declare
  v_session record;
  v_media json;
begin
  -- Validate session
  select * into v_session from guest_sessions 
  where event_id = p_event_id and session_token_hash = p_session_token_hash and expires_at > now();
  
  if not found then
    raise exception 'Invalid or expired session';
  end if;

  select json_agg(row_to_json(m)) into v_media
  from (
    select id, storage_path, thumbnail_path, mime_type, width, height, duration_ms, uploaded_at
    from media
    where event_id = p_event_id and status = 'approved' and deleted_at is null
    order by created_at desc
    limit p_limit offset p_offset
  ) m;

  return coalesce(v_media, '[]'::json);
end;
$$;

-- RPC to record uploaded media metadata
create or replace function record_uploaded_media(
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
  select * into v_session from guest_sessions 
  where event_id = p_event_id and session_token_hash = p_session_token_hash and expires_at > now();
  
  if not found then
    raise exception 'Invalid or expired session';
  end if;

  select * into v_event from events where id = p_event_id;
  select * into v_settings from event_settings where event_id = p_event_id;

  -- Determine initial status based on moderation settings
  if v_settings.moderation_required then
    v_initial_status := 'pending';
  else
    v_initial_status := 'approved';
  end if;

  -- Check storage limit
  if (select coalesce(storage_bytes, 0) + p_size_bytes from usage_meter where event_id = p_event_id) > v_event.storage_limit_bytes then
    raise exception 'Event storage limit exceeded';
  end if;

  insert into media (
    event_id, guest_session_id, storage_path, mime_type, size_bytes, 
    width, height, duration_ms, content_hash, status, uploaded_at
  ) values (
    p_event_id, v_session.id, p_storage_path, p_mime_type, p_size_bytes,
    p_width, p_height, p_duration_ms, p_content_hash, v_initial_status, now()
  ) returning id into v_media_id;

  -- Atomically update usage meter
  insert into usage_meter (event_id, storage_bytes, photo_count, video_count, updated_at)
  values (
    p_event_id, 
    p_size_bytes, 
    case when p_mime_type like 'video/%' then 0 else 1 end,
    case when p_mime_type like 'video/%' then 1 else 0 end,
    now()
  )
  on conflict (event_id) do update set
    storage_bytes = usage_meter.storage_bytes + excluded.storage_bytes,
    photo_count = usage_meter.photo_count + excluded.photo_count,
    video_count = usage_meter.video_count + excluded.video_count,
    updated_at = now();

  return v_media_id;
end;
$$;

-- Optimization Indexes
create index if not exists idx_guest_sessions_lookup on guest_sessions (event_id, session_token_hash, expires_at);
create index if not exists idx_events_owner_created on events (owner_id, created_at desc);

