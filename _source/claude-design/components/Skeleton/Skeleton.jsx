const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function Skeleton({ width='100%', height=14, radius=6, circle, lines, style }) {
  const base={background:'linear-gradient(90deg, rgb(241,245,249) 25%, rgb(226,232,240) 37%, rgb(241,245,249) 63%)',
    backgroundSize:'400% 100%',animation:'vcp-shimmer 1.4s ease infinite'};
  const one=(w,i)=>React.createElement('span',{key:i,style:{display:'block',width:w,
    height:circle?width:height,borderRadius:circle?'50%':radius,...base}});
  return React.createElement(React.Fragment,null,
    React.createElement('style',null,'@keyframes vcp-shimmer{0%{background-position:100% 50%}100%{background-position:0 50%}}'),
    lines
      ? React.createElement('span',{style:{display:'flex',flexDirection:'column',gap:8,...style}},
          Array.from({length:lines}).map((_,i)=>one(i===lines-1?'62%':'100%',i)))
      : React.createElement('span',{style:{display:'block',...style}},one(width,0)));
}