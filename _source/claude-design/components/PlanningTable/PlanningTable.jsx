const t={blue50:'var(--colors-vcp-blue-50, rgb(244,247,253))',blue100:'var(--colors-vcp-blue-100, rgb(232,238,251))',blue500:'var(--colors-vcp-blue-500, rgb(26,86,219))',fg1:'var(--colors-text-primary, rgb(2,6,23))',fg2:'var(--colors-text-secondary, rgb(51,65,85))',fg3:'var(--colors-text-tertiary, rgb(100,116,139))',fg4:'var(--colors-text-subtle, rgb(148,163,184))',canvas:'var(--colors-surface-canvas, rgb(248,250,252))',surface:'var(--colors-surface-elevated, rgb(255,255,255))',stroke:'var(--colors-stroke-default, rgb(203,213,225))',strokeSubtle:'var(--colors-stroke-subtle, rgb(226,232,240))',danger:'rgb(231,0,11)',font:"'Poppins', system-ui, sans-serif"};
const NS = 'VCPAddedValueDesignSystem_8e42bb';
const COLS = '1.5fr 5.25fr 1.5fr 1.5fr 1.15fr 1.15fr 2.15fr 1.5fr 2.15fr 2.25fr';
const HEADS = ['ID', 'Added Value', 'Urgency', 'Type', 'Initiator', 'Assignee', 'Start Date', 'Points', 'Due Date', 'Status'];

function PlanningRowView(props) {
  const { row, onRowClick } = props;
  const G = (typeof window !== 'undefined' && window[NS]) || {};
  const { StatusPill, UrgencyTag, Avatar, Badge } = G;
  const [h, setH] = React.useState(false);

  const cell = (key, node) => React.createElement('div', {
    key,
    style: { minWidth: 0, display: 'flex', alignItems: 'center', font: '400 13px/1.4 ' + t.font, color: t.fg2, overflow: 'hidden' }
  }, node);

  const cells = [
    cell('id', React.createElement('span', { style: { font: '400 12px/1 ' + t.font, color: t.fg3 } }, row.id)),
    cell('title', React.createElement('span', {
      style: { font: '500 13px/1.4 ' + t.font, color: t.fg1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
    }, row.title)),
    cell('urgency', UrgencyTag ? React.createElement(UrgencyTag, { urgency: row.urgency }) : null),
    cell('type', React.createElement('span', { style: { font: '400 12px/1 ' + t.font, color: t.fg2 } }, row.type)),
    cell('initiator', Avatar && row.initiator ? React.createElement(Avatar, { name: row.initiator, size: 26 }) : '—'),
    cell('assignee', Avatar && row.assignee && row.assignee !== '—' ? React.createElement(Avatar, { name: row.assignee, size: 26 }) : '—'),
    cell('start', React.createElement('span', { style: { font: '400 12px/1 ' + t.font } }, row.startDate || '—')),
    cell('points', Badge ? React.createElement(Badge, { tone: 'brand' }, row.points) : row.points),
    cell('due', React.createElement('span', {
      style: { font: (row.overdue ? '500 ' : '400 ') + '12px/1 ' + t.font, color: row.overdue ? t.danger : t.fg2 }
    }, row.dueDate || '—')),
    cell('status', StatusPill ? React.createElement(StatusPill, { status: row.status }) : null)
  ];

  return React.createElement('div', {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    onClick: () => onRowClick && onRowClick(row),
    style: {
      display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '0 18px', minHeight: 81,
      alignItems: 'center', borderBottom: '1px solid ' + t.strokeSubtle,
      background: h ? t.blue50 : t.surface,
      cursor: onRowClick ? 'pointer' : 'default', transition: 'background 120ms'
    }
  }, cells);
}

export function PlanningTable(props) {
  const { groups = [], onRowClick, onToggleGroup, style } = props;
  const G = (typeof window !== 'undefined' && window[NS]) || {};
  const { Icon, Badge } = G;

  const header = React.createElement('div', {
    key: 'head',
    style: {
      display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '0 18px', height: 44,
      alignItems: 'center', background: t.canvas, borderBottom: '1px solid ' + t.strokeSubtle
    }
  }, HEADS.map(label => React.createElement('span', {
    key: label,
    style: {
      font: '600 11px/1 ' + t.font, color: t.fg2, textTransform: 'uppercase', letterSpacing: '.05em',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
    }
  }, label)));

  const groupBlocks = groups.map(g => {
    const key = g.key || g.label;
    const rows = g.rows || [];

    const groupHeader = React.createElement('button', {
      key: 'gh',
      onClick: () => onToggleGroup && onToggleGroup(key),
      style: {
        width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px', height: 40,
        border: 0, borderBottom: '1px solid ' + t.strokeSubtle,
        background: g.type === 'backlog' ? t.canvas : t.blue50, cursor: 'pointer', textAlign: 'left'
      }
    }, [
      Icon ? React.createElement(Icon, { key: 'c', name: g.collapsed ? 'chevron-right' : 'chevron-down', size: 14, style: { color: t.fg3 } }) : null,
      React.createElement('span', { key: 'l', style: { font: '600 13px/1 ' + t.font, color: t.fg1 } }, g.label),
      React.createElement('span', { key: 'n', style: { font: '400 12px/1 ' + t.font, color: t.fg3 } }, '(' + rows.length + ')'),
      g.points != null && Badge ? React.createElement(Badge, { key: 'p', tone: 'brand', style: { marginLeft: 'auto' } }, g.points + ' pts') : null
    ]);

    const rowViews = g.collapsed ? [] : rows.map((r, i) =>
      React.createElement(PlanningRowView, { key: r.id || i, row: r, onRowClick }));

    return React.createElement('div', { key }, [groupHeader].concat(rowViews));
  });

  return React.createElement('div', {
    style: { background: t.surface, border: '1px solid ' + t.strokeSubtle, borderRadius: 8, overflow: 'hidden', ...style }
  }, [header].concat(groupBlocks));
}