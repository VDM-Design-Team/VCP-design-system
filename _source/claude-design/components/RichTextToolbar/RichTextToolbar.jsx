const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
const GROUPS=[
 [{k:'bold',t:'B',w:700,label:'Bold'},{k:'italic',t:'I',i:1,label:'Italic'},{k:'underline',t:'U',u:1,label:'Underline'},{k:'strike',t:'S',s:1,label:'Strikethrough'}],
 [{k:'ul',icon:'queue-list',label:'Bulleted list'},{k:'ol',icon:'queue-list',label:'Numbered list'}],
 [{k:'link',icon:'paper-clip',label:'Insert link'},{k:'image',icon:'photo',label:'Insert image'},{k:'file',icon:'document',label:'Insert file'}],
 [{k:'undo',icon:'arrow-left',label:'Undo'},{k:'redo',icon:'arrow-right',label:'Redo'}],
];
export function RichTextToolbar({ active={}, onCommand, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  return React.createElement('div',{role:'toolbar',style:{display:'flex',alignItems:'center',gap:2,
    padding:4,borderBottom:'1px solid '+t.strokeSubtle,flexWrap:'wrap',...style}},
    GROUPS.map((grp,gi)=>React.createElement(React.Fragment,{key:gi},
      gi>0&&React.createElement('span',{style:{width:1,height:16,background:t.strokeSubtle,margin:'0 4px'}}),
      grp.map(b=>React.createElement(TBtn,{key:b.k,b,on:!!active[b.k],onCommand,Icon})))));
}
function TBtn({ b, on, onCommand, Icon }) {
  const [h,setH]=React.useState(false);
  return React.createElement('button',{title:b.label,'aria-label':b.label,'aria-pressed':on,
    onClick:()=>onCommand&&onCommand(b.k),
    onMouseEnter:()=>setH(true),onMouseLeave:()=>setH(false),
    style:{width:28,height:28,borderRadius:4,border:0,cursor:'pointer',padding:0,
      display:'grid',placeItems:'center',
      background:on?t.blue100:h?t.blue50:'transparent',
      color:on?t.blue500:h?t.blue500:'rgb(71,85,105)',transition:'background 120ms, color 120ms'}},
    b.icon && Icon
      ? React.createElement(Icon,{name:b.icon,size:16})
      : React.createElement('span',{style:{font:(b.w||400)+' 13px/1 '+t.font,
          fontStyle:b.i?'italic':'normal',
          textDecoration:b.u?'underline':b.s?'line-through':'none'}},b.t));
}