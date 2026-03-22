-- ============================================
-- Daily Coordination — 초기 DB 마이그레이션
-- Supabase SQL Editor에서 실행
-- ============================================

-- 1. clothing_categories (카테고리 마스터)
create table if not exists public.clothing_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('아우터', '상의', '하의', '신발', '액세서리')),
  temp_min int,
  temp_max int,
  icon text not null default '',
  sort_order int not null default 0
);

alter table public.clothing_categories enable row level security;

-- 인증된 사용자 누구나 읽기 가능
create policy "clothing_categories_select"
  on public.clothing_categories for select
  to authenticated
  using (true);

-- 2. user_clothes (사용자 옷장)
create table if not exists public.user_clothes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.clothing_categories(id) on delete restrict,
  color text not null,
  color_name text not null,
  nickname text,
  created_at timestamptz not null default now()
);

alter table public.user_clothes enable row level security;

create policy "user_clothes_select"
  on public.user_clothes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_clothes_insert"
  on public.user_clothes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_clothes_delete"
  on public.user_clothes for delete
  to authenticated
  using (auth.uid() = user_id);

-- 3. recommendations (AI 코디 추천)
create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weather_data jsonb,
  a2ui_json jsonb,
  created_at timestamptz not null default now()
);

alter table public.recommendations enable row level security;

create policy "recommendations_select"
  on public.recommendations for select
  to authenticated
  using (auth.uid() = user_id);

create policy "recommendations_insert"
  on public.recommendations for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ============================================
-- Seed: 카테고리 초기 데이터
-- ============================================

insert into public.clothing_categories (name, type, icon, sort_order, temp_min, temp_max) values
  -- 아우터
  ('패딩',     '아우터', '🧥', 1,  null, 5),
  ('코트',     '아우터', '🧥', 2,  null, 10),
  ('자켓',     '아우터', '🧥', 3,  10,   20),
  ('가디건',   '아우터', '🧥', 4,  12,   22),
  ('바람막이', '아우터', '🧥', 5,  10,   20),
  ('점퍼',     '아우터', '🧥', 6,  5,    15),
  -- 상의
  ('반팔티',   '상의',   '👕', 10, 23,   null),
  ('긴팔티',   '상의',   '👕', 11, 15,   25),
  ('맨투맨',   '상의',   '👕', 12, 10,   22),
  ('후드',     '상의',   '👕', 13, 8,    20),
  ('니트',     '상의',   '👕', 14, 5,    18),
  ('셔츠',     '상의',   '👔', 15, 15,   28),
  ('블라우스', '상의',   '👔', 16, 15,   28),
  -- 하의
  ('청바지',   '하의',   '👖', 20, null, null),
  ('슬랙스',   '하의',   '👖', 21, null, null),
  ('면바지',   '하의',   '👖', 22, 15,   null),
  ('기모바지', '하의',   '👖', 23, null, 10),
  ('반바지',   '하의',   '🩳', 24, 25,   null),
  ('치마',     '하의',   '👗', 25, 18,   null),
  -- 신발
  ('운동화',   '신발',   '👟', 30, null, null),
  ('구두',     '신발',   '👞', 31, null, null),
  ('부츠',     '신발',   '🥾', 32, null, 10),
  ('샌들',     '신발',   '🩴', 33, 25,   null),
  ('슬리퍼',   '신발',   '🩴', 34, 25,   null),
  -- 액세서리
  ('모자',     '액세서리', '🧢', 40, null, null),
  ('목도리',   '액세서리', '🧣', 41, null, 10),
  ('장갑',     '액세서리', '🧤', 42, null, 5),
  ('우산',     '액세서리', '☂️', 43, null, null);
