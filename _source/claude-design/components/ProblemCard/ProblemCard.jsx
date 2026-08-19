const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
const SEV={critical:'rgb(231,0,11)',high:'rgb(245,158,11)',medium:'rgb(250,204,20)',low:'rgb(99,194,112)'};
export function ProblemCard({ index, severity='critical', children, attachments, onClick, style }) {
  const [h,setH]=React.useState(false);
  return React.createElement('article',{onClick,onMouseEnter:()=>setH(true),onMouseLeave:()=>setH(false),
    style:{display:'flex',background:t.surface,border:'1px solid '+t.strokeSubtle,borderRadius:8,
      boxShadow:h?'0 2px 6px rgba(2,6,23,.08)':'0 1px 2px rgba(2,6,23,.04)',overflow:'hidden',
      cursor:onClick?'pointer':'default',transition:'box-shadow 120ms',...style}},
    React.createElement('div',{style:{width:28,flexShrink:0,borderRadius:'8px 0 0 8px',
      background:SEV[severity]||SEV.critical,display:'flex',alignItems:'center',justifyContent:'center',
      color:'#fff',font:'600 13px/1 '+t.font}}, index),
    React.createElement('div',{style:{flex:1,minWidth:0,padding:'12px 16px',display:'flex',flexDirection:'column',gap:8}},
      React.createElement('p',{style:{margin:0,font:'400 14px/1.5 '+t.font,color:t.fg2}},children),
      attachments && React.createElement('div',{style:{display:'flex',gap:12,flexWrap:'wrap',
        font:'400 12px/1 '+t.font,color:t.fg3}},attachments)));
}