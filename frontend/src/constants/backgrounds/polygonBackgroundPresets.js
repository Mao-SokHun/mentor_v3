/**
 * Per-page polygon presets — different shapes, colors, speeds (not copy-paste of auth).
 * @typedef {{ wrapper: string, anim: string, color: string, viewBox: string, elements: object[] }} ShapeConfig
 */

/** @type {Record<string, ShapeConfig[]>} */
export const polygonPresets = {
  /** Login / signup — rose triangles on dark */
  auth: [
    {
      wrapper: 'absolute -top-8 right-[6%] w-[22rem] h-[22rem]',
      anim: 'poly-bg-orbit',
      glow: true,
      blend: 'screen',
      color: 'text-primary-300',
      viewBox: '0 0 200 200',
      elements: [
        {
          tag: 'polygon',
          points: '100,12 188,168 12,168',
          fill: 'none',
          stroke: true,
          strokeGradient: 'rose',
          strokeWidth: 2.25,
          strokeOpacity: 0.95,
        },
        {
          tag: 'polygon',
          points: '100,36 162,152 38,152',
          fillGradient: 'rose',
          fillOpacity: 0.22,
          stroke: true,
          strokeGradient: 'white',
          strokeWidth: 1.5,
          strokeOpacity: 0.8,
        },
      ],
    },
    {
      wrapper: 'absolute bottom-[18%] left-[4%] w-56 h-56 opacity-45',
      anim: 'poly-bg-spin-reverse',
      color: 'text-primary-300',
      viewBox: '0 0 200 200',
      elements: [
        { tag: 'polygon', points: '100,14 178,55 178,145 100,186 22,145 22,55', fill: true, fillOpacity: 0.1, stroke: true, strokeWidth: 1.75 },
      ],
    },
    {
      wrapper: 'absolute top-[42%] right-[28%] w-40 h-40 opacity-55',
      anim: 'poly-bg-spin-fast',
      color: 'text-primary-200',
      viewBox: '0 0 120 120',
      elements: [
        { tag: 'polygon', points: '60,8 112,108 8,108', fill: true, fillOpacity: 0.12, stroke: true, strokeWidth: 1.5 },
      ],
    },
    {
      wrapper: 'absolute top-[22%] left-[18%] w-28 h-28 opacity-50',
      anim: 'poly-bg-spin',
      color: 'text-primary-500',
      viewBox: '0 0 100 100',
      elements: [
        { tag: 'polygon', points: '50,8 92,50 50,92 8,50', fill: true, fillOpacity: 0.2, stroke: true, strokeWidth: 1.35, strokeOpacity: 0.85 },
      ],
    },
    {
      wrapper: 'absolute top-1/2 left-1/2 w-[min(90vw,32rem)] h-[min(90vw,32rem)] -translate-x-1/2 -translate-y-1/2 opacity-40',
      anim: 'poly-bg-spin-reverse',
      inner: true,
      color: 'text-primary-400',
      viewBox: '0 0 240 240',
      elements: [
        { tag: 'polygon', points: '120,20 220,200 20,200', fill: 'none', stroke: true, strokeWidth: 1.25, strokeDasharray: '6 10' },
      ],
    },
  ],

  /** Admin login — cool slate + cyan, geometric grid feel */
  admin: [
    {
      wrapper: 'absolute top-[10%] right-[10%] w-48 h-48 opacity-35',
      anim: 'poly-bg-spin-slow',
      color: 'text-slate-400',
      viewBox: '0 0 100 100',
      elements: [
        { tag: 'polygon', points: '50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5', fill: 'none', stroke: true, strokeWidth: 1.5 },
      ],
    },
    {
      wrapper: 'absolute bottom-[20%] left-[8%] w-64 h-64 opacity-30',
      anim: 'poly-bg-spin-reverse',
      color: 'text-cyan-400/80',
      viewBox: '0 0 200 200',
      elements: [
        { tag: 'polygon', points: '100,20 180,180 20,180', fill: 'none', stroke: true, strokeWidth: 1.2, strokeDasharray: '4 8' },
      ],
    },
    {
      wrapper: 'absolute top-[45%] left-[40%] w-24 h-24 opacity-25',
      anim: 'poly-bg-spin',
      color: 'text-slate-500',
      viewBox: '0 0 100 100',
      elements: [
        { tag: 'polygon', points: '50,8 92,50 50,92 8,50', fill: true, fillOpacity: 0.08, stroke: true, strokeWidth: 1 },
      ],
    },
  ],

  /** Public landing hero — sky + emerald accents, wider shapes */
  landing: [
    {
      wrapper: 'absolute -top-12 left-[5%] w-72 h-72 opacity-40',
      anim: 'poly-bg-spin-slow',
      color: 'text-sky-300/90',
      viewBox: '0 0 200 200',
      elements: [
        { tag: 'polygon', points: '100,10 190,55 190,145 100,190 10,145 10,55', fill: 'none', stroke: true, strokeWidth: 1.5 },
      ],
    },
    {
      wrapper: 'absolute bottom-[5%] right-[8%] w-80 h-80 opacity-35',
      anim: 'poly-bg-spin-reverse',
      color: 'text-emerald-300/80',
      viewBox: '0 0 200 200',
      elements: [
        { tag: 'polygon', points: '100,15 185,170 15,170', fill: true, fillOpacity: 0.06, stroke: true, strokeWidth: 1.25 },
      ],
    },
    {
      wrapper: 'absolute top-[30%] right-[25%] w-32 h-32 opacity-50',
      anim: 'poly-bg-spin-fast',
      color: 'text-primary-300',
      viewBox: '0 0 100 100',
      elements: [
        { tag: 'polygon', points: '50,5 95,50 50,95 5,50', fill: 'none', stroke: true, strokeWidth: 1.2 },
      ],
    },
    {
      wrapper: 'absolute top-1/2 left-1/2 w-[36rem] h-[36rem] -translate-x-1/2 -translate-y-1/2 opacity-20',
      anim: 'poly-bg-spin-slow',
      inner: true,
      color: 'text-white/60',
      viewBox: '0 0 240 240',
      elements: [
        { tag: 'polygon', points: '120,30 210,190 30,190', fill: 'none', stroke: true, strokeWidth: 0.8, strokeDasharray: '12 16' },
      ],
    },
  ],

  /** Student home welcome banner */
  home: [
    {
      wrapper: 'absolute -right-8 -top-10 w-40 h-40 opacity-30',
      anim: 'poly-bg-spin',
      color: 'text-white',
      viewBox: '0 0 100 100',
      elements: [
        { tag: 'polygon', points: '50,8 92,92 8,92', fill: 'none', stroke: true, strokeWidth: 1.5, strokeOpacity: 0.7 },
      ],
    },
    {
      wrapper: 'absolute bottom-0 left-[15%] w-28 h-28 opacity-25',
      anim: 'poly-bg-spin-reverse',
      color: 'text-primary-100',
      viewBox: '0 0 100 100',
      elements: [
        { tag: 'polygon', points: '50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5', fill: true, fillOpacity: 0.15, stroke: true, strokeWidth: 1 },
      ],
    },
    {
      wrapper: 'absolute top-[20%] left-[55%] w-20 h-20 opacity-20',
      anim: 'poly-bg-spin-fast',
      color: 'text-white/90',
      viewBox: '0 0 80 80',
      elements: [
        { tag: 'polygon', points: '40,4 76,40 40,76 4,40', fill: 'none', stroke: true, strokeWidth: 1 },
      ],
    },
  ],

  /** Home banner — bold white geometry on rose gradient */
  'home-soft': [
    {
      wrapper: 'absolute -right-16 -top-20 w-64 h-64 sm:w-72 sm:h-72',
      anim: 'poly-bg-orbit',
      glow: true,
      blend: 'screen',
      color: 'text-white',
      viewBox: '0 0 200 200',
      elements: [
        {
          tag: 'polygon',
          points: '100,12 188,168 12,168',
          fill: 'none',
          stroke: true,
          strokeGradient: 'white',
          strokeWidth: 2.25,
          strokeOpacity: 0.9,
        },
        {
          tag: 'polygon',
          points: '100,38 162,152 38,152',
          fillGradient: 'white',
          fillOpacity: 0.22,
          stroke: true,
          strokeGradient: 'white',
          strokeWidth: 1.5,
          strokeOpacity: 0.7,
        },
      ],
    },
    {
      wrapper: 'absolute bottom-[-12%] left-[4%] w-44 h-44 sm:w-52 sm:h-52',
      anim: 'poly-bg-spin-reverse',
      glow: true,
      blend: 'screen',
      color: 'text-white',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,6 94,50 50,94 6,50',
          fillGradient: 'white',
          fillOpacity: 0.18,
          stroke: true,
          strokeGradient: 'white',
          strokeWidth: 1.75,
          strokeOpacity: 0.85,
        },
      ],
    },
    {
      wrapper: 'absolute top-[8%] right-[28%] w-32 h-32',
      anim: 'poly-bg-float',
      blend: 'screen',
      color: 'text-white',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5',
          fill: 'none',
          stroke: true,
          strokeGradient: 'white',
          strokeWidth: 1.6,
          strokeDasharray: '5 7',
          strokeOpacity: 0.75,
        },
      ],
    },
    {
      wrapper: 'absolute top-1/2 left-[38%] w-56 h-56 sm:w-64 sm:h-64 -translate-x-1/2 -translate-y-1/2',
      anim: 'poly-bg-orbit-reverse',
      inner: true,
      blend: 'screen',
      color: 'text-white',
      viewBox: '0 0 120 120',
      elements: [
        {
          tag: 'polygon',
          points: '60,8 112,108 8,108',
          fill: 'none',
          stroke: true,
          strokeGradient: 'white',
          strokeWidth: 1.4,
          strokeDasharray: '8 12',
          strokeOpacity: 0.55,
        },
      ],
    },
  ],

  /** Teacher dashboard header — teal / amber on dark slate */
  teacher: [
    {
      wrapper: 'absolute -top-6 right-[12%] w-36 h-36 opacity-35',
      anim: 'poly-bg-spin-reverse',
      color: 'text-teal-300',
      viewBox: '0 0 100 100',
      elements: [
        { tag: 'polygon', points: '50,6 94,50 50,94 6,50', fill: true, fillOpacity: 0.12, stroke: true, strokeWidth: 1.2 },
      ],
    },
    {
      wrapper: 'absolute bottom-[-10%] left-[5%] w-44 h-44 opacity-30',
      anim: 'poly-bg-spin-slow',
      color: 'text-amber-300/90',
      viewBox: '0 0 120 120',
      elements: [
        { tag: 'polygon', points: '60,10 110,100 10,100', fill: 'none', stroke: true, strokeWidth: 1.4 },
      ],
    },
    {
      wrapper: 'absolute top-[35%] right-[40%] w-24 h-24 opacity-25',
      anim: 'poly-bg-spin',
      color: 'text-slate-400',
      viewBox: '0 0 100 100',
      elements: [
        { tag: 'polygon', points: '50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5', fill: 'none', stroke: true, strokeWidth: 1, strokeDasharray: '3 6' },
      ],
    },
  ],

  /** Landing CTA band — soft white geometry on primary gradient */
  cta: [
    {
      wrapper: 'absolute top-0 right-0 w-56 h-56 opacity-20',
      anim: 'poly-bg-spin-slow',
      color: 'text-white',
      viewBox: '0 0 200 200',
      elements: [
        { tag: 'polygon', points: '100,20 180,160 20,160', fill: true, fillOpacity: 0.08, stroke: true, strokeWidth: 1 },
      ],
    },
    {
      wrapper: 'absolute bottom-[-20%] left-[10%] w-72 h-72 opacity-15',
      anim: 'poly-bg-spin-reverse',
      color: 'text-white',
      viewBox: '0 0 200 200',
      elements: [
        { tag: 'polygon', points: '100,14 178,55 178,145 100,186 22,145 22,55', fill: 'none', stroke: true, strokeWidth: 1.2 },
      ],
    },
  ],

  /** Sidebar — compact rose facets */
  'sidebar-soft': [
    {
      wrapper: 'absolute -top-14 -right-10 w-64 h-64',
      anim: 'poly-bg-orbit',
      glow: true,
      blend: 'multiply',
      color: 'text-primary-400',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,8 92,92 8,92',
          fill: 'none',
          stroke: true,
          strokeGradient: 'rose',
          strokeWidth: 1.75,
          strokeOpacity: 0.7,
        },
      ],
    },
    {
      wrapper: 'absolute top-[32%] -left-8 w-52 h-52',
      anim: 'poly-bg-spin-reverse',
      glow: true,
      blend: 'multiply',
      color: 'text-primary-500',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,6 94,50 50,94 6,50',
          fillGradient: 'roseLight',
          fillOpacity: 0.28,
          stroke: true,
          strokeGradient: 'ink',
          strokeWidth: 1.5,
          strokeOpacity: 0.65,
        },
      ],
    },
    {
      wrapper: 'absolute bottom-[-6%] right-[6%] w-44 h-44',
      anim: 'poly-bg-float',
      blend: 'multiply',
      color: 'text-primary-300',
      viewBox: '0 0 120 120',
      elements: [
        {
          tag: 'polygon',
          points: '60,10 110,100 10,100',
          fill: 'none',
          stroke: true,
          strokeGradient: 'rose',
          strokeWidth: 1.6,
          strokeDasharray: '5 8',
          strokeOpacity: 0.6,
        },
      ],
    },
  ],

  /** Community — signature rose hex + nested triangle */
  'community-soft': [
    {
      wrapper: 'absolute -top-20 right-[-4%] w-[22rem] h-[22rem] max-w-[90vw]',
      anim: 'poly-bg-orbit',
      glow: true,
      blend: 'multiply',
      color: 'text-primary-500',
      viewBox: '0 0 200 200',
      elements: [
        {
          tag: 'polygon',
          points: '100,14 178,55 178,145 100,186 22,145 22,55',
          fill: 'none',
          stroke: true,
          strokeGradient: 'rose',
          strokeWidth: 2,
          strokeDasharray: '10 8',
          strokeOpacity: 0.85,
        },
        {
          tag: 'polygon',
          points: '100,42 158,130 42,130',
          fillGradient: 'roseLight',
          fillOpacity: 0.35,
          stroke: true,
          strokeGradient: 'ink',
          strokeWidth: 1.25,
          strokeOpacity: 0.6,
        },
      ],
    },
    {
      wrapper: 'absolute bottom-[6%] left-[-8%] w-60 h-60',
      anim: 'poly-bg-spin-reverse',
      glow: true,
      blend: 'multiply',
      color: 'text-primary-600',
      viewBox: '0 0 120 120',
      elements: [
        {
          tag: 'polygon',
          points: '60,10 110,100 10,100',
          fillGradient: 'rose',
          fillOpacity: 0.2,
          stroke: true,
          strokeGradient: 'ink',
          strokeWidth: 1.75,
          strokeOpacity: 0.75,
        },
      ],
    },
    {
      wrapper: 'absolute top-[38%] left-[18%] w-36 h-36',
      anim: 'poly-bg-float',
      blend: 'multiply',
      color: 'text-primary-400',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,8 92,50 50,92 8,50',
          fill: 'none',
          stroke: true,
          strokeGradient: 'rose',
          strokeWidth: 1.85,
          strokeOpacity: 0.8,
        },
      ],
    },
  ],

  /** Schedule — rose + sky accent */
  'schedule-soft': [
    {
      wrapper: 'absolute top-[-6%] right-[8%] w-72 h-72',
      anim: 'poly-bg-orbit',
      glow: true,
      blend: 'multiply',
      color: 'text-sky-400',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,8 92,92 8,92',
          fill: 'none',
          stroke: true,
          strokeGradient: 'rose',
          strokeWidth: 1.9,
          strokeOpacity: 0.75,
        },
        {
          tag: 'polygon',
          points: '50,22 78,78 22,78',
          fillGradient: 'roseLight',
          fillOpacity: 0.25,
          stroke: true,
          strokeWidth: 1.2,
          strokeOpacity: 0.5,
        },
      ],
    },
    {
      wrapper: 'absolute bottom-[4%] left-[4%] w-52 h-52',
      anim: 'poly-bg-spin-reverse',
      glow: true,
      blend: 'multiply',
      color: 'text-primary-500',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,6 94,50 50,94 6,50',
          fillGradient: 'rose',
          fillOpacity: 0.18,
          stroke: true,
          strokeGradient: 'ink',
          strokeWidth: 1.65,
          strokeOpacity: 0.7,
        },
      ],
    },
  ],

  /** Generic light pages — large branded triangle stack */
  'ambient-soft': [
    {
      wrapper: 'absolute -top-16 right-[10%] w-[20rem] h-[20rem]',
      anim: 'poly-bg-orbit-reverse',
      glow: true,
      blend: 'multiply',
      color: 'text-primary-500',
      viewBox: '0 0 200 200',
      elements: [
        {
          tag: 'polygon',
          points: '100,20 180,160 20,160',
          fill: 'none',
          stroke: true,
          strokeGradient: 'rose',
          strokeWidth: 2.1,
          strokeOpacity: 0.8,
        },
        {
          tag: 'polygon',
          points: '100,52 150,140 50,140',
          fillGradient: 'roseLight',
          fillOpacity: 0.3,
          stroke: true,
          strokeGradient: 'ink',
          strokeWidth: 1.35,
          strokeOpacity: 0.55,
        },
      ],
    },
    {
      wrapper: 'absolute bottom-[-4%] left-[6%] w-56 h-56',
      anim: 'poly-bg-spin-reverse',
      glow: true,
      blend: 'multiply',
      color: 'text-primary-400',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5',
          fill: 'none',
          stroke: true,
          strokeGradient: 'rose',
          strokeWidth: 1.8,
          strokeDasharray: '6 9',
          strokeOpacity: 0.75,
        },
      ],
    },
    {
      wrapper: 'absolute top-[45%] right-[35%] w-28 h-28',
      anim: 'poly-bg-float',
      blend: 'multiply',
      color: 'text-primary-300',
      viewBox: '0 0 80 80',
      elements: [
        {
          tag: 'polygon',
          points: '40,6 74,40 40,74 6,40',
          fillGradient: 'roseLight',
          fillOpacity: 0.4,
          stroke: true,
          strokeWidth: 1.4,
          strokeOpacity: 0.65,
        },
      ],
    },
  ],

  /** Teacher full page — geometry biased left; main content (right) stays neutral */
  'teacher-ambient': [
    {
      wrapper: 'absolute -top-12 left-[-4%] w-[18rem] h-[18rem] max-w-[70vw]',
      anim: 'poly-bg-orbit-reverse',
      glow: true,
      blend: 'multiply',
      color: 'text-primary-400',
      viewBox: '0 0 200 200',
      elements: [
        {
          tag: 'polygon',
          points: '100,20 180,160 20,160',
          fill: 'none',
          stroke: true,
          strokeGradient: 'rose',
          strokeWidth: 1.6,
          strokeOpacity: 0.45,
        },
        {
          tag: 'polygon',
          points: '100,52 150,140 50,140',
          fillGradient: 'roseLight',
          fillOpacity: 0.14,
          stroke: true,
          strokeGradient: 'ink',
          strokeWidth: 1.1,
          strokeOpacity: 0.32,
        },
      ],
    },
    {
      wrapper: 'absolute bottom-[-4%] left-[8%] w-48 h-48',
      anim: 'poly-bg-spin-reverse',
      glow: true,
      blend: 'multiply',
      color: 'text-primary-400',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5',
          fill: 'none',
          stroke: true,
          strokeGradient: 'rose',
          strokeWidth: 1.35,
          strokeDasharray: '6 9',
          strokeOpacity: 0.38,
        },
      ],
    },
    {
      wrapper: 'absolute top-[52%] right-[8%] w-24 h-24 opacity-70',
      anim: 'poly-bg-float',
      blend: 'multiply',
      color: 'text-primary-300',
      viewBox: '0 0 80 80',
      elements: [
        {
          tag: 'polygon',
          points: '40,6 74,40 40,74 6,40',
          fillGradient: 'roseLight',
          fillOpacity: 0.12,
          stroke: true,
          strokeWidth: 1.1,
          strokeOpacity: 0.28,
        },
      ],
    },
  ],

  /** Teacher banners — compact accents */
  'teacher-soft': [
    {
      wrapper: 'absolute -right-10 -top-8 w-48 h-48 opacity-[0.2]',
      anim: 'poly-bg-orbit',
      blend: 'multiply',
      color: 'text-primary-400',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,6 94,50 50,94 6,50',
          fill: 'none',
          stroke: true,
          strokeGradient: 'rose',
          strokeWidth: 0.85,
          strokeOpacity: 0.4,
        },
      ],
    },
    {
      wrapper: 'absolute bottom-[-6%] left-[6%] w-36 h-36 opacity-[0.16]',
      anim: 'poly-bg-spin-reverse',
      blend: 'multiply',
      color: 'text-primary-400',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,10 90,88 10,88',
          fillGradient: 'roseLight',
          fillOpacity: 0.06,
          stroke: true,
          strokeGradient: 'rose',
          strokeWidth: 0.65,
          strokeOpacity: 0.32,
        },
      ],
    },
  ],

  /** Landing features */
  features: [
    {
      wrapper: 'absolute top-4 right-[12%] w-44 h-44',
      anim: 'poly-bg-orbit',
      glow: true,
      blend: 'multiply',
      color: 'text-primary-500',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,8 92,50 50,92 8,50',
          fill: 'none',
          stroke: true,
          strokeGradient: 'rose',
          strokeWidth: 1.85,
          strokeOpacity: 0.75,
        },
        {
          tag: 'polygon',
          points: '50,22 78,50 50,78 22,50',
          fillGradient: 'roseLight',
          fillOpacity: 0.28,
          stroke: true,
          strokeWidth: 1.1,
          strokeOpacity: 0.45,
        },
      ],
    },
    {
      wrapper: 'absolute bottom-8 left-[6%] w-52 h-52',
      anim: 'poly-bg-spin-reverse',
      glow: true,
      blend: 'multiply',
      color: 'text-primary-400',
      viewBox: '0 0 120 120',
      elements: [
        {
          tag: 'polygon',
          points: '60,8 112,108 8,108',
          fillGradient: 'rose',
          fillOpacity: 0.15,
          stroke: true,
          strokeGradient: 'ink',
          strokeWidth: 1.5,
          strokeOpacity: 0.65,
        },
      ],
    },
  ],

  /** Admin panel — slate + cyan control-room geometry (light UI) */
  'admin-panel-soft': [
    {
      wrapper: 'absolute -top-16 right-[-6%] w-[26rem] h-[26rem] max-w-[95vw] opacity-70',
      anim: 'poly-bg-orbit',
      glow: true,
      blend: 'multiply',
      color: 'text-slate-400',
      viewBox: '0 0 200 200',
      elements: [
        {
          tag: 'polygon',
          points: '100,8 188,54 188,146 100,192 12,146 12,54',
          fill: 'none',
          stroke: true,
          strokeGradient: 'slate',
          strokeWidth: 1.85,
          strokeDasharray: '8 6',
          strokeOpacity: 0.75,
        },
        {
          tag: 'polygon',
          points: '100,38 158,72 158,128 100,162 42,128 42,72',
          fillGradient: 'cyanLight',
          fillOpacity: 0.22,
          stroke: true,
          strokeGradient: 'cyan',
          strokeWidth: 1.2,
          strokeOpacity: 0.55,
        },
      ],
    },
    {
      wrapper: 'absolute bottom-[8%] left-[-10%] w-72 h-72 opacity-60',
      anim: 'poly-bg-spin-reverse',
      blend: 'multiply',
      color: 'text-cyan-500/70',
      viewBox: '0 0 240 240',
      elements: [
        {
          tag: 'polygon',
          points: '120,24 216,216 24,216',
          fill: 'none',
          stroke: true,
          strokeGradient: 'cyan',
          strokeWidth: 1.65,
          strokeDasharray: '6 10',
          strokeOpacity: 0.7,
        },
      ],
    },
    {
      wrapper: 'absolute top-[28%] left-[42%] w-40 h-40 opacity-50',
      anim: 'poly-bg-drift-gentle',
      blend: 'multiply',
      color: 'text-slate-500',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,6 94,50 50,94 6,50',
          fillGradient: 'slateLight',
          fillOpacity: 0.18,
          stroke: true,
          strokeGradient: 'slate',
          strokeWidth: 1.4,
          strokeOpacity: 0.6,
        },
      ],
    },
    {
      wrapper: 'absolute top-[12%] left-[8%] w-32 h-32 opacity-45',
      anim: 'poly-bg-float',
      blend: 'multiply',
      color: 'text-cyan-600/60',
      viewBox: '0 0 100 100',
      elements: [
        {
          tag: 'polygon',
          points: '50,10 90,35 90,65 50,90 10,65 10,35',
          fill: 'none',
          stroke: true,
          strokeGradient: 'cyan',
          strokeWidth: 1.35,
          strokeOpacity: 0.65,
        },
      ],
    },
    {
      wrapper: 'absolute bottom-[22%] right-[14%] w-48 h-48 opacity-40',
      anim: 'poly-bg-orbit-reverse',
      glow: true,
      blend: 'multiply',
      color: 'text-slate-400',
      viewBox: '0 0 120 120',
      elements: [
        {
          tag: 'polygon',
          points: '60,8 112,108 8,108',
          fill: 'none',
          stroke: true,
          strokeGradient: 'slate',
          strokeWidth: 1.5,
          strokeOpacity: 0.55,
        },
      ],
    },
  ],

}
