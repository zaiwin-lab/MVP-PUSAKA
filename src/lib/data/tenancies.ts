import type { RentalPayment, Tenancy } from '@/lib/types';
import { d, period } from '@/lib/dates';

const doc = (name: string, kind: string, size: string) => ({ name, kind, size });

export const tenancies: Tenancy[] = [
  {
    id: 'tnc-0001', code: 'T-1041', property_id: 'prp-0001',
    tenant_name: 'Vincent Liew Chee Seng', tenant_company: 'Liew Fresh Mart Sdn Bhd',
    tenant_phone: '+60 12-990 4471', tenant_email: 'vincent.liew@demo.my',
    start_date: d(-92), end_date: d(273), monthly_rent: 6_500, deposit: 19_500,
    renewal_status: 'not_started', notes: 'Three-year term with a two-year extension option. Rental reviewed at year three.',
    documents: [doc('Tenancy Agreement (DEMO)', 'PDF', '1.8 MB'), doc('Inventory List', 'PDF', '420 KB')],
    status: 'active', created_at: d(-96),
  },
  {
    id: 'tnc-0002', code: 'T-1022', property_id: 'prp-0002',
    tenant_name: 'Marcus Chai Wei Kit', tenant_company: 'Chai & Associates Advisory',
    tenant_phone: '+60 12-338 5590', tenant_email: 'marcus.chai@demo.my',
    start_date: d(-706), end_date: d(24), monthly_rent: 9_800, deposit: 29_400,
    renewal_status: 'in_discussion', notes: 'Tenant has indicated interest in renewing for two years, subject to a rental review.',
    documents: [doc('Tenancy Agreement (DEMO)', 'PDF', '2.1 MB'), doc('Renewal Correspondence', 'PDF', '380 KB')],
    status: 'expiring', created_at: d(-712),
  },
  {
    id: 'tnc-0003', code: 'T-1008', property_id: 'prp-0003',
    tenant_name: 'Datuk Henry Lau Kim Seng', tenant_company: 'Sarawak Freight Solutions Sdn Bhd',
    tenant_phone: '+60 19-880 2200', tenant_email: 'henry.lau@demo.my',
    start_date: d(-390), end_date: d(410), monthly_rent: 17_500, deposit: 52_500,
    renewal_status: 'not_started', notes: 'Anchor industrial tenant. Rental fixed for the first three years.',
    documents: [doc('Tenancy Agreement (DEMO)', 'PDF', '2.6 MB'), doc('Fire Certificate', 'PDF', '640 KB')],
    status: 'active', created_at: d(-398),
  },
  {
    id: 'tnc-0004', code: 'T-1015', property_id: 'prp-0005',
    tenant_name: 'Nur Izzati binti Kamal', tenant_company: null,
    tenant_phone: '+60 13-220 7781', tenant_email: 'nurizzati@demo.my',
    start_date: d(-320), end_date: d(52), monthly_rent: 2_200, deposit: 6_600,
    renewal_status: 'not_started', notes: 'Family tenancy. Payment usually within the first week of the month; this month is outstanding.',
    documents: [doc('Tenancy Agreement (DEMO)', 'PDF', '1.4 MB')],
    status: 'expiring', created_at: d(-326),
  },
  {
    id: 'tnc-0005', code: 'T-1033', property_id: 'prp-0014',
    tenant_name: 'Sharifah Nadia binti Wan Ali', tenant_company: 'Nadia Boutique Stay',
    tenant_phone: '+60 19-220 6678', tenant_email: 'sharifah.nadia@demo.my',
    start_date: d(-118), end_date: d(58), monthly_rent: 7_800, deposit: 23_400,
    renewal_status: 'in_discussion', notes: 'Short first term agreed to test the heritage café concept. Trading well.',
    documents: [doc('Tenancy Agreement (DEMO)', 'PDF', '1.9 MB'), doc('Heritage Undertaking', 'PDF', '520 KB')],
    status: 'expiring', created_at: d(-124),
  },
  {
    id: 'tnc-0006', code: 'T-0996', property_id: 'prp-0015',
    tenant_name: 'Kong Ah Seng', tenant_company: 'Kong Seng Mini Market',
    tenant_phone: '+60 16-441 3390', tenant_email: 'kongahseng@demo.my',
    start_date: d(-560), end_date: d(83), monthly_rent: 5_600, deposit: 16_800,
    renewal_status: 'not_started', notes: 'Two months of rental outstanding. Recovery plan to be agreed before any renewal discussion.',
    documents: [doc('Tenancy Agreement (DEMO)', 'PDF', '1.6 MB'), doc('Reminder Letter 2 (DEMO)', 'PDF', '210 KB')],
    status: 'active', created_at: d(-568),
  },
  {
    id: 'tnc-0007', code: 'T-0902', property_id: 'prp-0006',
    tenant_name: 'Wong Chee Meng', tenant_company: 'Universiti Supplies Trading',
    tenant_phone: '+60 14-330 8812', tenant_email: 'cheemeng.wong@demo.my',
    start_date: d(-870), end_date: d(-142), monthly_rent: 4_500, deposit: 13_500,
    renewal_status: 'not_renewing', notes: 'Tenant relocated to a larger unit. Unit vacant since expiry — currently the longest vacancy in the portfolio.',
    documents: [doc('Tenancy Agreement (DEMO)', 'PDF', '1.5 MB'), doc('Handover Checklist', 'PDF', '300 KB')],
    status: 'expired', created_at: d(-878),
  },
  {
    id: 'tnc-0008', code: 'T-1052', property_id: 'prp-0013',
    tenant_name: 'Priscilla Ak Rentap', tenant_company: 'Rentap Trading',
    tenant_phone: '+60 14-880 2233', tenant_email: 'priscilla.r@demo.my',
    start_date: d(16), end_date: d(746), monthly_rent: 3_200, deposit: 9_600,
    renewal_status: 'not_started', notes: 'Agreement pending signature. Unit reserved and taken off the active marketing list.',
    documents: [doc('Draft Tenancy Agreement (DEMO)', 'PDF', '1.3 MB')],
    status: 'active', created_at: d(-4),
  },
];

/** Rental ledger for the current and previous three months. */
type Override = { paid?: number; status?: RentalPayment['status']; paidOffset?: number | null };
const overrides: Record<string, Override> = {
  // Kong Seng Mini Market — two months in arrears
  'tnc-0006:0': { paid: 0, status: 'outstanding', paidOffset: null },
  'tnc-0006:-1': { paid: 0, status: 'overdue', paidOffset: null },
  'tnc-0006:-2': { paid: 2_800, status: 'partial', paidOffset: -46 },
  // Tabuan terrace — current month not yet received
  'tnc-0004:0': { paid: 0, status: 'outstanding', paidOffset: null },
  // Waterfront — paid late last month
  'tnc-0005:-1': { paid: 7_800, status: 'paid', paidOffset: -19 },
  // Wisma Pusaka — current month partially settled
  'tnc-0002:0': { paid: 5_000, status: 'partial', paidOffset: -3 },
};

const ledgerTenancies = tenancies.filter((t) => t.status !== 'expired' && t.start_date <= d(0));

export const rentalPayments: RentalPayment[] = ledgerTenancies.flatMap((tenancy) =>
  [0, -1, -2, -3].map((offset) => {
    const key = `${tenancy.id}:${offset}`;
    const override = overrides[key];
    const dueDate = `${period(offset)}-07`;
    const paid = override?.paid ?? tenancy.monthly_rent;
    const status: RentalPayment['status'] = override?.status ?? 'paid';
    const paidOffset = override && 'paidOffset' in override ? override.paidOffset : offset * 30 + 3;
    return {
      id: `rnt-${tenancy.id}-${offset}`,
      tenancy_id: tenancy.id,
      property_id: tenancy.property_id,
      period: period(offset),
      amount_due: tenancy.monthly_rent,
      amount_paid: paid,
      due_date: dueDate,
      paid_date: paidOffset === null || paidOffset === undefined ? null : d(paidOffset),
      status,
      method: paid > 0 ? 'transfer' : null,
    };
  }),
);

export const tenancyById = (id: string | null | undefined) => tenancies.find((t) => t.id === id) ?? null;
export const tenancyByProperty = (propertyId: string) =>
  tenancies.find((t) => t.property_id === propertyId && t.status !== 'expired') ?? null;
