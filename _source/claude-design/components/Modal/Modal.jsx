const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function Modal({ open=true, title, description, children, footer, onClose, width=520, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  if(!open) return null;
  return React.createElement('div',{role:'dialog','aria-modal':'true',
    style:{position:'fixed',inset:0,zIndex:100,display:'grid',placeItems:'center',
      background:'rgba(2,6,23,.45)',padding:24}},
    React.createElement('div',{onClick:e=>e.stopPropagation(),
      style:{width:'100%',maxWidth:width,maxHeight:'calc(100vh - 48px)',background:t.surface,
        borderRadius:12,boxShadow:'0 24px 64px rgba(2,6,23,.28)',display:'flex',flexDirection:'column',
        overflow:'hidden',...style}},
      React.createElement('header',{style:{display:'flex',alignItems:'flex-start',gap:12,
        padding:'20px 24px 0'}},
        React.createElement('div',{style:{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:4}},
          React.createElement('h2',{style:{margin:0,font:'600 18px/1.3 '+t.font,color:t.fg1}},title),
          description && React.createElement('p',{style:{margin:0,font:'400 13px/1.5 '+t.font,color:t.fg3}},description)),
        onClose && React.createElement('button',{onClick:onClose,'aria-label':'Close',
          style:{width:32,height:32,borderRadius:8,border:0,background:'transparent',color:t.fg3,
            cursor:'pointer',display:'grid',placeItems:'center',flexShrink:0,padding:0}},
          Icon&&React.createElement(Icon,{name:'x-mark',size:20}))),
      React.createElement('div',{style:{padding:'20px 24px',overflowY:'auto',flex:1}},children),
      footer && React.createElement('footer',{style:{display:'flex',justifyContent:'flex-end',gap:10,
        padding:'16px 24px',borderTop:'1px solid '+t.strokeSubtle,background:t.canvas}},footer)));
}