const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function MarketingHero(props){
  const { eyebrow, title, body, primaryAction, secondaryAction, media, align='left', style } = props;
  const centred = align==='center';
  return React.createElement('section',{style:{background:t.blue700,color:'#fff',padding:'72px 48px',
    display:'grid',gridTemplateColumns:media&&!centred?'minmax(0,1fr) minmax(0,1fr)':'minmax(0,1fr)',
    gap:48,alignItems:'center',...style}},[
    React.createElement('div',{key:'c',style:{display:'flex',flexDirection:'column',gap:18,
      alignItems:centred?'center':'flex-start',textAlign:centred?'center':'left',
      maxWidth:centred?720:undefined,margin:centred?'0 auto':undefined}},[
      eyebrow?React.createElement('span',{key:'e',style:{font:'500 12px/1 '+t.font,letterSpacing:'.12em',
        textTransform:'uppercase',color:'rgb(140,170,237)'}},eyebrow):null,
      React.createElement('h1',{key:'t',style:{margin:0,font:'700 44px/1.15 '+t.font,letterSpacing:'-0.02em',
        textWrap:'balance'}},title),
      body?React.createElement('p',{key:'b',style:{margin:0,maxWidth:560,font:'400 17px/1.6 '+t.font,
        color:'rgb(198,213,246)'}},body):null,
      primaryAction||secondaryAction?React.createElement('div',{key:'a',style:{display:'flex',gap:12,
        flexWrap:'wrap',marginTop:6}},[primaryAction,secondaryAction]):null]),
    media&&!centred?React.createElement('div',{key:'m',style:{borderRadius:12,overflow:'hidden',
      boxShadow:'0 24px 64px rgba(2,6,23,.4)'}},media):null]);
}