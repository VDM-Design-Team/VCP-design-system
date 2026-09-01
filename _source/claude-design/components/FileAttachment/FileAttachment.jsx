const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
const KIND = { image:'photo', pdf:'document', doc:'document', csv:'document', video:'photo' };
export function FileAttachment({ name, size, kind='doc', thumb, onRemove, onClick, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  const [h,setH]=React.useState(false);
  return React.createElement('div',{onMouseEnter:()=>setH(true),onMouseLeave:()=>setH(false),onClick,
    style:{position:'relative',width:104,display:'flex',flexDirection:'column',gap:6,
      cursor:onClick?'pointer':'default',...style}},
    React.createElement('div',{style:{height:72,borderRadius:8,border:'1px solid '+t.strokeSubtle,
      background:thumb?'transparent':t.canvas,overflow:'hidden',display:'grid',placeItems:'center',
      color:t.fg3,boxShadow:h?'0 2px 6px rgba(2,6,23,.08)':'none',transition:'box-shadow 120ms'}},
      thumb ? React.createElement('img',{src:thumb,alt:name,style:{width:'100%',height:'100%',objectFit:'cover'}})
            : Icon&&React.createElement(Icon,{name:KIND[kind]||'document',size:24})),
    React.createElement('span',{style:{font:'400 11px/1.3 '+t.font,color:t.fg2,
      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},title:name},name),
    size && React.createElement('span',{style:{font:'400 10px/1 '+t.font,color:t.fg4}},size),
    onRemove && h && React.createElement('button',{onClick:e=>{e.stopPropagation();onRemove();},
      'aria-label':'Remove '+name,
      style:{position:'absolute',top:-6,right:-6,width:22,height:22,borderRadius:'50%',
        border:'1px solid '+t.strokeSubtle,background:t.surface,color:t.fg2,cursor:'pointer',
        display:'grid',placeItems:'center',boxShadow:'0 1px 3px rgba(2,6,23,.16)',padding:0}},
      Icon&&React.createElement(Icon,{name:'x-mark',size:12})));
}