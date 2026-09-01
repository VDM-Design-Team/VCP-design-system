const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function Checkbox({ label, checked, indeterminate, disabled, onChange, style }) {
  const ref=React.useRef(null);
  React.useEffect(()=>{ if(ref.current) ref.current.indeterminate=!!indeterminate; },[indeterminate]);
  return React.createElement('label',{style:{display:'inline-flex',alignItems:'center',gap:10,
    font:'400 14px/1.4 '+t.font,color:disabled?t.fg4:t.fg2,cursor:disabled?'not-allowed':'pointer',...style}},
    React.createElement('input',{ref,type:'checkbox',checked:!!checked,disabled,
      onChange:e=>onChange&&onChange(e.target.checked),
      style:{width:16,height:16,accentColor:'rgb(26,86,219)',cursor:'inherit',margin:0,flexShrink:0}}),
    label);
}