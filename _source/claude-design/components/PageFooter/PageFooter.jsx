const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function PageFooter(props){
  const { year=2026, org='Valuechainplus', links=[], version, style } = props;
  return React.createElement('footer',{style:{display:'flex',alignItems:'center',justifyContent:'center',
    gap:16,flexWrap:'wrap',padding:'20px 0 28px',...style}},[
    React.createElement('span',{key:'c',style:{font:'400 12px/1 '+t.font,color:t.fg4}},year+' © '+org),
    links.length?React.createElement('span',{key:'l',style:{display:'flex',gap:14,flexWrap:'wrap'}},
      links.map(l=>React.createElement('a',{key:l.label,href:l.href||'#',
        style:{font:'400 12px/1 '+t.font,color:t.fg3,textDecoration:'none'}},l.label))):null,
    version?React.createElement('span',{key:'v',style:{font:'400 11px/1 '+t.font,color:t.fg4}},version):null]);
}