const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function Menu({ items=[], onSelect, trigger, open, onOpenChange, align='right', style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const {Icon,IconButton}=G;
  const [inner,setInner]=React.useState(false);
  const isOpen = open!==undefined ? open : inner;
  const set = v => { onOpenChange ? onOpenChange(v) : setInner(v); };
  const ref=React.useRef(null);
  React.useEffect(()=>{
    if(!isOpen) return;
    const away=e=>{ if(ref.current&&!ref.current.contains(e.target)) set(false); };
    document.addEventListener('mousedown',away);
    return ()=>document.removeEventListener('mousedown',away);
  },[isOpen]);
  return React.createElement('div',{ref,style:{position:'relative',display:'inline-flex',...style}},
    React.createElement('span',{onClick:()=>set(!isOpen)},
      trigger || (IconButton&&Icon&&React.createElement(IconButton,{label:'More actions',
        icon:React.createElement(Icon,{name:'ellipsis-vertical',size:18})}))),
    isOpen && React.createElement('div',{role:'menu',
      style:{position:'absolute',top:'calc(100% + 6px)',[align]:0,zIndex:60,minWidth:190,
        background:t.surface,border:'1px solid '+t.strokeSubtle,borderRadius:8,padding:4,
        boxShadow:'0 8px 24px rgba(2,6,23,.18)'}},
      items.map((it,i)=> it.divider
        ? React.createElement('span',{key:'d'+i,style:{display:'block',height:1,
            background:t.strokeSubtle,margin:'4px 0'}})
        : React.createElement(MItem,{key:it.key||i,it,onSelect,set,Icon}))));
}
function MItem({ it, onSelect, set, Icon }) {
  const [h,setH]=React.useState(false);
  const danger=it.tone==='danger';
  return React.createElement('button',{role:'menuitem',disabled:it.disabled,
    onMouseEnter:()=>setH(true),onMouseLeave:()=>setH(false),
    onClick:()=>{ if(it.disabled) return; onSelect&&onSelect(it.key); it.onClick&&it.onClick(); set(false); },
    style:{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:6,
      border:0,cursor:it.disabled?'not-allowed':'pointer',textAlign:'left',
      background:h&&!it.disabled?(danger?'rgb(254,226,226)':t.blue50):'transparent',
      color:it.disabled?t.fg4:danger?t.danger:t.fg2,font:'400 13px/1 '+t.font}},
    it.icon&&Icon&&React.createElement(Icon,{name:it.icon,size:16}),
    React.createElement('span',{style:{flex:1}},it.label),
    it.shortcut&&React.createElement('span',{style:{font:'400 11px/1 '+t.font,color:t.fg4}},it.shortcut));
}