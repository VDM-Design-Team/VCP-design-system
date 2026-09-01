const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
export function FilterBar({ search, onSearchChange, searchPlaceholder='Search by title or ID',
  filters=[], onReset, align='right', trailing, style }) {
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const Icon=G.Icon, Input=G.Input, Button=G.Button, Select=G.Select;
  return React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',
    justifyContent:align==='right'?'flex-end':'flex-start',...style}},
    onReset && React.createElement(Button,{variant:'text',size:'small',onClick:onReset},'Reset'),
    filters.map(f=>React.createElement('div',{key:f.key,style:{minWidth:f.width||140}},
      Select&&React.createElement(Select,{size:'small',options:f.options,value:f.value,
        placeholder:f.label,onChange:f.onChange}))),
    onSearchChange!==undefined && React.createElement('div',{style:{width:260}},
      Input&&React.createElement(Input,{size:'small',value:search,placeholder:searchPlaceholder,
        onChange:e=>onSearchChange&&onSearchChange(e.target.value),
        leadingIcon:Icon&&React.createElement(Icon,{name:'magnifying-glass',size:16})})),
    trailing);
}