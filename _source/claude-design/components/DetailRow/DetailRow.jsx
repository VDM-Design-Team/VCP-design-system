const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function DetailRow(props){
  const { label, children, icon, onEdit, editing, align='center', style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Icon, IconButton } = G;
  return React.createElement('div',{style:{display:'flex',alignItems:align==='top'?'flex-start':'center',
    gap:12,minHeight:32,...style}},[
    React.createElement('span',{key:'l',style:{display:'flex',alignItems:'center',gap:6,width:132,flexShrink:0,
      font:'400 13px/1.3 '+t.font,color:t.fg3,paddingTop:align==='top'?3:0}},[
      icon&&Icon?React.createElement(Icon,{key:'i',name:icon,size:15,style:{color:t.fg4}}):null, label]),
    React.createElement('div',{key:'v',style:{flex:1,minWidth:0,font:'400 13px/1.4 '+t.font,color:t.fg1}},children),
    onEdit&&IconButton&&Icon?React.createElement(IconButton,{key:'e',label:'Edit '+label,size:26,
      onClick:onEdit,icon:React.createElement(Icon,{name:editing?'check':'pencil-square',size:14})}):null]);
}