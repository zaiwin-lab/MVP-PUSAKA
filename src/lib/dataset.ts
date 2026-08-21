import type {
  AppUser, Campaign, Lead, LeadActivity, Offer, Property, Referrer, ReferralReward,
  RentalPayment, SystemSettings, Tenancy, Viewing,
} from '@/lib/types';
import { properties } from '@/lib/data/properties';
import { leads, leadActivities, offers, viewings } from '@/lib/data/leads';
import { rentalPayments, tenancies } from '@/lib/data/tenancies';
import { referrers } from '@/lib/data/referrers';
import { campaigns } from '@/lib/data/campaigns';
import { users } from '@/lib/data/users';
import { settings } from '@/lib/data/settings';
import { d } from '@/lib/dates';

export interface Dataset {
  properties: Property[];
  leads: Lead[];
  activities: LeadActivity[];
  viewings: Viewing[];
  offers: Offer[];
  tenancies: Tenancy[];
  payments: RentalPayment[];
  referrers: Referrer[];
  rewards: ReferralReward[];
  campaigns: Campaign[];
  users: AppUser[];
  settings: SystemSettings;
}

const rewards: ReferralReward[] = [
  {
    id: 'rwd-0001', referrer_id: 'ref-0001', lead_id: 'led-0018', property_id: 'prp-0001',
    deal_value: 6_500, incentive_amount: null, status: 'approved', recorded_at: d(-94),
    notes: 'Tenancy concluded. Incentive value pending policy determination.',
  },
  {
    id: 'rwd-0002', referrer_id: 'ref-0002', lead_id: 'led-0019', property_id: 'prp-0014',
    deal_value: 7_800, incentive_amount: null, status: 'pending', recorded_at: d(-116),
    notes: 'Awaiting management confirmation of the referral incentive framework.',
  },
];

/** The seeded starting point. The client store clones this and applies live changes on top. */
export function seedDataset(): Dataset {
  return {
    properties: properties.map((p) => ({ ...p })),
    leads: leads.map((l) => ({ ...l })),
    activities: leadActivities.map((a) => ({ ...a })),
    viewings: viewings.map((v) => ({ ...v })),
    offers: offers.map((o) => ({ ...o })),
    tenancies: tenancies.map((t) => ({ ...t })),
    payments: rentalPayments.map((r) => ({ ...r })),
    referrers: referrers.map((r) => ({ ...r })),
    rewards: rewards.map((r) => ({ ...r })),
    campaigns: campaigns.map((c) => ({ ...c })),
    users: users.map((u) => ({ ...u })),
    settings: { ...settings },
  };
}
