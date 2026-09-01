const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
const TONE={created:t.blue500,status:t.indigo,handoff:'rgb(245,158,11)',
 comment:t.fg3,accepted:t.success,rejected:t.danger,edit:t.fg3};
export function Timeline({ items=[], style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const {Icon,Avatar}=G;
  return React.createElement('ol',{style:{listStyle:'none',margin:0,padding:0,
    display:'flex',flexDirection:'column',...style}},
    items.map((it,i)=>{
      const last=i===items.length-1;
      const c=TONE[it.kind]||t.fg3;
      return React.createElement('li',{key:it.id||i,style:{display:'flex',gap:12,position:'relative',
        paddingBottom:last?0:18}},
        React.createElement('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}},
          React.createElement('span',{style:{width:26,height:26,borderRadius:'50%',flexShrink:0,
            background:t.surface,border:'2px solid '+c,color:c,display:'grid',placeItems:'center'}},
            Icon&&React.createElement(Icon,{name:it.icon||'clock',size:13})),
          !last&&React.createElement('span',{style:{flex:1,width:2,background:t.strokeSubtle,marginTop:4}})),
        React.createElement('div',{style:{flex:1,minWidth:0,paddingTop:2,display:'flex',
          flexDirection:'column',gap:3}},
          React.createElement('div',{style:{display:'flex',alignItems:'baseline',gap:8,flexWrap:'wrap'}},
            React.createElement('span',{style:{font:'500 13px/1.4 '+t.font,color:t.fg1}},it.title),
            React.createElement('span',{style:{font:'400 11px/1 '+t.font,color:t.fg4}},it.timestamp)),
          it.actor&&React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6}},
            Avatar&&React.createElement(Avatar,{name:it.actor,size:18}),
            React.createElement('span',{style:{font:'400 12px/1 '+t.font,color:t.fg3}},it.actor)),
          it.detail&&React.createElement('span',{style:{font:'400 12px/1.5 '+t.font,color:t.fg3}},it.detail)));
    }));
}