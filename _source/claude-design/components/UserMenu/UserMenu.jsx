const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function UserMenu(props){
  const { user={}, role, items=[], onSelect, onSignOut, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Avatar, Icon, RoleBadge, Menu } = G;
  const trigger=React.createElement('button',{style:{display:'inline-flex',alignItems:'center',gap:8,
    border:0,background:'transparent',cursor:'pointer',padding:0}},[
    Avatar?React.createElement(Avatar,{key:'a',name:user.name,src:user.src,size:36}):null,
    React.createElement('span',{key:'n',style:{display:'flex',flexDirection:'column',gap:2,alignItems:'flex-start'}},[
      React.createElement('span',{key:'t',style:{font:'500 14px/1 '+t.font,color:t.fg1}},user.name),
      role&&RoleBadge?React.createElement(RoleBadge,{key:'r',role,showIcon:false,
        style:{height:16,font:'500 9px/1 '+t.font}}):null]),
    Icon?React.createElement(Icon,{key:'c',name:'chevron-down',size:18,style:{color:t.fg3}}):null]);
  const full=items.concat(onSignOut?[
    {divider:true},
    {key:'signout',label:'Sign out',icon:'arrow-uturn-left',tone:'danger',onClick:onSignOut}]:[]);
  if(!Menu) return trigger;
  return React.createElement(Menu,{items:full,onSelect,trigger,align:'right',style});
}