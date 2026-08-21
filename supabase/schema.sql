-- ============================================================================
-- KO-PUSAKA ASSET360 — PostgreSQL / Supabase schema
--
-- Mirrors src/lib/types.ts one-for-one. Every table uses UUID primary keys,
-- created_at / updated_at timestamps and explicit status fields so the
-- application can move from the seeded demo dataset to Supabase without any
-- change to component code.
--
--   psql "$DATABASE_URL" -f supabase/schema.sql
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums ----
create type user_role as enum (
  'super_admin', 'management', 'property_manager', 'officer', 'finance_viewer', 'referrer'
);

create type property_type as enum (
  'Shoplot', 'Office', 'Commercial', 'Residential', 'Industrial', 'Land', 'Warehouse', 'Other'
);

create type property_status as enum (
  'occupied', 'vacant', 'available_rent', 'available_sale', 'under_negotiation',
  'reserved', 'sold', 'inactive'
);

create type listing_intent as enum ('rent', 'sale', 'both', 'none');

create type marketing_badge as enum ('featured', 'urgent_rent', 'urgent_sale', 'new_listing', 'price_updated');

create type lead_stage as enum (
  'new', 'contacted', 'qualified', 'viewing_scheduled', 'viewing_completed',
  'negotiation', 'offer', 'agreement', 'successful', 'lost'
);

create type lead_interest as enum ('rent', 'buy', 'viewing', 'info');
create type contact_method as enum ('whatsapp', 'phone', 'email');

create type lead_source as enum (
  'website', 'referral', 'whatsapp', 'facebook', 'walk_in', 'agent', 'staff', 'event', 'advertisement'
);

create type activity_kind as enum (
  'note', 'call', 'whatsapp', 'email', 'viewing', 'stage_change', 'offer', 'assignment', 'created'
);

create type referrer_status as enum ('pending', 'approved', 'suspended', 'deactivated');
create type incentive_status as enum ('pending', 'approved', 'paid', 'rejected');
create type renewal_status as enum ('not_started', 'in_discussion', 'renewing', 'not_renewing', 'expired');
create type tenancy_status as enum ('active', 'expiring', 'expired', 'terminated');
create type payment_status as enum ('paid', 'partial', 'outstanding', 'overdue');
create type viewing_status as enum ('scheduled', 'completed', 'no_show', 'cancelled');
create type offer_status as enum ('pending', 'accepted', 'countered', 'rejected');

create type notification_kind as enum (
  'new_lead', 'lead_assigned', 'followup_overdue', 'viewing_upcoming', 'offer_received',
  'tenancy_expiring', 'rental_overdue', 'referral_conversion', 'vacancy_alert'
);

-- ------------------------------------------------------------ timestamps ---
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------ people and roles ---
-- Supabase Auth owns auth.users; profiles carries the application identity.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  title text,
  role user_role not null default 'officer',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- -------------------------------------------------------------- properties -
create table properties (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                    -- KPS-P-001
  slug text not null unique,                    -- SEO-friendly public URL
  name text not null,
  address text not null,
  location text not null,
  district text,
  lat numeric(9, 6),
  lng numeric(9, 6),
  type property_type not null,
  description text,
  highlights text[] not null default '{}',
  facilities text[] not null default '{}',
  documents jsonb not null default '[]',
  officer_id uuid references profiles (id) on delete set null,

  asset_value numeric(14, 2) not null default 0,
  sale_price numeric(14, 2),
  asking_rent numeric(12, 2),
  current_rent numeric(12, 2),
  deposit numeric(12, 2),

  floor_size_sqft integer not null default 0,
  land_size_sqft integer,
  bedrooms smallint,
  bathrooms smallint,
  car_parks smallint,

  status property_status not null default 'vacant',
  intent listing_intent not null default 'none',
  published boolean not null default false,
  badges marketing_badge[] not null default '{}',
  date_listed date,
  vacant_since date,
  last_marketing_activity date,
  next_action text,
  next_action_due date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index properties_status_idx on properties (status);
create index properties_published_idx on properties (published) where published;
create index properties_officer_idx on properties (officer_id);
create trigger properties_updated before update on properties
  for each row execute function set_updated_at();

create table property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  storage_path text not null,                   -- Supabase Storage object path
  caption text,
  sort_order smallint not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index property_images_property_idx on property_images (property_id, sort_order);

create table property_documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  name text not null,
  kind text not null,
  storage_path text not null,
  size_bytes bigint,
  public boolean not null default false,
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------- tenancy ---
create table tenancies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  property_id uuid not null references properties (id) on delete cascade,
  tenant_name text not null,
  tenant_company text,
  tenant_phone text,
  tenant_email text,
  start_date date not null,
  end_date date not null,
  monthly_rent numeric(12, 2) not null,
  deposit numeric(12, 2) not null default 0,
  renewal renewal_status not null default 'not_started',
  status tenancy_status not null default 'active',
  notes text,
  documents jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenancy_dates check (end_date > start_date)
);
create index tenancies_property_idx on tenancies (property_id);
create index tenancies_expiry_idx on tenancies (end_date) where status <> 'expired';
create trigger tenancies_updated before update on tenancies
  for each row execute function set_updated_at();

create table rental_payments (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references tenancies (id) on delete cascade,
  property_id uuid not null references properties (id) on delete cascade,
  period char(7) not null,                      -- YYYY-MM
  amount_due numeric(12, 2) not null,
  amount_paid numeric(12, 2) not null default 0,
  due_date date not null,
  paid_date date,
  method text,
  status payment_status not null default 'outstanding',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenancy_id, period)
);
create index rental_payments_status_idx on rental_payments (status);
create trigger rental_payments_updated before update on rental_payments
  for each row execute function set_updated_at();

-- ------------------------------------------------------------- referrals ---
create table referrers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles (id) on delete set null,
  code text not null unique,                    -- KPS-A1023
  full_name text not null,
  id_number text,                               -- store masked or encrypted
  organisation text,
  phone text not null,
  email text not null,
  occupation text,
  referrer_type text not null default 'public',
  bank_details jsonb,                           -- populated only if policy requires
  status referrer_status not null default 'pending',
  approved_at timestamptz,
  approved_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger referrers_updated before update on referrers
  for each row execute function set_updated_at();

create table referral_clicks (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references referrers (id) on delete cascade,
  property_id uuid references properties (id) on delete set null,
  visitor_hash text,                            -- hashed, not personally identifying
  user_agent text,
  campaign text,
  created_at timestamptz not null default now()
);
create index referral_clicks_referrer_idx on referral_clicks (referrer_id, created_at desc);

-- ------------------------------------------------------------- campaigns ---
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel lead_source not null,
  utm text not null unique,
  start_date date not null default current_date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------- leads ---
create table leads (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  phone text not null,
  email text,
  company text,
  property_id uuid references properties (id) on delete set null,
  interest lead_interest not null default 'info',
  preferred_contact contact_method not null default 'whatsapp',
  message text,
  source lead_source not null default 'website',
  campaign_id uuid references campaigns (id) on delete set null,
  referrer_id uuid references referrers (id) on delete set null,
  referral_code text,
  officer_id uuid references profiles (id) on delete set null,
  stage lead_stage not null default 'new',
  estimated_value numeric(14, 2) not null default 0,
  next_action text,
  next_followup date,
  last_interaction date not null default current_date,
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_stage_idx on leads (stage);
create index leads_officer_idx on leads (officer_id);
create index leads_followup_idx on leads (next_followup) where stage not in ('successful', 'lost');
create index leads_referrer_idx on leads (referrer_id);
create trigger leads_updated before update on leads
  for each row execute function set_updated_at();

create table lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  kind activity_kind not null,
  summary text not null,
  detail text,
  actor_id uuid references profiles (id) on delete set null,
  actor_name text,
  created_at timestamptz not null default now()
);
create index lead_activities_lead_idx on lead_activities (lead_id, created_at desc);

create table lead_followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  due_date date not null,
  action text not null,
  completed_at timestamptz,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index lead_followups_due_idx on lead_followups (due_date) where completed_at is null;

create table viewings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  property_id uuid not null references properties (id) on delete cascade,
  officer_id uuid references profiles (id) on delete set null,
  scheduled_at timestamptz not null,
  status viewing_status not null default 'scheduled',
  outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index viewings_scheduled_idx on viewings (scheduled_at) where status = 'scheduled';

create table offers (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  property_id uuid not null references properties (id) on delete cascade,
  kind text not null check (kind in ('rent', 'sale')),
  amount numeric(14, 2) not null,
  submitted_at date not null default current_date,
  status offer_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table referral_attributions (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references referrers (id) on delete cascade,
  lead_id uuid not null references leads (id) on delete cascade,
  property_id uuid references properties (id) on delete set null,
  captured_at timestamptz not null default now(),
  outcome text not null default 'open',
  unique (lead_id)                              -- one credited introduction per lead
);

create table referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references referrers (id) on delete cascade,
  lead_id uuid not null references leads (id) on delete cascade,
  property_id uuid references properties (id) on delete set null,
  deal_value numeric(14, 2) not null default 0,
  incentive_amount numeric(12, 2),              -- null until policy determines it
  status incentive_status not null default 'pending',
  recorded_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id)                              -- prevents duplicate conversions
);

-- --------------------------------------------------- notifications, audit --
create table notifications (
  id uuid primary key default gen_random_uuid(),
  kind notification_kind not null,
  title text not null,
  body text,
  href text,
  severity text not null default 'info',
  audience user_role[] not null default '{}',
  recipient_id uuid references profiles (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_recipient_idx on notifications (recipient_id, created_at desc);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles (id) on delete set null,
  entity text not null,
  entity_id uuid,
  action text not null,
  changes jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on audit_logs (entity, entity_id, created_at desc);

create table system_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);

insert into system_settings (key, value, description) values
  ('attribution_window_days', '30', 'Days a referral code stays attached to a visitor'),
  ('incentive_model', '"not_configured"', 'not_configured | fixed | percentage'),
  ('incentive_value', 'null', 'Set once KO-PUSAKA approves the referral policy'),
  ('vacancy_amber_days', '30', 'Vacancy days before a property turns amber'),
  ('vacancy_red_days', '90', 'Vacancy days before a property turns red'),
  ('followup_stale_days', '3', 'Days without interaction before a lead is flagged'),
  ('leaderboard_public', 'false', 'Publish the referrer leaderboard on the public site');

-- ---------------------------------------------------- helpful projections --
create or replace view property_scorecards as
select
  p.id,
  p.code,
  p.name,
  p.status,
  p.asking_rent,
  p.current_rent,
  case when p.vacant_since is null then 0 else (current_date - p.vacant_since) end as vacant_days,
  case when p.status = 'occupied' then coalesce(p.current_rent, 0) else 0 end as monthly_income,
  case when p.status <> 'occupied' then coalesce(p.asking_rent, 0) else 0 end as potential_monthly_income,
  (select count(*) from leads l where l.property_id = p.id) as lead_count,
  (select count(*) from viewings v where v.property_id = p.id) as viewing_count,
  (select coalesce(sum(rp.amount_due - rp.amount_paid), 0)
     from rental_payments rp where rp.property_id = p.id) as outstanding
from properties p;

-- ----------------------------------------------------- row level security --
alter table profiles            enable row level security;
alter table properties          enable row level security;
alter table property_images     enable row level security;
alter table property_documents  enable row level security;
alter table tenancies           enable row level security;
alter table rental_payments     enable row level security;
alter table leads               enable row level security;
alter table lead_activities     enable row level security;
alter table lead_followups      enable row level security;
alter table viewings            enable row level security;
alter table offers              enable row level security;
alter table referrers           enable row level security;
alter table referral_clicks     enable row level security;
alter table referral_attributions enable row level security;
alter table referral_rewards    enable row level security;
alter table campaigns           enable row level security;
alter table notifications       enable row level security;
alter table audit_logs          enable row level security;
alter table system_settings     enable row level security;

create or replace function current_role_name() returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

-- The public marketplace reads published listings anonymously.
create policy "public reads published properties" on properties
  for select using (published = true and status <> 'inactive');

create policy "public reads images of published properties" on property_images
  for select using (
    exists (select 1 from properties p where p.id = property_id and p.published)
  );

-- Staff read the whole portfolio; officers write their own assignments.
create policy "staff read properties" on properties
  for select to authenticated using (current_role_name() is not null);

create policy "managers write properties" on properties
  for all to authenticated
  using (current_role_name() in ('super_admin', 'property_manager') or officer_id = auth.uid())
  with check (current_role_name() in ('super_admin', 'property_manager') or officer_id = auth.uid());

-- Anyone may lodge an enquiry; only staff may read the pipeline.
create policy "anyone submits a lead" on leads for insert with check (true);

create policy "staff read leads" on leads
  for select to authenticated using (
    current_role_name() in ('super_admin', 'management', 'property_manager')
    or officer_id = auth.uid()
  );

create policy "staff update leads" on leads
  for update to authenticated using (
    current_role_name() in ('super_admin', 'property_manager') or officer_id = auth.uid()
  );

-- Referrers see only their own record and their own attributed leads.
create policy "referrer reads own record" on referrers
  for select to authenticated using (
    profile_id = auth.uid() or current_role_name() in ('super_admin', 'management', 'property_manager')
  );

create policy "referrer reads own attributions" on referral_attributions
  for select to authenticated using (
    exists (select 1 from referrers r where r.id = referrer_id and r.profile_id = auth.uid())
    or current_role_name() in ('super_admin', 'management', 'property_manager')
  );

create policy "finance reads rental" on rental_payments
  for select to authenticated using (
    current_role_name() in ('super_admin', 'management', 'finance_viewer', 'property_manager')
  );

create policy "staff read settings" on system_settings
  for select to authenticated using (current_role_name() is not null);

create policy "admin writes settings" on system_settings
  for all to authenticated using (current_role_name() = 'super_admin');
