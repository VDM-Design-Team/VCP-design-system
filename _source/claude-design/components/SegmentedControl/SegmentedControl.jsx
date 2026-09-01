const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function SegmentedControl({ options=[], value, onChange, size='default', style }) {
  const h = size==='small'?28:36;
  return React.createElement('div',{role:'radiogroup',style:{display:'inline-flex',padding:2,gap:2,
    background:'rgb(241,245,249)',borderRadius:8,...style}},
    options.map(o=>{ const k=typeof o==='string'?o:o.value, l=typeof o==='string'?o:o.label, on=value===k;
      return React.createElement('button',{key:k,role:'radio','aria-checked':on,onClick:()=>onChange&&onChange(k),
        style:{height:h,padding:'0 14px',border:0,borderRadius:6,cursor:'pointer',
          background:on?t.surface:'transparent',color:on?t.fg1:t.fg3,
          font:(on?'500 ':'400 ')+(size==='small'?12:13)+'px/1 '+t.font,
          boxShadow:on?'0 1px 2px rgba(2,6,23,.08)':'none',transition:'background 120ms'}},l);}));
}