'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import type { Dataset } from '@/lib/dataset';
import { seedDataset } from '@/lib/dataset';
import type {
  ActivityKind, ContactMethod, IncentiveStatus, Lead, LeadInterest, LeadSourceKey, LeadStage,
  Property, PropertyStatus, ReferrerStatus, Role,
} from '@/lib/types';
import { d, dt } from '@/lib/dates';
import { uid } from '@/lib/utils';

const STORAGE_KEY = 'kopusaka-asset360-demo-v1';

export interface EnquiryInput {
  name: string;
  phone: string;
  email: string;
  company?: string;
  property_id: string | null;
  interest: LeadInterest;
  preferred_contact: ContactMethod;
  message: string;
  referral_code?: string | null;
  source?: LeadSourceKey;
}

interface StoreValue {
  data: Dataset;
  hydrated: boolean;
  role: Role;
  setRole: (role: Role) => void;
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  submitEnquiry: (input: EnquiryInput) => Lead;
  updateLeadStage: (leadId: string, stage: LeadStage, note?: string) => void;
  assignLead: (leadId: string, officerId: string) => void;
  logActivity: (leadId: string, kind: ActivityKind, summary: string, detail?: string) => void;
  scheduleFollowup: (leadId: string, date: string, action: string) => void;
  updateProperty: (propertyId: string, patch: Partial<Property>) => void;
  setPropertyStatus: (propertyId: string, status: PropertyStatus) => void;
  recordMarketingActivity: (propertyId: string, note: string) => void;
  setReferrerStatus: (referrerId: string, status: ReferrerStatus) => void;
  setRewardStatus: (rewardId: string, status: IncentiveStatus) => void;
  recordPayment: (paymentId: string) => void;
  markLeadLost: (leadId: string, reason: string) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const actorFor = (data: Dataset, userId: string) => data.users.find((u) => u.id === userId)?.name ?? 'Officer';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Dataset>(() => seedDataset());
  const [hydrated, setHydrated] = useState(false);
  const [role, setRole] = useState<Role>('management');
  const [currentUserId, setCurrentUserId] = useState('usr-0004');

  // The seeded dataset renders on the server; live demo changes are layered in
  // after mount so server and client markup always match.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { data: Dataset; role?: Role; userId?: string; day?: string };
        if (parsed.day === d(0) && parsed.data?.properties?.length) {
          setData(parsed.data);
          if (parsed.role) setRole(parsed.role);
          if (parsed.userId) setCurrentUserId(parsed.userId);
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      /* a corrupt or unavailable store simply falls back to the seed */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, role, userId: currentUserId, day: d(0) }));
    } catch {
      /* storage may be unavailable — the demo still works in memory */
    }
  }, [data, role, currentUserId, hydrated]);

  const logActivity = useCallback<StoreValue['logActivity']>((leadId, kind, summary, detail) => {
    setData((prev) => ({
      ...prev,
      activities: [
        {
          id: uid('act'),
          lead_id: leadId,
          kind,
          summary,
          detail,
          actor: actorFor(prev, currentUserId),
          created_at: new Date().toISOString(),
        },
        ...prev.activities,
      ],
      leads: prev.leads.map((l) => (l.id === leadId ? { ...l, last_interaction: d(0) } : l)),
    }));
  }, [currentUserId]);

  const submitEnquiry = useCallback<StoreValue['submitEnquiry']>((input) => {
    const seedRef = seedDataset().referrers;
    const referrer = input.referral_code
      ? seedRef.find((r) => r.code.toLowerCase() === input.referral_code!.toLowerCase() && r.status === 'approved') ?? null
      : null;
    const property = seedDataset().properties.find((p) => p.id === input.property_id) ?? null;
    const lead: Lead = {
      id: uid('led'),
      code: `L-${Math.floor(2100 + Math.random() * 800)}`,
      name: input.name,
      phone: input.phone,
      email: input.email,
      company: input.company || null,
      property_id: input.property_id,
      interest: input.interest,
      preferred_contact: input.preferred_contact,
      message: input.message,
      source: referrer ? 'referral' : input.source ?? 'website',
      campaign_id: referrer ? 'cmp-0003' : 'cmp-0008',
      referrer_id: referrer?.id ?? null,
      referral_code: referrer?.code ?? null,
      officer_id: property?.officer_id ?? 'usr-0003',
      stage: 'new',
      estimated_value: property?.asking_rent ?? property?.sale_price ?? 0,
      next_action: 'Contact prospect and qualify requirement',
      next_followup: d(0),
      last_interaction: d(0),
      created_at: d(0),
    };

    setData((prev) => ({
      ...prev,
      leads: [lead, ...prev.leads],
      referrers: prev.referrers.map((r) =>
        r.id === referrer?.id ? { ...r, clicks: r.clicks + 1, unique_visitors: r.unique_visitors + 1 } : r,
      ),
      activities: [
        {
          id: uid('act'),
          lead_id: lead.id,
          kind: 'created',
          summary: referrer
            ? `Enquiry received via referral ${referrer.code} (${referrer.name})`
            : 'Enquiry received from the public website',
          detail: input.message,
          actor: 'System',
          created_at: new Date().toISOString(),
        },
        ...prev.activities,
      ],
      properties: prev.properties.map((p) =>
        p.id === input.property_id ? { ...p, last_marketing_activity: d(0), updated_at: d(0) } : p,
      ),
    }));

    return lead;
  }, []);

  const updateLeadStage = useCallback<StoreValue['updateLeadStage']>((leadId, stage, note) => {
    setData((prev) => {
      const lead = prev.leads.find((l) => l.id === leadId);
      if (!lead) return prev;
      const nextActions: Partial<Record<LeadStage, string>> = {
        contacted: 'Qualify requirement, budget and timeline',
        qualified: 'Arrange a property viewing',
        viewing_scheduled: 'Confirm viewing attendance',
        viewing_completed: 'Collect feedback and propose terms',
        negotiation: 'Agree commercial terms',
        offer: 'Table offer for management decision',
        agreement: 'Prepare and issue the agreement',
        successful: 'Handover and commence tenancy',
        lost: 'Closed — record the reason',
      };
      const property = prev.properties.find((p) => p.id === lead.property_id);
      const shouldReserve = stage === 'agreement' && property && property.status !== 'occupied';
      const shouldOccupy = stage === 'successful' && property && property.status !== 'occupied';
      const shouldNegotiate = ['negotiation', 'offer'].includes(stage) && property && ['available_rent', 'available_sale', 'vacant'].includes(property.status);

      return {
        ...prev,
        leads: prev.leads.map((l) =>
          l.id === leadId
            ? {
                ...l,
                stage,
                next_action: nextActions[stage] ?? l.next_action,
                next_followup: ['successful', 'lost'].includes(stage) ? null : d(stage === 'new' ? 0 : 2),
                last_interaction: d(0),
              }
            : l,
        ),
        properties: prev.properties.map((p) => {
          if (!property || p.id !== property.id) return p;
          if (shouldOccupy) {
            return {
              ...p,
              status: 'occupied' as PropertyStatus,
              listing_intent: 'none' as const,
              published: false,
              current_rent: p.asking_rent,
              vacant_since: null,
              updated_at: d(0),
              next_action: 'Tenancy active — monitor collection',
            };
          }
          if (shouldReserve) return { ...p, status: 'reserved' as PropertyStatus, updated_at: d(0) };
          if (shouldNegotiate) return { ...p, status: 'under_negotiation' as PropertyStatus, updated_at: d(0) };
          return p;
        }),
        rewards:
          stage === 'successful' && lead.referrer_id && !prev.rewards.some((r) => r.lead_id === lead.id)
            ? [
                {
                  id: uid('rwd'),
                  referrer_id: lead.referrer_id,
                  lead_id: lead.id,
                  property_id: lead.property_id ?? '',
                  deal_value: lead.estimated_value,
                  incentive_amount: null,
                  status: 'pending' as IncentiveStatus,
                  recorded_at: d(0),
                  notes: 'Automatically recorded on conversion. Incentive subject to policy approval.',
                },
                ...prev.rewards,
              ]
            : prev.rewards,
        activities: [
          {
            id: uid('act'),
            lead_id: leadId,
            kind: 'stage_change' as ActivityKind,
            summary: `Stage moved to ${stage.replace(/_/g, ' ')}`,
            detail: note,
            actor: actorFor(prev, currentUserId),
            created_at: new Date().toISOString(),
          },
          ...prev.activities,
        ],
      };
    });
  }, [currentUserId]);

  const assignLead = useCallback<StoreValue['assignLead']>((leadId, officerId) => {
    setData((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => (l.id === leadId ? { ...l, officer_id: officerId } : l)),
      activities: [
        {
          id: uid('act'),
          lead_id: leadId,
          kind: 'assignment' as ActivityKind,
          summary: `Assigned to ${prev.users.find((u) => u.id === officerId)?.name ?? 'officer'}`,
          actor: actorFor(prev, currentUserId),
          created_at: new Date().toISOString(),
        },
        ...prev.activities,
      ],
    }));
  }, [currentUserId]);

  const scheduleFollowup = useCallback<StoreValue['scheduleFollowup']>((leadId, date, action) => {
    setData((prev) => ({
      ...prev,
      leads: prev.leads.map((l) =>
        l.id === leadId ? { ...l, next_followup: date, next_action: action || l.next_action, last_interaction: d(0) } : l,
      ),
      activities: [
        {
          id: uid('act'),
          lead_id: leadId,
          kind: 'note' as ActivityKind,
          summary: `Follow-up scheduled for ${date}`,
          detail: action,
          actor: actorFor(prev, currentUserId),
          created_at: new Date().toISOString(),
        },
        ...prev.activities,
      ],
    }));
  }, [currentUserId]);

  const updateProperty = useCallback<StoreValue['updateProperty']>((propertyId, patch) => {
    setData((prev) => ({
      ...prev,
      properties: prev.properties.map((p) => (p.id === propertyId ? { ...p, ...patch, updated_at: d(0) } : p)),
    }));
  }, []);

  const setPropertyStatus = useCallback<StoreValue['setPropertyStatus']>((propertyId, status) => {
    setData((prev) => ({
      ...prev,
      properties: prev.properties.map((p) => {
        if (p.id !== propertyId) return p;
        const becomingVacant = status !== 'occupied' && p.status === 'occupied';
        return {
          ...p,
          status,
          updated_at: d(0),
          published: ['available_rent', 'available_sale', 'under_negotiation', 'reserved'].includes(status) ? true : p.published,
          vacant_since: becomingVacant ? d(0) : status === 'occupied' ? null : p.vacant_since,
          current_rent: status === 'occupied' ? p.current_rent ?? p.asking_rent : null,
        };
      }),
    }));
  }, []);

  const recordMarketingActivity = useCallback<StoreValue['recordMarketingActivity']>((propertyId) => {
    setData((prev) => ({
      ...prev,
      properties: prev.properties.map((p) =>
        p.id === propertyId ? { ...p, last_marketing_activity: d(0), updated_at: d(0) } : p,
      ),
    }));
  }, []);

  const setReferrerStatus = useCallback<StoreValue['setReferrerStatus']>((referrerId, status) => {
    setData((prev) => ({
      ...prev,
      referrers: prev.referrers.map((r) =>
        r.id === referrerId
          ? {
              ...r,
              status,
              approved_at: status === 'approved' ? r.approved_at ?? d(0) : r.approved_at,
              approved_by: status === 'approved' ? r.approved_by ?? actorFor(prev, currentUserId) : r.approved_by,
            }
          : r,
      ),
    }));
  }, [currentUserId]);

  const setRewardStatus = useCallback<StoreValue['setRewardStatus']>((rewardId, status) => {
    setData((prev) => ({
      ...prev,
      rewards: prev.rewards.map((r) => (r.id === rewardId ? { ...r, status } : r)),
    }));
  }, []);

  const recordPayment = useCallback<StoreValue['recordPayment']>((paymentId) => {
    setData((prev) => ({
      ...prev,
      payments: prev.payments.map((p) =>
        p.id === paymentId ? { ...p, amount_paid: p.amount_due, status: 'paid', paid_date: d(0), method: 'transfer' } : p,
      ),
    }));
  }, []);

  const markLeadLost = useCallback<StoreValue['markLeadLost']>((leadId, reason) => {
    setData((prev) => ({
      ...prev,
      leads: prev.leads.map((l) =>
        l.id === leadId ? { ...l, stage: 'lost', lost_reason: reason, next_followup: null, last_interaction: d(0) } : l,
      ),
      activities: [
        {
          id: uid('act'),
          lead_id: leadId,
          kind: 'stage_change' as ActivityKind,
          summary: 'Lead marked as lost',
          detail: reason,
          actor: actorFor(prev, currentUserId),
          created_at: new Date().toISOString(),
        },
        ...prev.activities,
      ],
    }));
  }, [currentUserId]);

  const resetDemo = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setData(seedDataset());
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      data, hydrated, role, setRole, currentUserId, setCurrentUserId,
      submitEnquiry, updateLeadStage, assignLead, logActivity, scheduleFollowup,
      updateProperty, setPropertyStatus, recordMarketingActivity, setReferrerStatus,
      setRewardStatus, recordPayment, markLeadLost, resetDemo,
    }),
    [
      data, hydrated, role, currentUserId, submitEnquiry, updateLeadStage, assignLead, logActivity,
      scheduleFollowup, updateProperty, setPropertyStatus, recordMarketingActivity, setReferrerStatus,
      setRewardStatus, recordPayment, markLeadLost, resetDemo,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export { dt };
