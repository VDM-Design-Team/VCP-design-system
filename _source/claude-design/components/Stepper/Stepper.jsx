const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function Stepper({ value=0, min=0, max=999, step=1, onChange, suffix, disabled, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  const clamp=v=>Math.max(min,Math.min(max,v));
  const btn=(d,name)=>{ const dis=disabled||(d<0?value<=min:value>=max);
    return React.createElement('button',{onClick:()=>onChange&&onChange(clamp(value+d*step)),disabled:dis,
      'aria-label':d<0?'Decrease':'Increase',
      style:{width:32,height:'100%',border:0,background:'transparent',color:dis?t.fg4:t.fg2,
        cursor:dis?'not-allowed':'pointer',display:'grid',placeItems:'center',padding:0,flexShrink:0}},
      Icon&&React.createElement(Icon,{name,size:14})); };
  return React.createElement('div',{style:{display:'inline-flex',alignItems:'stretch',height:36,
    border:'1px solid '+t.stroke,borderRadius:8,background:t.surface,overflow:'hidden',...style}},
    btn(-1,'chevron-left'),
    React.createElement('input',{type:'text',inputMode:'numeric',value:String(value),disabled,
      onChange:e=>{ const n=Number(e.target.value.replace(/[^\d-]/g,'')); if(!Number.isNaN(n)) onChange&&onChange(clamp(n)); },
      style:{width:56,border:0,outline:0,textAlign:'center',background:'transparent',
        color:t.fg1,font:'500 14px/1 '+t.font}}),
    suffix&&React.createElement('span',{style:{display:'grid',placeItems:'center',paddingRight:8,
      font:'400 12px/1 '+t.font,color:t.fg3}},suffix),
    btn(1,'chevron-right'));
}