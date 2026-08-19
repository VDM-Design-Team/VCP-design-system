const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function Accordion({ items=[], openKeys=[], onToggle, multiple, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  const [inner,setInner]=React.useState([]);
  const keys = onToggle ? openKeys : inner;
  const toggle = k => {
    if (onToggle) return onToggle(k);
    setInner(cur => cur.includes(k) ? cur.filter(x=>x!==k) : multiple ? [...cur,k] : [k]);
  };
  return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:8,...style}},
    items.map((it,i)=>{ const k=it.key||String(i); const on=keys.includes(k);
      return React.createElement('div',{key:k,style:{border:'1px solid '+t.strokeSubtle,
        borderRadius:8,overflow:'hidden',background:t.surface}},
        React.createElement('button',{onClick:()=>toggle(k),'aria-expanded':on,
          style:{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'12px 14px',
            border:0,background:on?t.blue50:'transparent',cursor:'pointer',textAlign:'left'}},
          Icon&&React.createElement(Icon,{name:on?'chevron-down':'chevron-right',size:14,
            style:{color:t.fg3,flexShrink:0}}),
          React.createElement('span',{style:{flex:1,font:'500 14px/1.3 '+t.font,color:t.fg1}},it.title),
          it.meta&&React.createElement('span',{style:{font:'400 12px/1 '+t.font,color:t.fg3}},it.meta)),
        on&&React.createElement('div',{style:{padding:'0 14px 14px 38px',
          font:'400 14px/1.55 '+t.font,color:t.fg2}},it.content));
    }));
}