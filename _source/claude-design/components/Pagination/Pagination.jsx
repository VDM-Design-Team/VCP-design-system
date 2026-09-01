const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function Pagination({ page=1, pageCount=1, onChange, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  const nums=[]; const from=Math.max(1,Math.min(page-2,pageCount-4)), to=Math.min(pageCount,from+4);
  for(let i=from;i<=to;i++) nums.push(i);
  const btn=(k,content,dis,act)=>React.createElement('button',{key:k,disabled:dis,onClick:act,
    style:{minWidth:32,height:32,padding:'0 8px',borderRadius:6,cursor:dis?'not-allowed':'pointer',
      border:'1px solid '+t.strokeSubtle,background:t.surface,color:dis?t.fg4:t.fg2,
      font:'400 13px/1 '+t.font,display:'grid',placeItems:'center'}},content);
  return React.createElement('nav',{style:{display:'flex',alignItems:'center',gap:6,...style}},
    btn('prev',Icon&&React.createElement(Icon,{name:'chevron-left',size:14}),page<=1,()=>onChange&&onChange(page-1)),
    nums.map(n=>React.createElement('button',{key:n,onClick:()=>onChange&&onChange(n),
      style:{minWidth:32,height:32,borderRadius:6,cursor:'pointer',
        border:'1px solid '+(n===page?t.blue500:t.strokeSubtle),
        background:n===page?t.blue500:t.surface,color:n===page?'#fff':t.fg2,
        font:(n===page?'500 ':'400 ')+'13px/1 '+t.font}},n)),
    btn('next',Icon&&React.createElement(Icon,{name:'chevron-right',size:14}),page>=pageCount,()=>onChange&&onChange(page+1)),
    React.createElement('span',{style:{marginLeft:8,font:'400 12px/1 '+t.font,color:t.fg3}},
      'Page '+page+' of '+pageCount));
}