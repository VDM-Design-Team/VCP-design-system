const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',indigo:'rgb(79,70,229)',font:"'Poppins', system-ui, sans-serif"};
export function ReviewPanel(props){
  const { decision, onDecisionChange, reason, onReasonChange, criteria=[], onCriterionToggle,
    overdue, style } = props;
  const G=(typeof window!=='undefined'&&window['VCPAddedValueDesignSystem_8e42bb'])||{};
  const { Field, Textarea, Checkbox, Banner, Icon, RadioGroup, Select } = G;
  const needReason = decision==='rejected'||decision==='changes';
  const blocks=[];
  if(overdue&&Banner) blocks.push(React.createElement(Banner,{key:'b',tone:'warning',
    icon:Icon?React.createElement(Icon,{name:'exclamation-triangle',size:18}):null,
    title:'Past deployment date'},'An overdue reason is required before this can be accepted.'));
  if(criteria.length&&Field) blocks.push(React.createElement(Field,{key:'ac',label:'Acceptance criteria'},
    React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:2}},
      criteria.map((c,i)=>Checkbox?React.createElement(Checkbox,{key:i,label:c.label,checked:!!c.met,
        onChange:()=>onCriterionToggle&&onCriterionToggle(i)}):null))));
  if(Field) blocks.push(React.createElement(Field,{key:'d',label:'Decision',required:true},
    RadioGroup?React.createElement(RadioGroup,{value:decision||'',onChange:onDecisionChange,options:[
      {value:'accepted',label:'Accept',hint:'Moves the Added Value to the next status.'},
      {value:'changes',label:'Request changes',hint:'Returns it to the initiating domain.'},
      {value:'rejected',label:'Reject',hint:'Closes it without shipping.'}]}):null));
  if(overdue&&Field&&Select) blocks.push(React.createElement(Field,{key:'or',label:'Overdue reason',required:true},
    React.createElement(Select,{options:['Blocked by dependency','Scope increased','Capacity shortfall','External delay'],
      placeholder:'Select a reason'})));
  if(needReason&&Field) blocks.push(React.createElement(Field,{key:'r',
    label: decision==='rejected'?'Rejection reason':'Requested changes', required:true,
    helper:'Shared with the initiating domain'},
    Textarea?React.createElement(Textarea,{rows:3,value:reason||'',
      placeholder:'Explain what needs to change',
      onChange:e=>onReasonChange&&onReasonChange(e.target.value)}):null));
  return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:16,...style}},blocks);
}