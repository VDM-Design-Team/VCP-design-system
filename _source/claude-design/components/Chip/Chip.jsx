const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',font:"'Poppins', system-ui, sans-serif"};
export function Chip({ label, avatar, count, onRemove, selected, onClick, style }) {
  const [h,setH]=React.useState(false);
  return React.createElement('span', { onClick, onMouseEnter:()=>setH(true), onMouseLeave:()=>setH(false), style:{
      display:'inline-flex', alignItems:'center', gap:6, height:28,
      padding: avatar ? '2px 6px 2px 2px' : '0 10px', borderRadius:999,
      background: selected ? t.blue200 : h && onClick ? t.blue200 : t.blue100,
      color:t.fg1, font:'500 13px/1 '+t.font, cursor:onClick?'pointer':'default',
      transition:'background 120ms', whiteSpace:'nowrap', ...style } },
    avatar, label,
    count!=null && React.createElement(React.Fragment,null,
      React.createElement('span',{style:{width:1,alignSelf:'stretch',background:'rgba(2,6,23,.22)',margin:'4px 2px'}}),
      React.createElement('span',{style:{font:'500 12px/1 '+t.font,padding:'0 4px 0 2px'}},count)),
    onRemove && React.createElement('button',{onClick:e=>{e.stopPropagation();onRemove();},'aria-label':'Remove '+label,
      style:{width:18,height:18,borderRadius:'50%',border:0,background:'transparent',color:t.fg1,
        cursor:'pointer',display:'grid',placeItems:'center',padding:0,font:'400 11px/1 '+t.font}},'\u2715'));
}