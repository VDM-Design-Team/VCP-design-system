const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function DomainCard(props){
  const { domain, lead, members=0, activeValues=0, allocated, consumed, onClick, onEdit, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { DomainLabel, ProgressBar, Avatar, IconButton, Icon, Badge } = G;
  const [h,setH]=React.useState(false);
  const pct=allocated?consumed/allocated:0;
  const tone=pct>=.9?'danger':pct>=.75?'warning':'brand';
  return React.createElement('article',{onClick,onMouseEnter:()=>setH(true),onMouseLeave:()=>setH(false),
    style:{display:'flex',flexDirection:'column',gap:12,padding:16,borderRadius:8,
      background:t.surface,border:'1px solid '+t.strokeSubtle,
      boxShadow:h?'0 2px 6px rgba(2,6,23,.08)':'0 1px 2px rgba(2,6,23,.04)',
      cursor:onClick?'pointer':'default',transition:'box-shadow 120ms',...style}},[
    React.createElement('div',{key:'h',style:{display:'flex',alignItems:'center',gap:8}},[
      DomainLabel?React.createElement(DomainLabel,{key:'d',domain}):null,
      React.createElement('span',{key:'sp',style:{flex:1}}),
      onEdit&&IconButton&&Icon?React.createElement(IconButton,{key:'e',label:'Edit '+domain,size:26,
        onClick:e=>{ e.stopPropagation(); onEdit(); },
        icon:React.createElement(Icon,{name:'pencil-square',size:14})}):null]),
    lead?React.createElement('div',{key:'l',style:{display:'flex',alignItems:'center',gap:8}},[
      Avatar?React.createElement(Avatar,{key:'a',name:lead,size:24}):null,
      React.createElement('span',{key:'t',style:{font:'400 12px/1 '+t.font,color:t.fg3}},'Lead · '+lead)]):null,
    React.createElement('div',{key:'s',style:{display:'flex',gap:16}},[
      React.createElement('span',{key:'m',style:{font:'400 12px/1.4 '+t.font,color:t.fg3}},members+' members'),
      React.createElement('span',{key:'v',style:{font:'400 12px/1.4 '+t.font,color:t.fg3}},activeValues+' active')]),
    allocated!=null&&ProgressBar?React.createElement(ProgressBar,{key:'p',value:consumed||0,max:allocated,
      tone,label:(consumed||0)+' of '+allocated+' pts',showLabel:true}):null]);
}