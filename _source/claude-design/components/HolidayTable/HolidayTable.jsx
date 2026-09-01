const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function HolidayTable(props){
  const { rows=[], editable, onEdit, onDelete, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Badge, IconButton, Icon, DomainLabel, Avatar } = G;
  const COLS=editable?'1.6fr 120px 1.1fr 1fr 130px 76px':'1.6fr 120px 1.1fr 1fr 130px';
  const heads=['Holiday','Date','Applies to','Added by','Recurring'].concat(editable?['']:[]);
  const header=React.createElement('div',{key:'h',style:{display:'grid',gridTemplateColumns:COLS,gap:14,
    padding:'0 18px',height:44,alignItems:'center',background:t.canvas,
    borderBottom:'1px solid '+t.strokeSubtle}},
    heads.map((h,i)=>React.createElement('span',{key:i,style:{font:'600 11px/1 '+t.font,color:t.fg2,
      textTransform:'uppercase',letterSpacing:'.05em'}},h)));
  const body=rows.map((r,i)=>React.createElement('div',{key:r.id||i,style:{display:'grid',gridTemplateColumns:COLS,
    gap:14,padding:'12px 18px',alignItems:'center',
    borderBottom:i===rows.length-1?0:'1px solid '+t.strokeSubtle}},[
    React.createElement('div',{key:'n',style:{display:'flex',flexDirection:'column',gap:2,minWidth:0}},[
      React.createElement('span',{key:'t',style:{font:'500 13px/1.3 '+t.font,color:t.fg1}},r.name),
      r.type?React.createElement('span',{key:'ty',style:{font:'400 11px/1 '+t.font,color:t.fg3}},r.type):null]),
    React.createElement('span',{key:'d',style:{font:'400 12px/1 '+t.font,color:t.fg2}},r.date),
    React.createElement('div',{key:'a',style:{display:'flex',gap:6,flexWrap:'wrap'}},
      (r.appliesTo||['All domains']).map(d=>
        d==='All domains'
          ? React.createElement('span',{key:d,style:{font:'400 12px/1 '+t.font,color:t.fg3}},d)
          : DomainLabel?React.createElement(DomainLabel,{key:d,domain:d,size:'small'}):null)),
    React.createElement('div',{key:'by',style:{display:'flex',alignItems:'center',gap:6,minWidth:0}},[
      Avatar&&r.addedBy?React.createElement(Avatar,{key:'av',name:r.addedBy,size:22}):null,
      React.createElement('span',{key:'nm',style:{font:'400 12px/1 '+t.font,color:t.fg2,
        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},r.addedBy||'System')]),
    React.createElement('div',{key:'rec'}, Badge?React.createElement(Badge,{tone:r.recurring?'brand':'neutral'},
      r.recurring?'Yearly':'One-off'):null),
    editable?React.createElement('div',{key:'act',style:{display:'flex',gap:4,justifyContent:'flex-end'}},[
      IconButton&&Icon?React.createElement(IconButton,{key:'e',label:'Edit '+r.name,
        onClick:()=>onEdit&&onEdit(r),icon:React.createElement(Icon,{name:'pencil-square',size:16})}):null,
      IconButton&&Icon?React.createElement(IconButton,{key:'d',label:'Delete '+r.name,variant:'danger',
        onClick:()=>onDelete&&onDelete(r),icon:React.createElement(Icon,{name:'trash',size:16})}):null]):null]));
  return React.createElement('div',{style:{background:t.surface,border:'1px solid '+t.strokeSubtle,
    borderRadius:8,overflow:'hidden',...style}},[header].concat(body));
}