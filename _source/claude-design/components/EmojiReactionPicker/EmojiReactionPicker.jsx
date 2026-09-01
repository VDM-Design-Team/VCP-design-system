const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
const DEFAULT_EMOJI=['\u{1F44D}','\u{1F44E}','\u{1F389}','\u{1F3AF}','\u{1F440}','\u{1F525}','\u{1F914}','\u{2705}'];
export function EmojiReactionPicker(props){
  const { emoji=DEFAULT_EMOJI, onSelect, reactions=[], onToggle, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Popover, Icon } = G;
  const [open,setOpen]=React.useState(false);
  const grid=React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4}},
    emoji.map(e=>React.createElement('button',{key:e,onClick:()=>{ onSelect&&onSelect(e); setOpen(false); },
      'aria-label':'React '+e,
      style:{height:36,borderRadius:6,border:0,background:'transparent',cursor:'pointer',
        fontSize:18,lineHeight:1,display:'grid',placeItems:'center'}},e)));
  const trigger=React.createElement('button',{'aria-label':'Add reaction',
    style:{display:'inline-flex',alignItems:'center',gap:4,height:24,padding:'0 8px',
      borderRadius:999,border:'1px solid '+t.strokeSubtle,background:t.surface,
      color:t.fg3,cursor:'pointer',font:'400 12px/1 '+t.font}},
    Icon?React.createElement(Icon,{name:'plus',size:12}):'+');
  const pills=reactions.map((r,i)=>React.createElement('button',{key:i,onClick:()=>onToggle&&onToggle(r.emoji),
    style:{display:'inline-flex',alignItems:'center',gap:4,height:24,padding:'0 8px',
      borderRadius:999,cursor:'pointer',
      border:'1px solid '+(r.mine?t.blue500:t.strokeSubtle),
      background:r.mine?t.blue100:t.surface,color:r.mine?t.blue500:t.fg2,
      font:'400 12px/1 '+t.font}},r.emoji+' '+r.count));
  return React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',...style}},
    pills.concat([
      Popover?React.createElement(Popover,{key:'p',open,onOpenChange:setOpen,width:180,
        trigger,content:grid}):null]));
}