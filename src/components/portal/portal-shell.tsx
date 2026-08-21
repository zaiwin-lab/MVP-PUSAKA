'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Bell, Building2, ChevronDown, Contact, Gauge, Handshake, LayoutDashboard, LogOut, Megaphone,
  Menu, PieChart, RotateCcw, Settings, ShieldAlert, Users, Wallet, X, FileBarChart, ClipboardList,
} from 'lucide-react';
import { Logo } from '@/components/brand';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { actionAlerts, notifications } from '@/lib/metrics';
import { roleLabel } from '@/lib/labels';
import type { Role } from '@/lib/types';
import { cn } from '@/lib/utils';

const groups: { label: string; items: { href: string; label: string; icon: typeof Gauge; roles?: Role[] }[] }[] = [
  {
    label: 'Overview',
    items: [
      { href: '/portal', label: 'Executive Dashboard', icon: LayoutDashboard },
      { href: '/portal/officer', label: 'My Day (Officer)', icon: Gauge },
      { href: '/portal/action-centre', label: 'Action Centre', icon: ShieldAlert },
    ],
  },
  {
    label: 'Portfolio',
    items: [
      { href: '/portal/properties', label: 'Properties', icon: Building2 },
      { href: '/portal/idle-assets', label: 'Idle Asset Watchlist', icon: PieChart },
      { href: '/portal/tenancies', label: 'Tenancies', icon: ClipboardList },
      { href: '/portal/rental', label: 'Rental & Income', icon: Wallet },
    ],
  },
  {
    label: 'Growth',
    items: [
      { href: '/portal/leads', label: 'Lead CRM', icon: Contact },
      { href: '/portal/referrers', label: 'Referral Network', icon: Handshake },
      { href: '/portal/campaigns', label: 'Campaigns', icon: Megaphone },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/portal/reports', label: 'Reports', icon: FileBarChart },
      { href: '/portal/admin', label: 'Admin & Settings', icon: Settings },
    ],
  },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, role, setRole, currentUserId, setCurrentUserId, resetDemo } = useStore();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    setNotifOpen(false);
    setUserOpen(false);
  }, [pathname]);

  const alerts = actionAlerts(data);
  const notifs = notifications(data).slice(0, 8);
  const user = data.users.find((u) => u.id === currentUserId) ?? data.users[0];
  const critical = alerts.filter((a) => a.severity === 'critical').length;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/10 px-5">
        <Logo tone="light" href="/portal" />
        <button type="button" className="text-white/60 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav className="scrollbar-slim flex-1 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === '/portal' ? pathname === '/portal' : pathname.startsWith(item.href);
                const Icon = item.icon;
                const badge = item.href === '/portal/action-centre' && critical ? critical : null;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                        active ? 'bg-white/12 text-white' : 'text-white/60 hover:bg-white/[0.07] hover:text-white',
                      )}
                    >
                      <Icon size={16} className={active ? 'text-gold-300' : ''} />
                      <span className="flex-1">{item.label}</span>
                      {badge ? (
                        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4">
        <Link href="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-white/60 transition hover:bg-white/[0.07] hover:text-white">
          <LogOut size={15} /> Back to public site
        </Link>
        <button
          type="button"
          onClick={resetDemo}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-white/45 transition hover:bg-white/[0.07] hover:text-white"
        >
          <RotateCcw size={15} /> Reset demo data
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] bg-ink lg:block">{sidebar}</aside>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />
          <aside className="absolute inset-y-0 left-0 w-[272px] animate-fade-in bg-ink" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-md">
          <div className="flex h-[68px] items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button type="button" className="rounded-lg p-2 text-ink lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
                <Menu size={20} />
              </button>
              <div className="hidden sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">KO-PUSAKA Asset360</p>
                <p className="text-[13px] text-ink-muted">One Screen. Every Property. Every Opportunity.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge tone="gold" className="hidden md:inline-flex">Demo data</Badge>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setNotifOpen((v) => !v); setUserOpen(false); }}
                  className="relative rounded-lg p-2.5 text-ink-muted transition hover:bg-slate-100 hover:text-ink"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {notifs.length ? (
                    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9.5px] font-bold text-white">
                      {notifs.length}
                    </span>
                  ) : null}
                </button>

                {notifOpen ? (
                  <div className="absolute right-0 top-full z-50 mt-2 w-[340px] animate-fade-up overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
                    <div className="flex items-center justify-between border-b border-line px-4 py-3">
                      <p className="text-[13px] font-semibold text-ink">Notifications</p>
                      <Link href="/portal/action-centre" className="text-[12px] font-semibold text-emerald-600">View all</Link>
                    </div>
                    <ul className="max-h-[380px] overflow-y-auto">
                      {notifs.map((n) => (
                        <li key={n.id}>
                          <Link href={n.href} className="flex gap-3 border-b border-line/60 px-4 py-3 transition hover:bg-emerald-50/50">
                            <span
                              className={cn(
                                'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                                n.severity === 'critical' ? 'bg-red-500' : n.severity === 'warning' ? 'bg-gold-400' : 'bg-emerald-500',
                              )}
                            />
                            <span>
                              <span className="block text-[13px] font-medium leading-snug text-ink">{n.title}</span>
                              <span className="mt-0.5 block text-[12px] leading-snug text-ink-muted">{n.body}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setUserOpen((v) => !v); setNotifOpen(false); }}
                  className="flex items-center gap-2.5 rounded-xl border border-line px-2.5 py-1.5 transition hover:border-emerald-300"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-[12px] font-semibold text-white">
                    {user.initials}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-[12.5px] font-semibold leading-tight text-ink">{user.name.split(' ').slice(0, 2).join(' ')}</span>
                    <span className="block text-[11px] leading-tight text-ink-muted">{roleLabel[role]}</span>
                  </span>
                  <ChevronDown size={14} className="text-ink-soft" />
                </button>

                {userOpen ? (
                  <div className="absolute right-0 top-full z-50 mt-2 w-[300px] animate-fade-up overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
                    <div className="border-b border-line px-4 py-3">
                      <p className="text-[13px] font-semibold text-ink">{user.name}</p>
                      <p className="text-[12px] text-ink-muted">{user.title}</p>
                    </div>
                    <div className="p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                        <Users size={12} /> Switch demo persona
                      </p>
                      <ul className="space-y-1">
                        {data.users.map((u) => (
                          <li key={u.id}>
                            <button
                              type="button"
                              onClick={() => { setCurrentUserId(u.id); setRole(u.role); setUserOpen(false); }}
                              className={cn(
                                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition',
                                u.id === currentUserId ? 'bg-emerald-50 text-emerald-800' : 'text-ink-muted hover:bg-slate-50',
                              )}
                            >
                              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-[10.5px] font-semibold text-ink">
                                {u.initials}
                              </span>
                              <span className="flex-1">
                                <span className="block font-medium text-ink">{u.name.split(' ').slice(0, 2).join(' ')}</span>
                                <span className="block text-[11px]">{roleLabel[u.role]}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
