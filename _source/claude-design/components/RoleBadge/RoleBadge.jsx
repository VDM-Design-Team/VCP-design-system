const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export const ROLE_STYLES={
  User:{bg:'rgb(241,245,249)',fg:'rgb(71,85,105)',icon:'users'},
  Admin:{bg:'var(--colors-vcp-blue-100, rgb(232,238,251))',fg:'var(--colors-vcp-blue-500, rgb(26,86,219))',icon:'cog-6-tooth'},
  'Admin Dev':{bg:'rgb(236,238,254)',fg:'rgb(79,70,229)',icon:'cog-6-tooth'},
  'Super Admin':{bg:'rgb(254,226,226)',fg:'rgb(185,28,28)',icon:'building-office'}};
export function RoleBadge(props){
  const { role='User', showIcon=true, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  const c=ROLE_STYLES[role]||ROLE_STYLES.User;
  return React.createElement('span',{style:{display:'inline-flex',alignItems:'center',gap:4,height:22,
    padding:'0 8px',borderRadius:6,background:c.bg,color:c.fg,
    font:'500 11px/1 '+t.font,whiteSpace:'nowrap',...style}},[
    showIcon&&Icon?React.createElement(Icon,{key:'i',name:c.icon,size:12}):null, role]);
}