import type { SystemSettings } from '@/lib/types';

export const settings: SystemSettings = {
  organisation: 'KO-PUSAKA',
  tagline: 'From Idle Assets to Active Income',
  whatsapp_number: '60138000000',
  contact_email: 'asset@kopusaka.demo',
  contact_phone: '+60 82-555 000',
  office_address: 'Wisma Pusaka, Jalan Tun Jugah, 93350 Kuching, Sarawak',
  attribution_window_days: 30,
  referral_policy_note:
    'Referral recognition and any incentive remain subject to KO-PUSAKA policy approval. No commission rate is fixed in the system until management determines it.',
  incentive_model: 'not_configured',
  incentive_value: null,
  leaderboard_public: false,
  vacancy_amber_days: 30,
  vacancy_red_days: 90,
  followup_stale_days: 3,
};

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://asset.kopusaka.my';
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? settings.whatsapp_number;
