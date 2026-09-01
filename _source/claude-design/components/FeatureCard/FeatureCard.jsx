const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function FeatureCard(props){
  const { icon, title, children, action, tone='surface', style } = props;
  const onBrand = tone==='brand';
  return React.createElement('article',{style:{display:'flex',flexDirection:'column',gap:10,padding:22,
    borderRadius:12,background:onBrand?t.blue700:t.surface,
    border:'1px solid '+(onBrand?'transparent':t.strokeSubtle),
    color:onBrand?'#fff':t.fg1,
    boxShadow:onBrand?'none':'0 1px 2px rgba(2,6,23,.04)',...style}},[
    icon?React.createElement('div',{key:'i',style:{width:40,height:40,borderRadius:10,display:'grid',
      placeItems:'center',marginBottom:4,
      background:onBrand?'rgba(255,255,255,.14)':t.blue50,
      color:onBrand?'#fff':t.blue500}},icon):null,
    React.createElement('h3',{key:'t',style:{margin:0,font:'600 17px/1.3 '+t.font}},title),
    React.createElement('p',{key:'b',style:{margin:0,font:'400 14px/1.6 '+t.font,
      color:onBrand?'rgb(198,213,246)':t.fg3}},children),
    action?React.createElement('div',{key:'a',style:{marginTop:6}},action):null]);
}