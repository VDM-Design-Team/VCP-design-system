const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export const TAG_COLOURS=['rgb(26,86,219)','rgb(79,70,229)','rgb(99,194,112)','rgb(250,204,20)','rgb(231,0,11)','rgb(100,116,139)'];
export function TagEditor({ tags=[], onAdd, onRemove, onColourChange, editable=true, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const {Icon,Input,Button}=G;
  const [draft,setDraft]=React.useState('');
  const [colour,setColour]=React.useState(TAG_COLOURS[0]);
  const submit=()=>{ const v=draft.trim(); if(!v) return; onAdd&&onAdd({label:v,colour}); setDraft(''); };
  return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:12,...style}},
    React.createElement('div',{style:{display:'flex',gap:8,flexWrap:'wrap'}},
      tags.length===0 && React.createElement('span',{style:{font:'400 13px/1 '+t.font,color:t.fg4}},'No tags yet.'),
      tags.map((tg,i)=>React.createElement('span',{key:tg.label||i,
        style:{display:'inline-flex',alignItems:'center',gap:6,height:26,padding:'0 8px',
          borderRadius:6,background:(tg.colour||TAG_COLOURS[0])+'1f',
          color:tg.colour||TAG_COLOURS[0],font:'500 12px/1 '+t.font}},
        React.createElement('span',{style:{width:7,height:7,borderRadius:'50%',
          background:tg.colour||TAG_COLOURS[0]}}),
        tg.label,
        editable&&onRemove&&React.createElement('button',{onClick:()=>onRemove(tg),
          'aria-label':'Remove '+tg.label,
          style:{border:0,background:'transparent',color:'inherit',cursor:'pointer',padding:0,
            display:'grid',placeItems:'center'}},
          Icon&&React.createElement(Icon,{name:'x-mark',size:12}))))),
    editable && React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}},
      React.createElement('div',{style:{display:'flex',gap:4}},
        TAG_COLOURS.map(c=>React.createElement('button',{key:c,onClick:()=>{setColour(c);onColourChange&&onColourChange(c);},
          'aria-label':'Colour '+c,
          style:{width:22,height:22,borderRadius:6,border:colour===c?'2px solid '+t.fg1:'1px solid '+t.strokeSubtle,
            background:c,cursor:'pointer',padding:0}}))),
      React.createElement('div',{style:{flex:1,minWidth:160}},
        Input&&React.createElement(Input,{size:'small',value:draft,placeholder:'New tag name',
          onChange:e=>setDraft(e.target.value),
          onKeyDown:e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } }})),
      Button&&React.createElement(Button,{size:'small',variant:'outlined',onClick:submit,
        disabled:!draft.trim()},'Add tag')));
}