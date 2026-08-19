const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function RadioGroup({ options=[], value, onChange, name, orientation='vertical', disabled, style }) {
  const gid = React.useRef('rg-'+Math.random().toString(36).slice(2,8)).current;
  return React.createElement('div',{role:'radiogroup',
    style:{display:'flex',flexDirection:orientation==='horizontal'?'row':'column',
      gap:orientation==='horizontal'?16:8,flexWrap:'wrap',...style}},
    options.map(o=>{ const v=typeof o==='string'?o:o.value, l=typeof o==='string'?o:o.label,
      hint=typeof o==='object'?o.hint:null, dis=disabled||(typeof o==='object'&&o.disabled);
      return React.createElement('label',{key:v,
        style:{display:'flex',alignItems:hint?'flex-start':'center',gap:10,
          cursor:dis?'not-allowed':'pointer',color:dis?t.fg4:t.fg2}},
        React.createElement('input',{type:'radio',name:name||gid,value:v,checked:value===v,disabled:dis,
          onChange:()=>onChange&&onChange(v),
          style:{width:16,height:16,accentColor:'rgb(26,86,219)',margin:hint?'2px 0 0':0,
            cursor:'inherit',flexShrink:0}}),
        React.createElement('span',{style:{display:'flex',flexDirection:'column',gap:2}},
          React.createElement('span',{style:{font:'400 14px/1.4 '+t.font}},l),
          hint&&React.createElement('span',{style:{font:'400 12px/1.45 '+t.font,color:t.fg3}},hint)));
    }));
}