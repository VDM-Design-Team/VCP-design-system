const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function Select({ options=[], value, onChange, placeholder, invalid, size='large', style, ...rest }) {
  const [f,setF]=React.useState(false);
  const h=size==='small'?32:40;
  const bd = invalid ? t.danger : f ? t.blue500 : t.stroke;
  const caret = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round' viewBox='0 0 24 24'%3E%3Cpath d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")";
  return React.createElement('select',{value,onChange:e=>onChange&&onChange(e.target.value),
    onFocus:()=>setF(true),onBlur:()=>setF(false),
    style:{width:'100%',height:h,padding:'0 34px 0 12px',background:t.surface,
      backgroundImage:caret,backgroundRepeat:'no-repeat',backgroundPosition:'right 10px center',
      border:'1px solid '+bd,borderRadius:8,color:t.fg1,font:'400 '+(size==='small'?13:14)+'px/1 '+t.font,
      appearance:'none',outline:0,cursor:'pointer',
      boxShadow:f?'0 0 0 3px rgba(26,86,219,.16)':'none',transition:'border-color 120ms, box-shadow 120ms',...style},...rest},
    placeholder && React.createElement('option',{value:''},placeholder),
    options.map(o=>{const v=typeof o==='string'?o:o.value,l=typeof o==='string'?o:o.label;
      return React.createElement('option',{key:v,value:v},l);}));
}