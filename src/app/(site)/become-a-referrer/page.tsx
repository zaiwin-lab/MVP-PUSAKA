import type { Metadata } from 'next';
import { BarChart3, Handshake, Link2, QrCode, ShieldCheck, Users } from 'lucide-react';
import { ReferrerApplicationForm } from '@/components/public/referrer-application-form';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { settings } from '@/lib/data/settings';

export const metadata: Metadata = {
  title: 'Become a Referral Partner',
  description:
    'Join the KO-PUSAKA Property Referral Network. Get a unique referral link and QR code, share available properties, and have every enquiry credited to you.',
  alternates: { canonical: '/become-a-referrer' },
};

const steps = [
  { icon: Users, title: 'Apply', body: 'Complete the short application below. Staff, members, partners, agents and approved members of the public may apply.' },
  { icon: ShieldCheck, title: 'Get approved', body: 'KO-PUSAKA reviews and approves every referrer before activation. This keeps the network credible.' },
  { icon: Link2, title: 'Receive your link', body: 'You receive a referral code, a personal link such as /r/KPS-A1023, and a downloadable QR code.' },
  { icon: Handshake, title: 'Share properties', body: 'Share any available listing by WhatsApp, Facebook, LinkedIn or QR — the attribution travels with the link.' },
  { icon: BarChart3, title: 'Track everything', body: 'Your dashboard shows clicks, enquiries, viewings, negotiations and closed deals in real time.' },
  { icon: QrCode, title: 'Be recognised', body: 'Successful conversions are recorded against your name for recognition and any approved incentive.' },
];

export default function BecomeReferrerPage() {
  return (
    <>
      <section className="border-t border-line bg-emerald-800 text-white">
        <div className="container-page py-16">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-300">
            <Handshake size={14} /> KO-PUSAKA Property Referral Network
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-[34px] font-semibold leading-tight tracking-tight sm:text-[46px]">
            Refer. Connect. Earn Recognition.
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/75">
            If you know someone looking for commercial, industrial or residential space, you can put
            them in front of the right KO-PUSAKA property — and be credited for it. No cold calling,
            no paperwork, just a link that remembers who sent the enquiry.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#apply" variant="white" size="lg">Apply to join</ButtonLink>
            <ButtonLink href="/referrer" variant="ghost" size="lg" className="text-white hover:bg-white/10 hover:text-white">
              Preview the referrer dashboard
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-ink">
          Six steps from application to credited deal
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon size={18} />
                </span>
                <span className="font-display text-[15px] font-semibold text-ink-soft">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-[16px] font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="apply" className="container-page pb-20">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <Card>
            <CardHeader
              title="Referrer application"
              subtitle="All fields are reviewed by KO-PUSAKA before your referral code is issued."
            />
            <CardBody>
              <ReferrerApplicationForm />
            </CardBody>
          </Card>

          <div className="space-y-5">
            <Card className="bg-slate-50/70">
              <CardHeader title="What you receive on approval" />
              <CardBody className="space-y-3 text-[13.5px] text-ink-muted">
                {[
                  'A unique referral code, for example KPS-A1023',
                  'A personal referral link, for example /r/KPS-A1023',
                  'A downloadable QR code for print and shopfront use',
                  'A dashboard showing clicks, enquiries, viewings and deals',
                  'Ready-made share text for WhatsApp and social media',
                ].map((item) => (
                  <p key={item} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </p>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Referral policy" />
              <CardBody className="space-y-3 text-[13px] leading-relaxed text-ink-muted">
                <p>{settings.referral_policy_note}</p>
                <p>
                  Attribution is held for {settings.attribution_window_days} days from the moment a
                  visitor arrives through your link. Duplicate enquiries from the same prospect are
                  credited once.
                </p>
                <p>
                  KO-PUSAKA may suspend or deactivate a referrer who misrepresents a property or
                  submits enquiries without the prospect&apos;s consent.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
