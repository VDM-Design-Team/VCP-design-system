const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function Divider({ orientation='horizontal', label, style }) {
  if (orientation==='vertical')
    return React.createElement('span',{style:{width:1,alignSelf:'stretch',background:t.strokeSubtle,...style}});
  if (label) return React.createElement('div',{style:{display:'flex',alignItems:'center',gap:12,...style}},
    React.createElement('span',{style:{flex:1,height:1,background:t.strokeSubtle}}),
    React.createElement('span',{style:{font:'500 11px/1 '+t.font,color:t.fg4,textTransform:'uppercase',letterSpacing:'.06em'}},label),
    React.createElement('span',{style:{flex:1,height:1,background:t.strokeSubtle}}));
  return React.createElement('hr',{style:{border:0,height:1,background:t.strokeSubtle,margin:0,...style}});
}