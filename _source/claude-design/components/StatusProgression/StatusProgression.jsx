const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export const FLOW=['Draft','In progress','Ready for review','Ready for hand-off','Completed'];
export function StatusProgression(props){
  const { steps=FLOW, current, onStepClick, blocked, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  const idx=steps.indexOf(current);
  const nodes=[];
  steps.forEach((s,i)=>{
    const done=i<idx, on=i===idx, isBlocked=blocked&&on;
    const bg=isBlocked?t.danger:done?t.success:on?t.blue500:t.surface;
    const fg=(done||on||isBlocked)?'#fff':t.fg3;
    if(i>0) nodes.push(React.createElement('span',{key:'c'+i,style:{flex:1,height:2,minWidth:12,
      background:i<=idx?t.success:t.strokeSubtle}}));
    nodes.push(React.createElement('button',{key:s,onClick:()=>onStepClick&&onStepClick(s),
      disabled:!onStepClick,title:s,
      style:{display:'inline-flex',alignItems:'center',gap:6,height:30,padding:'0 12px',
        borderRadius:999,flexShrink:0,cursor:onStepClick?'pointer':'default',
        border:'1px solid '+((done||on||isBlocked)?'transparent':t.stroke),
        background:bg,color:fg,font:(on?'500 ':'400 ')+'12px/1 '+t.font,whiteSpace:'nowrap'}},[
      done&&Icon?React.createElement(Icon,{key:'i',name:'check',size:12}):null,
      isBlocked&&Icon?React.createElement(Icon,{key:'b',name:'exclamation-circle',size:12}):null, s]));
  });
  return React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',...style}},nodes);
}