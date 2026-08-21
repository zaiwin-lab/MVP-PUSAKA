/**
 * KO-PUSAKA ASSET360 — domain model.
 *
 * These types mirror the Supabase schema in `supabase/schema.sql` one-for-one,
 * so swapping the seeded demo repository for real queries is a data-source
 * change only — no component touches storage directly.
 */

export type UUID = string;
export type ISODate = string; // YYYY-MM-DD

export type Role =
  | 'super_admin'
  | 'management'
  | 'property_manager'
  | 'officer'
  | 'finance_viewer'
  | 'referrer';

export interface AppUser {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  role: Role;
  title: string;
  initials: string;
  active: boolean;
  created_at: ISODate;
}

export type PropertyType =
  | 'Shoplot'
  | 'Office'
  | 'Commercial'
  | 'Residential'
  | 'Industrial'
  | 'Land'
  | 'Warehouse'
  | 'Other';

export type PropertyStatus =
  | 'occupied'
  | 'vacant'
  | 'available_rent'
  | 'available_sale'
  | 'under_negotiation'
  | 'reserved'
  | 'sold'
  | 'inactive';

export type ListingIntent = 'rent' | 'sale' | 'both' | 'none';

export type MarketingBadge =
  | 'featured'
  | 'urgent_rent'
  | 'urgent_sale'
  | 'new_listing'
  | 'price_updated';

export type HealthStatus = 'green' | 'amber' | 'red';

export interface Property {
  id: UUID;
  code: string; // KPS-P-001
  slug: string; // metrocity-commercial-shoplot-kuching
  name: string;
  address: string;
  location: string; // Kuching, Sarawak
  district: string;
  lat: number;
  lng: number;
  type: PropertyType;
  description: string;
  highlights: string[];
  facilities: string[];
  images: string[]; // seeded generator keys — swap for Supabase Storage URLs
  documents: { name: string; kind: string; size: string }[];
  officer_id: UUID;

  // financial
  asset_value: number;
  sale_price: number | null;
  asking_rent: number | null; // monthly
  current_rent: number | null; // monthly, if occupied
  deposit: number | null;

  // physical
  floor_size_sqft: number;
  land_size_sqft: number | null;
  bedrooms?: number;
  bathrooms?: number;
  car_parks?: number;

  // state
  status: PropertyStatus;
  listing_intent: ListingIntent;
  published: boolean;
  badges: MarketingBadge[];
  date_listed: ISODate | null;
  vacant_since: ISODate | null;
  last_marketing_activity: ISODate | null;
  next_action: string;
  next_action_due: ISODate | null;
  updated_at: ISODate;
  created_at: ISODate;
}

export interface Tenancy {
  id: UUID;
  code: string;
  property_id: UUID;
  tenant_name: string;
  tenant_company: string | null;
  tenant_phone: string;
  tenant_email: string;
  start_date: ISODate;
  end_date: ISODate;
  monthly_rent: number;
  deposit: number;
  renewal_status: 'not_started' | 'in_discussion' | 'renewing' | 'not_renewing' | 'expired';
  notes: string;
  documents: { name: string; kind: string; size: string }[];
  status: 'active' | 'expiring' | 'expired' | 'terminated';
  created_at: ISODate;
}

export interface RentalPayment {
  id: UUID;
  tenancy_id: UUID;
  property_id: UUID;
  period: string; // YYYY-MM
  amount_due: number;
  amount_paid: number;
  due_date: ISODate;
  paid_date: ISODate | null;
  status: 'paid' | 'partial' | 'outstanding' | 'overdue';
  method: 'transfer' | 'cheque' | 'cash' | null;
}

export type LeadStage =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'viewing_scheduled'
  | 'viewing_completed'
  | 'negotiation'
  | 'offer'
  | 'agreement'
  | 'successful'
  | 'lost';

export type LeadInterest = 'rent' | 'buy' | 'viewing' | 'info';
export type ContactMethod = 'whatsapp' | 'phone' | 'email';

export interface Lead {
  id: UUID;
  code: string;
  name: string;
  phone: string;
  email: string;
  company: string | null;
  property_id: UUID | null;
  interest: LeadInterest;
  preferred_contact: ContactMethod;
  message: string;
  source: LeadSourceKey;
  campaign_id: UUID | null;
  referrer_id: UUID | null;
  referral_code: string | null;
  officer_id: UUID | null;
  stage: LeadStage;
  estimated_value: number; // monthly rent or sale value in play
  next_action: string;
  next_followup: ISODate | null;
  last_interaction: ISODate;
  lost_reason?: string;
  created_at: ISODate;
}

export type LeadSourceKey =
  | 'website'
  | 'referral'
  | 'whatsapp'
  | 'facebook'
  | 'walk_in'
  | 'agent'
  | 'staff'
  | 'event'
  | 'advertisement';

export type ActivityKind =
  | 'note'
  | 'call'
  | 'whatsapp'
  | 'email'
  | 'viewing'
  | 'stage_change'
  | 'offer'
  | 'assignment'
  | 'created';

export interface LeadActivity {
  id: UUID;
  lead_id: UUID;
  kind: ActivityKind;
  summary: string;
  detail?: string;
  actor: string;
  created_at: string; // ISO datetime
}

export interface Viewing {
  id: UUID;
  lead_id: UUID;
  property_id: UUID;
  scheduled_at: string; // ISO datetime
  officer_id: UUID;
  status: 'scheduled' | 'completed' | 'no_show' | 'cancelled';
  outcome: string | null;
}

export interface Offer {
  id: UUID;
  lead_id: UUID;
  property_id: UUID;
  kind: 'rent' | 'sale';
  amount: number;
  submitted_at: ISODate;
  status: 'pending' | 'accepted' | 'countered' | 'rejected';
  notes: string;
}

export type ReferrerStatus = 'pending' | 'approved' | 'suspended' | 'deactivated';

export interface Referrer {
  id: UUID;
  code: string; // KPS-A1023
  name: string;
  id_number: string; // masked placeholder
  organisation: string | null;
  phone: string;
  email: string;
  occupation: string;
  referrer_type: 'staff' | 'member' | 'partner' | 'agent' | 'public';
  bank_placeholder: string | null;
  status: ReferrerStatus;
  approved_at: ISODate | null;
  approved_by: string | null;
  created_at: ISODate;
  clicks: number;
  unique_visitors: number;
}

export interface ReferralAttribution {
  id: UUID;
  referrer_id: UUID;
  lead_id: UUID;
  property_id: UUID | null;
  captured_at: ISODate;
  outcome: 'open' | 'qualified' | 'viewing' | 'deal' | 'lost';
}

export type IncentiveStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface ReferralReward {
  id: UUID;
  referrer_id: UUID;
  lead_id: UUID;
  property_id: UUID;
  deal_value: number;
  incentive_amount: number | null; // null until policy is set by KO-PUSAKA
  status: IncentiveStatus;
  recorded_at: ISODate;
  notes: string;
}

export interface Campaign {
  id: UUID;
  name: string;
  channel: LeadSourceKey;
  utm: string;
  start_date: ISODate;
  active: boolean;
  visitors: number;
}

export type NotificationKind =
  | 'new_lead'
  | 'lead_assigned'
  | 'followup_overdue'
  | 'viewing_upcoming'
  | 'offer_received'
  | 'tenancy_expiring'
  | 'rental_overdue'
  | 'referral_conversion'
  | 'vacancy_alert';

export interface AppNotification {
  id: UUID;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  severity: 'info' | 'warning' | 'critical';
  audience: Role[];
  read: boolean;
  created_at: string;
}

export interface SystemSettings {
  organisation: string;
  tagline: string;
  whatsapp_number: string;
  contact_email: string;
  contact_phone: string;
  office_address: string;
  attribution_window_days: number;
  referral_policy_note: string;
  incentive_model: 'not_configured' | 'fixed' | 'percentage';
  incentive_value: number | null;
  leaderboard_public: boolean;
  vacancy_amber_days: number;
  vacancy_red_days: number;
  followup_stale_days: number;
}
