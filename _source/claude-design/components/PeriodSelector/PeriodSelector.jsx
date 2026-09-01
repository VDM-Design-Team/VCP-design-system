const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function PeriodSelector({ value, onChange, periods=[], label, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  const i=Math.max(0,periods.indexOf(value));
  const go=d=>{ const n=i+d; if(n>=0&&n<periods.length&&onChange) onChange(periods[n]); };
  const btn=(dir,name,dis)=>React.createElement('button',{onClick:()=>go(dir),disabled:dis,
    'aria-label':dir<0?'Previous period':'Next period',
    style:{width:32,height:32,borderRadius:8,border:'1px solid '+t.strokeSubtle,
      background:t.surface,color:dis?t.fg4:'rgb(71,85,105)',cursor:dis?'not-allowed':'pointer',
      display:'grid',placeItems:'center',padding:0,flexShrink:0}},
    Icon&&React.createElement(Icon,{name,size:16}));
  return React.createElement('div',{style:{display:'inline-flex',alignItems:'center',gap:8,...style}},
    label&&React.createElement('span',{style:{font:'400 12px/1 '+t.font,color:t.fg3}},label),
    btn(-1,'chevron-left',i<=0),
    React.createElement('span',{style:{minWidth:104,textAlign:'center',font:'500 14px/1 '+t.font,color:t.fg1}},value),
    btn(1,'chevron-right',i>=periods.length-1));
}