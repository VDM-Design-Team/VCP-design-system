const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function IconButton({ icon, label, variant='ghost', size=32, onClick, disabled, style }) {
  const [h,setH]=React.useState(false);
  let bg='transparent', fg=t.fg2, bd='none';
  if(variant==='filled'){ bg=disabled?'rgb(223,223,223)':h?t.blue600:t.blue500; fg='#fff'; }
  if(variant==='outlined'){ bd='1px solid '+t.stroke; bg=h?t.blue50:t.surface; fg=t.fg2; }
  if(variant==='ghost'){ bg=h?t.blue50:'transparent'; fg=h?t.blue500:t.fg2; }
  if(variant==='danger'){ bg=h?'rgb(254,226,226)':'transparent'; fg=t.danger; }
  return React.createElement('button',{onClick:disabled?undefined:onClick,disabled,
    'aria-label':label,title:label,
    onMouseEnter:()=>setH(true),onMouseLeave:()=>setH(false),
    style:{width:size,height:size,borderRadius:variant==='filled'?'50%':8,border:bd,background:bg,
      color:disabled?'rgb(129,129,129)':fg,cursor:disabled?'not-allowed':'pointer',
      display:'grid',placeItems:'center',padding:0,flexShrink:0,
      transition:'background 120ms, color 120ms',...style}}, icon);
}