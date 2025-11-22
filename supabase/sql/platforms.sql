-- عمود بحث FTS وفهارس
alter table public.platform
add column if not exists search_vector tsvector generated always as (
  setweight(to_tsvector('simple', coalesce(name,'')), 'A') ||
  setweight(to_tsvector('simple', coalesce(title,'')), 'B') ||
  setweight(to_tsvector('simple', coalesce(description,'')), 'B') ||
  setweight(to_tsvector('simple', array_to_string(tags, ' ')), 'C') ||
  setweight(to_tsvector('simple', coalesce(features::text,'')), 'C') ||
  setweight(to_tsvector('simple', coalesce(goals::text,'')), 'C')
) stored;

create index if not exists platform_search_idx on public.platform using gin (search_vector);
create index if not exists platform_slug_idx on public.platform (slug);
create index if not exists platform_priority_idx on public.platform (priority desc);
create index if not exists platform_published_idx on public.platform (published);
create index if not exists platform_type_idx on public.platform (type);
create index if not exists platform_created_idx on public.platform (created_at desc);

-- تريجر تحديث updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists platform_set_updated_at on public.platform;
create trigger platform_set_updated_at before update on public.platform
for each row execute function public.set_updated_at();

-- RLS وسياسات الوصول
alter table public.platform enable row level security;

create policy public_read_published on public.platform
for select using (published = true);

create policy owner_all on public.platform
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- دالة RPC للبحث المتقدم
create or replace function public.search_platforms(q text)
returns setof public.platform
language sql stable
as $$
  select *
  from public.platform
  where published = true
    and search_vector @@ websearch_to_tsquery('simple', q)
  order by ts_rank(search_vector, websearch_to_tsquery('simple', q)) desc, priority desc, updated_at desc
$$;

-- عدّادات حسب النوع
create or replace function public.platform_type_counts()
returns table(type text, count int)
language sql stable
as $$
  select type, count(*)
  from public.platform
  where published = true
  group by type
$$;