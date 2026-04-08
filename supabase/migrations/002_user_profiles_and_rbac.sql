-- F6: 역할 기반 접근 제어 (RBAC)
-- user_profiles 테이블 + clothing_categories admin RLS
-- 원격 적용일: 2026-03-26 (mcp__supabase__apply_migration via Claude Code)
-- 로컬 파일 누락분 복원 (lint drift 수정)

-- ==========================================
-- 1. user_profiles 테이블
-- ==========================================
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

-- 본인 프로필만 조회 가능
create policy "user_profiles_select_own"
  on public.user_profiles for select
  using (auth.uid() = id);

-- ==========================================
-- 2. 신규 가입자 자동 프로필 생성 트리거
-- ==========================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.user_profiles (id, role) values (new.id, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================
-- 3. clothing_categories admin 전용 RLS
-- ==========================================
-- 기존 SELECT 정책은 001_init.sql에서 모두에게 허용됨 (그대로 유지)
-- INSERT/UPDATE/DELETE는 admin만 가능하도록 추가

create policy "clothing_categories_insert_admin"
  on public.clothing_categories for insert
  with check (
    exists (
      select 1 from public.user_profiles
      where user_profiles.id = auth.uid() and user_profiles.role = 'admin'
    )
  );

create policy "clothing_categories_update_admin"
  on public.clothing_categories for update
  using (
    exists (
      select 1 from public.user_profiles
      where user_profiles.id = auth.uid() and user_profiles.role = 'admin'
    )
  );

create policy "clothing_categories_delete_admin"
  on public.clothing_categories for delete
  using (
    exists (
      select 1 from public.user_profiles
      where user_profiles.id = auth.uid() and user_profiles.role = 'admin'
    )
  );
