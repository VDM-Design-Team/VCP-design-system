const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function DataTable({ columns=[], rows=[], onRowClick, sort, onSortChange, selectable,
  selected=[], onSelectedChange, empty, dense, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{}; const Icon=G.Icon, Checkbox=G.Checkbox;
  const grid = (selectable?'40px ':'') + columns.map(c=>c.width||'1fr').join(' ');
  const rowH = dense?44:56;
  const allOn = rows.length>0 && selected.length===rows.length;
  const toggleAll = () => onSelectedChange && onSelectedChange(allOn?[]:rows.map((r,i)=>r.id??i));
  const toggleOne = id => { if(!onSelectedChange) return;
    onSelectedChange(selected.includes(id)?selected.filter(x=>x!==id):[...selected,id]); };
  return React.createElement('div',{style:{background:t.surface,border:'1px solid '+t.strokeSubtle,
    borderRadius:8,overflow:'hidden',...style}},
    React.createElement('div',{style:{display:'grid',gridTemplateColumns:grid,gap:14,
      padding:'0 18px',height:44,alignItems:'center',background:t.canvas,
      borderBottom:'1px solid '+t.strokeSubtle}},
      selectable && React.createElement('div',null, Checkbox&&React.createElement(Checkbox,{checked:allOn,
        indeterminate:selected.length>0&&!allOn,onChange:toggleAll})),
      columns.map(c=>React.createElement('button',{key:c.key,disabled:!c.sortable,
        onClick:()=>c.sortable&&onSortChange&&onSortChange(c.key),
        style:{display:'flex',alignItems:'center',gap:6,border:0,background:'transparent',padding:0,
          cursor:c.sortable?'pointer':'default',color:t.fg2,
          font:'600 11px/1 '+t.font,textTransform:'uppercase',letterSpacing:'.05em',
          justifyContent:c.align==='right'?'flex-end':'flex-start'}},
        c.label,
        c.sortable && Icon && React.createElement(Icon,{size:12,
          name: sort===c.key?'chevron-up':'chevron-down',
          style:{opacity:sort===c.key?1:.4}})))),
    rows.length===0
      ? React.createElement('div',{style:{padding:'48px 18px',textAlign:'center',
          font:'400 14px/1.5 '+t.font,color:t.fg3}}, empty||'Nothing here yet.')
      : rows.map((r,i)=>React.createElement(Row,{key:r.id??i,row:r,index:i,columns,grid,rowH,
          onRowClick,selectable,selected,toggleOne,Checkbox})));
}
function Row({ row, index, columns, grid, rowH, onRowClick, selectable, selected, toggleOne, Checkbox }) {
  const [h,setH]=React.useState(false);
  const id = row.id ?? index;
  return React.createElement('div',{onMouseEnter:()=>setH(true),onMouseLeave:()=>setH(false),
    onClick:()=>onRowClick&&onRowClick(row),
    style:{display:'grid',gridTemplateColumns:grid,gap:14,padding:'0 18px',minHeight:rowH,
      alignItems:'center',borderBottom:'1px solid '+t.strokeSubtle,
      background:h?t.blue50:'transparent',cursor:onRowClick?'pointer':'default',
      transition:'background 120ms'}},
    selectable && React.createElement('div',{onClick:e=>e.stopPropagation()},
      Checkbox&&React.createElement(Checkbox,{checked:selected.includes(id),onChange:()=>toggleOne(id)})),
    columns.map(c=>React.createElement('div',{key:c.key,
      style:{minWidth:0,font:'400 14px/1.4 '+t.font,color:t.fg2,
        display:'flex',alignItems:'center',gap:8,
        justifyContent:c.align==='right'?'flex-end':'flex-start'}},
      c.render ? c.render(row) : row[c.key])));
}