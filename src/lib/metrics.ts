import type { Dataset } from '@/lib/dataset';
import type {
  HealthStatus, Lead, LeadStage, Property, PropertyType, Tenancy,
} from '@/lib/types';
import { d, daysBetween, daysUntil, period, periodLabel } from '@/lib/dates';
import { OPEN_STAGES } from '@/lib/labels';

/* ------------------------------------------------------------------ */
/* Property-level derivations                                          */
/* ------------------------------------------------------------------ */

export const isVacant = (p: Property) =>
  ['vacant', 'available_rent', 'available_sale', 'under_negotiation', 'reserved'].includes(p.status);

export const isIncomeProducing = (p: Property) => p.status === 'occupied' && !!p.current_rent;

export const vacantDays = (p: Property) => (p.vacant_since ? Math.max(0, daysBetween(p.vacant_since)) : 0);

export const potentialMonthlyRent = (p: Property) => (isVacant(p) ? p.asking_rent ?? 0 : 0);

export function leadsForProperty(data: Dataset, propertyId: string) {
  return data.leads.filter((l) => l.property_id === propertyId);
}

export function enquiriesThisMonth(data: Dataset, propertyId: string) {
  const current = period(0);
  return data.leads.filter((l) => l.property_id === propertyId && l.created_at.startsWith(current)).length;
}

export interface PropertyScorecard {
  property: Property;
  vacantDays: number;
  leads: number;
  leadsThisMonth: number;
  viewings: number;
  offers: number;
  tenancy: Tenancy | null;
  outstanding: number;
  monthlyIncome: number;
  potentialMonthlyIncome: number;
  daysSinceMarketing: number | null;
  health: HealthStatus;
  healthReasons: string[];
}

export function scorecard(data: Dataset, property: Property): PropertyScorecard {
  const propertyLeads = leadsForProperty(data, property.id);
  const tenancy =
    data.tenancies.find((t) => t.property_id === property.id && t.status !== 'expired' && t.status !== 'terminated') ?? null;
  const outstanding = data.payments
    .filter((p) => p.property_id === property.id)
    .reduce((sum, p) => sum + Math.max(0, p.amount_due - p.amount_paid), 0);
  const days = vacantDays(property);
  const daysSinceMarketing = property.last_marketing_activity ? daysBetween(property.last_marketing_activity) : null;
  const reasons: string[] = [];
  let health: HealthStatus = 'green';

  if (isVacant(property)) {
    if (days > data.settings.vacancy_red_days) {
      health = 'red';
      reasons.push(`Vacant for ${days} days`);
    } else if (days > data.settings.vacancy_amber_days) {
      health = 'amber';
      reasons.push(`Vacant for ${days} days`);
    }
    if (daysSinceMarketing !== null && daysSinceMarketing > 30) {
      health = health === 'red' ? 'red' : 'amber';
      reasons.push(`No marketing activity for ${daysSinceMarketing} days`);
    }
    if (propertyLeads.length === 0) {
      health = 'red';
      reasons.push('No enquiries received');
    }
  }

  if (outstanding > 0) {
    health = outstanding >= (property.current_rent ?? 0) * 2 ? 'red' : health === 'red' ? 'red' : 'amber';
    reasons.push(`Rental outstanding of RM${outstanding.toLocaleString('en-MY')}`);
  }

  if (tenancy) {
    const until = daysUntil(tenancy.end_date);
    if (until < 0) {
      health = 'red';
      reasons.push('Tenancy expired');
    } else if (until <= 60) {
      health = health === 'red' ? 'red' : 'amber';
      reasons.push(`Tenancy expires in ${until} days`);
    }
  }

  if (property.next_action_due && daysBetween(property.next_action_due) > 0 && property.status !== 'occupied') {
    health = health === 'red' ? 'red' : 'amber';
    reasons.push('Next action overdue');
  }

  if (reasons.length === 0) reasons.push('Performing — income current, no action outstanding');

  return {
    property,
    vacantDays: days,
    leads: propertyLeads.length,
    leadsThisMonth: enquiriesThisMonth(data, property.id),
    viewings: data.viewings.filter((v) => v.property_id === property.id).length,
    offers: data.offers.filter((o) => o.property_id === property.id).length,
    tenancy,
    outstanding,
    monthlyIncome: isIncomeProducing(property) ? property.current_rent ?? 0 : 0,
    potentialMonthlyIncome: potentialMonthlyRent(property),
    daysSinceMarketing,
    health,
    healthReasons: reasons,
  };
}

export function scorecards(data: Dataset) {
  return data.properties.map((p) => scorecard(data, p));
}

/* ------------------------------------------------------------------ */
/* Rental income                                                       */
/* ------------------------------------------------------------------ */

export function rentalSummary(data: Dataset) {
  const current = period(0);
  const currentRows = data.payments.filter((p) => p.period === current);
  const expected = currentRows.reduce((s, p) => s + p.amount_due, 0);
  const collected = currentRows.reduce((s, p) => s + p.amount_paid, 0);
  const outstandingAll = data.payments.reduce((s, p) => s + Math.max(0, p.amount_due - p.amount_paid), 0);
  const monthlyIncome = data.properties.reduce((s, p) => s + (isIncomeProducing(p) ? p.current_rent ?? 0 : 0), 0);
  const potentialMonthly = data.properties.reduce((s, p) => s + potentialMonthlyRent(p), 0);
  return {
    expected,
    collected,
    outstanding: expected - collected,
    outstandingAll,
    collectionRate: expected ? (collected / expected) * 100 : 100,
    monthlyIncome,
    annualisedIncome: monthlyIncome * 12,
    potentialMonthly,
    potentialAnnual: potentialMonthly * 12,
  };
}

export function rentalTrend(data: Dataset) {
  return [-5, -4, -3, -2, -1, 0].map((offset) => {
    const key = period(offset);
    const rows = data.payments.filter((p) => p.period === key);
    // Months outside the seeded ledger fall back to the portfolio's contracted rent.
    const contracted = data.tenancies
      .filter((t) => t.status !== 'expired' && t.start_date <= `${key}-28`)
      .reduce((s, t) => s + t.monthly_rent, 0);
    const expected = rows.length ? rows.reduce((s, p) => s + p.amount_due, 0) : contracted;
    const collected = rows.length ? rows.reduce((s, p) => s + p.amount_paid, 0) : Math.round(contracted * 0.96);
    return { month: periodLabel(key), key, expected, collected };
  });
}

export function rentalByType(data: Dataset) {
  const map = new Map<PropertyType, { type: PropertyType; income: number; potential: number }>();
  data.properties.forEach((p) => {
    const row = map.get(p.type) ?? { type: p.type, income: 0, potential: 0 };
    row.income += isIncomeProducing(p) ? p.current_rent ?? 0 : 0;
    row.potential += potentialMonthlyRent(p);
    map.set(p.type, row);
  });
  return [...map.values()].sort((a, b) => b.income + b.potential - (a.income + a.potential));
}

/* ------------------------------------------------------------------ */
/* Portfolio KPIs                                                      */
/* ------------------------------------------------------------------ */

export function portfolioKpis(data: Dataset) {
  const cards = scorecards(data);
  const total = data.properties.length;
  const occupied = data.properties.filter((p) => p.status === 'occupied').length;
  const vacant = data.properties.filter((p) => isVacant(p)).length;
  const forRent = data.properties.filter((p) => p.listing_intent === 'rent' || p.listing_intent === 'both').length;
  const forSale = data.properties.filter((p) => p.listing_intent === 'sale' || p.listing_intent === 'both').length;
  const rental = rentalSummary(data);
  const openLeads = data.leads.filter((l) => OPEN_STAGES.includes(l.stage));
  const current = period(0);

  return {
    totalProperties: total,
    portfolioValue: data.properties.reduce((s, p) => s + p.asset_value, 0),
    occupied,
    vacant,
    forRent,
    forSale,
    occupancyRate: total ? (occupied / total) * 100 : 0,
    monthlyIncome: rental.monthlyIncome,
    annualisedIncome: rental.annualisedIncome,
    outstanding: rental.outstandingAll,
    collectionRate: rental.collectionRate,
    potentialMonthly: rental.potentialMonthly,
    potentialAnnual: rental.potentialAnnual,
    activeLeads: openLeads.length,
    newLeads: data.leads.filter((l) => l.stage === 'new').length,
    newLeadsThisMonth: data.leads.filter((l) => l.created_at.startsWith(current)).length,
    viewings: data.viewings.filter((v) => v.status === 'scheduled').length,
    negotiations: data.leads.filter((l) => ['negotiation', 'offer'].includes(l.stage)).length,
    successful: data.leads.filter((l) => l.stage === 'successful').length,
    referralLeads: data.leads.filter((l) => l.referrer_id).length,
    vacant30: cards.filter((c) => isVacant(c.property) && c.vacantDays > 30).length,
    vacant90: cards.filter((c) => isVacant(c.property) && c.vacantDays > 90).length,
    tenanciesExpiring: data.tenancies.filter(
      (t) => t.status !== 'expired' && daysUntil(t.end_date) >= 0 && daysUntil(t.end_date) <= 90,
    ).length,
    health: {
      green: cards.filter((c) => c.health === 'green').length,
      amber: cards.filter((c) => c.health === 'amber').length,
      red: cards.filter((c) => c.health === 'red').length,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Leads                                                               */
/* ------------------------------------------------------------------ */

export const isOpen = (lead: Lead) => OPEN_STAGES.includes(lead.stage);

export function followupBuckets(data: Dataset, officerId?: string) {
  const pool = data.leads.filter((l) => isOpen(l) && (!officerId || l.officer_id === officerId));
  const dueToday = pool.filter((l) => l.next_followup === d(0));
  const overdue = pool.filter((l) => l.next_followup && daysBetween(l.next_followup) > 0);
  const stale = pool.filter((l) => daysBetween(l.last_interaction) > data.settings.followup_stale_days);
  const viewingsToday = data.viewings.filter(
    (v) => v.status === 'scheduled' && v.scheduled_at.slice(0, 10) === d(0) && (!officerId || v.officer_id === officerId),
  );
  const negotiationPending = pool.filter(
    (l) => ['negotiation', 'offer'].includes(l.stage) && daysBetween(l.last_interaction) >= 7,
  );
  return { pool, dueToday, overdue, stale, viewingsToday, negotiationPending };
}

export function funnel(data: Dataset) {
  const groups: { stage: LeadStage; label: string; count: number }[] = [
    { stage: 'new', label: 'New', count: 0 },
    { stage: 'contacted', label: 'Contacted', count: 0 },
    { stage: 'qualified', label: 'Qualified', count: 0 },
    { stage: 'viewing_scheduled', label: 'Viewing', count: 0 },
    { stage: 'negotiation', label: 'Negotiation', count: 0 },
    { stage: 'successful', label: 'Successful', count: 0 },
  ];
  const bucket: Record<LeadStage, number> = {
    new: 0, contacted: 1, qualified: 2, viewing_scheduled: 3, viewing_completed: 3,
    negotiation: 4, offer: 4, agreement: 4, successful: 5, lost: -1,
  };
  data.leads.forEach((l) => {
    const index = bucket[l.stage];
    if (index >= 0) for (let i = 0; i <= index; i += 1) groups[i].count += 1;
  });
  return groups;
}

export function pipelineValue(data: Dataset) {
  return data.leads
    .filter((l) => ['negotiation', 'offer', 'agreement'].includes(l.stage))
    .reduce((s, l) => s + (l.estimated_value > 100_000 ? l.estimated_value : l.estimated_value * 12), 0);
}

export function sourcePerformance(data: Dataset) {
  const map = new Map<string, { source: string; leads: number; qualified: number; deals: number }>();
  data.leads.forEach((l) => {
    const row = map.get(l.source) ?? { source: l.source, leads: 0, qualified: 0, deals: 0 };
    row.leads += 1;
    if (!['new', 'contacted', 'lost'].includes(l.stage)) row.qualified += 1;
    if (l.stage === 'successful') row.deals += 1;
    map.set(l.source, row);
  });
  return [...map.values()].sort((a, b) => b.leads - a.leads);
}

/* ------------------------------------------------------------------ */
/* Referral engine                                                     */
/* ------------------------------------------------------------------ */

export function referrerStats(data: Dataset, referrerId: string) {
  const attributed = data.leads.filter((l) => l.referrer_id === referrerId);
  const referrer = data.referrers.find((r) => r.id === referrerId);
  const qualified = attributed.filter((l) => !['new', 'contacted', 'lost'].includes(l.stage));
  const viewings = data.viewings.filter((v) => attributed.some((l) => l.id === v.lead_id));
  const deals = attributed.filter((l) => l.stage === 'successful');
  const clicks = referrer?.clicks ?? 0;
  return {
    referrer,
    clicks,
    uniqueVisitors: referrer?.unique_visitors ?? 0,
    enquiries: attributed.length,
    qualified: qualified.length,
    viewings: viewings.length,
    negotiations: attributed.filter((l) => ['negotiation', 'offer', 'agreement'].includes(l.stage)).length,
    deals: deals.length,
    conversionRate: attributed.length ? (deals.length / attributed.length) * 100 : 0,
    clickToEnquiry: clicks ? (attributed.length / clicks) * 100 : 0,
    leads: attributed,
    rewards: data.rewards.filter((r) => r.referrer_id === referrerId),
  };
}

export function leaderboard(data: Dataset) {
  return data.referrers
    .filter((r) => r.status === 'approved')
    .map((r) => ({ ...referrerStats(data, r.id), referrer: r }))
    .sort((a, b) => b.deals - a.deals || b.qualified - a.qualified || b.enquiries - a.enquiries);
}

export function referralSummary(data: Dataset) {
  const board = leaderboard(data);
  return {
    activeReferrers: data.referrers.filter((r) => r.status === 'approved').length,
    pendingReferrers: data.referrers.filter((r) => r.status === 'pending').length,
    clicks: board.reduce((s, r) => s + r.clicks, 0),
    enquiries: board.reduce((s, r) => s + r.enquiries, 0),
    qualified: board.reduce((s, r) => s + r.qualified, 0),
    deals: board.reduce((s, r) => s + r.deals, 0),
    board,
  };
}

/* ------------------------------------------------------------------ */
/* Idle assets and the action centre                                   */
/* ------------------------------------------------------------------ */

export function idleAssets(data: Dataset) {
  return scorecards(data)
    .filter((c) => isVacant(c.property))
    .sort((a, b) => b.vacantDays - a.vacantDays);
}

export interface ActionAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  href: string;
  cta: string;
  metric?: string;
}

export function actionAlerts(data: Dataset): ActionAlert[] {
  const alerts: ActionAlert[] = [];
  const cards = scorecards(data);
  const rental = rentalSummary(data);
  const buckets = followupBuckets(data);

  const vacant90 = cards.filter((c) => isVacant(c.property) && c.vacantDays > 90);
  if (vacant90.length) {
    alerts.push({
      id: 'vacant-90',
      severity: 'critical',
      title: `${vacant90.length} ${vacant90.length === 1 ? 'property has' : 'properties have'} been vacant for more than 90 days`,
      detail: vacant90.map((c) => `${c.property.name} (${c.vacantDays} days)`).join(' · '),
      href: '/portal/idle-assets',
      cta: 'Open idle asset watchlist',
      metric: `${vacant90.length}`,
    });
  }

  if (rental.potentialMonthly > 0) {
    alerts.push({
      id: 'unrealised-income',
      severity: 'critical',
      title: `RM${rental.potentialMonthly.toLocaleString('en-MY')} potential monthly rental remains unrealised`,
      detail: `Annualised, that is RM${rental.potentialAnnual.toLocaleString('en-MY')} of income the portfolio is not yet earning.`,
      href: '/portal/idle-assets',
      cta: 'See the assets behind this figure',
      metric: `RM${(rental.potentialMonthly / 1000).toFixed(1)}k`,
    });
  }

  if (buckets.overdue.length) {
    alerts.push({
      id: 'overdue-followups',
      severity: 'critical',
      title: `${buckets.overdue.length} leads have not been followed up`,
      detail: 'Follow-up dates have passed without a recorded interaction.',
      href: '/portal/leads?filter=overdue',
      cta: 'Open overdue follow-ups',
      metric: `${buckets.overdue.length}`,
    });
  }

  const expiring = data.tenancies.filter(
    (t) => t.status !== 'expired' && daysUntil(t.end_date) >= 0 && daysUntil(t.end_date) <= 60,
  );
  if (expiring.length) {
    alerts.push({
      id: 'tenancies-expiring',
      severity: 'warning',
      title: `${expiring.length} tenancies expire within 60 days`,
      detail: expiring
        .map((t) => `${data.properties.find((p) => p.id === t.property_id)?.name ?? 'Property'} — ${daysUntil(t.end_date)} days`)
        .join(' · '),
      href: '/portal/tenancies',
      cta: 'Start renewal action',
      metric: `${expiring.length}`,
    });
  }

  const noEnquiries = cards.filter((c) => isVacant(c.property) && c.leadsThisMonth === 0);
  if (noEnquiries.length) {
    alerts.push({
      id: 'no-enquiries',
      severity: 'warning',
      title: `${noEnquiries.length} available properties received zero enquiries this month`,
      detail: noEnquiries.map((c) => c.property.name).join(' · '),
      href: '/portal/properties?filter=available',
      cta: 'Review marketing activity',
      metric: `${noEnquiries.length}`,
    });
  }

  if (buckets.negotiationPending.length) {
    alerts.push({
      id: 'stalled-negotiations',
      severity: 'warning',
      title: `${buckets.negotiationPending.length} negotiations have had no activity for 7 days`,
      detail: buckets.negotiationPending.map((l) => `${l.name} — ${l.next_action}`).join(' · '),
      href: '/portal/leads?filter=negotiation',
      cta: 'Push negotiations forward',
      metric: `${buckets.negotiationPending.length}`,
    });
  }

  const arrears = cards.filter((c) => c.outstanding > 0);
  if (arrears.length) {
    const total = arrears.reduce((s, c) => s + c.outstanding, 0);
    alerts.push({
      id: 'rental-arrears',
      severity: 'critical',
      title: `RM${total.toLocaleString('en-MY')} of rental is outstanding across ${arrears.length} properties`,
      detail: arrears.map((c) => `${c.property.name} — RM${c.outstanding.toLocaleString('en-MY')}`).join(' · '),
      href: '/portal/rental?filter=outstanding',
      cta: 'Open rental collection',
      metric: `RM${(total / 1000).toFixed(1)}k`,
    });
  }

  const staleMarketing = cards.filter(
    (c) => isVacant(c.property) && c.daysSinceMarketing !== null && c.daysSinceMarketing > 30,
  );
  if (staleMarketing.length) {
    alerts.push({
      id: 'stale-marketing',
      severity: 'info',
      title: `${staleMarketing.length} available properties have had no marketing activity for over 30 days`,
      detail: staleMarketing
        .map((c) => `${c.property.name} — ${c.daysSinceMarketing} days`)
        .join(' · '),
      href: '/portal/properties?filter=available',
      cta: 'Refresh listings and share',
      metric: `${staleMarketing.length}`,
    });
  }

  const pendingReferrers = data.referrers.filter((r) => r.status === 'pending');
  if (pendingReferrers.length) {
    alerts.push({
      id: 'pending-referrers',
      severity: 'info',
      title: `${pendingReferrers.length} referrer ${pendingReferrers.length === 1 ? 'application is' : 'applications are'} awaiting approval`,
      detail: pendingReferrers.map((r) => `${r.name} — ${r.organisation ?? r.occupation}`).join(' · '),
      href: '/portal/referrers?filter=pending',
      cta: 'Review applications',
      metric: `${pendingReferrers.length}`,
    });
  }

  const order = { critical: 0, warning: 1, info: 2 } as const;
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export function notifications(data: Dataset) {
  const buckets = followupBuckets(data);
  const items = [
    ...data.leads
      .filter((l) => l.stage === 'new')
      .map((l) => ({
        id: `ntf-lead-${l.id}`,
        kind: 'new_lead' as const,
        title: `New enquiry from ${l.name}`,
        body: `${data.properties.find((p) => p.id === l.property_id)?.name ?? 'General enquiry'} · ${
          l.referral_code ? `referral ${l.referral_code}` : l.source
        }`,
        href: `/portal/leads/${l.id}`,
        severity: 'info' as const,
        created_at: `${l.created_at}T09:00:00.000Z`,
      })),
    ...buckets.overdue.map((l) => ({
      id: `ntf-overdue-${l.id}`,
      kind: 'followup_overdue' as const,
      title: `Follow-up overdue — ${l.name}`,
      body: l.next_action,
      href: `/portal/leads/${l.id}`,
      severity: 'critical' as const,
      created_at: `${l.next_followup}T08:00:00.000Z`,
    })),
    ...buckets.viewingsToday.map((v) => ({
      id: `ntf-viewing-${v.id}`,
      kind: 'viewing_upcoming' as const,
      title: `Viewing today — ${data.properties.find((p) => p.id === v.property_id)?.name ?? ''}`,
      body: `With ${data.leads.find((l) => l.id === v.lead_id)?.name ?? 'prospect'}`,
      href: `/portal/leads/${v.lead_id}`,
      severity: 'warning' as const,
      created_at: v.scheduled_at,
    })),
    ...data.tenancies
      .filter((t) => t.status !== 'expired' && daysUntil(t.end_date) >= 0 && daysUntil(t.end_date) <= 90)
      .map((t) => ({
        id: `ntf-tenancy-${t.id}`,
        kind: 'tenancy_expiring' as const,
        title: `Tenancy expires in ${daysUntil(t.end_date)} days`,
        body: `${data.properties.find((p) => p.id === t.property_id)?.name ?? ''} — ${t.tenant_company ?? t.tenant_name}`,
        href: '/portal/tenancies',
        severity: (daysUntil(t.end_date) <= 30 ? 'critical' : 'warning') as 'critical' | 'warning',
        created_at: `${d(-1)}T08:00:00.000Z`,
      })),
    ...data.payments
      .filter((p) => p.status === 'overdue' || (p.status === 'outstanding' && daysBetween(p.due_date) > 0))
      .map((p) => ({
        id: `ntf-rent-${p.id}`,
        kind: 'rental_overdue' as const,
        title: `Rental overdue — ${data.properties.find((x) => x.id === p.property_id)?.name ?? ''}`,
        body: `RM${(p.amount_due - p.amount_paid).toLocaleString('en-MY')} outstanding for ${periodLabel(p.period)}`,
        href: '/portal/rental?filter=outstanding',
        severity: 'critical' as const,
        created_at: `${p.due_date}T08:00:00.000Z`,
      })),
    ...data.rewards.map((r) => ({
      id: `ntf-reward-${r.id}`,
      kind: 'referral_conversion' as const,
      title: `Referral conversion recorded`,
      body: `${data.referrers.find((x) => x.id === r.referrer_id)?.name ?? ''} — ${
        data.properties.find((p) => p.id === r.property_id)?.name ?? ''
      }`,
      href: '/portal/referrers',
      severity: 'info' as const,
      created_at: `${r.recorded_at}T08:00:00.000Z`,
    })),
  ];
  return items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

/* ------------------------------------------------------------------ */
/* Recent activity feed                                                */
/* ------------------------------------------------------------------ */

export function recentActivity(data: Dataset, limit = 8) {
  return [...data.activities]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, limit)
    .map((a) => ({ activity: a, lead: data.leads.find((l) => l.id === a.lead_id) ?? null }));
}
