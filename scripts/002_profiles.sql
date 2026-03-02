create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'teacher',
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'profiles_select_own' and tablename = 'profiles') then
    create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'profiles_insert_own' and tablename = 'profiles') then
    create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'profiles_update_own' and tablename = 'profiles') then
    create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;
