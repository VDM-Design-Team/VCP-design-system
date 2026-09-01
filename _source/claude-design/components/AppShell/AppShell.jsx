const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function AppShell({ role='user', active, onNavigate, collapsed, onToggleCollapse,
  showDomainSelector, domain, onDomainChange, sidebarFooter,
  title, subtitle, breadcrumb, onBack, actions, user, notifications,
  detail, children, footer='2026 © Valuechainplus', style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const Sidebar=G.Sidebar, TopBar=G.TopBar;
  const ROLE_LABEL={user:'User',admin:'Admin',superAdmin:'Super Admin'};
  return React.createElement('div',{style:{display:'flex',minHeight:'100vh',background:t.canvas,...style}},
    Sidebar&&React.createElement(Sidebar,{role,active,onNavigate,collapsed,onToggleCollapse,
      showDomainSelector:showDomainSelector??(role!=='superAdmin'),domain,onDomainChange,
      footerAction:sidebarFooter}),
    React.createElement('div',{style:{flex:1,minWidth:0,display:'flex',flexDirection:'column'}},
      TopBar&&React.createElement(TopBar,{title,subtitle,breadcrumb,onBack,actions,user,
        notifications,role:ROLE_LABEL[role]}),
      React.createElement('div',{style:{flex:1,display:'grid',
        gridTemplateColumns:detail?'minmax(0,1fr) 390px':'minmax(0,1fr)',
        gap:16,padding:'24px 32px 8px',alignContent:'start'}},
        React.createElement('main',{style:{minWidth:0,display:'flex',flexDirection:'column',gap:16}},children),
        detail&&React.createElement('aside',{style:{display:'flex',flexDirection:'column',gap:14}},detail)),
      footer&&React.createElement('div',{style:{padding:'16px 0 24px',textAlign:'center',
        font:'400 12px/1 '+t.font,color:t.fg4}},footer)));
}