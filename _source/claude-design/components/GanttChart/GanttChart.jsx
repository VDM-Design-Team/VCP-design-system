const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function GanttChart({ tasks=[], start, end, today, onTaskClick, rowHeight=44, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Avatar=G.Avatar;
  const s=new Date(start).getTime(), e=new Date(end).getTime();
  const span=Math.max(1,e-s);
  const pct=d=>((new Date(d).getTime()-s)/span)*100;
  const months=[]; { const c=new Date(s); c.setDate(1);
    while(c.getTime()<=e){ months.push(new Date(c)); c.setMonth(c.getMonth()+1); } }
  const TONE={critical:t.danger,high:'rgb(245,158,11)',medium:t.blue500,low:t.success};
  return React.createElement('div',{style:{background:t.surface,border:'1px solid '+t.strokeSubtle,
    borderRadius:8,overflow:'hidden',...style}},
    React.createElement('div',{style:{display:'flex',borderBottom:'1px solid '+t.strokeSubtle,background:t.canvas}},
      React.createElement('div',{style:{width:260,flexShrink:0,padding:'0 16px',height:40,
        display:'flex',alignItems:'center',font:'600 11px/1 '+t.font,color:t.fg2,
        textTransform:'uppercase',letterSpacing:'.05em',borderRight:'1px solid '+t.strokeSubtle}},'Added Value'),
      React.createElement('div',{style:{flex:1,position:'relative',height:40}},
        months.map((m,i)=>React.createElement('span',{key:i,style:{position:'absolute',
          left:Math.max(0,pct(m))+'%',top:0,height:'100%',paddingLeft:8,
          borderLeft:'1px solid '+t.strokeSubtle,display:'flex',alignItems:'center',
          font:'500 11px/1 '+t.font,color:t.fg3,whiteSpace:'nowrap'}},
          m.toLocaleString('en',{month:'short'})+' '+m.getFullYear())))),
    tasks.map((tk,i)=>React.createElement('div',{key:tk.id||i,
      style:{display:'flex',borderBottom:i===tasks.length-1?0:'1px solid '+t.strokeSubtle}},
      React.createElement('div',{style:{width:260,flexShrink:0,padding:'0 16px',minHeight:rowHeight,
        display:'flex',alignItems:'center',gap:8,borderRight:'1px solid '+t.strokeSubtle}},
        Avatar&&tk.assignee&&React.createElement(Avatar,{name:tk.assignee,size:22}),
        React.createElement('span',{style:{font:'400 12px/1.3 '+t.font,color:t.fg1,
          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},title:tk.title},tk.title)),
      React.createElement('div',{style:{flex:1,position:'relative',minHeight:rowHeight}},
        months.map((m,j)=>React.createElement('span',{key:j,style:{position:'absolute',
          left:Math.max(0,pct(m))+'%',top:0,bottom:0,borderLeft:'1px solid '+t.strokeSubtle}})),
        today && React.createElement('span',{style:{position:'absolute',left:pct(today)+'%',top:0,bottom:0,
          borderLeft:'2px dashed '+t.blue500,zIndex:1}}),
        React.createElement('button',{onClick:()=>onTaskClick&&onTaskClick(tk),title:tk.title,
          style:{position:'absolute',left:pct(tk.start)+'%',width:Math.max(1.5,pct(tk.end)-pct(tk.start))+'%',
            top:'50%',transform:'translateY(-50%)',height:22,borderRadius:6,border:0,
            background:TONE[tk.severity]||t.blue500,cursor:onTaskClick?'pointer':'default',
            display:'flex',alignItems:'center',padding:'0 8px',overflow:'hidden'}},
          React.createElement('span',{style:{font:'500 10px/1 '+t.font,color:'#fff',whiteSpace:'nowrap'}},
            tk.points!=null?tk.points+' pts':''))))));
}