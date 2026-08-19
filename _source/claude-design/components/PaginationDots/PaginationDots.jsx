const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function PaginationDots(props){
  const { count=1, index=0, onChange, style } = props;
  return React.createElement('div',{role:'tablist',style:{display:'inline-flex',alignItems:'center',gap:6,...style}},
    Array.from({length:count}).map((_,i)=>{
      const on=i===index;
      return React.createElement('button',{key:i,role:'tab','aria-selected':on,'aria-label':'Page '+(i+1),
        onClick:()=>onChange&&onChange(i),
        style:{width:on?20:8,height:8,borderRadius:999,border:0,padding:0,
          background:on?t.blue500:t.stroke,cursor:'pointer',
          transition:'width 180ms, background 180ms'}});
    }));
}