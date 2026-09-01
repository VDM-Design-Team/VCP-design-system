const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function EmailLayout(props){
  const { preheader, heading, children, action, footer='2026 © Valuechainplus', logoSrc='/assets/logo-valuechainplus.png', style } = props;
  return React.createElement('div',{style:{background:t.canvas,padding:'32px 16px',
    fontFamily:t.font,...style}},
    React.createElement('table',{role:'presentation',cellPadding:0,cellSpacing:0,
      style:{width:'100%',maxWidth:600,margin:'0 auto',borderCollapse:'collapse'}},
      React.createElement('tbody',null,[
        preheader?React.createElement('tr',{key:'ph'},React.createElement('td',{style:{display:'none',
          fontSize:0,lineHeight:0,color:'transparent'}},preheader)):null,
        React.createElement('tr',{key:'lg'},React.createElement('td',{style:{padding:'0 0 20px',textAlign:'center'}},
          React.createElement('img',{src:logoSrc,alt:'valuechainplus',
            style:{height:26,width:'auto',display:'inline-block'}}))),
        React.createElement('tr',{key:'bd'},React.createElement('td',{style:{background:t.surface,borderRadius:12,
          padding:'32px 28px',border:'1px solid '+t.strokeSubtle}},
          React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:14}},[
            heading?React.createElement('h1',{key:'h',style:{margin:0,font:'600 22px/1.3 '+t.font,
              color:t.fg1}},heading):null,
            React.createElement('div',{key:'c',style:{font:'400 15px/1.65 '+t.font,color:t.fg2}},children),
            action?React.createElement('div',{key:'a',style:{paddingTop:8}},action):null]))),
        React.createElement('tr',{key:'ft'},React.createElement('td',{style:{padding:'20px 0 0',textAlign:'center',
          font:'400 12px/1.6 '+t.font,color:t.fg4}},footer))
      ])));
}