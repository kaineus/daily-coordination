-- F8: 일반 코디 추천 캐시 테이블
-- 날씨 조건별 공유 캐시 (사용자 무관)

create table if not exists public.general_recommendations (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  weather_hash text not null,
  weather_data jsonb not null,
  recommendation jsonb not null,
  created_at timestamptz not null default now(),
  unique(date, weather_hash)
);

alter table public.general_recommendations enable row level security;

-- anon도 조회 가능 (비로그인 사용자용)
create policy "general_recommendations_anon_select"
  on public.general_recommendations for select
  to anon
  using (true);

-- authenticated도 조회 가능
create policy "general_recommendations_auth_select"
  on public.general_recommendations for select
  to authenticated
  using (true);
