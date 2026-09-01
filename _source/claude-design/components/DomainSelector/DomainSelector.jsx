const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function DomainSelector(props){
  const { domains=[], value, onChange, collapsed, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Icon, DomainLabel, Menu } = G;
  const trigger=React.createElement('button',{title:value,
    style:{display:'flex',alignItems:'center',gap:8,width:'100%',height:37,
      padding:collapsed?'0':'0 10px',borderRadius:8,cursor:'pointer',
      border:'1px solid '+t.strokeSubtle,background:t.surface,
      justifyContent:collapsed?'center':'space-between'}},
    collapsed
      ? [Icon?React.createElement(Icon,{key:'i',name:'building-office',size:18,style:{color:t.fg2}}):null]
      : [React.createElement('span',{key:'l',style:{minWidth:0,display:'flex',alignItems:'center',gap:6}},
          DomainLabel&&value?React.createElement(DomainLabel,{domain:value,size:'small'})
            :React.createElement('span',{style:{font:'400 13px/1 '+t.font,color:t.fg3}},'Select a domain')),
         Icon?React.createElement(Icon,{key:'c',name:'chevron-down',size:16,style:{color:t.fg3,flexShrink:0}}):null]);
  if(!Menu) return trigger;
  return React.createElement(Menu,{align:'left',trigger,style:{display:'block',width:'100%',...style},
    onSelect:onChange,
    items:domains.map(d=>({key:d,label:d,icon:d===value?'check':undefined}))});
}