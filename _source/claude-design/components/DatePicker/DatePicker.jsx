const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
const DAYS=['Mo','Tu','We','Th','Fr','Sa','Su'];
function iso(d){ return d.toISOString().slice(0,10); }
export function DatePicker({ value, onChange, month, onMonthChange, capacity={}, holidays=[],
  rangeEnd, min, max, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon;
  const [inner,setInner]=React.useState(()=>new Date(value||Date.now()));
  const view = month ? new Date(month) : inner;
  const setView = d => { onMonthChange ? onMonthChange(iso(d)) : setInner(d); };
  const y=view.getFullYear(), m=view.getMonth();
  const first=new Date(y,m,1);
  const lead=(first.getDay()+6)%7;
  const dim=new Date(y,m+1,0).getDate();
  const cells=[];
  for(let i=0;i<lead;i++) cells.push(null);
  for(let d=1;d<=dim;d++) cells.push(new Date(y,m,d));
  const sel=value?iso(new Date(value)):null;
  const end=rangeEnd?iso(new Date(rangeEnd)):null;
  const inRange=k=>sel&&end&&k>sel&&k<end;
  const CAP={low:t.success,medium:t.warn,high:t.danger};
  const navBtn=(d,name)=>React.createElement('button',{onClick:()=>setView(new Date(y,m+d,1)),
    'aria-label':d<0?'Previous month':'Next month',
    style:{width:28,height:28,borderRadius:6,border:0,background:'transparent',color:t.fg2,
      cursor:'pointer',display:'grid',placeItems:'center',padding:0}},
    Icon&&React.createElement(Icon,{name,size:16}));
  return React.createElement('div',{style:{width:300,background:t.surface,border:'1px solid '+t.strokeSubtle,
    borderRadius:12,padding:14,boxShadow:'0 8px 24px rgba(2,6,23,.12)',...style}},
    React.createElement('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}},
      navBtn(-1,'chevron-left'),
      React.createElement('span',{style:{font:'500 14px/1 '+t.font,color:t.fg1}},
        view.toLocaleString('en',{month:'long'})+' '+y),
      navBtn(1,'chevron-right')),
    React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:4}},
      DAYS.map(d=>React.createElement('span',{key:d,style:{textAlign:'center',
        font:'500 10px/1 '+t.font,color:t.fg4,padding:'4px 0'}},d))),
    React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}},
      cells.map((d,i)=>{
        if(!d) return React.createElement('span',{key:'e'+i});
        const k=iso(d);
        const on=k===sel||k===end;
        const hol=holidays.includes(k);
        const dis=(min&&k<min)||(max&&k>max);
        const cap=capacity[k];
        return React.createElement('button',{key:k,disabled:dis,onClick:()=>onChange&&onChange(k),
          style:{position:'relative',height:36,borderRadius:8,border:0,cursor:dis?'not-allowed':'pointer',
            background:on?t.blue500:inRange(k)?t.blue100:hol?'rgb(254,226,226)':'transparent',
            color:on?'#fff':dis?t.fg4:hol?t.danger:t.fg1,
            font:(on?'500 ':'400 ')+'13px/1 '+t.font,display:'grid',placeItems:'center'}},
          d.getDate(),
          cap&&!on&&React.createElement('span',{style:{position:'absolute',bottom:4,left:'50%',
            transform:'translateX(-50%)',width:4,height:4,borderRadius:'50%',background:CAP[cap]||t.fg4}}));
      })));
}