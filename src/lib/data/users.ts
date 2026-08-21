import type { AppUser } from '@/lib/types';
import { d } from '@/lib/dates';

export const users: AppUser[] = [
  {
    id: 'usr-0001',
    name: 'Datin Sri Norhayati Abdullah',
    email: 'norhayati@kopusaka.demo',
    phone: '+60 82-555 010',
    role: 'management',
    title: 'Chief Executive Officer',
    initials: 'NA',
    active: true,
    created_at: d(-900),
  },
  {
    id: 'usr-0002',
    name: 'Encik Zulkifli Hassan',
    email: 'zulkifli@kopusaka.demo',
    phone: '+60 82-555 011',
    role: 'super_admin',
    title: 'Head of Asset Management',
    initials: 'ZH',
    active: true,
    created_at: d(-880),
  },
  {
    id: 'usr-0003',
    name: 'Sarah Lim Mei Yin',
    email: 'sarah@kopusaka.demo',
    phone: '+60 13-800 2201',
    role: 'property_manager',
    title: 'Property Manager — Kuching Central',
    initials: 'SL',
    active: true,
    created_at: d(-640),
  },
  {
    id: 'usr-0004',
    name: 'Ahmad Faizal Rahman',
    email: 'faizal@kopusaka.demo',
    phone: '+60 13-800 2202',
    role: 'officer',
    title: 'Asset Officer — Samarahan & Serian',
    initials: 'AF',
    active: true,
    created_at: d(-520),
  },
  {
    id: 'usr-0005',
    name: 'Grace Anak Jugah',
    email: 'grace@kopusaka.demo',
    phone: '+60 13-800 2203',
    role: 'officer',
    title: 'Asset Officer — Northern Region',
    initials: 'GJ',
    active: true,
    created_at: d(-430),
  },
  {
    id: 'usr-0006',
    name: 'Mohd Ridzuan Bakar',
    email: 'ridzuan@kopusaka.demo',
    phone: '+60 13-800 2204',
    role: 'finance_viewer',
    title: 'Finance Executive',
    initials: 'MR',
    active: true,
    created_at: d(-380),
  },
];

export const userById = (id: string | null | undefined) =>
  users.find((u) => u.id === id) ?? null;

/** The signed-in demo persona per portal role switcher. */
export const DEMO_OFFICER_ID = 'usr-0004';
