'use client';

import { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Check, Copy, Download, Facebook, Linkedin, MessageCircle, QrCode, Share2 } from 'lucide-react';
import { Button, buttonClass } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

export function shareText(name: string, location: string, url: string) {
  return `Property available from KO-PUSAKA: ${name}, ${location}. View details here: ${url}`;
}

export function ShareTools({
  url, title, location, compact, className, referralCode,
}: {
  url: string;
  title: string;
  location: string;
  compact?: boolean;
  className?: string;
  referralCode?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [absolute, setAbsolute] = useState(url);
  const canvasWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const base = window.location.origin;
    const full = url.startsWith('http') ? url : `${base}${url}`;
    setAbsolute(referralCode ? `${full}${full.includes('?') ? '&' : '?'}ref=${referralCode}` : full);
  }, [url, referralCode]);

  const text = shareText(title, location, absolute);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(absolute);
    } catch {
      const el = document.createElement('textarea');
      el.value = absolute;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: absolute });
        return;
      } catch {
        /* user dismissed — fall through to copy */
      }
    }
    void copy();
  };

  const downloadQr = () => {
    const canvas = canvasWrap.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `kopusaka-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const links = [
    { label: 'WhatsApp', icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(text)}` },
    { label: 'Facebook', icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absolute)}` },
    { label: 'LinkedIn', icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(absolute)}` },
  ];

  if (compact) {
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        <Button variant="outline" size="sm" onClick={nativeShare}>
          <Share2 size={14} /> Share
        </Button>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy link'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
          <QrCode size={14} /> QR
        </Button>
        <QrModal open={qrOpen} onClose={() => setQrOpen(false)} url={absolute} title={title} onDownload={downloadQr} wrapRef={canvasWrap} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {links.map(({ label, icon: Icon, href }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer noopener" className={buttonClass('outline', 'sm', 'justify-start')}>
            <Icon size={15} className="text-emerald-600" /> {label}
          </a>
        ))}
        <Button variant="outline" size="sm" className="justify-start" onClick={copy}>
          {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} className="text-emerald-600" />}
          {copied ? 'Link copied' : 'Copy link'}
        </Button>
        <Button variant="outline" size="sm" className="justify-start" onClick={() => setQrOpen(true)}>
          <QrCode size={15} className="text-emerald-600" /> Show QR
        </Button>
        <Button variant="outline" size="sm" className="justify-start" onClick={nativeShare}>
          <Share2 size={15} className="text-emerald-600" /> More
        </Button>
      </div>
      <p className="rounded-xl bg-slate-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-muted">{text}</p>
      <QrModal open={qrOpen} onClose={() => setQrOpen(false)} url={absolute} title={title} onDownload={downloadQr} wrapRef={canvasWrap} />
    </div>
  );
}

function QrModal({
  open, onClose, url, title, onDownload, wrapRef,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
  onDownload: () => void;
  wrapRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Property QR code"
      subtitle="Print it, paste it on the shopfront, or share it in a WhatsApp group."
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" onClick={onDownload}>
            <Download size={14} /> Download PNG
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div ref={wrapRef} className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <QRCodeCanvas value={url} size={208} level="M" marginSize={2} fgColor="#14181c" bgColor="#ffffff" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-1 break-all text-[12px] text-ink-muted">{url}</p>
        </div>
      </div>
    </Modal>
  );
}
