import { settings } from '@/lib/data/settings';

const content: Record<string, { title: string; intro: string; sections: { heading: string; body: string[] }[] }> = {
  privacy: {
    title: 'Privacy Statement',
    intro:
      'KO-PUSAKA collects personal information through this site only to respond to property enquiries and to manage the referral network.',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'When you submit an enquiry we collect your name, phone number, email address, optional company name, the property you enquired about, your preferred contact method and your message.',
          'If you arrived through a referral link we also record the referral code so that the introduction can be credited correctly.',
        ],
      },
      {
        heading: 'How we use it',
        body: [
          'Your details are used to contact you about your enquiry, to arrange viewings, and to progress any tenancy or purchase discussion that follows.',
          'Aggregate figures — how many enquiries a property received, which channel produced them — are used internally to manage the portfolio. These figures do not identify you.',
        ],
      },
      {
        heading: 'Who can see it',
        body: [
          'Enquiry records are visible to the KO-PUSAKA officer responsible for the property, to property management and to administrators of the platform.',
          'Referral partners see that an enquiry was generated through their link and its progress stage. They do not see your contact details unless KO-PUSAKA involves them directly with your consent.',
        ],
      },
      {
        heading: 'Retention and your rights',
        body: [
          'Enquiry records are retained for as long as needed to manage the relationship and to meet record-keeping obligations.',
          `You may ask us to correct or remove your details at any time by writing to ${settings.contact_email}.`,
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    intro:
      'These terms apply to the public KO-PUSAKA Asset360 site. Using the site means you accept them.',
    sections: [
      {
        heading: 'Property information',
        body: [
          'Listing details — sizes, rates, availability and specifications — are published in good faith and reviewed regularly, but they are indicative. Measurements are approximate and rates are subject to confirmation in writing.',
          'Nothing on this site constitutes an offer or a binding tenancy or sale. Terms become binding only in a signed agreement.',
        ],
      },
      {
        heading: 'Availability',
        body: [
          'A property shown as available may be under discussion with another prospect. Status is updated as the position changes, and the date of the last update is shown on each listing.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: [
          'You may share listing links freely. You may not scrape the site, misrepresent KO-PUSAKA properties, or submit enquiries on behalf of another person without their consent.',
        ],
      },
      {
        heading: 'Demonstration data',
        body: [
          'This deployment is populated with demonstration data for evaluation purposes. Properties, tenants, leads and figures shown are illustrative.',
        ],
      },
    ],
  },
  'referral-policy': {
    title: 'Referral Policy',
    intro: settings.referral_policy_note,
    sections: [
      {
        heading: 'Who may become a referrer',
        body: [
          'Staff, cooperative members, business partners, registered agents and approved members of the public may apply. Every application is reviewed and approved by KO-PUSAKA before a referral code is issued.',
        ],
      },
      {
        heading: 'How attribution works',
        body: [
          `When a visitor arrives through a referral link, the referral code is stored in their browser for ${settings.attribution_window_days} days. If they submit an enquiry within that window, the enquiry is credited to the referrer.`,
          'Where the same prospect is introduced by more than one referrer, the first recorded introduction stands. Duplicate enquiries from the same prospect are credited once.',
        ],
      },
      {
        heading: 'Recognition and incentives',
        body: [
          'Successful conversions are recorded against the referrer for recognition. Any incentive is subject to KO-PUSAKA policy approval; no commission rate is fixed within the platform until management determines it.',
          'Incentive eligibility is recorded and tracked through four states — pending, approved, paid and rejected — so that the position on every referral is always clear.',
        ],
      },
      {
        heading: 'Conduct',
        body: [
          'Referrers must represent properties accurately and must not commit KO-PUSAKA to terms. KO-PUSAKA may suspend or deactivate a referrer who misrepresents a property, submits enquiries without consent, or brings the network into disrepute.',
        ],
      },
    ],
  },
};

export function LegalPage({ slug }: { slug: string }) {
  const page = content[slug];
  if (!page) return null;

  return (
    <section className="border-t border-line bg-canvas">
      <div className="container-page max-w-3xl py-14">
        <p className="eyebrow">KO-PUSAKA Asset360</p>
        <h1 className="mt-3 font-display text-[34px] font-semibold tracking-tight text-ink">{page.title}</h1>
        <p className="mt-4 text-[15.5px] leading-relaxed text-ink-muted">{page.intro}</p>

        <div className="mt-10 space-y-8">
          {page.sections.map((section) => (
            <div key={section.heading} className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <h2 className="font-display text-[19px] font-semibold text-ink">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((para) => (
                  <p key={para} className="text-[14px] leading-relaxed text-ink-muted">{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-[12.5px] text-ink-soft">
          Questions about this page? Write to {settings.contact_email}.
        </p>
      </div>
    </section>
  );
}
