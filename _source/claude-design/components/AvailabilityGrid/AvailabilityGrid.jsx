const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
const LOAD={free:{bg:'rgb(220,245,224)',fg:'rgb(40,120,50)'},light:{bg:'rgb(232,238,251)',fg:'rgb(26,86,219)'},
 busy:{bg:'rgb(254,243,199)',fg:'rgb(146,84,14)'},full:{bg:'rgb(254,226,226)',fg:'rgb(185,28,28)'},
 holiday:{bg:'rgb(241,245,249)',fg:'rgb(148,163,184)'}};
export function AvailabilityGrid(props){
  const { people=[], days=[], onCellClick, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Avatar, Tooltip } = G;
  const cols='190px repeat('+days.length+', minmax(30px, 1fr))';
  const header=React.createElement('div',{key:'h',style:{display:'grid',gridTemplateColumns:cols,gap:2,
    padding:'0 12px',height:40,alignItems:'center',background:t.canvas,
    borderBottom:'1px solid '+t.strokeSubtle}},
    [React.createElement('span',{key:'l',style:{font:'600 11px/1 '+t.font,color:t.fg2,
      textTransform:'uppercase',letterSpacing:'.05em'}},'Assignee')].concat(
      days.map(d=>React.createElement('span',{key:d.key||d.label,style:{textAlign:'center',
        font:'500 10px/1.3 '+t.font,color:d.weekend?t.fg4:t.fg3}},d.label))));
  const rows=people.map(p=>React.createElement('div',{key:p.name,style:{display:'grid',gridTemplateColumns:cols,gap:2,
    padding:'6px 12px',alignItems:'center',borderBottom:'1px solid '+t.strokeSubtle}},
    [React.createElement('span',{key:'n',style:{display:'flex',alignItems:'center',gap:8,minWidth:0}},[
      Avatar?React.createElement(Avatar,{key:'a',name:p.name,size:24}):null,
      React.createElement('span',{key:'t',style:{font:'400 12px/1 '+t.font,color:t.fg1,
        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},p.name)])].concat(
      days.map(d=>{
        const dk=d.key||d.label;
        const cellLoad=(p.load||{})[dk]||'free';
        const c=LOAD[cellLoad]||LOAD.free;
        const cell=React.createElement('button',{key:dk,onClick:()=>onCellClick&&onCellClick(p,d),
          style:{height:28,borderRadius:4,border:0,background:c.bg,color:c.fg,
            cursor:onCellClick?'pointer':'default',font:'500 10px/1 '+t.font,
            display:'grid',placeItems:'center',padding:0,width:'100%'}},
          (p.points||{})[dk]||'');
        return Tooltip?React.createElement(Tooltip,{key:dk,content:p.name+' \u2014 '+d.label+': '+cellLoad},cell):cell;
      }))));
  const legend=React.createElement('div',{key:'lg',style:{display:'flex',gap:14,flexWrap:'wrap',
    padding:'10px 12px',borderTop:'1px solid '+t.strokeSubtle,background:t.canvas}},
    Object.keys(LOAD).map(k=>React.createElement('span',{key:k,style:{display:'inline-flex',alignItems:'center',gap:6,
      font:'400 11px/1 '+t.font,color:t.fg3}},[
      React.createElement('span',{key:'s',style:{width:12,height:12,borderRadius:3,background:LOAD[k].bg,
        border:'1px solid '+LOAD[k].fg+'44'}}),k])));
  return React.createElement('div',{style:{background:t.surface,border:'1px solid '+t.strokeSubtle,
    borderRadius:8,overflow:'hidden',...style}},[header].concat(rows).concat([legend]));
}