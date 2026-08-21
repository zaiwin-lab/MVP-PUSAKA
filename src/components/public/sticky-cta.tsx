'use client';

import { MessageCircle, Send } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/data/settings';
import { whatsappLink } from '@/lib/utils';

export function StickyCta({ propertyName, code }: { propertyName: string; code: string }) {
  const text = `Hello KO-PUSAKA, I am interested in ${propertyName} (${code}). Please share more details.`;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur-md lg:hidden">
      <div className="flex gap-2">
        <a
          href={whatsappLink(WHATSAPP_NUMBER, text)}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-600 text-sm font-semibold text-emerald-700"
        >
          <MessageCircle size={17} /> WhatsApp
        </a>
        <a
          href="#enquire"
          className="inline-flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white"
        >
          <Send size={16} /> Enquire Now
        </a>
      </div>
    </div>
  );
}
