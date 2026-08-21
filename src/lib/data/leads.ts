import type { Lead, LeadActivity, Offer, Viewing } from '@/lib/types';
import { d, dt } from '@/lib/dates';

export const leads: Lead[] = [
  {
    id: 'led-0001', code: 'L-2041', name: 'Jonathan Ting Chee Kiong', phone: '+60 12-880 4412', email: 'jonathan.ting@demo.my',
    company: 'Ting Logistics Sdn Bhd', property_id: 'prp-0008', interest: 'rent', preferred_contact: 'whatsapp',
    message: 'We are expanding our Bintulu distribution operation and need warehouse space with dock access. Could we arrange a site visit this week?',
    source: 'referral', campaign_id: 'cmp-0003', referrer_id: 'ref-0003', referral_code: 'KPS-C3078', officer_id: 'usr-0005',
    stage: 'new', estimated_value: 21_000, next_action: 'Call to qualify requirement and timeline', next_followup: d(0),
    last_interaction: d(0), created_at: d(0),
  },
  {
    id: 'led-0002', code: 'L-2040', name: 'Nurhaliza binti Ismail', phone: '+60 13-661 2205', email: 'nurhaliza@demo.my',
    company: null, property_id: 'prp-0006', interest: 'rent', preferred_contact: 'whatsapp',
    message: 'Interested to open a tuition centre on the first floor. What is the rental and is the layout open plan?',
    source: 'facebook', campaign_id: 'cmp-0001', referrer_id: null, referral_code: null, officer_id: 'usr-0004',
    stage: 'new', estimated_value: 4_800, next_action: 'Send floor plan and rental package', next_followup: d(0),
    last_interaction: d(0), created_at: d(0),
  },
  {
    id: 'led-0003', code: 'L-2039', name: 'Dr. Amirul Hakim', phone: '+60 19-773 8890', email: 'dr.amirul@demo.my',
    company: 'Klinik Amanah', property_id: 'prp-0004', interest: 'viewing', preferred_contact: 'phone',
    message: 'Looking for a corner retail lot for a new clinic branch. Please advise availability and viewing slots.',
    source: 'website', campaign_id: 'cmp-0008', referrer_id: null, referral_code: null, officer_id: 'usr-0003',
    stage: 'new', estimated_value: 8_800, next_action: 'Return call and offer two viewing slots', next_followup: d(1),
    last_interaction: d(-1), created_at: d(-1),
  },
  {
    id: 'led-0004', code: 'L-2036', name: 'Grace Wong Siew Fong', phone: '+60 16-224 7781', email: 'grace.wong@demo.my',
    company: 'Aromatica Café', property_id: 'prp-0014', interest: 'info', preferred_contact: 'email',
    message: 'Any upcoming heritage shoplot availability at the Waterfront? We are planning a second outlet for next year.',
    source: 'referral', campaign_id: 'cmp-0003', referrer_id: 'ref-0002', referral_code: 'KPS-B2041', officer_id: 'usr-0003',
    stage: 'contacted', estimated_value: 7_800, next_action: 'Share waitlist form and alternative units', next_followup: d(2),
    last_interaction: d(-2), created_at: d(-4),
  },
  {
    id: 'led-0005', code: 'L-2034', name: 'Mohd Syafiq bin Roslan', phone: '+60 11-2288 3390', email: 'syafiq.roslan@demo.my',
    company: 'Syafiq Hardware Trading', property_id: 'prp-0007', interest: 'rent', preferred_contact: 'whatsapp',
    message: 'Is the Sibu lot suitable for a hardware showroom? What is the negotiable rental for a three-year term?',
    source: 'whatsapp', campaign_id: 'cmp-0002', referrer_id: null, referral_code: null, officer_id: 'usr-0005',
    stage: 'contacted', estimated_value: 7_200, next_action: 'Send three-year term proposal', next_followup: d(-3),
    last_interaction: d(-6), created_at: d(-7),
  },
  {
    id: 'led-0006', code: 'L-2033', name: 'Chin Kah Wai', phone: '+60 12-440 9902', email: 'kahwai.chin@demo.my',
    company: null, property_id: 'prp-0012', interest: 'rent', preferred_contact: 'phone',
    message: 'Family of five relocating to Kuching for work. Is the Petra Jaya semi-D still available from next month?',
    source: 'website', campaign_id: 'cmp-0008', referrer_id: null, referral_code: null, officer_id: 'usr-0003',
    stage: 'contacted', estimated_value: 3_800, next_action: 'Confirm availability after current negotiation', next_followup: d(-1),
    last_interaction: d(-5), created_at: d(-8),
  },
  {
    id: 'led-0007', code: 'L-2031', name: 'Rebecca Anak Nyaring', phone: '+60 14-556 1123', email: 'rebecca.n@demo.my',
    company: 'Borneo Craft Collective', property_id: 'prp-0006', interest: 'rent', preferred_contact: 'whatsapp',
    message: 'We want the ground floor for a craft retail outlet serving the university crowd. Can the rental be staged for the first six months?',
    source: 'referral', campaign_id: 'cmp-0003', referrer_id: 'ref-0001', referral_code: 'KPS-A1023', officer_id: 'usr-0004',
    stage: 'qualified', estimated_value: 4_800, next_action: 'Prepare staged-rental proposal for approval', next_followup: d(1),
    last_interaction: d(-2), created_at: d(-12),
  },
  {
    id: 'led-0008', code: 'L-2029', name: 'Hafiz Danial bin Roslee', phone: '+60 17-330 4478', email: 'hafiz.danial@demo.my',
    company: 'Danial Energy Services', property_id: 'prp-0008', interest: 'rent', preferred_contact: 'email',
    message: 'Require covered warehouse and yard for O&G support equipment. Budget around RM20k monthly.',
    source: 'agent', campaign_id: 'cmp-0004', referrer_id: 'ref-0003', referral_code: 'KPS-C3078', officer_id: 'usr-0005',
    stage: 'qualified', estimated_value: 21_000, next_action: 'Site visit paperwork and yard measurements', next_followup: d(3),
    last_interaction: d(-3), created_at: d(-16),
  },
  {
    id: 'led-0009', code: 'L-2027', name: 'Lim Sze Ming', phone: '+60 12-770 6654', email: 'szeming.lim@demo.my',
    company: 'Sze Ming Advisory', property_id: 'prp-0009', interest: 'viewing', preferred_contact: 'whatsapp',
    message: 'Looking at the whole floor for an accounting practice of 20 staff. Viewing this week if possible.',
    source: 'website', campaign_id: 'cmp-0008', referrer_id: null, referral_code: null, officer_id: 'usr-0005',
    stage: 'viewing_scheduled', estimated_value: 11_500, next_action: 'Viewing today at 11:00 — bring layout plan', next_followup: d(0),
    last_interaction: d(-1), created_at: d(-9),
  },
  {
    id: 'led-0010', code: 'L-2026', name: 'Farah Adilah binti Yusof', phone: '+60 13-909 1187', email: 'farah.adilah@demo.my',
    company: 'Adilah Wellness', property_id: 'prp-0004', interest: 'viewing', preferred_contact: 'whatsapp',
    message: 'Wellness studio concept — need the corner lot with alfresco space. Available for viewing Saturday?',
    source: 'facebook', campaign_id: 'cmp-0001', referrer_id: null, referral_code: null, officer_id: 'usr-0003',
    stage: 'viewing_scheduled', estimated_value: 8_800, next_action: 'Viewing scheduled — confirm attendance', next_followup: d(2),
    last_interaction: d(-2), created_at: d(-14),
  },
  {
    id: 'led-0011', code: 'L-2024', name: 'Sanjay Kumar a/l Devan', phone: '+60 18-220 5567', email: 'sanjay.kumar@demo.my',
    company: 'SK Distribution', property_id: 'prp-0007', interest: 'rent', preferred_contact: 'phone',
    message: 'Viewed the Sibu lot. Interested but concerned about the strong-room taking up floor area.',
    source: 'referral', campaign_id: 'cmp-0003', referrer_id: 'ref-0002', referral_code: 'KPS-B2041', officer_id: 'usr-0005',
    stage: 'viewing_completed', estimated_value: 7_200, next_action: 'Quote cost of strong-room removal', next_followup: d(-4),
    last_interaction: d(-8), created_at: d(-21),
  },
  {
    id: 'led-0012', code: 'L-2023', name: 'Angela Chong Mei Fong', phone: '+60 16-889 3312', email: 'angela.chong@demo.my',
    company: 'Bright Steps Preschool', property_id: 'prp-0006', interest: 'rent', preferred_contact: 'whatsapp',
    message: 'Viewed the Samarahan shoplot. Need confirmation that a preschool licence is permitted on the first floor.',
    source: 'referral', campaign_id: 'cmp-0003', referrer_id: 'ref-0004', referral_code: 'KPS-D4102', officer_id: 'usr-0004',
    stage: 'viewing_completed', estimated_value: 4_800, next_action: 'Confirm change-of-use position with council', next_followup: d(1),
    last_interaction: d(-3), created_at: d(-24),
  },
  {
    id: 'led-0013', code: 'L-2021', name: 'Ir. Kelvin Sia Chong Hui', phone: '+60 12-338 2290', email: 'kelvin.sia@demo.my',
    company: 'Sia & Partners Engineering', property_id: 'prp-0004', interest: 'rent', preferred_contact: 'email',
    message: 'Offer submitted for the Saradise corner lot at RM8,200 with a two-month fit-out rent-free period.',
    source: 'referral', campaign_id: 'cmp-0003', referrer_id: 'ref-0001', referral_code: 'KPS-A1023', officer_id: 'usr-0003',
    stage: 'negotiation', estimated_value: 8_200, next_action: 'Counter at RM8,600 with one month rent-free', next_followup: d(0),
    last_interaction: d(-1), created_at: d(-30),
  },
  {
    id: 'led-0014', code: 'L-2019', name: 'Datuk Wilfred Ngau', phone: '+60 19-441 7788', email: 'wilfred.ngau@demo.my',
    company: 'Ngau Development Holdings', property_id: 'prp-0010', interest: 'buy', preferred_contact: 'phone',
    message: 'Evaluating the Jalan Song parcel for a retail row development. Requesting a soil report and title extract.',
    source: 'agent', campaign_id: 'cmp-0004', referrer_id: 'ref-0003', referral_code: 'KPS-C3078', officer_id: 'usr-0003',
    stage: 'negotiation', estimated_value: 3_500_000, next_action: 'Board paper for price approval', next_followup: d(-9),
    last_interaction: d(-9), created_at: d(-46),
  },
  {
    id: 'led-0015', code: 'L-2018', name: 'Michelle Tan Hui Xin', phone: '+60 11-3388 4420', email: 'michelle.tan@demo.my',
    company: 'Kopi & Co', property_id: 'prp-0015', interest: 'rent', preferred_contact: 'whatsapp',
    message: 'Interested in the Batu Kawah unit if the current tenant does not renew. Please keep us informed.',
    source: 'walk_in', campaign_id: null, referrer_id: null, referral_code: null, officer_id: 'usr-0004',
    stage: 'negotiation', estimated_value: 5_600, next_action: 'Revert once tenant arrears position is resolved', next_followup: d(4),
    last_interaction: d(-4), created_at: d(-38),
  },
  {
    id: 'led-0016', code: 'L-2016', name: 'Zainal Abidin bin Marzuki', phone: '+60 13-447 9901', email: 'zainal.abidin@demo.my',
    company: 'ZA Enterprise', property_id: 'prp-0011', interest: 'buy', preferred_contact: 'phone',
    message: 'Offer of RM1.15 million for the Serian land, subject to conversion approval.',
    source: 'advertisement', campaign_id: 'cmp-0007', referrer_id: null, referral_code: null, officer_id: 'usr-0004',
    stage: 'offer', estimated_value: 1_150_000, next_action: 'Table offer to management for decision', next_followup: d(2),
    last_interaction: d(-6), created_at: d(-58),
  },
  {
    id: 'led-0017', code: 'L-2014', name: 'Priscilla Ak Rentap', phone: '+60 14-880 2233', email: 'priscilla.r@demo.my',
    company: 'Rentap Trading', property_id: 'prp-0013', interest: 'rent', preferred_contact: 'whatsapp',
    message: 'Agreed terms for the Mukah shoplot. Ready to sign once the agreement is prepared.',
    source: 'referral', campaign_id: 'cmp-0003', referrer_id: 'ref-0004', referral_code: 'KPS-D4102', officer_id: 'usr-0005',
    stage: 'agreement', estimated_value: 3_200, next_action: 'Send tenancy agreement for signing', next_followup: d(1),
    last_interaction: d(-2), created_at: d(-64),
  },
  {
    id: 'led-0018', code: 'L-2009', name: 'Vincent Liew Chee Seng', phone: '+60 12-990 4471', email: 'vincent.liew@demo.my',
    company: 'Liew Fresh Mart', property_id: 'prp-0001', interest: 'rent', preferred_contact: 'phone',
    message: 'Tenancy concluded for the MetroCity shoplot.',
    source: 'referral', campaign_id: 'cmp-0003', referrer_id: 'ref-0001', referral_code: 'KPS-A1023', officer_id: 'usr-0003',
    stage: 'successful', estimated_value: 6_500, next_action: 'Tenancy active — monitor first-year performance', next_followup: null,
    last_interaction: d(-96), created_at: d(-142),
  },
  {
    id: 'led-0019', code: 'L-2007', name: 'Sharifah Nadia binti Wan Ali', phone: '+60 19-220 6678', email: 'sharifah.nadia@demo.my',
    company: 'Nadia Boutique Stay', property_id: 'prp-0014', interest: 'rent', preferred_contact: 'whatsapp',
    message: 'Tenancy concluded for the Waterfront heritage shoplot.',
    source: 'referral', campaign_id: 'cmp-0003', referrer_id: 'ref-0002', referral_code: 'KPS-B2041', officer_id: 'usr-0003',
    stage: 'successful', estimated_value: 7_800, next_action: 'Tenancy active — renewal review at month 10', next_followup: null,
    last_interaction: d(-118), created_at: d(-170),
  },
  {
    id: 'led-0020', code: 'L-2005', name: 'Brandon Chai Yew Ming', phone: '+60 16-771 3390', email: 'brandon.chai@demo.my',
    company: 'Chai Motors', property_id: 'prp-0011', interest: 'buy', preferred_contact: 'phone',
    message: 'Wanted the Serian land for a service centre but proceeded with an alternative site.',
    source: 'facebook', campaign_id: 'cmp-0001', referrer_id: null, referral_code: null, officer_id: 'usr-0004',
    stage: 'lost', estimated_value: 1_100_000, next_action: 'Closed — revisit in next financial year', next_followup: null,
    lost_reason: 'Bought a competing site closer to the town centre',
    last_interaction: d(-72), created_at: d(-110),
  },
];

export const viewings: Viewing[] = [
  { id: 'vwg-0001', lead_id: 'led-0009', property_id: 'prp-0009', scheduled_at: dt(0, 11), officer_id: 'usr-0005', status: 'scheduled', outcome: null },
  { id: 'vwg-0002', lead_id: 'led-0010', property_id: 'prp-0004', scheduled_at: dt(2, 10, 30), officer_id: 'usr-0003', status: 'scheduled', outcome: null },
  { id: 'vwg-0003', lead_id: 'led-0008', property_id: 'prp-0008', scheduled_at: dt(3, 14), officer_id: 'usr-0005', status: 'scheduled', outcome: null },
  { id: 'vwg-0004', lead_id: 'led-0011', property_id: 'prp-0007', scheduled_at: dt(-8, 15), officer_id: 'usr-0005', status: 'completed', outcome: 'Interested; raised concern on strong-room floor area' },
  { id: 'vwg-0005', lead_id: 'led-0012', property_id: 'prp-0006', scheduled_at: dt(-6, 9, 30), officer_id: 'usr-0004', status: 'completed', outcome: 'Positive; pending change-of-use confirmation' },
  { id: 'vwg-0006', lead_id: 'led-0013', property_id: 'prp-0004', scheduled_at: dt(-18, 16), officer_id: 'usr-0003', status: 'completed', outcome: 'Proceeded to offer' },
  { id: 'vwg-0007', lead_id: 'led-0014', property_id: 'prp-0010', scheduled_at: dt(-32, 10), officer_id: 'usr-0003', status: 'completed', outcome: 'Site walk with consultant; requested soil report' },
  { id: 'vwg-0008', lead_id: 'led-0017', property_id: 'prp-0013', scheduled_at: dt(-40, 11), officer_id: 'usr-0005', status: 'completed', outcome: 'Agreed terms verbally' },
  { id: 'vwg-0009', lead_id: 'led-0007', property_id: 'prp-0006', scheduled_at: dt(-5, 15, 30), officer_id: 'usr-0004', status: 'completed', outcome: 'Requested staged rental for first six months' },
];

export const offers: Offer[] = [
  { id: 'ofr-0001', lead_id: 'led-0013', property_id: 'prp-0004', kind: 'rent', amount: 8_200, submitted_at: d(-6), status: 'countered', notes: 'Requested two months rent-free for fit-out' },
  { id: 'ofr-0002', lead_id: 'led-0016', property_id: 'prp-0011', kind: 'sale', amount: 1_150_000, submitted_at: d(-6), status: 'pending', notes: 'Subject to land conversion approval' },
  { id: 'ofr-0003', lead_id: 'led-0014', property_id: 'prp-0010', kind: 'sale', amount: 3_500_000, submitted_at: d(-12), status: 'pending', notes: 'Below asking; board decision required' },
  { id: 'ofr-0004', lead_id: 'led-0017', property_id: 'prp-0013', kind: 'rent', amount: 3_200, submitted_at: d(-14), status: 'accepted', notes: 'Two-year term with one-year extension option' },
];

const handwritten: LeadActivity[] = [
  { id: 'act-h001', lead_id: 'led-0013', kind: 'note', summary: 'Management guidance received', detail: 'Head of Asset Management approves countering at RM8,600 with one month rent-free. Do not go below RM8,400.', actor: 'Sarah Lim Mei Yin', created_at: dt(-1, 9, 15) },
  { id: 'act-h002', lead_id: 'led-0014', kind: 'note', summary: 'Board paper drafted', detail: 'Valuation supports RM3.65m asking. Offer at RM3.50m tabled for the next management meeting.', actor: 'Sarah Lim Mei Yin', created_at: dt(-9, 14, 40) },
  { id: 'act-h003', lead_id: 'led-0005', kind: 'whatsapp', summary: 'Sent rental package', detail: 'Shared photos and the three-year indicative rental. No reply since.', actor: 'Grace Anak Jugah', created_at: dt(-6, 11, 5) },
  { id: 'act-h004', lead_id: 'led-0012', kind: 'call', summary: 'Council enquiry in progress', detail: 'Planning department to revert on first-floor preschool use within the week.', actor: 'Ahmad Faizal Rahman', created_at: dt(-3, 15, 20) },
  { id: 'act-h005', lead_id: 'led-0007', kind: 'note', summary: 'Staged rental request', detail: 'Proposes RM3,600 for months 1–6, then full RM4,800. Needs approval.', actor: 'Ahmad Faizal Rahman', created_at: dt(-2, 10, 10) },
  { id: 'act-h006', lead_id: 'led-0011', kind: 'email', summary: 'Awaiting contractor quotation', detail: 'Strong-room removal quotation requested from two contractors.', actor: 'Grace Anak Jugah', created_at: dt(-8, 16, 0) },
];

const stageStory: Record<string, string[]> = {
  contacted: ['First contact made'],
  qualified: ['First contact made', 'Requirement qualified'],
  viewing_scheduled: ['First contact made', 'Requirement qualified', 'Viewing scheduled'],
  viewing_completed: ['First contact made', 'Requirement qualified', 'Viewing scheduled', 'Viewing completed'],
  negotiation: ['First contact made', 'Requirement qualified', 'Viewing completed', 'Entered negotiation'],
  offer: ['First contact made', 'Requirement qualified', 'Viewing completed', 'Entered negotiation', 'Offer received'],
  agreement: ['First contact made', 'Requirement qualified', 'Viewing completed', 'Offer accepted', 'Agreement in preparation'],
  successful: ['First contact made', 'Viewing completed', 'Offer accepted', 'Agreement signed', 'Tenancy commenced'],
  lost: ['First contact made', 'Viewing completed', 'Marked as lost'],
};

/** Seeded timeline: an intake entry per lead, then the stage path it travelled. */
export const leadActivities: LeadActivity[] = [
  ...leads.flatMap((lead, index) => {
    const base: LeadActivity[] = [
      {
        id: `act-${lead.id}-0`,
        lead_id: lead.id,
        kind: 'created',
        summary:
          lead.source === 'referral'
            ? `Enquiry received via referral ${lead.referral_code}`
            : 'Enquiry received from the public website',
        detail: lead.message,
        actor: 'System',
        created_at: `${lead.created_at}T09:${`${(index * 7) % 60}`.padStart(2, '0')}:00.000Z`,
      },
    ];
    const story = stageStory[lead.stage] ?? [];
    const span = Math.max(1, Math.round((story.length + 1) / 2));
    story.forEach((summary, i) => {
      base.push({
        id: `act-${lead.id}-${i + 1}`,
        lead_id: lead.id,
        kind: i === 0 ? 'call' : summary.includes('Viewing') ? 'viewing' : 'stage_change',
        summary,
        actor: 'Officer',
        created_at: `${d(
          Math.min(
            0,
            Number(((new Date(`${lead.created_at}T00:00:00`).getTime() - new Date(`${d(0)}T00:00:00`).getTime()) / 86_400_000).toFixed(0)) +
              (i + 1) * span,
          ),
        )}T10:${`${(i * 11) % 60}`.padStart(2, '0')}:00.000Z`,
      });
    });
    return base;
  }),
  ...handwritten,
];

export const leadById = (id: string | null | undefined) => leads.find((l) => l.id === id) ?? null;
