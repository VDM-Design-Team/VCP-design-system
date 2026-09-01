const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function TopBar({ title, subtitle, onBack, breadcrumb, actions, user, notifications=0, role, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const Icon=G.Icon, Avatar=G.Avatar, Badge=G.Badge;
  return React.createElement('header',{style:{height:84,flexShrink:0,background:t.surface,
    borderBottom:'1px solid '+t.strokeSubtle,display:'flex',alignItems:'center',
    justifyContent:'space-between',gap:16,padding:'0 32px',...style}},
    React.createElement('div',{style:{display:'flex',alignItems:'center',gap:14,minWidth:0}},
      onBack && React.createElement('button',{onClick:onBack,'aria-label':'Back',
        style:{width:32,height:32,borderRadius:8,border:0,background:'transparent',color:t.fg1,
          cursor:'pointer',display:'grid',placeItems:'center',flexShrink:0,padding:0}},
        Icon&&React.createElement(Icon,{name:'arrow-left',size:20})),
      React.createElement('div',{style:{minWidth:0,display:'flex',flexDirection:'column',gap:2}},
        breadcrumb && React.createElement('span',{style:{font:'400 12px/1 '+t.font,color:t.fg3}},breadcrumb),
        React.createElement('h1',{style:{margin:0,font:'600 20px/1.2 '+t.font,color:t.fg1,
          whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},title),
        subtitle && React.createElement('span',{style:{font:'400 12px/1 '+t.font,color:t.fg3}},subtitle))),
    React.createElement('div',{style:{display:'flex',alignItems:'center',gap:16,flexShrink:0}},
      actions,
      React.createElement('button',{'aria-label':'Notifications',style:{position:'relative',width:32,height:32,
        border:0,background:'transparent',color:t.fg2,cursor:'pointer',display:'grid',placeItems:'center',padding:0}},
        Icon&&React.createElement(Icon,{name:'bell',size:22}),
        notifications>0 && React.createElement('span',{style:{position:'absolute',top:0,right:0,minWidth:16,
          height:16,padding:'0 4px',borderRadius:999,background:t.danger,color:'#fff',
          font:'500 9px/16px '+t.font,textAlign:'center'}},notifications)),
      user && React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}},
        Avatar&&React.createElement(Avatar,{name:user.name,src:user.src,size:36}),
        React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:2}},
          React.createElement('span',{style:{font:'500 14px/1 '+t.font,color:t.fg1}},user.name),
          role && Badge && React.createElement(Badge,{tone:'brand',style:{height:16,font:'500 9px/1 '+t.font}},role)),
        Icon&&React.createElement(Icon,{name:'chevron-down',size:18,style:{color:t.fg3}}))));
}