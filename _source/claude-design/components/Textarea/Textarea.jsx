const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function Textarea({ invalid, rows=4, style, ...rest }) {
  const [f,setF]=React.useState(false);
  const bd = invalid ? t.danger : f ? t.blue500 : t.stroke;
  return React.createElement('textarea',{rows,onFocus:()=>setF(true),onBlur:()=>setF(false),
    style:{width:'100%',padding:'10px 12px',background:t.surface,border:'1px solid '+bd,borderRadius:8,
      color:t.fg1,font:'400 14px/1.5 '+t.font,outline:0,resize:'vertical',
      boxShadow:f?'0 0 0 3px rgba(26,86,219,.16)':'none',transition:'border-color 120ms, box-shadow 120ms',...style},...rest});
}