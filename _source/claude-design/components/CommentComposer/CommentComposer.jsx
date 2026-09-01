const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
const NS = 'VCPAddedValueDesignSystem_8e42bb';
export function CommentComposer(props) {
  const { author, value, onChange, onSubmit, onCancel, placeholder = 'Write a comment…', loading, style } = props;
  const G = (typeof window !== 'undefined' && window[NS]) || {};
  const { Avatar, Button, Textarea, RichTextToolbar } = G;
  const [inner, setInner] = React.useState('');
  const v = value !== undefined ? value : inner;
  const set = s => { if (onChange) onChange(s); else setInner(s); };

  const editor = React.createElement('div', {
    style: { border: '1px solid ' + t.strokeSubtle, borderRadius: 8, overflow: 'hidden', background: t.surface }
  }, [
    RichTextToolbar ? React.createElement(RichTextToolbar, { key: 'tb' }) : null,
    Textarea ? React.createElement(Textarea, {
      key: 'ta', rows: 3, value: v, placeholder,
      onChange: e => set(e.target.value),
      style: { border: 0, borderRadius: 0, boxShadow: 'none' }
    }) : null
  ]);

  const actions = React.createElement('div', {
    style: { display: 'flex', justifyContent: 'flex-end', gap: 8 }
  }, [
    onCancel && Button ? React.createElement(Button, { key: 'c', variant: 'text', size: 'small', onClick: onCancel }, 'Cancel') : null,
    Button ? React.createElement(Button, {
      key: 's', size: 'small', disabled: !!loading || !v.trim(),
      onClick: () => onSubmit && onSubmit(v)
    }, loading ? 'Posting…' : 'Comment') : null
  ]);

  const column = React.createElement('div', {
    style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }
  }, [editor, actions]);

  return React.createElement('div', { style: { display: 'flex', gap: 12, ...style } }, [
    Avatar ? React.createElement(Avatar, { key: 'av', name: author, size: 32 }) : null,
    column
  ]);
}