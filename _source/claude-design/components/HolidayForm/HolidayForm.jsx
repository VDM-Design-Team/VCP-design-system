const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function HolidayForm(props){
  const { value={}, onChange, domains=['Design','Development','Governance','Partners & Campaigns'], style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Field, Input, Select, Checkbox, Toggle, RadioGroup } = G;
  const set=(k,v)=>onChange&&onChange({...value,[k]:v});
  const scope=value.scope||'all';
  return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:16,...style}},[
    Field?React.createElement(Field,{key:'n',label:'Holiday name',required:true},
      Input?React.createElement(Input,{value:value.name||'',placeholder:'e.g. Independence Day',
        onChange:e=>set('name',e.target.value)}):null):null,
    Field?React.createElement(Field,{key:'t',label:'Type'},
      Select?React.createElement(Select,{options:['Public holiday','Company','Team event','Freeze'],
        value:value.type||'',placeholder:'Select a type',onChange:v=>set('type',v)}):null):null,
    React.createElement('div',{key:'d',style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}},[
      Field?React.createElement(Field,{key:'s',label:'Start date',required:true},
        Input?React.createElement(Input,{value:value.start||'',placeholder:'dd-mm-yyyy',
          onChange:e=>set('start',e.target.value)}):null):null,
      Field?React.createElement(Field,{key:'e',label:'End date',helper:'Leave blank for a single day'},
        Input?React.createElement(Input,{value:value.end||'',placeholder:'dd-mm-yyyy',
          onChange:e=>set('end',e.target.value)}):null):null]),
    Field?React.createElement(Field,{key:'sc',label:'Applies to'},
      RadioGroup?React.createElement(RadioGroup,{value:scope,onChange:v=>set('scope',v),options:[
        {value:'all',label:'All domains'},
        {value:'some',label:'Specific domains'}]}):null):null,
    scope==='some'?React.createElement('div',{key:'dm',style:{display:'flex',flexDirection:'column',gap:2,
      paddingLeft:26}},domains.map(d=>Checkbox?React.createElement(Checkbox,{key:d,label:d,
        checked:(value.domains||[]).includes(d),
        onChange:on=>set('domains',on?[...(value.domains||[]),d]:(value.domains||[]).filter(x=>x!==d))}):null)):null,
    Toggle?React.createElement(Toggle,{key:'r',checked:!!value.recurring,
      onChange:v=>set('recurring',v),label:'Repeat every year'}):null]);
}