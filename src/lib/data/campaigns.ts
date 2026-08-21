import type { Campaign } from '@/lib/types';
import { d } from '@/lib/dates';

export const campaigns: Campaign[] = [
  { id: 'cmp-0001', name: 'Facebook — Vacant Commercial Push', channel: 'facebook', utm: 'fb-vacant-commercial', start_date: d(-64), active: true, visitors: 1_842 },
  { id: 'cmp-0002', name: 'WhatsApp Broadcast — Member Network', channel: 'whatsapp', utm: 'wa-member-broadcast', start_date: d(-40), active: true, visitors: 963 },
  { id: 'cmp-0003', name: 'Referral Network', channel: 'referral', utm: 'referral-network', start_date: d(-186), active: true, visitors: 899 },
  { id: 'cmp-0004', name: 'Agent Partner Circulation', channel: 'agent', utm: 'agent-circulation', start_date: d(-120), active: true, visitors: 604 },
  { id: 'cmp-0005', name: 'Staff Share Drive', channel: 'staff', utm: 'staff-share', start_date: d(-92), active: true, visitors: 388 },
  { id: 'cmp-0006', name: 'Sarawak Property Expo Booth', channel: 'event', utm: 'expo-booth', start_date: d(-28), active: false, visitors: 271 },
  { id: 'cmp-0007', name: 'Newspaper & Radio Spot', channel: 'advertisement', utm: 'print-radio', start_date: d(-55), active: false, visitors: 194 },
  { id: 'cmp-0008', name: 'Organic Website', channel: 'website', utm: 'organic', start_date: d(-365), active: true, visitors: 2_410 },
];

export const campaignById = (id: string | null | undefined) =>
  campaigns.find((c) => c.id === id) ?? null;
