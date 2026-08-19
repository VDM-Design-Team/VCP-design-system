const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function StatCard({ label, value, unit, delta, deltaTone, icon, footer, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  const dc = deltaTone==='down' ? t.danger : deltaTone==='flat' ? t.fg3 : 'rgb(40,120,50)';
  return React.createElement('div',{style:{background:t.surface,border:'1px solid '+t.strokeSubtle,
    borderRadius:8,padding:16,display:'flex',flexDirection:'column',gap:8,
    boxShadow:'0 1px 2px rgba(2,6,23,.04)',...style}},
    React.createElement('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}},
      React.createElement('span',{style:{font:'400 12px/1 '+t.font,color:t.fg3}},label),
      icon&&React.createElement('span',{style:{color:t.fg4,display:'grid',placeItems:'center'}},icon)),
    React.createElement('div',{style:{display:'flex',alignItems:'baseline',gap:6}},
      React.createElement('span',{style:{font:'600 28px/1 '+t.font,color:t.fg1}},value),
      unit&&React.createElement('span',{style:{font:'400 13px/1 '+t.font,color:t.fg3}},unit),
      delta!=null&&React.createElement('span',{style:{marginLeft:2,font:'500 12px/1 '+t.font,color:dc}},delta)),
    footer&&React.createElement('span',{style:{font:'400 12px/1.4 '+t.font,color:t.fg3}},footer));
}