-- Esquema completo de ServiYa / Chuberlite en Supabase (estado final de las migraciones del 2026-10-21).
-- Proyecto: chuberlite (nmdguaufanloqimicbyu), región sa-east-1.
-- Para recrearlo en un proyecto vacío: pegar en el SQL Editor y ejecutar.

-- ───────────── Perfiles ─────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'user' check (role in ('user','provider','admin')),
  avatar_url text,
  phone text,
  subscription_until timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

-- Al registrarse se crea el perfil; los proveedores reciben 30 días de prueba
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare es_proveedor boolean := new.raw_user_meta_data->>'role' = 'provider';
begin
  insert into public.profiles (id, name, role, subscription_until)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    case when es_proveedor then 'provider' else 'user' end,
    case when es_proveedor then now() + interval '30 days' end
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Un usuario no puede cambiarse el rol (salvo user → provider) ni la suscripción.
-- Sin sesión (consola SQL / service role) sí se puede, para nombrar admins.
create or replace function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.role is distinct from old.role and not (old.role = 'user' and new.role = 'provider') then
      raise exception 'No puedes cambiar tu rol';
    end if;
    new.subscription_until := case
      when old.role = 'user' and new.role = 'provider' and old.subscription_until is null then now() + interval '30 days'
      else old.subscription_until end;
  end if;
  return new;
end $$;
create trigger profiles_protect before update on public.profiles
for each row execute function public.protect_profile_fields();

-- ───────────── Proveedores ─────────────
create table public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  category text not null,
  specialty text not null default '',
  description text not null default '',
  price_range text not null default 'A convenir',
  city text not null default '',
  district text not null default '',
  lat double precision,
  lng double precision,
  whatsapp text,
  image_url text,
  available boolean not null default true,
  response_time text not null default '1 hora',
  rating_avg numeric(3,2) not null default 0,
  reviews_count int not null default 0,
  created_at timestamptz not null default now()
);
create index providers_category_idx on public.providers (category);
create index providers_city_idx on public.providers (lower(city));

-- Lo que ve el público: solo fichas con suscripción vigente
create view public.provider_cards with (security_invoker = on) as
select p.*, pr.name, pr.avatar_url
from public.providers p
join public.profiles pr on pr.id = p.user_id
where pr.subscription_until > now() or pr.role = 'admin';

-- ───────────── Favoritos, chat, reseñas ─────────────
create table public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, provider_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(content) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (from_user <> to_user)
);
create index messages_pair_idx on public.messages (least(from_user, to_user), greatest(from_user, to_user), created_at);
create index messages_to_idx on public.messages (to_user, read_at);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (provider_id, user_id)
);

create or replace function public.refresh_provider_rating() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid := coalesce(new.provider_id, old.provider_id);
begin
  update public.providers p set
    rating_avg = coalesce((select round(avg(stars)::numeric, 2) from public.reviews where provider_id = pid), 0),
    reviews_count = (select count(*) from public.reviews where provider_id = pid)
  where p.id = pid;
  return null;
end $$;
create trigger reviews_rating after insert or update or delete on public.reviews
for each row execute function public.refresh_provider_rating();

create or replace function public.my_conversations()
returns table (other_id uuid, name text, avatar_url text, last_content text, last_at timestamptz, unread bigint)
language sql stable security invoker set search_path = public as $$
  with mios as (
    select case when from_user = auth.uid() then to_user else from_user end as otro, *
    from public.messages
    where auth.uid() in (from_user, to_user)
  ),
  ultimo as (
    select distinct on (otro) otro, content, created_at from mios order by otro, created_at desc
  )
  select u.otro, p.name, p.avatar_url, u.content, u.created_at,
    (select count(*) from mios m where m.otro = u.otro and m.to_user = auth.uid() and m.read_at is null)
  from ultimo u join public.profiles p on p.id = u.otro
  order by u.created_at desc
$$;

-- ───────────── Pagos y notificaciones ─────────────
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  method text not null default 'yape' check (method in ('yape','plin','transferencia')),
  reference text not null,
  months int not null default 1 check (months between 1 and 12),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);
create index payments_status_idx on public.payments (status, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('like','message','payment','review')),
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, read, created_at desc);

create or replace function public.notify_like() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, type, message, link)
  select p.user_id, 'like', coalesce((select name from public.profiles where id = new.user_id), 'Alguien') || ' te agregó a favoritos', '/profile'
  from public.providers p where p.id = new.provider_id;
  return new;
end $$;
create trigger likes_notify after insert on public.likes for each row execute function public.notify_like();

create or replace function public.notify_message() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, type, message, link)
  values (new.to_user, 'message',
    'Nuevo mensaje de ' || coalesce((select name from public.profiles where id = new.from_user), 'un usuario'),
    '/mensajes?con=' || new.from_user);
  return new;
end $$;
create trigger messages_notify after insert on public.messages for each row execute function public.notify_message();

create or replace function public.notify_review() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, type, message, link)
  select p.user_id, 'review', 'Recibiste una reseña de ' || new.stars || ' estrellas', '/profile'
  from public.providers p where p.id = new.provider_id;
  return new;
end $$;
create trigger reviews_notify after insert on public.reviews for each row execute function public.notify_review();

-- Aprobar o rechazar un pago (solo admin): extiende la suscripción y avisa al proveedor
create or replace function public.review_payment(payment_id uuid, approve boolean) returns void
language plpgsql security definer set search_path = public as $$
declare pay public.payments;
begin
  if not public.is_admin() then raise exception 'Solo el administrador puede revisar pagos'; end if;
  select * into pay from public.payments where id = payment_id for update;
  if pay.id is null or pay.status <> 'pending' then raise exception 'El pago no está pendiente'; end if;
  update public.payments set status = case when approve then 'approved' else 'rejected' end,
    reviewed_at = now(), reviewed_by = auth.uid() where id = payment_id;
  if approve then
    update public.profiles set subscription_until =
      greatest(coalesce(subscription_until, now()), now()) + make_interval(months => pay.months)
    where id = pay.user_id;
  end if;
  insert into public.notifications (user_id, type, message, link)
  values (pay.user_id, 'payment',
    case when approve then 'Tu pago fue aprobado. ¡Tu perfil está activo!' else 'Tu pago fue rechazado. Revisa el número de operación.' end,
    '/pagos');
end $$;

-- Borrar la propia cuenta (las fotos se borran antes desde el cliente con la API de Storage)
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Sin sesión'; end if;
  delete from auth.users where id = auth.uid();
end $$;

-- ───────────── Permisos ─────────────
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.notify_like() from public, anon, authenticated;
revoke execute on function public.notify_message() from public, anon, authenticated;
revoke execute on function public.notify_review() from public, anon, authenticated;
revoke execute on function public.protect_profile_fields() from public, anon, authenticated;
revoke execute on function public.refresh_provider_rating() from public, anon, authenticated;
revoke execute on function public.review_payment(uuid, boolean) from public, anon;
revoke execute on function public.my_conversations() from public, anon;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.review_payment(uuid, boolean) to authenticated;
grant execute on function public.my_conversations() to authenticated;
grant execute on function public.delete_my_account() to authenticated;

alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.likes enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

create policy "perfiles visibles" on public.profiles for select using (true);
create policy "editar mi perfil" on public.profiles for update using (id = auth.uid() or public.is_admin());

create policy "proveedores visibles" on public.providers for select using (true);
create policy "crear mi ficha" on public.providers for insert with check (user_id = auth.uid());
create policy "editar mi ficha" on public.providers for update using (user_id = auth.uid() or public.is_admin());
create policy "borrar mi ficha" on public.providers for delete using (user_id = auth.uid() or public.is_admin());

create policy "mis favoritos" on public.likes for select using (user_id = auth.uid());
create policy "dar favorito" on public.likes for insert with check (user_id = auth.uid());
create policy "quitar favorito" on public.likes for delete using (user_id = auth.uid());

create policy "mis mensajes" on public.messages for select using (auth.uid() in (from_user, to_user));
create policy "enviar mensaje" on public.messages for insert with check (from_user = auth.uid());
create policy "marcar leido" on public.messages for update using (to_user = auth.uid());

create policy "reseñas visibles" on public.reviews for select using (true);
create policy "escribir reseña" on public.reviews for insert with check (
  user_id = auth.uid() and not exists (select 1 from public.providers where id = provider_id and user_id = auth.uid()));
create policy "editar mi reseña" on public.reviews for update using (user_id = auth.uid());
create policy "borrar mi reseña" on public.reviews for delete using (user_id = auth.uid() or public.is_admin());

create policy "mis pagos" on public.payments for select using (user_id = auth.uid() or public.is_admin());
create policy "registrar pago" on public.payments for insert with check (user_id = auth.uid() and status = 'pending');

create policy "mis notificaciones" on public.notifications for select using (user_id = auth.uid());
create policy "leer notificacion" on public.notifications for update using (user_id = auth.uid());
create policy "borrar notificacion" on public.notifications for delete using (user_id = auth.uid());

-- Tiempo real para chat y notificaciones
alter publication supabase_realtime add table public.messages, public.notifications;

-- Fotos de perfil y de servicios: avatars/<id del usuario>/...
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
create policy "subir mi foto" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "cambiar mi foto" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "borrar mi foto" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Para nombrar al primer administrador (desde el SQL Editor, después de que se registre):
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'TU_CORREO');
