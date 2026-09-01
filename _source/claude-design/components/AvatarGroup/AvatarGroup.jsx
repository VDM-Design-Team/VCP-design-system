const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',success:'rgb(99,194,112)',danger:'rgb(231,0,11)',warn:'rgb(250,204,20)',font:"'Poppins', system-ui, sans-serif"};
export function AvatarGroup({ people = [], max = 4, size = 28, style }) {
  const shown = people.slice(0, max), rest = people.length - shown.length;
  return React.createElement('div', { style:{ display:'inline-flex', alignItems:'center', ...style } },
    shown.map((p,i)=>React.createElement('div',{key:i,style:{marginLeft:i?-8:0,zIndex:shown.length-i}},
      React.createElement(window.Avatar||Avatar,{...(typeof p==='string'?{name:p}:p),size,ring:true}))),
    rest>0 && React.createElement('div',{style:{marginLeft:-8,width:size,height:size,borderRadius:'50%',
      background:t.blue100,color:t.blue500,display:'inline-flex',alignItems:'center',justifyContent:'center',
      font:'500 '+Math.round(size*0.36)+'px/1 '+t.font,boxShadow:'0 0 0 2px '+t.surface}}, '+'+rest));
}
function Avatar({ name='', size=28, ring }) {
  const TONES=['rgb(212,192,93)','rgb(139,183,247)','rgb(247,168,139)','rgb(176,156,239)','rgb(119,209,180)','rgb(241,142,142)'];
  let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))>>>0;
  const label = name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return React.createElement('div',{title:name,style:{width:size,height:size,borderRadius:'50%',background:TONES[h%TONES.length],
    color:'#fff',display:'inline-flex',alignItems:'center',justifyContent:'center',font:'500 '+Math.round(size*0.38)+'px/1 '+t.font,
    boxShadow:ring?'0 0 0 2px '+t.surface:'none'}}, label);
}