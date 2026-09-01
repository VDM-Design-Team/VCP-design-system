const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function SearchSelect(props){
  const { options=[], value, onChange, placeholder='Search…', renderOption, emptyText='No matches', multiple, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Icon, Avatar } = G;
  const [q,setQ]=React.useState('');
  const [open,setOpen]=React.useState(false);
  const ref=React.useRef(null);
  React.useEffect(()=>{
    if(!open) return;
    const away=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown',away);
    return ()=>document.removeEventListener('mousedown',away);
  },[open]);
  const norm=o=>typeof o==='string'?{value:o,label:o}:o;
  const list=options.map(norm).filter(o=>!q||String(o.label).toLowerCase().includes(q.toLowerCase()));
  const selected=Array.isArray(value)?value:value?[value]:[];
  const pick=v=>{
    if(!onChange) return;
    if(multiple) onChange(selected.includes(v)?selected.filter(x=>x!==v):[...selected,v]);
    else { onChange(v); setOpen(false); }
  };
  return React.createElement('div',{ref,style:{position:'relative',...style}},[
    React.createElement('div',{key:'in',style:{display:'flex',alignItems:'center',gap:8,height:36,padding:'0 12px',
      background:t.surface,border:'1px solid '+(open?t.blue500:t.stroke),borderRadius:8,
      boxShadow:open?'0 0 0 3px rgba(26,86,219,.16)':'none'}},[
      Icon?React.createElement(Icon,{key:'i',name:'magnifying-glass',size:16,style:{color:t.fg3}}):null,
      React.createElement('input',{key:'f',value:q,placeholder,onFocus:()=>setOpen(true),
        onChange:e=>{ setQ(e.target.value); setOpen(true); },
        style:{flex:1,minWidth:0,border:0,outline:0,background:'transparent',color:t.fg1,
          font:'400 13px/1 '+t.font}}),
      selected.length?React.createElement('span',{key:'c',style:{font:'500 11px/1 '+t.font,color:t.blue500}},
        selected.length):null]),
    open?React.createElement('div',{key:'l',role:'listbox',style:{position:'absolute',top:'calc(100% + 6px)',left:0,right:0,
      zIndex:70,maxHeight:220,overflowY:'auto',background:t.surface,
      border:'1px solid '+t.strokeSubtle,borderRadius:8,padding:4,
      boxShadow:'0 8px 24px rgba(2,6,23,.18)'}},
      list.length?list.map(o=>{
        const on=selected.includes(o.value);
        return React.createElement('button',{key:o.value,role:'option','aria-selected':on,onClick:()=>pick(o.value),
          style:{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'8px 10px',
            borderRadius:6,border:0,cursor:'pointer',textAlign:'left',
            background:on?t.blue100:'transparent',color:on?t.blue500:t.fg2,
            font:'400 13px/1.3 '+t.font}},
          renderOption?renderOption(o,on):[
            Avatar&&o.avatar!==false?React.createElement(Avatar,{key:'a',name:String(o.label),size:22}):null,
            React.createElement('span',{key:'l',style:{flex:1}},o.label),
            on&&Icon?React.createElement(Icon,{key:'c',name:'check',size:14}):null]);
      }):React.createElement('div',{style:{padding:'12px 10px',font:'400 13px/1 '+t.font,color:t.fg4,
        textAlign:'center'}},emptyText)):null]);
}