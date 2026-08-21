import type { Metadata } from 'next';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { EnquiryForm } from '@/components/public/enquiry-form';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { WHATSAPP_NUMBER, settings } from '@/lib/data/settings';
import { whatsappLink } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contact the KO-PUSAKA Property Team',
  description: 'Speak to the KO-PUSAKA property team about renting or buying a property, or about listing your requirement.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <section className="border-t border-line bg-canvas">
      <div className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 font-display text-[34px] font-semibold leading-tight tracking-tight text-ink sm:text-[42px]">
            Talk to the property team
          </h1>
          <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-ink-muted">
            Tell us what you are looking for — the type of space, preferred area, size and budget — and
            we will come back with suitable options from the KO-PUSAKA portfolio.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: Phone, label: 'Phone', value: settings.contact_phone },
              { icon: Mail, label: 'Email', value: settings.contact_email },
              { icon: MapPin, label: 'Office', value: settings.office_address },
              { icon: Clock, label: 'Office hours', value: 'Monday to Friday, 8:30am – 5:00pm' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3.5 rounded-2xl border border-line bg-white p-4 shadow-card">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon size={17} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">{label}</p>
                  <p className="mt-1 text-[14px] font-medium text-ink">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <ButtonLink
            href={whatsappLink(WHATSAPP_NUMBER, 'Hello KO-PUSAKA, I would like to enquire about a property.')}
            external
            size="lg"
            className="mt-6 w-full sm:w-auto"
          >
            <MessageCircle size={17} /> Message us on WhatsApp
          </ButtonLink>
        </div>

        <Card>
          <CardHeader title="Send an enquiry" subtitle="We respond to every enquiry, usually within one working day." />
          <CardBody>
            <EnquiryForm propertyId={null} defaultInterest="info" id="contact-enquire" />
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
