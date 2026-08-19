const t = {
  blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',
  blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',
  blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',
  blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',
  blue400:'var(--colors-vcp-blue-400, rgb(83,128,228))',
  blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',
  blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',
  blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',
  fg1:'var(--colors-text-primary, rgb(2,6,23))',
  fg2:'var(--colors-text-secondary, rgb(51,65,85))',
  fg3:'var(--colors-text-tertiary, rgb(100,116,139))',
  fg4:'var(--colors-text-subtle, rgb(148,163,184))',
  canvas:'var(--colors-surface-canvas, rgb(248,250,252))',
  surface:'var(--colors-surface-elevated, rgb(255,255,255))',
  stroke:'var(--colors-stroke-default, rgb(203,213,225))',
  strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',
  success:'rgb(99,194,112)', danger:'rgb(231,0,11)', warn:'rgb(250,204,20)',
  font:"'Poppins', system-ui, sans-serif",
};
export function SidebarItem({ label, icon, selected, collapsed, badge, onClick, style }) {
  const [h,setH] = React.useState(false);
  const bg = selected ? t.blue100 : h ? t.blue50 : 'transparent';
  const fg = selected ? t.blue500 : t.fg2;
  return React.createElement('div', {
    onClick, onMouseEnter:()=>setH(true), onMouseLeave:()=>setH(false),
    title: collapsed ? label : undefined,
    style:{ display:'flex', alignItems:'center', gap:8, height:40, borderRadius:8,
      padding:collapsed?'8px':'8px 8px', background:bg, color:fg, cursor:'pointer',
      justifyContent:collapsed?'center':'flex-start',
      font:(selected?'500 ':'400 ')+'14px/1 '+t.font, transition:'background 120ms', ...style }
  },
    icon && React.createElement('span',{style:{width:24,height:24,display:'grid',placeItems:'center',flexShrink:0}}, icon),
    !collapsed && React.createElement('span',{style:{flex:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}, label),
    !collapsed && badge!=null && React.createElement('span',{style:{font:'500 10px/16px '+t.font,background:t.blue500,color:'#fff',borderRadius:999,padding:'0 6px'}}, badge)
  );
}