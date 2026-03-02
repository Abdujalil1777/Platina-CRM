-- Profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'teacher',
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Students table
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  course text not null,
  group_name text,
  status text default 'active' check (status in ('active', 'graduated', 'paused', 'expelled')),
  start_date date default current_date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.students enable row level security;
create policy "students_select" on public.students for select using (auth.uid() = user_id);
create policy "students_insert" on public.students for insert with check (auth.uid() = user_id);
create policy "students_update" on public.students for update using (auth.uid() = user_id);
create policy "students_delete" on public.students for delete using (auth.uid() = user_id);

-- Payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  amount numeric not null,
  payment_date date default current_date,
  payment_method text default 'cash' check (payment_method in ('cash', 'card', 'transfer')),
  description text,
  month text,
  status text default 'paid' check (status in ('paid', 'pending', 'overdue')),
  created_at timestamptz default now()
);

alter table public.payments enable row level security;
create policy "payments_select" on public.payments for select using (auth.uid() = user_id);
create policy "payments_insert" on public.payments for insert with check (auth.uid() = user_id);
create policy "payments_update" on public.payments for update using (auth.uid() = user_id);
create policy "payments_delete" on public.payments for delete using (auth.uid() = user_id);

-- Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text default 'todo' check (status in ('todo', 'in_progress', 'done')),
  due_date date,
  assigned_to text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tasks enable row level security;
create policy "tasks_select" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update" on public.tasks for update using (auth.uid() = user_id);
create policy "tasks_delete" on public.tasks for delete using (auth.uid() = user_id);
