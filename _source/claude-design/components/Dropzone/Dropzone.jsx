const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function Dropzone({ onFiles, hint='PNG, JPG, GIF, DOCX, CSV and PDF file up to 10MB', label='Upload a file', style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  const [over,setOver]=React.useState(false);
  return React.createElement('label',{
    onDragOver:e=>{e.preventDefault();setOver(true);},
    onDragLeave:()=>setOver(false),
    onDrop:e=>{e.preventDefault();setOver(false);onFiles&&onFiles(Array.from(e.dataTransfer.files||[]));},
    style:{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:22,
      border:'1px dashed '+(over?t.blue500:t.stroke),borderRadius:8,
      background:over?t.blue50:t.surface,textAlign:'center',cursor:'pointer',
      transition:'border-color 120ms, background 120ms',...style}},
    React.createElement('input',{type:'file',multiple:true,style:{display:'none'},
      onChange:e=>onFiles&&onFiles(Array.from(e.target.files||[]))}),
    Icon&&React.createElement(Icon,{name:'cloud-arrow-up',size:22,style:{color:t.fg3}}),
    React.createElement('span',{style:{font:'400 13px/1.4 '+t.font,color:t.fg2}},
      React.createElement('strong',{style:{color:t.blue500,fontWeight:500}},label),' or drag and drop'),
    React.createElement('span',{style:{font:'400 11px/1.4 '+t.font,color:t.fg3}},hint));
}