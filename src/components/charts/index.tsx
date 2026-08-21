'use client';

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

const EMERALD = '#1f6248';
const EMERALD_LIGHT = '#82bb9f';
const GOLD = '#d4a844';
const RED = '#dc2626';
const SLATE = '#cbd5e1';

const axis = { stroke: '#8a94a1', fontSize: 11, tickLine: false, axisLine: false };

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: '1px solid #e4e8e6',
    boxShadow: '0 12px 32px -12px rgba(20,24,28,0.25)',
    fontSize: 12,
    padding: '8px 12px',
  },
  labelStyle: { fontWeight: 600, color: '#14181c', marginBottom: 2 },
};

export function OccupancyDonut({ occupied, vacant }: { occupied: number; vacant: number }) {
  const data = [
    { name: 'Occupied', value: occupied, fill: EMERALD },
    { name: 'Vacant / available', value: vacant, fill: GOLD },
  ];
  const total = occupied + vacant;

  return (
    <div className="relative h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius="62%" outerRadius="88%" paddingAngle={2} strokeWidth={0}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} formatter={(v: number, n: string) => [`${v} properties`, n]} />
          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: 12, color: '#5c6672' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-[42%] -translate-y-1/2 text-center">
        <p className="font-display text-[30px] font-semibold leading-none text-ink">
          {total ? Math.round((occupied / total) * 100) : 0}%
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-ink-soft">Occupancy</p>
      </div>
    </div>
  );
}

export function IncomeTrend({ data }: { data: { month: string; expected: number; collected: number }[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={EMERALD} stopOpacity={0.22} />
              <stop offset="100%" stopColor={EMERALD} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1ef" vertical={false} />
          <XAxis dataKey="month" {...axis} />
          <YAxis {...axis} tickFormatter={(v) => formatCurrency(v, { compact: true })} width={62} />
          <Tooltip {...tooltipStyle} formatter={(v: number, n: string) => [formatCurrency(v), n === 'expected' ? 'Expected' : 'Collected']} />
          <Area type="monotone" dataKey="expected" stroke={SLATE} strokeWidth={2} strokeDasharray="5 4" fill="none" />
          <Area type="monotone" dataKey="collected" stroke={EMERALD} strokeWidth={2.5} fill="url(#collectedFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FunnelBars({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2.5">
      {data.map((step, i) => (
        <div key={step.label} className="flex items-center gap-3">
          <span className="w-[92px] shrink-0 text-[12.5px] text-ink-muted">{step.label}</span>
          <div className="h-8 flex-1 overflow-hidden rounded-lg bg-slate-100">
            <div
              className="flex h-full items-center justify-end rounded-lg px-2.5 text-[12px] font-semibold text-white transition-all duration-700"
              style={{
                width: `${Math.max(8, (step.count / max) * 100)}%`,
                background: `linear-gradient(90deg, ${EMERALD} 0%, ${EMERALD_LIGHT} ${100 - i * 8}%)`,
              }}
            >
              {step.count}
            </div>
          </div>
          <span className="w-11 shrink-0 text-right text-[11.5px] text-ink-soft">
            {max ? Math.round((step.count / max) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function VacancyBars({ data }: { data: { name: string; days: number; potential: number }[] }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1ef" horizontal={false} />
          <XAxis type="number" {...axis} />
          <YAxis type="category" dataKey="name" {...axis} width={132} tick={{ fontSize: 11, fill: '#5c6672' }} />
          <Tooltip
            {...tooltipStyle}
            formatter={(v: number, _n, item) => [`${v} days vacant · ${formatCurrency(item.payload.potential)} / month`, 'Vacancy']}
          />
          <Bar dataKey="days" radius={[0, 6, 6, 0]} barSize={16}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.days > 90 ? RED : entry.days > 30 ? GOLD : EMERALD_LIGHT} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChannelBars({ data }: { data: { source: string; leads: number; deals: number }[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1ef" vertical={false} />
          <XAxis dataKey="source" {...axis} interval={0} angle={-16} textAnchor="end" height={54} />
          <YAxis {...axis} allowDecimals={false} width={38} />
          <Tooltip {...tooltipStyle} />
          <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11.5, color: '#5c6672' }}>{v}</span>} />
          <Bar dataKey="leads" name="Leads" fill={EMERALD_LIGHT} radius={[6, 6, 0, 0]} barSize={18} />
          <Bar dataKey="deals" name="Deals" fill={EMERALD} radius={[6, 6, 0, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function IncomeByTypeBars({ data }: { data: { type: string; income: number; potential: number }[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1ef" vertical={false} />
          <XAxis dataKey="type" {...axis} interval={0} angle={-16} textAnchor="end" height={54} />
          <YAxis {...axis} tickFormatter={(v) => formatCurrency(v, { compact: true })} width={54} />
          <Tooltip {...tooltipStyle} formatter={(v: number, n: string) => [formatCurrency(v), n === 'income' ? 'Current income' : 'Unrealised potential']} />
          <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11.5, color: '#5c6672' }}>{v === 'income' ? 'Current income' : 'Unrealised potential'}</span>} />
          <Bar dataKey="income" stackId="a" fill={EMERALD} radius={[0, 0, 0, 0]} barSize={26} />
          <Bar dataKey="potential" stackId="a" fill={GOLD} radius={[6, 6, 0, 0]} barSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
