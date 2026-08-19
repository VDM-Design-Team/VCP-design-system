const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function AttachmentPreview(props){
  const { name, src, kind='image', size, onClose, onDownload, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Icon, IconButton } = G;
  return React.createElement('div',{style:{display:'flex',flexDirection:'column',borderRadius:12,
    overflow:'hidden',background:t.surface,border:'1px solid '+t.strokeSubtle,
    boxShadow:'0 8px 24px rgba(2,6,23,.14)',...style}},[
    React.createElement('div',{key:'h',style:{display:'flex',alignItems:'center',gap:10,
      padding:'10px 12px',borderBottom:'1px solid '+t.strokeSubtle}},[
      Icon?React.createElement(Icon,{key:'i',name:kind==='image'?'photo':'document',size:16,
        style:{color:t.fg3,flexShrink:0}}):null,
      React.createElement('span',{key:'n',style:{flex:1,minWidth:0,font:'500 13px/1.3 '+t.font,color:t.fg1,
        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},name),
      size?React.createElement('span',{key:'s',style:{font:'400 11px/1 '+t.font,color:t.fg4}},size):null,
      onDownload&&IconButton&&Icon?React.createElement(IconButton,{key:'dl',label:'Download '+name,size:28,
        onClick:onDownload,icon:React.createElement(Icon,{name:'arrow-down-tray',size:15})}):null,
      onClose&&IconButton&&Icon?React.createElement(IconButton,{key:'x',label:'Close preview',size:28,
        onClick:onClose,icon:React.createElement(Icon,{name:'x-mark',size:15})}):null]),
    React.createElement('div',{key:'b',style:{background:t.canvas,minHeight:200,display:'grid',
      placeItems:'center',padding:kind==='image'?0:32}},
      kind==='image'&&src
        ? React.createElement('img',{src,alt:name,style:{maxWidth:'100%',maxHeight:420,display:'block'}})
        : React.createElement('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',gap:8,
            color:t.fg3}},[
            Icon?React.createElement(Icon,{key:'i',name:'document',size:32}):null,
            React.createElement('span',{key:'t',style:{font:'400 13px/1 '+t.font}},'No inline preview')]))]);
}