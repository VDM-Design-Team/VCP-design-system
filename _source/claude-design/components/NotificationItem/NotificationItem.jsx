const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
const KIND={handoff:{icon:'arrow-right',fg:'rgb(146,84,14)',bg:'rgb(254,243,199)'},
 comment:{icon:'chat-bubble-left-right',fg:'rgb(71,85,105)',bg:'rgb(241,245,249)'},
 accepted:{icon:'check-circle',fg:'rgb(40,120,50)',bg:'rgb(220,245,224)'},
 rejected:{icon:'x-circle',fg:'rgb(185,28,28)',bg:'rgb(254,226,226)'},
 assigned:{icon:'user-plus',fg:'var(--colors-vcp-blue-500, rgb(26,86,219))',bg:'var(--colors-vcp-blue-100, rgb(232,238,251))'},
 overdue:{icon:'exclamation-triangle',fg:'rgb(185,28,28)',bg:'rgb(254,226,226)'}};
export function NotificationItem(props){
  const { kind='comment', title, body, timestamp, unread, onClick, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  const c=KIND[kind]||KIND.comment;
  const [h,setH]=React.useState(false);
  return React.createElement('button',{onClick,onMouseEnter:()=>setH(true),onMouseLeave:()=>setH(false),
    style:{display:'flex',gap:12,width:'100%',padding:'12px 14px',border:0,textAlign:'left',
      cursor:onClick?'pointer':'default',
      background:h?t.blue50:unread?'var(--colors-vcp-blue-50, rgb(244,247,253))':'transparent',
      borderBottom:'1px solid '+t.strokeSubtle,transition:'background 120ms',...style}},[
    React.createElement('span',{key:'i',style:{width:32,height:32,borderRadius:8,flexShrink:0,
      background:c.bg,color:c.fg,display:'grid',placeItems:'center'}},
      Icon?React.createElement(Icon,{name:c.icon,size:16}):null),
    React.createElement('span',{key:'c',style:{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:3}},[
      React.createElement('span',{key:'t',style:{font:(unread?'500 ':'400 ')+'13px/1.4 '+t.font,color:t.fg1}},title),
      body?React.createElement('span',{key:'b',style:{font:'400 12px/1.5 '+t.font,color:t.fg3}},body):null,
      timestamp?React.createElement('span',{key:'ts',style:{font:'400 11px/1 '+t.font,color:t.fg4}},timestamp):null]),
    unread?React.createElement('span',{key:'d',style:{width:8,height:8,borderRadius:'50%',flexShrink:0,
      background:t.blue500,marginTop:4}}):null]);
}