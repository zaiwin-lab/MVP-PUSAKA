import type {
  HealthStatus, IncentiveStatus, LeadSourceKey, LeadStage, PropertyStatus, ReferrerStatus, Role,
} from '@/lib/types';

export const propertyStatusLabel: Record<PropertyStatus, string> = {
  occupied: 'Occupied',
  vacant: 'Vacant',
  available_rent: 'Available for Rent',
  available_sale: 'Available for Sale',
  under_negotiation: 'Under Negotiation',
  reserved: 'Reserved',
  sold: 'Sold',
  inactive: 'Inactive',
};

export const propertyStatusTone: Record<PropertyStatus, 'emerald' | 'gold' | 'slate' | 'red' | 'blue'> = {
  occupied: 'emerald',
  vacant: 'red',
  available_rent: 'blue',
  available_sale: 'blue',
  under_negotiation: 'gold',
  reserved: 'gold',
  sold: 'slate',
  inactive: 'slate',
};

export const leadStages: LeadStage[] = [
  'new', 'contacted', 'qualified', 'viewing_scheduled', 'viewing_completed',
  'negotiation', 'offer', 'agreement', 'successful', 'lost',
];

export const leadStageLabel: Record<LeadStage, string> = {
  new: 'New Lead',
  contacted: 'Contacted',
  qualified: 'Qualified',
  viewing_scheduled: 'Viewing Scheduled',
  viewing_completed: 'Viewing Completed',
  negotiation: 'Negotiation',
  offer: 'Offer / Application',
  agreement: 'Agreement',
  successful: 'Successful',
  lost: 'Lost',
};

export const leadStageShort: Record<LeadStage, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  viewing_scheduled: 'Viewing Set',
  viewing_completed: 'Viewed',
  negotiation: 'Negotiation',
  offer: 'Offer',
  agreement: 'Agreement',
  successful: 'Won',
  lost: 'Lost',
};

export const leadSourceLabel: Record<LeadSourceKey, string> = {
  website: 'Website',
  referral: 'Referral',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  walk_in: 'Walk-in',
  agent: 'Agent',
  staff: 'Staff',
  event: 'Event',
  advertisement: 'Advertisement',
};

export const healthLabel: Record<HealthStatus, string> = {
  green: 'Healthy',
  amber: 'Needs Attention',
  red: 'Action Required',
};

export const referrerStatusLabel: Record<ReferrerStatus, string> = {
  pending: 'Pending Approval',
  approved: 'Approved',
  suspended: 'Suspended',
  deactivated: 'Deactivated',
};

export const incentiveStatusLabel: Record<IncentiveStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
  rejected: 'Rejected',
};

export const roleLabel: Record<Role, string> = {
  super_admin: 'Super Admin',
  management: 'Management',
  property_manager: 'Property Manager',
  officer: 'Officer',
  finance_viewer: 'Finance Viewer',
  referrer: 'Referrer',
};

export const badgeLabel: Record<string, string> = {
  featured: 'Featured',
  urgent_rent: 'Urgent to Rent',
  urgent_sale: 'Urgent to Sell',
  new_listing: 'New Listing',
  price_updated: 'Price Updated',
};

export const AVAILABLE_STATUSES: PropertyStatus[] = ['available_rent', 'available_sale', 'under_negotiation', 'reserved', 'vacant'];
export const OPEN_STAGES: LeadStage[] = ['new', 'contacted', 'qualified', 'viewing_scheduled', 'viewing_completed', 'negotiation', 'offer', 'agreement'];
