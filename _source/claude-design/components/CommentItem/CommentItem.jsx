const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function CommentItem({ author, avatarSrc, timestamp, children, reactions=[], replyCount,
  onReply, onReact, edited, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Avatar=G.Avatar, Icon=G.Icon;
  return React.createElement('article',{style:{display:'flex',gap:12,...style}},
    Avatar&&React.createElement(Avatar,{name:author,src:avatarSrc,size:32}),
    React.createElement('div',{style:{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:6}},
      React.createElement('div',{style:{display:'flex',alignItems:'baseline',gap:8,flexWrap:'wrap'}},
        React.createElement('strong',{style:{font:'500 14px/1 '+t.font,color:t.fg1}},author),
        React.createElement('span',{style:{font:'400 12px/1 '+t.font,color:t.fg4}},timestamp),
        edited&&React.createElement('span',{style:{font:'400 11px/1 '+t.font,color:t.fg4,fontStyle:'italic'}},'edited')),
      React.createElement('div',{style:{font:'400 14px/1.55 '+t.font,color:t.fg2}},children),
      React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginTop:2}},
        reactions.map((r,i)=>React.createElement('button',{key:i,onClick:()=>onReact&&onReact(r.emoji),
          style:{display:'inline-flex',alignItems:'center',gap:4,height:24,padding:'0 8px',borderRadius:999,
            border:'1px solid '+(r.mine?t.blue500:t.strokeSubtle),background:r.mine?t.blue100:t.surface,
            color:r.mine?t.blue500:t.fg2,cursor:'pointer',font:'400 12px/1 '+t.font}},r.emoji,r.count)),
        onReply&&React.createElement('button',{onClick:onReply,
          style:{border:0,background:'transparent',color:t.fg3,cursor:'pointer',padding:0,
            font:'500 12px/1 '+t.font}}, replyCount?replyCount+' replies':'Reply'))));
}