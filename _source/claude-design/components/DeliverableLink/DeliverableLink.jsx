const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function DeliverableLink(props){
  const { label, url, domain, state='filled', onEdit, onDelete, onChange, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Icon, IconButton, DomainLabel, Input } = G;
  if(state==='editing'){
    return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:6,...style}},[
      React.createElement('span',{key:'l',style:{font:'400 11px/1 '+t.font,color:t.fg3}},label||'Label'),
      Input?React.createElement(Input,{key:'i',size:'small',value:url||'',placeholder:'Paste Link Here',
        onChange:e=>onChange&&onChange(e.target.value),
        leadingIcon:Icon?React.createElement(Icon,{name:'paper-clip',size:14}):null}):null]);
  }
  if(state==='empty'){
    return React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',
      border:'1px dashed '+t.stroke,borderRadius:8,color:t.fg4,
      font:'400 13px/1 '+t.font,...style}},[
      Icon?React.createElement(Icon,{key:'i',name:'paper-clip',size:14}):null,'No link added']);
  }
  return React.createElement('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',
    border:'1px solid '+t.strokeSubtle,borderRadius:8,background:t.surface,...style}},[
    Icon?React.createElement(Icon,{key:'i',name:'paper-clip',size:14,style:{color:t.fg3,flexShrink:0}}):null,
    React.createElement('div',{key:'c',style:{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:2}},[
      React.createElement('a',{key:'a',href:url||'#',target:'_blank',rel:'noreferrer',
        style:{font:'500 13px/1.3 '+t.font,color:t.blue500,textDecoration:'none',
          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},label||url),
      url&&label?React.createElement('span',{key:'u',style:{font:'400 11px/1 '+t.font,color:t.fg4,
        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},url):null]),
    domain&&DomainLabel?React.createElement(DomainLabel,{key:'d',domain,size:'small'}):null,
    onEdit&&IconButton&&Icon?React.createElement(IconButton,{key:'e',label:'Edit link',size:26,
      onClick:onEdit,icon:React.createElement(Icon,{name:'pencil-square',size:14})}):null,
    onDelete&&IconButton&&Icon?React.createElement(IconButton,{key:'x',label:'Delete link',size:26,variant:'danger',
      onClick:onDelete,icon:React.createElement(Icon,{name:'trash',size:14})}):null]);
}