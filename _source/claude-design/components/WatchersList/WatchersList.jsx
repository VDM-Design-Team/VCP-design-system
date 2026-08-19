const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function WatchersList(props){
  const { watchers=[], onAdd, onRemove, editable, max=6, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Avatar, Icon, Tooltip } = G;
  const shown=watchers.slice(0,max), rest=watchers.length-shown.length;
  const chips=shown.map((w,i)=>{
    const name=typeof w==='string'?w:w.name;
    const node=React.createElement('span',{style:{position:'relative',display:'inline-flex'}},[
      Avatar?React.createElement(Avatar,{key:'a',name,size:28,ring:true}):null,
      editable&&onRemove?React.createElement('button',{key:'x',onClick:()=>onRemove(w),
        'aria-label':'Remove '+name,
        style:{position:'absolute',top:-3,right:-3,width:15,height:15,borderRadius:'50%',
          border:0,background:t.fg2,color:'#fff',cursor:'pointer',display:'grid',
          placeItems:'center',padding:0,font:'400 8px/1 '+t.font}},'\u2715'):null]);
    return Tooltip?React.createElement(Tooltip,{key:name+i,content:name},node):React.createElement('span',{key:name+i},node);
  });
  const extras=[];
  if(rest>0) extras.push(React.createElement('span',{key:'rest',style:{width:28,height:28,borderRadius:'50%',
    background:t.blue100,color:t.blue500,display:'grid',placeItems:'center',
    font:'500 11px/1 '+t.font}},'+'+rest));
  if(editable&&onAdd) extras.push(React.createElement('button',{key:'add',onClick:onAdd,'aria-label':'Add watcher',
    style:{width:28,height:28,borderRadius:'50%',border:'1px dashed '+t.stroke,
      background:'transparent',color:t.fg3,cursor:'pointer',display:'grid',placeItems:'center',
      padding:0,flexShrink:0}}, Icon?React.createElement(Icon,{name:'plus',size:14}):'+'));
  return React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',...style}},
    chips.concat(extras));
}