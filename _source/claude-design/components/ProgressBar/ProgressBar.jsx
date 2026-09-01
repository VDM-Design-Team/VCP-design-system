const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',font:"'Poppins', system-ui, sans-serif"};
export function ProgressBar({ value=0, max=100, tone='brand', height=8, showLabel, label, style }) {
  const pct = Math.max(0, Math.min(100, (value/max)*100));
  const fill = tone==='success'?'rgb(99,194,112)':tone==='warning'?'rgb(250,204,20)':tone==='danger'?'rgb(231,0,11)':t.blue500;
  return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:6,...style}},
    (showLabel||label) && React.createElement('div',{style:{display:'flex',justifyContent:'space-between',font:'400 12px/1 '+t.font,color:t.fg3}},
      React.createElement('span',null,label||''), showLabel && React.createElement('span',null,Math.round(pct)+'%')),
    React.createElement('div',{role:'progressbar','aria-valuenow':value,'aria-valuemax':max,
      style:{height,borderRadius:999,background:'rgb(226,232,240)',overflow:'hidden'}},
      React.createElement('div',{style:{width:pct+'%',height:'100%',background:fill,borderRadius:999,transition:'width 260ms'}})));
}