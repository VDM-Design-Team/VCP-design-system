const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function Spinner({ size=20, thickness=2, label, style }) {
  return React.createElement('span',{role:'status','aria-label':label||'Loading',
    style:{display:'inline-flex',alignItems:'center',gap:8,...style}},
    React.createElement('style',null,'@keyframes vcp-spin{to{transform:rotate(360deg)}}'),
    React.createElement('span',{style:{width:size,height:size,borderRadius:'50%',flexShrink:0,
      border:thickness+'px solid rgb(226,232,240)',borderTopColor:t.blue500,
      animation:'vcp-spin .7s linear infinite'}}),
    label&&React.createElement('span',{style:{font:'400 13px/1 '+t.font,color:t.fg3}},label));
}