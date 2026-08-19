const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',font:"'Poppins', system-ui, sans-serif"};
export const STATUSES = {
  Draft:{bg:'rgb(241,245,249)',fg:'rgb(100,116,139)'},
  'In progress':{bg:'var(--colors-vcp-blue-100, rgb(232,238,251))',fg:'var(--colors-vcp-blue-500, rgb(26,86,219))'},
  'Ready for review':{bg:'rgb(254,243,199)',fg:'rgb(146,84,14)'},
  'Ready for hand-off':{bg:'rgb(236,238,254)',fg:'rgb(79,70,229)'},
  Completed:{bg:'rgb(220,245,224)',fg:'rgb(40,120,50)'},
  Blocked:{bg:'rgb(254,226,226)',fg:'rgb(185,28,28)'},
  Archive:{bg:'rgb(238,238,238)',fg:'rgb(97,97,97)'},
};
export function StatusPill({ status='In progress', interactive, onClick, style }) {
  const c = STATUSES[status] || STATUSES.Draft;
  const [h,setH]=React.useState(false);
  return React.createElement('span', {
    onClick, onMouseEnter:()=>setH(true), onMouseLeave:()=>setH(false),
    style:{ display:'inline-flex', alignItems:'center', gap:6, height:28, padding:'0 10px',
      borderRadius:8, background:c.bg, color:c.fg, font:'500 13px/1 '+t.font,
      cursor:interactive?'pointer':'default', whiteSpace:'nowrap',
      boxShadow:interactive&&h?'0 0 0 1px '+c.fg:'none', transition:'box-shadow 120ms', ...style } },
    React.createElement('span',{style:{width:8,height:8,borderRadius:'50%',background:'currentColor'}}),
    status);
}