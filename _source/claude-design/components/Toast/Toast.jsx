const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
const TONE={info:{bg:'rgb(14,10,73)',fg:'#fff'},success:{bg:'rgb(40,120,50)',fg:'#fff'},
 warning:{bg:'rgb(146,84,14)',fg:'#fff'},danger:{bg:'rgb(185,28,28)',fg:'#fff'}};
export function Toast({ tone='info', title, children, icon, action, onDismiss, style }) {
  const c=TONE[tone]||TONE.info;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  return React.createElement('div',{role:'status',style:{display:'flex',alignItems:'flex-start',gap:12,
    minWidth:320,maxWidth:440,padding:'12px 14px',borderRadius:10,background:c.bg,color:c.fg,
    boxShadow:'0 12px 32px rgba(2,6,23,.28)',...style}},
    icon && React.createElement('span',{style:{flexShrink:0,display:'grid',placeItems:'center'}},icon),
    React.createElement('div',{style:{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:2}},
      title && React.createElement('strong',{style:{font:'600 13px/1.4 '+t.font}},title),
      children && React.createElement('span',{style:{font:'400 13px/1.5 '+t.font,opacity:.9}},children)),
    action,
    onDismiss && React.createElement('button',{onClick:onDismiss,'aria-label':'Dismiss',
      style:{border:0,background:'transparent',color:'inherit',cursor:'pointer',padding:0,flexShrink:0,
        display:'grid',placeItems:'center',opacity:.8}},
      Icon&&React.createElement(Icon,{name:'x-mark',size:16})));
}