import type { PropertyType } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Property imagery is generated as deterministic SVG artwork rather than stock
 * photography: every listing gets a consistent, on-brand illustration that never
 * breaks, loads instantly and can be replaced one-for-one with Supabase Storage
 * URLs when real photography is uploaded.
 */

type Archetype = 'exterior' | 'interior' | 'land';

const archetypeFor = (view: string): Archetype => {
  if (['interior', 'workspace', 'boardroom', 'living', 'kitchen', 'bedroom', 'lobby', 'mezzanine', 'strongroom', 'upper-floor'].includes(view)) return 'interior';
  if (['aerial', 'site', 'road', 'surrounds', 'yard', 'apron'].includes(view)) return 'land';
  return 'exterior';
};

const palettes: Record<string, { sky: [string, string]; far: string; body: string; bodyDark: string; roof: string; glass: string; ground: string; accent: string }> = {
  emerald: { sky: ['#e8f1ec', '#cfe1d7'], far: '#b9cfc3', body: '#f4f2ec', bodyDark: '#e2ded3', roof: '#194e3a', glass: '#7fa8a0', ground: '#cbd8cf', accent: '#b98c2c' },
  dusk:    { sky: ['#eef1f4', '#d5dde4'], far: '#bcc8d2', body: '#f6f5f1', bodyDark: '#e3e2dc', roof: '#25333f', glass: '#8fa7b8', ground: '#ccd5da', accent: '#b98c2c' },
  sand:    { sky: ['#f4f0e8', '#e3dccd'], far: '#cec5b2', body: '#faf7f1', bodyDark: '#eae4d8', roof: '#5a4a33', glass: '#a9b6ac', ground: '#d8cfbc', accent: '#194e3a' },
};

const paletteFor = (type: PropertyType) => {
  if (['Office', 'Commercial'].includes(type)) return palettes.dusk;
  if (['Land', 'Residential'].includes(type)) return palettes.sand;
  return palettes.emerald;
};

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function windows(x: number, y: number, w: number, h: number, cols: number, rows: number, fill: string, opacity = 0.75) {
  const pad = w * 0.09;
  const cw = (w - pad * (cols + 1)) / cols;
  const ch = (h - pad * (rows + 1)) / rows;
  const cells = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={x + pad + c * (cw + pad)}
          y={y + pad + r * (ch + pad)}
          width={cw}
          height={ch}
          rx={1.5}
          fill={fill}
          opacity={((r + c) % 3 === 0 ? opacity : opacity - 0.22)}
        />,
      );
    }
  }
  return cells;
}

export function PropertyImage({
  seed, type, view = 'facade', className, rounded,
}: {
  seed: string;
  type: PropertyType;
  view?: string;
  className?: string;
  rounded?: string;
}) {
  const p = paletteFor(type);
  const n = hash(`${seed}-${view}`);
  const archetype = archetypeFor(view);
  const gid = `g-${hash(`${seed}${view}`) % 100000}`;
  const tall = ['Office'].includes(type);
  const shed = ['Warehouse', 'Industrial'].includes(type);
  const house = type === 'Residential';

  return (
    <svg viewBox="0 0 400 300" className={cn('h-full w-full', rounded, className)} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${type} illustration`}>
      <defs>
        <linearGradient id={`${gid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="100%" stopColor={p.sky[1]} />
        </linearGradient>
        <linearGradient id={`${gid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.glass} stopOpacity="0.95" />
          <stop offset="100%" stopColor={p.glass} stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${gid}-vig`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="60%" stopColor="#14181c" stopOpacity="0" />
          <stop offset="100%" stopColor="#14181c" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      <rect width="400" height="300" fill={`url(#${gid}-sky)`} />
      <circle cx={60 + (n % 240)} cy={54 + (n % 26)} r={26} fill="#ffffff" opacity="0.5" />

      {archetype === 'exterior' && (
        <>
          {/* distant skyline */}
          <g opacity="0.5">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const w = 34 + ((n >> (i * 2)) % 40);
              const h = 40 + ((n >> (i * 3)) % 70);
              const x = i * 68 - 20 + ((n >> i) % 14);
              return <rect key={i} x={x} y={214 - h} width={w} height={h} fill={p.far} rx={2} />;
            })}
          </g>

          {/* main subject */}
          {tall && (
            <g>
              <rect x="118" y="52" width="164" height="162" fill={p.body} />
              <rect x="118" y="52" width="164" height="10" fill={p.roof} />
              <rect x="272" y="52" width="10" height="162" fill={p.bodyDark} />
              {windows(128, 70, 138, 132, 5, 6, `url(#${gid}-glass)`)}
              <rect x="168" y="188" width="64" height="26" fill={p.roof} opacity="0.9" />
            </g>
          )}

          {shed && (
            <g>
              <polygon points="70,120 330,120 330,132 70,132" fill={p.roof} />
              <rect x="70" y="132" width="260" height="82" fill={p.body} />
              <rect x="70" y="132" width="260" height="8" fill={p.bodyDark} />
              {[0, 1, 2].map((i) => (
                <rect key={i} x={92 + i * 82} y={158} width={52} height={56} rx={2} fill={p.bodyDark} />
              ))}
              {[0, 1, 2].map((i) => (
                <rect key={`l-${i}`} x={92 + i * 82} y={158} width={52} height={7} fill={p.roof} opacity="0.7" />
              ))}
            </g>
          )}

          {house && (
            <g>
              <polygon points="90,128 200,74 310,128" fill={p.roof} />
              <rect x="104" y="128" width="192" height="86" fill={p.body} />
              <rect x="104" y="128" width="192" height="7" fill={p.bodyDark} />
              {windows(120, 146, 70, 44, 2, 2, `url(#${gid}-glass)`)}
              <rect x="216" y="150" width="58" height="64" rx={2} fill={p.bodyDark} />
              <rect x="240" y="170" width="12" height="44" rx={1} fill={p.roof} opacity="0.65" />
            </g>
          )}

          {!tall && !shed && !house && (
            <g>
              {/* shophouse row */}
              {[0, 1, 2].map((i) => {
                const x = 74 + i * 86;
                const h = 118 + ((n >> (i + 2)) % 16);
                return (
                  <g key={i}>
                    <rect x={x} y={214 - h} width={82} height={h} fill={i === 1 ? p.body : p.bodyDark} />
                    <rect x={x} y={214 - h} width={82} height={9} fill={p.roof} opacity={i === 1 ? 1 : 0.72} />
                    {windows(x + 8, 214 - h + 20, 66, h - 78, 3, 2, `url(#${gid}-glass)`)}
                    <rect x={x + 8} y={172} width={66} height={42} rx={2} fill={`url(#${gid}-glass)`} opacity="0.9" />
                    <rect x={x + 8} y={166} width={66} height={7} fill={p.accent} opacity={i === 1 ? 0.85 : 0.35} />
                  </g>
                );
              })}
            </g>
          )}

          {/* five-foot way + road */}
          <rect x="0" y="214" width="400" height="12" fill={p.ground} />
          <rect x="0" y="226" width="400" height="74" fill={p.ground} opacity="0.55" />
          <g opacity="0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={18 + i * 84} y={262} width={40} height={3} rx={1.5} fill="#ffffff" />
            ))}
          </g>
          {/* street trees */}
          {[46, 356].map((x, i) => (
            <g key={i} opacity="0.85">
              <rect x={x - 2} y={196} width={4} height={22} fill={p.roof} opacity="0.6" />
              <circle cx={x} cy={188} r={20} fill="#2f7d5b" opacity="0.28" />
              <circle cx={x - 8} cy={196} r={13} fill="#2f7d5b" opacity="0.22" />
            </g>
          ))}
        </>
      )}

      {archetype === 'interior' && (
        <>
          <rect width="400" height="300" fill={p.body} />
          <rect x="0" y="0" width="400" height="196" fill={p.body} />
          <rect x="0" y="196" width="400" height="104" fill={p.bodyDark} />
          <polygon points="0,196 400,196 400,206 0,206" fill={p.roof} opacity="0.16" />
          {/* window wall */}
          <rect x={188 + (n % 20)} y="42" width="170" height="132" rx="3" fill={`url(#${gid}-glass)`} />
          <rect x={188 + (n % 20)} y="42" width="170" height="132" rx="3" fill="none" stroke={p.roof} strokeOpacity="0.35" strokeWidth="3" />
          <line x1={273 + (n % 20)} y1="42" x2={273 + (n % 20)} y2="174" stroke={p.roof} strokeOpacity="0.28" strokeWidth="3" />
          <line x1={188 + (n % 20)} y1="108" x2={358 + (n % 20)} y2="108" stroke={p.roof} strokeOpacity="0.28" strokeWidth="3" />
          {/* light spill */}
          <polygon points={`${188 + (n % 20)},174 ${358 + (n % 20)},174 330,300 120,300`} fill="#ffffff" opacity="0.22" />
          {/* furniture blocks */}
          <rect x="34" y="150" width="122" height="16" rx="4" fill={p.roof} opacity="0.75" />
          <rect x="42" y="166" width="14" height="34" rx="3" fill={p.roof} opacity="0.5" />
          <rect x="134" y="166" width="14" height="34" rx="3" fill={p.roof} opacity="0.5" />
          <rect x="52" y="120" width="86" height="30" rx="4" fill={p.accent} opacity="0.28" />
          <circle cx="176" cy="196" r="9" fill={p.accent} opacity="0.45" />
          <rect x="30" y="52" width="60" height="76" rx="3" fill={p.bodyDark} />
          <rect x="30" y="52" width="60" height="6" fill={p.roof} opacity="0.5" />
        </>
      )}

      {archetype === 'land' && (
        <>
          <rect width="400" height="300" fill={p.ground} />
          <rect x="0" y="0" width="400" height="300" fill={p.sky[0]} opacity="0.35" />
          {/* parcels */}
          <g opacity="0.9">
            <polygon points="40,84 240,52 300,180 84,232" fill={p.body} stroke={p.roof} strokeOpacity="0.45" strokeWidth="2.5" strokeDasharray="7 5" />
            <polygon points="248,50 372,64 372,168 306,178" fill={p.bodyDark} opacity="0.75" />
          </g>
          {/* road */}
          <polygon points="0,232 400,168 400,206 0,272" fill={p.roof} opacity="0.72" />
          <g opacity="0.7">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={12 + i * 68} y={248 - i * 10.4} width={30} height={3} rx={1.5} fill="#ffffff" transform={`rotate(-9 ${12 + i * 68} ${248 - i * 10.4})`} />
            ))}
          </g>
          {/* vegetation clusters */}
          {[[62, 120], [116, 96], [286, 128], [340, 96], [200, 214]].map(([cx, cy], i) => (
            <g key={i} opacity="0.4">
              <circle cx={cx} cy={cy} r={16 + ((n >> i) % 10)} fill="#2f7d5b" />
              <circle cx={cx + 14} cy={cy + 8} r={11} fill="#2f7d5b" opacity="0.7" />
            </g>
          ))}
          <rect x="150" y="118" width="70" height="40" rx="3" fill={p.accent} opacity="0.18" />
        </>
      )}

      <rect width="400" height="300" fill={`url(#${gid}-vig)`} />
    </svg>
  );
}
