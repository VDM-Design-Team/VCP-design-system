const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function BudgetTable({ rows=[], editable, onChange, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const {DomainLabel,ProgressBar,Input,Badge}=G;
  const COLS='200px 1fr 110px 110px 110px';
  return React.createElement('div',{style:{background:t.surface,border:'1px solid '+t.strokeSubtle,
    borderRadius:8,overflow:'hidden',...style}},
    React.createElement('div',{style:{display:'grid',gridTemplateColumns:COLS,gap:14,padding:'0 18px',
      height:44,alignItems:'center',background:t.canvas,borderBottom:'1px solid '+t.strokeSubtle}},
      ['Domain','Consumption','Allocated','Consumed','Remaining'].map((h,i)=>
        React.createElement('span',{key:h,style:{font:'600 11px/1 '+t.font,color:t.fg2,
          textTransform:'uppercase',letterSpacing:'.05em',textAlign:i>1?'right':'left'}},h))),
    rows.map((r,i)=>{
      const consumed=r.consumed??0, allocated=r.allocated??0;
      const remaining=allocated-consumed;
      const pct=allocated?consumed/allocated:0;
      const tone=pct>=.9?'danger':pct>=.75?'warning':'brand';
      return React.createElement('div',{key:r.domain||i,
        style:{display:'grid',gridTemplateColumns:COLS,gap:14,padding:'12px 18px',alignItems:'center',
          borderBottom:i===rows.length-1?0:'1px solid '+t.strokeSubtle}},
        DomainLabel&&React.createElement(DomainLabel,{domain:r.domain}),
        ProgressBar&&React.createElement(ProgressBar,{value:consumed,max:allocated||1,tone,showLabel:true}),
        editable&&Input
          ? React.createElement(Input,{size:'small',value:String(allocated),
              onChange:e=>onChange&&onChange(r.domain,Number(e.target.value)||0),
              style:{textAlign:'right'}})
          : React.createElement('span',{style:{font:'400 13px/1 '+t.font,color:t.fg2,textAlign:'right'}},allocated),
        React.createElement('span',{style:{font:'400 13px/1 '+t.font,color:t.fg2,textAlign:'right'}},consumed),
        React.createElement('div',{style:{display:'flex',justifyContent:'flex-end'}},
          Badge&&React.createElement(Badge,{tone:remaining<0?'danger':remaining===0?'warning':'success'},remaining)));
    }));
}