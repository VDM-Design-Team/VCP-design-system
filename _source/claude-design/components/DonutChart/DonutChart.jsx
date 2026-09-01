const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function DonutChart({ value=0, max=100, size=140, thickness=16, half, label, caption, tone, style }) {
  const pct=Math.max(0,Math.min(1,value/max));
  const auto = pct>=.9?t.danger:pct>=.75?'rgb(245,158,11)':t.blue500;
  const colour = tone==='success'?t.success:tone==='warning'?'rgb(245,158,11)':tone==='danger'?t.danger:tone?tone:auto;
  const r=(size-thickness)/2, cx=size/2, cy=half?size/2:size/2;
  const total=half?Math.PI*r:2*Math.PI*r;
  const arc=total*pct;
  const h = half ? size/2 + thickness/2 : size;
  return React.createElement('div',{style:{display:'inline-flex',flexDirection:'column',alignItems:'center',gap:6,...style}},
    React.createElement('div',{style:{position:'relative',width:size,height:h}},
      React.createElement('svg',{width:size,height:h,viewBox:'0 0 '+size+' '+h,style:{display:'block'}},
        React.createElement('circle',{cx,cy,r,fill:'none',stroke:'rgb(226,232,240)',strokeWidth:thickness,
          strokeLinecap:'round',
          strokeDasharray: half ? total+' '+(2*Math.PI*r) : undefined,
          transform: half ? 'rotate(180 '+cx+' '+cy+')' : undefined}),
        React.createElement('circle',{cx,cy,r,fill:'none',stroke:colour,strokeWidth:thickness,
          strokeLinecap:'round',strokeDasharray:arc+' '+(2*Math.PI*r),
          transform:'rotate('+(half?180:-90)+' '+cx+' '+cy+')',
          style:{transition:'stroke-dasharray 400ms'}})),
      React.createElement('div',{style:{position:'absolute',inset:0,display:'flex',flexDirection:'column',
        alignItems:'center',justifyContent:half?'flex-end':'center',
        paddingBottom:half?4:0,pointerEvents:'none'}},
        React.createElement('span',{style:{font:'600 '+Math.round(size*0.2)+'px/1 '+t.font,color:t.fg1}},
          label??Math.round(pct*100)+'%'),
        caption&&React.createElement('span',{style:{marginTop:2,font:'400 11px/1 '+t.font,color:t.fg3}},caption))));
}