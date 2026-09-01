const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
const TONE={info:{bg:'rgb(219,234,254)',fg:'rgb(29,78,216)',bd:'rgb(191,219,254)'},
 success:{bg:'rgb(220,245,224)',fg:'rgb(40,120,50)',bd:'rgb(187,235,195)'},
 warning:{bg:'rgb(254,243,199)',fg:'rgb(146,84,14)',bd:'rgb(253,230,138)'},
 danger:{bg:'rgb(254,226,226)',fg:'rgb(185,28,28)',bd:'rgb(254,202,202)'}};
export function Banner({ tone='info', title, children, icon, onDismiss, action, style }) {
  const c=TONE[tone]||TONE.info;
  return React.createElement('div',{role:'status',style:{display:'flex',gap:12,padding:'12px 14px',
    background:c.bg,border:'1px solid '+c.bd,borderRadius:8,color:c.fg,...style}},
    icon && React.createElement('span',{style:{flexShrink:0,display:'grid',placeItems:'center'}},icon),
    React.createElement('div',{style:{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:2}},
      title && React.createElement('strong',{style:{font:'600 14px/1.4 '+t.font}},title),
      children && React.createElement('span',{style:{font:'400 13px/1.5 '+t.font}},children)),
    action,
    onDismiss && React.createElement('button',{onClick:onDismiss,'aria-label':'Dismiss',
      style:{border:0,background:'transparent',color:'inherit',cursor:'pointer',padding:0,
        font:'400 14px/1 '+t.font,alignSelf:'flex-start'}},'\u2715'));
}