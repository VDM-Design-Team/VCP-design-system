const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function SettingsSection(props){
  const { title, description, children, action, danger, style } = props;
  return React.createElement('section',{style:{display:'grid',gridTemplateColumns:'260px minmax(0,1fr)',gap:32,
    padding:'24px 0',borderBottom:'1px solid '+t.strokeSubtle,...style}},[
    React.createElement('div',{key:'h',style:{display:'flex',flexDirection:'column',gap:4}},[
      React.createElement('h3',{key:'t',style:{margin:0,font:'600 15px/1.3 '+t.font,
        color:danger?t.danger:t.fg1}},title),
      description?React.createElement('p',{key:'d',style:{margin:0,font:'400 13px/1.55 '+t.font,
        color:t.fg3}},description):null]),
    React.createElement('div',{key:'b',style:{display:'flex',flexDirection:'column',gap:14,minWidth:0}},[
      React.createElement('div',{key:'c'},children),
      action?React.createElement('div',{key:'a',style:{display:'flex',gap:10}},action):null])]);
}