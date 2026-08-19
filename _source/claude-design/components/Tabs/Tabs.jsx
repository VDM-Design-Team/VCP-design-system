const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function Tabs({ tabs=[], value, onChange, style }) {
  return React.createElement('div',{role:'tablist',style:{display:'flex',gap:4,
    borderBottom:'1px solid '+t.strokeSubtle,...style}},
    tabs.map(tb=>{ const k=typeof tb==='string'?tb:tb.key, l=typeof tb==='string'?tb:tb.label,
      n=typeof tb==='object'?tb.count:undefined, on=value===k;
      return React.createElement('button',{key:k,role:'tab','aria-selected':on,onClick:()=>onChange&&onChange(k),
        style:{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 14px',border:0,
          background:'transparent',cursor:'pointer',color:on?t.blue500:t.fg3,
          font:(on?'500 ':'400 ')+'14px/1 '+t.font,borderBottom:'2px solid '+(on?t.blue500:'transparent'),
          marginBottom:-1,transition:'color 120ms, border-color 120ms'}},
        l, n!=null && React.createElement('span',{style:{font:'500 10px/16px '+t.font,padding:'0 6px',
          borderRadius:999,background:on?t.blue100:'rgb(241,245,249)',color:on?t.blue500:t.fg3}},n));}));
}