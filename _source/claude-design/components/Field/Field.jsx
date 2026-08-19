const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function Field({ label, required, onAdd, helper, error, children, htmlFor, style }) {
  return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:6,...style}},
    label && React.createElement('label',{htmlFor,style:{display:'flex',alignItems:'center',gap:6,font:'500 14px/1 '+t.font,color:t.fg1}},
      label,
      required && React.createElement('span',{style:{color:t.danger}},'*'),
      onAdd && React.createElement('button',{onClick:onAdd,'aria-label':'Add '+label,style:{width:18,height:18,borderRadius:'50%',
        border:0,background:t.blue500,color:'#fff',cursor:'pointer',display:'grid',placeItems:'center',padding:0,font:'600 12px/1 '+t.font}},'+')),
    children,
    (error||helper) && React.createElement('span',{style:{font:'400 12px/1.4 '+t.font,color:error?t.danger:t.fg3}}, error||helper));
}