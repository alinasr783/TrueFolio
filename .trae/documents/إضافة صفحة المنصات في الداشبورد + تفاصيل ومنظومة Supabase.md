## نظرة عامة

* إنشاء قسم جديد في الداشبورد لعرض "منصاتنا" كبطاقات مرتّبة ومنسّقة جدًا.

* إضافة صفحة تفاصيل لكل منصة تتضمن المميزات، الأهداف، الروابط، الوسوم، والميديا.

* دعم مشاركة صفحة التفاصيل وزر عودة إلى صفحة المنصات.

## التوجيه والمسارات

* إضافة مسارين جديدين مع التحميل الكسول مثل بقية صفحات الداشبورد:

  * `'/dashboard/platforms'` لصفحة القائمة.

  * `'/dashboard/platform/:slug'` لصفحة التفاصيل.

* نمط الشريط الجانبي سيظهر تلقائيًا لأن المسار يبدأ بـ `'/dashboard'` حسب الكشف في `src/App.jsx:37`.

## صفحة قائمة المنصات

* المسار: `src/pages/dashboard/jsx/Platforms.jsx`.

* المكوّنات: بطاقات تعرض `صورة غلاف`، `لوجو`، `عنوان`، `وصف`، `tags`، زر `عرض المزيد`، وزر `الذهاب للموقع`.

* وظائف:

  * جلب البيانات من Supabase: `platform` مع الحقول الأساسية.

  * بحث + فلترة بالوسوم والنوع + ترتيب بالأولوية/الأحدث (نفس نمط فلاتر `projects.jsx`).

  * حركة سلسة باستخدام `framer-motion` لمواءمة أسلوب المشروع.

## صفحة تفاصيل المنصة

* المسار: `src/pages/dashboard/jsx/Platform.jsx`.

* تعرض:

  * رأس الصفحة: عنوان، وصف، شارة الحالة/النوع، أزرار مشاركة/زيارة الموقع.

  * أقسام منظمة: "أهم المميزات" (features)، "الأهداف" (goals)، "التقنيات" (tags/technologies)، "الصور/الميديا".

  * زر "العودة إلى المنصات" يعيد إلى `'/dashboard/platforms'`.

* الجلب بالـ `slug` لقراءة صف واحد من الجدول.

## البيانات والواجهة

* استخدام Tailwind + `lucide-react` + `framer-motion` بنفس أسلوب صفحات `projects.jsx` و`project.jsx` للحفاظ على التناسق.

* الحقول المعروضة في البطاقات: `cover_url`، `logo_url`، `name`/`title`، `description`، `tags`، `live_link`.

* في التفاصيل: عرض `features (jsonb)` و`goals (jsonb)` كقوائم غنية.

## SQL لـ Supabase (المخطط المقترح)

```sql
-- جدول المنصات
create table if not exists public.platform (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  name text not null,
  title text,
  description text,
  type text check (type in ('web','mobile','api','tool')) default 'web',
  tags text[] default '{}',
  logo_url text,
  cover_url text,
  live_link text,
  repo_link text,
  features jsonb default '[]',
  goals jsonb default '[]',
  ownership_pct int default 100 check (ownership_pct between 0 and 100),
  priority int default 0,
  published boolean default true,
  status text check (status in ('active','planning','completed','on_hold')) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- تحديث تلقائي لحقل updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger platform_set_updated_at
before update on public.platform
for each row execute procedure public.set_updated_at();

-- تفعيل RLS
alter table public.platform enable row level security;

-- القراءة العامة للمنصات المنشورة فقط
create policy "Public read published platforms"
  on public.platform
  for select
  using (published = true);

-- إدارة كاملة للمالكين (اليوزر صاحب السجل)
create policy "Owner full access"
  on public.platform
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- فهرس للأداء
create index if not exists platform_slug_idx on public.platform (slug);
create index if not exists platform_published_priority_idx on public.platform (published, priority desc);
```

## الربط من الواجهة

* القائمة: `supabase.from('platform').select('id, slug, name, title, description, tags, logo_url, cover_url, live_link, type, status, priority')
  .eq('published', true)
  .order('priority', { ascending: false })`.

* التفاصيل: `supabase.from('platform').select('*').eq('slug', slug).single()`.

## المشاركة والعودة

* زر مشاركة يستخدم `navigator.share` إن كان متاحًا؛ وإلا نسخ الرابط إلى الحافظة مع إشعار.

* زر "العودة" يستخدم `useNavigate()` للعودة إلى `'/dashboard/platforms'`.

## الأداء وتجربة المستخدم

* تخزين مؤقت خفيف في `sessionStorage` لمدة قصيرة لتسريع التصفح.

* صور بـ `loading="lazy"` و`decoding="async"`، وضبط حجم الشبكة responsive.

## التغييرات في الملفات

* إضافة:

  * `src/pages/dashboard/jsx/Platforms.jsx`

  * `src/pages/dashboard/jsx/Platform.jsx`

* تحديث التوجيه في `src/App.jsx` بإضافة مساري التحميل الكسول والـ `<Route>`.

* إضافة رابط في الشريط الجانبي إن رغبت: `src/pages/dashboard/jsx/Sidebar.jsx` لضمان الوصول السريع.

## بعد الموافقة

* تنفيذ الصفحتين والربط مع Supabase، ثم تزويدك بعينات إدخال بيانات أولية إن رغبت، مع التحقق البصري في المعاينة.

