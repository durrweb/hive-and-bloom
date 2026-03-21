-- ============================================================
-- HIVE & BLOOM — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- fuzzy search

-- ── ENUMS ───────────────────────────────────────────────────
create type content_status as enum ('draft', 'published', 'archived');
create type pollinator_type as enum ('honeybee', 'mason_bee', 'bumblebee', 'butterfly', 'moth', 'hoverfly', 'beetle', 'other');
create type season as enum ('spring', 'summer', 'autumn', 'winter');
create type difficulty as enum ('beginner', 'intermediate', 'advanced');
create type comment_status as enum ('pending', 'approved', 'flagged', 'removed');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  display_name    text,
  avatar_url      text,
  bio             text,
  location        text,
  hive_count      integer default 0,
  member_since    timestamptz default now(),
  is_expert       boolean default false,
  role            text default 'member' check (role in ('member', 'author', 'moderator', 'admin')),
  website_url     text,
  updated_at      timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text unique not null,
  description text,
  icon        text,              -- emoji or icon name
  color       text,              -- hex color for UI
  parent_id   uuid references categories(id),
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

insert into categories (name, slug, description, icon, color, sort_order) values
  ('Honeybee Keeping',     'honeybee-keeping',    'Hive management, swarms, seasonal care',             '🐝', '#C8771E', 1),
  ('Mason & Native Bees',  'native-bees',         'Solitary bees, nest boxes, habitat',                 '🌿', '#3D6B3A', 2),
  ('Butterfly Gardening',  'butterfly-gardening', 'Host plants, migration, garden design',              '🦋', '#8A7BAF', 3),
  ('Pollinator Plants',    'pollinator-plants',   'What to grow and when to grow it',                   '🌸', '#C96B4A', 4),
  ('Hive Health',          'hive-health',         'Disease, pests, varroa, treatments',                 '🔬', '#4A8BAF', 5),
  ('Honey & Hive Products','hive-products',       'Harvest, extraction, beeswax, propolis',             '🍯', '#8A4F0A', 6),
  ('Getting Started',      'getting-started',     'First hive guides, beginner resources',              '🌱', '#6B9E65', 7),
  ('Conservation',         'conservation',        'Advocacy, habitat restoration, policy',              '🌍', '#2A4A2A', 8);

-- ============================================================
-- ARTICLES
-- ============================================================
create table articles (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  title           text not null,
  subtitle        text,
  excerpt         text,
  body            text not null,          -- markdown or rich text (MDX)
  cover_image_url text,
  author_id       uuid not null references profiles(id),
  category_id     uuid references categories(id),
  status          content_status default 'draft',
  difficulty      difficulty,
  read_time_mins  integer,
  featured        boolean default false,
  views           integer default 0,
  likes           integer default 0,
  published_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index articles_slug_idx       on articles(slug);
create index articles_status_idx     on articles(status);
create index articles_category_idx   on articles(category_id);
create index articles_author_idx     on articles(author_id);
create index articles_featured_idx   on articles(featured) where featured = true;
create index articles_published_idx  on articles(published_at desc) where status = 'published';
-- Full-text search
create index articles_fts_idx on articles using gin(to_tsvector('english', title || ' ' || coalesce(excerpt, '') || ' ' || body));

create table article_tags (
  article_id  uuid references articles(id) on delete cascade,
  tag         text not null,
  primary key (article_id, tag)
);

create index article_tags_tag_idx on article_tags(tag);

-- Related articles (many-to-many)
create table article_relations (
  article_id  uuid references articles(id) on delete cascade,
  related_id  uuid references articles(id) on delete cascade,
  primary key (article_id, related_id)
);

-- ============================================================
-- RECIPES
-- ============================================================
create table recipes (
  id                uuid primary key default uuid_generate_v4(),
  slug              text unique not null,
  title             text not null,
  subtitle          text,
  description       text,
  cover_image_url   text,
  author_id         uuid not null references profiles(id),
  status            content_status default 'draft',
  difficulty        difficulty,
  prep_time_mins    integer,
  cook_time_mins    integer,
  total_time_mins   integer generated always as (coalesce(prep_time_mins,0) + coalesce(cook_time_mins,0)) stored,
  servings          integer,
  honey_variety     text,                 -- e.g. 'wildflower', 'lavender', 'clover'
  season_best       season,               -- best season to make/enjoy
  tags              text[],
  featured          boolean default false,
  views             integer default 0,
  likes             integer default 0,
  published_at      timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table recipe_ingredients (
  id          uuid primary key default uuid_generate_v4(),
  recipe_id   uuid not null references recipes(id) on delete cascade,
  section     text,                       -- e.g. 'For the dough', 'For the glaze'
  name        text not null,
  amount      numeric,
  unit        text,
  notes       text,
  sort_order  integer default 0
);

create table recipe_steps (
  id          uuid primary key default uuid_generate_v4(),
  recipe_id   uuid not null references recipes(id) on delete cascade,
  step_number integer not null,
  title       text,
  body        text not null,
  tip         text,
  image_url   text,
  timer_secs  integer
);

create index recipes_slug_idx     on recipes(slug);
create index recipes_status_idx   on recipes(status);
create index recipes_honey_idx    on recipes(honey_variety);
create index recipes_season_idx   on recipes(season_best);

-- ============================================================
-- POLLINATORS (reference data for the field guide)
-- ============================================================
create table pollinators (
  id                uuid primary key default uuid_generate_v4(),
  common_name       text not null,
  scientific_name   text,
  type              pollinator_type not null,
  description       text,
  image_url         text,
  habitat           text[],
  active_seasons    season[],
  range_description text,             -- US/Canada geographic range
  conservation_status text,           -- e.g. 'Least Concern', 'Vulnerable'
  fun_fact          text,
  created_at        timestamptz default now()
);

-- ============================================================
-- PLANTS (pollinator-friendly plants reference)
-- ============================================================
create table plants (
  id              uuid primary key default uuid_generate_v4(),
  common_name     text not null,
  scientific_name text,
  description     text,
  image_url       text,
  bloom_seasons   season[],
  pollinators_attracted pollinator_type[],
  is_native       boolean default true,
  hardiness_zones text,           -- e.g. '4-9'
  height_inches   integer,
  sun_requirement text,           -- 'full', 'partial', 'shade'
  water_needs     text,           -- 'low', 'moderate', 'high'
  notes           text,
  created_at      timestamptz default now()
);

-- ============================================================
-- SEASONAL CALENDAR
-- ============================================================
create table seasonal_tasks (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text,
  category        text not null,  -- 'hive', 'garden', 'mason-bee', etc.
  season          season not null,
  month_start     integer check (month_start between 1 and 12),
  month_end       integer check (month_end between 1 and 12),
  difficulty      difficulty,
  pollinator_type pollinator_type,
  region          text,           -- null = all regions
  related_article_id uuid references articles(id),
  sort_order      integer default 0,
  created_at      timestamptz default now()
);

insert into seasonal_tasks (title, description, category, season, month_start, month_end, difficulty, sort_order) values
  -- SPRING
  ('Inspect hives for winter survival',       'Check for queen presence, food stores, and signs of disease after winter.', 'hive', 'spring', 3, 3, 'beginner', 1),
  ('Add supers as nectar flow begins',        'Watch for hive population build-up and add honey supers before they run out of space.', 'hive', 'spring', 4, 5, 'beginner', 2),
  ('Swarm prevention checks',                 'Look for queen cells and split hives if needed to prevent swarming.', 'hive', 'spring', 4, 5, 'intermediate', 3),
  ('Plant early-bloom pollinator flowers',    'Crocuses, dandelions, and flowering fruit trees are crucial first-of-year food sources.', 'garden', 'spring', 3, 4, 'beginner', 4),
  ('Set out mason bee nest boxes',            'Place nest tubes and cocoons outside when daytime temps reach 55°F consistently.', 'mason-bee', 'spring', 3, 4, 'beginner', 5),
  -- SUMMER
  ('Harvest honey (mid-summer)',              'Inspect supers and harvest when frames are 80%+ capped.', 'hive', 'summer', 6, 7, 'intermediate', 6),
  ('Monitor for varroa mite levels',         'Do alcohol wash or sugar roll counts monthly. Treat if >2% threshold is exceeded.', 'hive', 'summer', 6, 8, 'intermediate', 7),
  ('Provide water sources for bees',          'A shallow dish with stones prevents bees from drowning and keeps them off neighbors'' pools.', 'hive', 'summer', 6, 9, 'beginner', 8),
  ('Plant late-summer bloomers',              'Lavender, borage, phacelia, and echinacea help bridge the summer dearth.', 'garden', 'summer', 6, 7, 'beginner', 9),
  ('Harvest mason bee cocoons',               'Collect cocoons from tubes in late summer before pests damage them.', 'mason-bee', 'summer', 8, 8, 'beginner', 10),
  -- AUTUMN
  ('Final varroa treatment before winter',   'Treat with oxalic acid or Apivar before winter bees are raised.', 'hive', 'autumn', 9, 10, 'intermediate', 11),
  ('Combine weak hives',                      'Merge weak colonies into stronger ones using the newspaper method.', 'hive', 'autumn', 9, 10, 'intermediate', 12),
  ('Feed hives if stores are low',           'Feed 2:1 sugar syrup to colonies with fewer than 40–60 lbs of stored honey.', 'hive', 'autumn', 9, 10, 'beginner', 13),
  ('Plant spring bulbs for early forage',    'Crocuses, snowdrops, and alliums planted now feed bees in early spring.', 'garden', 'autumn', 9, 10, 'beginner', 14),
  ('Clean mason bee nest boxes',             'Remove old tubes, clean wood surfaces, and store cocoons in cool refrigerator.', 'mason-bee', 'autumn', 10, 10, 'beginner', 15),
  -- WINTER
  ('Insulate hives for cold climates',        'Wrap hives or add insulation boards in zones 5 and colder.', 'hive', 'winter', 11, 12, 'beginner', 16),
  ('Oxalic acid dribble treatment',          'Best time to treat broodless colonies for varroa with oxalic acid dribble.', 'hive', 'winter', 12, 1, 'intermediate', 17),
  ('Plan next year''s garden',               'Order seeds, design new pollinator beds, and map succession planting calendars.', 'garden', 'winter', 1, 2, 'beginner', 18),
  ('Inspect beekeeping equipment',           'Repair hive bodies, replace worn frames, clean tools before spring rush.', 'hive', 'winter', 1, 2, 'beginner', 19),
  ('Store mason bee cocoons safely',         'Keep harvested cocoons in a paper bag in the fridge at 34–38°F until spring.', 'mason-bee', 'winter', 11, 3, 'beginner', 20);

-- ============================================================
-- COMMENTS
-- ============================================================
create table comments (
  id            uuid primary key default uuid_generate_v4(),
  author_id     uuid not null references profiles(id) on delete cascade,
  article_id    uuid references articles(id) on delete cascade,
  recipe_id     uuid references recipes(id) on delete cascade,
  parent_id     uuid references comments(id) on delete cascade, -- threading
  body          text not null,
  status        comment_status default 'approved',
  likes         integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  constraint comment_target check (
    (article_id is not null and recipe_id is null) or
    (recipe_id is not null and article_id is null)
  )
);

create index comments_article_idx on comments(article_id) where article_id is not null;
create index comments_recipe_idx  on comments(recipe_id)  where recipe_id  is not null;
create index comments_parent_idx  on comments(parent_id)  where parent_id  is not null;

-- ============================================================
-- BOOKMARKS / SAVED CONTENT
-- ============================================================
create table bookmarks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  article_id  uuid references articles(id) on delete cascade,
  recipe_id   uuid references recipes(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (user_id, article_id),
  unique (user_id, recipe_id),
  constraint bookmark_target check (
    (article_id is not null and recipe_id is null) or
    (recipe_id is not null and article_id is null)
  )
);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
create table newsletter_subscribers (
  id              uuid primary key default uuid_generate_v4(),
  email           text unique not null,
  first_name      text,
  interests       text[],               -- e.g. ['honeybees', 'recipes', 'butterflies']
  confirmed       boolean default false,
  confirm_token   text,
  subscribed_at   timestamptz default now(),
  unsubscribed_at timestamptz
);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger articles_updated_at  before update on articles  for each row execute procedure set_updated_at();
create trigger recipes_updated_at   before update on recipes   for each row execute procedure set_updated_at();
create trigger profiles_updated_at  before update on profiles  for each row execute procedure set_updated_at();
create trigger comments_updated_at  before update on comments  for each row execute procedure set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles             enable row level security;
alter table articles             enable row level security;
alter table article_tags         enable row level security;
alter table recipes              enable row level security;
alter table recipe_ingredients   enable row level security;
alter table recipe_steps         enable row level security;
alter table comments             enable row level security;
alter table bookmarks            enable row level security;
alter table seasonal_tasks       enable row level security;
alter table pollinators          enable row level security;
alter table plants               enable row level security;
alter table categories           enable row level security;
alter table newsletter_subscribers enable row level security;

-- ── Profiles ─────────────────────────────────────────────────
create policy "Profiles are publicly readable"
  on profiles for select using (true);
create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- ── Articles ─────────────────────────────────────────────────
create policy "Published articles are publicly readable"
  on articles for select using (status = 'published');
create policy "Authors can read their own drafts"
  on articles for select using (auth.uid() = author_id);
create policy "Authors can insert articles"
  on articles for insert with check (auth.uid() = author_id);
create policy "Authors can update their own articles"
  on articles for update using (auth.uid() = author_id);
create policy "Admins can do anything with articles"
  on articles for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'moderator'))
  );

-- ── Article Tags ─────────────────────────────────────────────
create policy "Article tags are publicly readable"
  on article_tags for select using (true);
create policy "Authors can manage tags on their articles"
  on article_tags for all using (
    exists (select 1 from articles where id = article_id and author_id = auth.uid())
  );

-- ── Recipes ──────────────────────────────────────────────────
create policy "Published recipes are publicly readable"
  on recipes for select using (status = 'published');
create policy "Authors can read their own draft recipes"
  on recipes for select using (auth.uid() = author_id);
create policy "Authors can insert recipes"
  on recipes for insert with check (auth.uid() = author_id);
create policy "Authors can update their own recipes"
  on recipes for update using (auth.uid() = author_id);

-- ── Recipe sub-tables ────────────────────────────────────────
create policy "Ingredients are publicly readable"
  on recipe_ingredients for select using (true);
create policy "Authors can manage ingredients"
  on recipe_ingredients for all using (
    exists (select 1 from recipes where id = recipe_id and author_id = auth.uid())
  );
create policy "Steps are publicly readable"
  on recipe_steps for select using (true);
create policy "Authors can manage steps"
  on recipe_steps for all using (
    exists (select 1 from recipes where id = recipe_id and author_id = auth.uid())
  );

-- ── Comments ─────────────────────────────────────────────────
create policy "Approved comments are publicly readable"
  on comments for select using (status = 'approved');
create policy "Authenticated users can post comments"
  on comments for insert with check (auth.uid() = author_id);
create policy "Users can update their own comments"
  on comments for update using (auth.uid() = author_id);
create policy "Users can delete their own comments"
  on comments for delete using (auth.uid() = author_id);
create policy "Moderators can manage all comments"
  on comments for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'moderator'))
  );

-- ── Bookmarks ────────────────────────────────────────────────
create policy "Users can read their own bookmarks"
  on bookmarks for select using (auth.uid() = user_id);
create policy "Users can manage their own bookmarks"
  on bookmarks for all using (auth.uid() = user_id);

-- ── Reference tables: public read-only ───────────────────────
create policy "Seasonal tasks are public" on seasonal_tasks for select using (true);
create policy "Pollinators are public"    on pollinators    for select using (true);
create policy "Plants are public"         on plants         for select using (true);
create policy "Categories are public"     on categories     for select using (true);

-- ── Newsletter ───────────────────────────────────────────────
create policy "Anyone can subscribe"
  on newsletter_subscribers for insert with check (true);
create policy "Admins can manage subscribers"
  on newsletter_subscribers for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- Published articles with author and category info joined
create view published_articles as
  select
    a.*,
    p.display_name  as author_name,
    p.avatar_url    as author_avatar,
    p.username      as author_username,
    c.name          as category_name,
    c.slug          as category_slug,
    c.color         as category_color,
    c.icon          as category_icon
  from articles a
  join profiles p  on p.id = a.author_id
  left join categories c on c.id = a.category_id
  where a.status = 'published'
  order by a.published_at desc;

-- Published recipes with author info
create view published_recipes as
  select
    r.*,
    p.display_name  as author_name,
    p.avatar_url    as author_avatar,
    p.username      as author_username
  from recipes r
  join profiles p on p.id = r.author_id
  where r.status = 'published'
  order by r.published_at desc;
