// Button — transcribed from VCP Design Library.fig, node 6713:4379 (`Button`, 72 variants).
// Geometry and colour are EXACT file values, not inferred:
//   Small  (Button_Small,  6809:46368) 36px tall, 8px 12px padding, Poppins 400 14px/20px
//   Normal (Button_Normal, 6777:45937) 40px tall, 8px 16px padding, Poppins 400 16px/100%
//   radius 6 · gap 10 · filled label rgb(249,249,249)
const t = {
  blue200:'var(--colors-vcp-blue-200, rgb(198,213,246))',
  blue300:'var(--colors-vcp-blue-300, rgb(140,170,237))',
  blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',
  blue600:'var(--colors-vcp-blue-600, rgb(20,65,164))',
  blue700:'var(--colors-vcp-blue-700, rgb(13,43,110))',
  blue900:'rgb(7,22,55)',
  label:'rgb(249,249,249)',
  font:"'Poppins', system-ui, sans-serif",
};
const SIZES = {
  small:  { h:36, px:12, fs:14, lh:'20px' },
  normal: { h:40, px:16, fs:16, lh:'100%' },
};
SIZES.large = SIZES.normal;
export function Button({ variant='filled', size='normal', children, leadingIcon, trailingIcon, disabled, onClick, style, ...rest }) {
  const s = SIZES[size] || SIZES.normal;
  const [h,setH] = React.useState(false), [p,setP] = React.useState(false);
  const state = disabled ? 'disabled' : p ? 'pressed' : h ? 'hover' : 'default';
  let bg='transparent', fg=t.blue500, shadow='none';
  if (variant==='filled') {
    bg = { default:t.blue500, hover:t.blue600, pressed:t.blue700, disabled:t.blue300 }[state];
    fg = disabled ? 'rgb(255,255,255)' : t.label;
  } else if (variant==='outlined') {
    bg = state==='pressed' ? t.blue200 : 'transparent';
    const stroke = { default:t.blue500, hover:t.blue600, pressed:t.blue700, disabled:t.blue300 }[state];
    shadow = 'inset 0 0 0 1px ' + stroke;
    fg = { default:t.blue500, hover:t.blue700, pressed:t.blue700, disabled:t.blue300 }[state];
  } else {
    bg = 'rgba(255,255,255,0)';
    fg = { default:t.blue500, hover:t.blue500, pressed:t.blue900, disabled:t.blue300 }[state];
  }
  return React.createElement('button', {
    onClick: disabled ? undefined : onClick, disabled,
    onMouseEnter:()=>setH(true), onMouseLeave:()=>{setH(false);setP(false);},
    onMouseDown:()=>setP(true), onMouseUp:()=>setP(false),
    style:{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:10,
      height:s.h, padding:'8px '+s.px+'px', borderRadius:6, border:'none', boxShadow:shadow,
      background:bg, color:fg, boxSizing:'border-box',
      fontFamily:t.font, fontWeight:400, fontSize:s.fs, lineHeight:s.lh,
      cursor:disabled?'not-allowed':'pointer',
      transition:'background 120ms, color 120ms, box-shadow 120ms', whiteSpace:'nowrap', ...style }, ...rest
  }, leadingIcon, children, trailingIcon);
}
