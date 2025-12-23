-- Create workout_groups table
create table public.workout_groups (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  name text not null,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Enable RLS
alter table public.workout_groups enable row level security;

-- Policies for workout_groups
create policy "Users can view their own workout groups"
  on public.workout_groups for select
  using (auth.uid() = user_id);

create policy "Users can insert their own workout groups"
  on public.workout_groups for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own workout groups"
  on public.workout_groups for update
  using (auth.uid() = user_id);

create policy "Users can delete their own workout groups"
  on public.workout_groups for delete
  using (auth.uid() = user_id);

-- Add group_id to workouts
alter table public.workouts 
add column group_id uuid references public.workout_groups(id) on delete set null;

-- Add index for performance
create index workout_groups_user_id_idx on public.workout_groups(user_id);
create index workouts_group_id_idx on public.workouts(group_id);
