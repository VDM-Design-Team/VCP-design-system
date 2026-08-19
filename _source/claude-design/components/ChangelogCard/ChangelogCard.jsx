const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function ChangelogCard(props){
  const { version, date, title, children, tags=[], index, count, onNavigate, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Badge, PaginationDots } = G;
  return React.createElement('div',{style:{background:t.surface,border:'1px solid '+t.strokeSubtle,
    borderRadius:12,padding:20,display:'flex',flexDirection:'column',gap:12,
    boxShadow:'0 2px 6px rgba(2,6,23,.06)',...style}},[
    React.createElement('div',{key:'h',style:{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}},[
      version&&Badge?React.createElement(Badge,{key:'v',tone:'brand'},version):null,
      date?React.createElement('span',{key:'d',style:{font:'400 12px/1 '+t.font,color:t.fg3}},date):null]),
    React.createElement('h3',{key:'t',style:{margin:0,font:'600 18px/1.3 '+t.font,color:t.fg1}},title),
    React.createElement('div',{key:'b',style:{font:'400 14px/1.6 '+t.font,color:t.fg2}},children),
    tags.length?React.createElement('div',{key:'tg',style:{display:'flex',gap:6,flexWrap:'wrap'}},
      tags.map(tg=>Badge?React.createElement(Badge,{key:tg,tone:'neutral'},tg):null)):null,
    count>1&&PaginationDots?React.createElement('div',{key:'p',style:{display:'flex',justifyContent:'center',
      paddingTop:4}}, React.createElement(PaginationDots,{count,index,onChange:onNavigate})):null]);
}