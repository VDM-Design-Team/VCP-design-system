import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from './IconButton';
import { Button } from '../button';

const meta = {
  title: 'Actions/IconButton',
  component: IconButton,
  parameters: {
    docs: {
      description: {
        component:
          'A square button carrying a single icon and no visible text. Same `variant` names, ' +
          'same `sm`/`md`/`lg` scale, same focus ring and same `loading` behaviour as `Button` — ' +
          'if you know Button, you know this. `label` is a **required** prop: it becomes the ' +
          "button's accessible name and its tooltip, and there is no way to render one without " +
          'it. Reach for it only when the icon is unambiguous and space is genuinely tight; ' +
          'otherwise use a `Button` with `iconLeft` and a visible word.' +
          '\n\n**From Figma:** Icon buttons display actions in a compact layout. Icon buttons ' +
          'can represent opening actions such as opening an overflow menu or search, or ' +
          'represent binary actions that can be toggled on and off, such as favorite or ' +
          'bookmark. Icon buttons can be grouped together or they can stand alone.',
      },
    },
  },
  args: { icon: 'pencil-simple', label: 'Edit deliverable' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary', 'danger'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The four `action.*` families, identical to Button's. There is no `link` — see the docs. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} variant="primary" icon="plus" label="Add deliverable" />
      <IconButton {...args} variant="secondary" icon="funnel-simple" label="Filter results" />
      <IconButton {...args} variant="tertiary" icon="pencil-simple" label="Edit deliverable" />
      <IconButton {...args} variant="danger" icon="trash" label="Delete deliverable" />
    </div>
  ),
};

/** 32 / 40 / 48 — Button's scale exactly. `md` is the only size that meets the 40 target. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} size="sm" variant="secondary" />
      <IconButton {...args} size="md" variant="secondary" />
      <IconButton {...args} size="lg" variant="secondary" />
    </div>
  ),
};

/** Every variant at every size, so the whole matrix is visible in one place. */
export const Matrix: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['primary', 'secondary', 'tertiary', 'danger'] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <span className="w-20 text-label-sm text-text-subtle">{variant}</span>
          <IconButton {...args} variant={variant} size="sm" />
          <IconButton {...args} variant={variant} size="md" />
          <IconButton {...args} variant={variant} size="lg" />
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} variant="primary" icon="plus" label="Add deliverable" disabled />
      <IconButton {...args} variant="secondary" icon="funnel-simple" label="Filter results" disabled />
      <IconButton {...args} variant="tertiary" disabled />
      <IconButton {...args} variant="danger" icon="trash" label="Delete deliverable" disabled />
    </div>
  ),
};

/**
 * `loading` swaps the glyph for a spinner, disables the button and sets
 * `aria-busy` — the same contract as Button. The accessible name does not
 * change, so the control keeps its identity mid-announcement.
 */
export const Loading: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} variant="primary" icon="plus" label="Add deliverable" loading />
      <IconButton {...args} variant="secondary" size="sm" loading />
      <IconButton {...args} variant="tertiary" size="lg" loading />
    </div>
  ),
};

/** The reason this component exists: a dense row of actions with no room for words. */
export const Toolbar: Story = {
  render: (args) => (
    <div className="flex items-center gap-1 rounded-md border border-stroke-subtle bg-surface-elevated p-1">
      <IconButton {...args} size="sm" icon="magnifying-glass" label="Search deliverables" />
      <IconButton {...args} size="sm" icon="funnel-simple" label="Filter results" />
      <IconButton {...args} size="sm" icon="sort-ascending" label="Sort ascending" />
      <IconButton {...args} size="sm" icon="eye" label="Toggle preview" />
      <span className="mx-1 h-5 w-px bg-stroke-subtle" aria-hidden="true" />
      <IconButton {...args} size="sm" icon="dots-three" label="More actions" />
    </div>
  ),
};

/** Beside a Button at the same `size` — the heights line up because the scale is shared. */
export const NextToButton: Story = {
  name: 'Beside a Button',
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Button size={size} variant="primary">
            Save changes
          </Button>
          <IconButton {...args} size={size} variant="secondary" icon="x" label="Discard changes" />
          <IconButton {...args} size={size} variant="tertiary" icon="dots-three" label="More actions" />
          <span className="text-label-sm text-text-subtle">size “{size}”</span>
        </div>
      ))}
    </div>
  ),
};

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  render: (args) => {
    const set = (
      <div className="flex items-center gap-3 bg-surface-canvas p-6">
        <IconButton {...args} variant="primary" icon="plus" label="Add deliverable" />
        <IconButton {...args} variant="secondary" icon="funnel-simple" label="Filter results" />
        <IconButton {...args} variant="tertiary" icon="pencil-simple" label="Edit deliverable" />
        <IconButton {...args} variant="danger" icon="trash" label="Delete deliverable" />
        <IconButton {...args} variant="secondary" icon="x" label="Dismiss" disabled />
        <IconButton {...args} variant="primary" icon="plus" label="Add deliverable" loading />
      </div>
    );
    return (
      <div className="grid grid-cols-1 gap-4">
        <div>{set}</div>
        <div className="dark">{set}</div>
      </div>
    );
  },
};
