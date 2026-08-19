const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export const ASSIGNEE_STATUSES={
  Available:{bg:'rgb(220,245,224)',fg:'rgb(40,120,50)',dot:'rgb(99,194,112)'},
  'At capacity':{bg:'rgb(254,243,199)',fg:'rgb(146,84,14)',dot:'rgb(250,204,20)'},
  Overloaded:{bg:'rgb(254,226,226)',fg:'rgb(185,28,28)',dot:'rgb(231,0,11)'},
  'On holiday':{bg:'rgb(241,245,249)',fg:'rgb(100,116,139)',dot:'rgb(148,163,184)'}};
export function AssigneeStatus(props){
  const { name, status='Available', load, capacity, showAvatar=true, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Avatar, Tooltip } = G;
  const c=ASSIGNEE_STATUSES[status]||ASSIGNEE_STATUSES.Available;
  const body=React.createElement('span',{style:{display:'inline-flex',alignItems:'center',gap:8,...style}},[
    showAvatar&&Avatar?React.createElement(Avatar,{key:'a',name,size:26}):null,
    React.createElement('span',{key:'n',style:{font:'400 13px/1 '+t.font,color:t.fg1}},name),
    React.createElement('span',{key:'s',style:{display:'inline-flex',alignItems:'center',gap:4,height:20,
      padding:'0 8px',borderRadius:24,background:c.bg,color:c.fg,font:'500 10px/1 '+t.font}},[
      React.createElement('span',{key:'d',style:{width:6,height:6,borderRadius:'50%',background:c.dot}}),
      status])]);
  if(load==null||!Tooltip) return body;
  return React.createElement(Tooltip,{content:load+' of '+capacity+' points assigned'},body);
}