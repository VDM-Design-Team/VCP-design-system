const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
const LEVELS=['None','View','Contribute','Admin'];
export function DomainAccessTable(props){
  const { rows=[], onChange, readOnly, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { DomainLabel, Badge } = G;
  const COLS='210px repeat(4, 1fr)';
  const header=React.createElement('div',{key:'h',style:{display:'grid',gridTemplateColumns:COLS,gap:8,
    padding:'0 18px',height:44,alignItems:'center',background:t.canvas,
    borderBottom:'1px solid '+t.strokeSubtle}},
    ['Domain'].concat(LEVELS).map((h,i)=>React.createElement('span',{key:h,style:{font:'600 11px/1 '+t.font,
      color:t.fg2,textTransform:'uppercase',letterSpacing:'.05em',
      textAlign:i===0?'left':'center'}},h)));
  const body=rows.map((r,i)=>React.createElement('div',{key:r.domain,style:{display:'grid',gridTemplateColumns:COLS,
    gap:8,padding:'10px 18px',alignItems:'center',
    borderBottom:i===rows.length-1?0:'1px solid '+t.strokeSubtle}},
    [React.createElement('div',{key:'d'}, DomainLabel?React.createElement(DomainLabel,{domain:r.domain}):r.domain)].concat(
      LEVELS.map(lv=>{
        const on=r.level===lv;
        if(readOnly) return React.createElement('div',{key:lv,style:{display:'grid',placeItems:'center'}},
          on&&Badge?React.createElement(Badge,{tone:'brand'},'\u2713'):React.createElement('span',{style:{color:t.fg4,
            font:'400 12px/1 '+t.font}},'\u2014'));
        return React.createElement('div',{key:lv,style:{display:'grid',placeItems:'center'}},
          React.createElement('input',{type:'radio',name:'access-'+r.domain,checked:on,
            onChange:()=>onChange&&onChange(r.domain,lv),
            style:{width:16,height:16,accentColor:'rgb(26,86,219)',cursor:'pointer',margin:0}}));
      }))));
  return React.createElement('div',{style:{background:t.surface,border:'1px solid '+t.strokeSubtle,
    borderRadius:8,overflow:'hidden',...style}},[header].concat(body));
}