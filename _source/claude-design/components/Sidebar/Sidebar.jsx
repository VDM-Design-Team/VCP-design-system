const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export const NAV_BY_ROLE = {
  user: [
    { key:'dashboard', label:'Dashboard', icon:'squares-2x2' },
    { key:'my-values', label:'My Values', icon:'queue-list' },
    { key:'assigned', label:'Assigned', icon:'eye' },
    { key:'drafts', label:'Drafts', icon:'pencil-square' },
    { key:'task-log', label:'Task Log Trail', icon:'clipboard-document-list' },
    { key:'archive', label:'Archive', icon:'archive-box' },
  ],
  admin: [
    { key:'dashboard', label:'Dashboard', icon:'squares-2x2' },
    { key:'my-values', label:'My Values', icon:'queue-list' },
    { key:'manage', label:'Manage', icon:'arrows-up-down' },
    { key:'assigned', label:'Assigned', icon:'eye' },
    { key:'drafts', label:'Drafts', icon:'pencil-square' },
    { key:'task-log', label:'Task Log Trail', icon:'clipboard-document-list' },
    { key:'archive', label:'Archive', icon:'archive-box' },
  ],
  superAdmin: [
    { key:'dashboard', label:'Dashboard', icon:'squares-2x2' },
    { key:'accounts', label:'Accounts', icon:'users' },
    { key:'domains', label:'Domains', icon:'building-office' },
    { key:'contact-list', label:'Contact List', icon:'envelope' },
  ],
};
export function Sidebar({ role='user', active, onNavigate, collapsed, onToggleCollapse,
  showDomainSelector, domain='Design', onDomainChange, domains=['Design','Development','Governance','Partners & Campaigns'],
  footerAction, style }) {
  const G = (typeof window!=='undefined' && window['VCPAddedValueDesignSystem_8e42bb']) || {};
  const Icon = G.Icon, SidebarItem = G.SidebarItem, Logo = G.Logo, Select = G.Select;
  const items = NAV_BY_ROLE[role] || NAV_BY_ROLE.user;
  const w = collapsed ? 76 : 256;
  return React.createElement('aside',{style:{position:'relative',width:w,flexShrink:0,
    background:t.surface,borderRight:'1px solid '+t.stroke,display:'flex',flexDirection:'column',
    padding:'20px 0 16px',transition:'width 180ms',...style}},
    React.createElement('div',{style:{padding:collapsed?'0 12px':'0 32px 0 24px',display:'flex',
      alignItems:'center',justifyContent:collapsed?'center':'flex-start'}},
      Logo && React.createElement(Logo,{height:26,collapsed})),
    React.createElement('div',{style:{marginTop:40,padding:'0 12px',display:'flex',flexDirection:'column',gap:32,flex:1}},
      showDomainSelector && !collapsed && Select && React.createElement(Select,{size:'small',
        options:domains,value:domain,onChange:onDomainChange}),
      React.createElement('nav',{style:{display:'flex',flexDirection:'column',gap:8}},
        items.map(it => SidebarItem && React.createElement(SidebarItem,{key:it.key,label:it.label,
          selected:active===it.key,collapsed,onClick:()=>onNavigate&&onNavigate(it.key),
          icon:Icon&&React.createElement(Icon,{name:it.icon,size:24})})))),
    React.createElement('div',{style:{padding:'0 12px',display:'flex',flexDirection:'column',gap:8}},
      footerAction,
      SidebarItem && React.createElement(SidebarItem,{label:'Report a problem',collapsed,
        icon:Icon&&React.createElement(Icon,{name:'exclamation-triangle',size:24})})),
    onToggleCollapse && React.createElement('button',{onClick:onToggleCollapse,
      'aria-label':collapsed?'Expand sidebar':'Collapse sidebar',
      style:{position:'absolute',left:w-16,top:15,width:32,height:32,borderRadius:'50%',
        border:'1px solid '+t.stroke,background:t.surface,color:t.fg2,cursor:'pointer',
        display:'grid',placeItems:'center',boxShadow:'0 1px 3px rgba(2,6,23,.1)',zIndex:2,padding:0}},
      Icon&&React.createElement(Icon,{name:collapsed?'chevron-right':'chevron-left',size:16})));
}