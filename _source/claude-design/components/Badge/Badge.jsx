// Badge — the Figma `Tag` component, transcribed from VCP Design Library.fig.
//   Size=Large  (6785:1625) 28px tall, Poppins 500 14px/20px, 20px icons
//   Size=Medium (6785:1624) 24px tall, Poppins 500 12px/16px, 16px icons
//   both: radius 8 · padding 4px 8px · label rgb(0,0,0) · overflow hidden
// Status fills are the exact per-variant overrides from the Tags page.
const FONT = "'Poppins', system-ui, sans-serif";
const SIZES = {
  large:  { h:28, fs:14, lh:'20px', gap:8, icon:20 },
  medium: { h:24, fs:12, lh:'16px', gap:4, icon:16 },
};
SIZES.default = SIZES.large;
SIZES.small = SIZES.medium;
// Verbatim fills from /Tags/components/Type<Status>Size*
const TONE = {
  accepted:'rgb(219,234,254)', 'in progress':'rgb(219,234,254)', review:'rgb(219,234,254)',
  reopened:'rgb(219,234,254)', 'design review':'rgb(219,234,254)', 'for review':'rgb(219,234,254)',
  'for qa':'rgb(219,234,254)', 'in qa':'rgb(219,234,254)', 'ready for deploy':'rgb(219,234,254)',
  'confirmed prod':'rgb(219,234,254)',
  completed:'rgb(220,252,231)',
  pending:'rgb(254,249,194)', initiated:'rgb(254,249,194)',
  draft:'rgb(226,232,240)', backlog:'rgb(226,232,240)',
  rejected:'rgb(255,226,226)',
  // generic aliases, mapped onto the same file fills
  neutral:'rgb(226,232,240)', brand:'rgb(219,234,254)', info:'rgb(219,234,254)',
  success:'rgb(220,252,231)', warning:'rgb(254,249,194)', danger:'rgb(255,226,226)',
};
export function Badge({ tone='neutral', size='large', children, icon, trailingIcon, style }) {
  const s = SIZES[size] || SIZES.large;
  const bg = TONE[String(tone).toLowerCase()] || TONE.neutral;
  return React.createElement('span', { style:{
    display:'inline-flex', alignItems:'center', gap:s.gap, height:s.h, padding:'4px 8px',
    borderRadius:8, overflow:'hidden', background:bg, color:'rgb(0,0,0)', boxSizing:'border-box',
    fontFamily:FONT, fontWeight:500, fontSize:s.fs, lineHeight:s.lh,
    textAlign:'center', whiteSpace:'nowrap', ...style } },
    icon, children, trailingIcon);
}
