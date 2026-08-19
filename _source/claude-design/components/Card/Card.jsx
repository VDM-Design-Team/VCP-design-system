const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function Card({ title, action, footer, padded=true, children, style, bodyStyle }) {
  return React.createElement('section',{style:{background:t.surface,border:'1px solid '+t.strokeSubtle,
    borderRadius:8,boxShadow:'0 1px 2px rgba(2,6,23,.04)',overflow:'hidden',...style}},
    (title||action) && React.createElement('header',{style:{display:'flex',alignItems:'center',
      justifyContent:'space-between',gap:12,padding:'14px 16px'}},
      React.createElement('h3',{style:{margin:0,font:'600 16px/1.2 '+t.font,color:t.fg1}},title),
      action),
    React.createElement('div',{style:{padding:padded?(title?'0 16px 16px':'16px'):0,...bodyStyle}},children),
    footer && React.createElement('footer',{style:{padding:'12px 16px',borderTop:'1px solid '+t.strokeSubtle,
      background:t.canvas}},footer));
}