const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function MultipartEditor(props){
  const { parts=[], onChange, onAdd, onRemove, domains=['Design','Development','Governance','Partners & Campaigns'], style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Field, Select, Input, Stepper, IconButton, Icon, Button, DomainLabel, Badge } = G;
  const total=parts.reduce((s,p)=>s+(Number(p.points)||0),0);
  const set=(i,k,v)=>onChange&&onChange(parts.map((p,j)=>j===i?{...p,[k]:v}:p));
  const rows=parts.map((p,i)=>React.createElement('div',{key:i,style:{display:'flex',flexDirection:'column',gap:12,
    padding:14,border:'1px solid '+t.strokeSubtle,borderRadius:8,background:t.surface}},[
    React.createElement('div',{key:'h',style:{display:'flex',alignItems:'center',gap:8}},[
      Badge?React.createElement(Badge,{key:'n',tone:'brand'},'Part '+(i+1)):null,
      p.domain&&DomainLabel?React.createElement(DomainLabel,{key:'d',domain:p.domain,size:'small'}):null,
      React.createElement('span',{key:'sp',style:{flex:1}}),
      onRemove&&parts.length>1&&IconButton&&Icon?React.createElement(IconButton,{key:'x',
        label:'Remove part '+(i+1),variant:'danger',size:26,onClick:()=>onRemove(i),
        icon:React.createElement(Icon,{name:'trash',size:14})}):null]),
    React.createElement('div',{key:'g',style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}},[
      Field?React.createElement(Field,{key:'d',label:'Receiving domain',required:true},
        Select?React.createElement(Select,{size:'small',options:domains,value:p.domain||'',
          placeholder:'Select a domain',onChange:v=>set(i,'domain',v)}):null):null,
      Field?React.createElement(Field,{key:'dt',label:'Deployment date',required:true},
        Input?React.createElement(Input,{size:'small',value:p.date||'',placeholder:'dd-mm-yyyy',
          onChange:e=>set(i,'date',e.target.value)}):null):null]),
    Field?React.createElement(Field,{key:'p',label:'Value points'},
      Stepper?React.createElement(Stepper,{value:Number(p.points)||0,max:99,suffix:'pts',
        onChange:v=>set(i,'points',v)}):null):null]));
  const footer=React.createElement('div',{key:'f',style:{display:'flex',alignItems:'center',
    justifyContent:'space-between',gap:12}},[
    onAdd&&Button?React.createElement(Button,{key:'a',variant:'outlined',size:'small',onClick:onAdd,
      leadingIcon:Icon?React.createElement(Icon,{name:'plus',size:14}):null},'Add part'):null,
    React.createElement('span',{key:'tot',style:{font:'500 13px/1 '+t.font,color:t.fg2}},
      'Total: '+total+' pts across '+parts.length+' '+(parts.length===1?'domain':'domains'))]);
  return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:12,...style}},
    rows.concat([footer]));
}