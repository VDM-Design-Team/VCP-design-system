const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function Tooltip({ content, placement='top', children, style }) {
  const [open,setOpen]=React.useState(false);
  const pos = placement==='bottom'?{top:'calc(100% + 8px)'}:placement==='left'?{right:'calc(100% + 8px)',top:'50%',transform:'translateY(-50%)'}
    :placement==='right'?{left:'calc(100% + 8px)',top:'50%',transform:'translateY(-50%)'}:{bottom:'calc(100% + 8px)'};
  const center = (placement==='top'||placement==='bottom')?{left:'50%',transform:'translateX(-50%)'}:{};
  return React.createElement('span',{onMouseEnter:()=>setOpen(true),onMouseLeave:()=>setOpen(false),
    onFocus:()=>setOpen(true),onBlur:()=>setOpen(false),
    style:{position:'relative',display:'inline-flex',...style}},
    children,
    open && React.createElement('span',{role:'tooltip',style:{position:'absolute',...pos,...center,zIndex:50,
      background:'rgb(14,10,73)',color:'#fff',font:'400 12px/1.4 '+t.font,padding:'6px 10px',
      borderRadius:6,whiteSpace:'nowrap',boxShadow:'0 8px 24px rgba(2,6,23,.18)',pointerEvents:'none'}},content));
}