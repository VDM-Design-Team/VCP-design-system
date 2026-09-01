const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function Popover(props){
  const { content, trigger, open, onOpenChange, placement='bottom', width=280, style } = props;
  const [inner,setInner]=React.useState(false);
  const isOpen = open!==undefined ? open : inner;
  const set=v=>{ if(onOpenChange) onOpenChange(v); else setInner(v); };
  const ref=React.useRef(null);
  React.useEffect(()=>{
    if(!isOpen) return;
    const away=e=>{ if(ref.current&&!ref.current.contains(e.target)) set(false); };
    const esc=e=>{ if(e.key==='Escape') set(false); };
    document.addEventListener('mousedown',away);
    document.addEventListener('keydown',esc);
    return ()=>{ document.removeEventListener('mousedown',away); document.removeEventListener('keydown',esc); };
  },[isOpen]);
  const pos = placement==='top'?{bottom:'calc(100% + 8px)'}:{top:'calc(100% + 8px)'};
  return React.createElement('div',{ref,style:{position:'relative',display:'inline-flex',...style}},[
    React.createElement('span',{key:'tr',onClick:()=>set(!isOpen)},trigger),
    isOpen?React.createElement('div',{key:'pop',role:'dialog',style:{position:'absolute',...pos,left:0,zIndex:70,
      width,background:t.surface,border:'1px solid '+t.strokeSubtle,borderRadius:10,padding:14,
      boxShadow:'0 8px 24px rgba(2,6,23,.18)'}},content):null]);
}