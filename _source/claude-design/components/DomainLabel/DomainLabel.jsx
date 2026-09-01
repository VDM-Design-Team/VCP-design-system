const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',font:"'Poppins', system-ui, sans-serif"};
export const DOMAINS = {
  Design:{bg:'rgb(236,238,254)',fg:'rgb(79,70,229)'},
  Development:{bg:'rgb(219,234,254)',fg:'rgb(26,86,219)'},
  Governance:{bg:'rgb(220,245,224)',fg:'rgb(40,120,50)'},
  'Partners & Campaigns':{bg:'rgb(254,243,199)',fg:'rgb(146,84,14)'},
  Marketing:{bg:'rgb(252,237,241)',fg:'rgb(172,53,87)'},
  Operations:{bg:'rgb(241,245,249)',fg:'rgb(71,85,105)'},
};
export function DomainLabel({ domain='Design', size='default', style }) {
  const c = DOMAINS[domain] || DOMAINS.Operations;
  const small = size === 'small';
  return React.createElement('span', { title:domain, style:{ display:'inline-flex', alignItems:'center', gap:4,
    height:small?18:22, padding:small?'0 6px':'0 8px', borderRadius:6,
    background:c.bg, color:c.fg, font:'500 '+(small?10:11)+'px/1 '+t.font, whiteSpace:'nowrap', ...style } },
    React.createElement('span',{style:{width:5,height:5,borderRadius:'50%',background:'currentColor'}}), domain);
}