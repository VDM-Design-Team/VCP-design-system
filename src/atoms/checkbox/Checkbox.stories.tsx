import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Checkbox, CheckboxMark } from './Checkbox';

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          'A real `<input type="checkbox">` with a token-styled box. Use it for independent ' +
          'on/off choices inside a form that is explicitly submitted. The `indeterminate` ' +
          'state is for the parent row of a partially selected group — it is never something ' +
          'a user can select directly.' +
          '\n\n**From Figma:** Checkboxes are a selection control which allow users to select ' +
          'one or more options from a set; present a list containing sub-selections; and turn ' +
          'an item on or off in a desktop environment.',
      },
    },
  },
  args: { label: 'Email me about product updates' },
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    size: { control: 'radio', options: ['sm', 'md'] },
    label: { control: 'text' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = {
  args: { indeterminate: true, label: 'Select all regions' },
};

/** Every state side by side, so a regression in one is obvious. */
export const States: Story = {
  render: (args) => (
    <div className="flex flex-col items-start">
      <Checkbox {...args} label="Unchecked" />
      <Checkbox {...args} label="Checked" defaultChecked />
      <Checkbox {...args} label="Mixed" indeterminate />
    </div>
  ),
};

/** The two sizes Figma ships: 16 (`sm`, the default) and 20 (`md`). Both keep a 40 target. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start">
      <Checkbox {...args} size="sm" label="Small, 16" defaultChecked />
      <Checkbox {...args} size="md" label="Medium, 20" defaultChecked />
      <Checkbox {...args} size="md" label="Medium, mixed" indeterminate />
    </div>
  ),
};

/** Disabled in each of the three states. Colour alone never carries the meaning. */
export const Disabled: Story = {
  render: (args) => (
    <div className="flex flex-col items-start">
      <Checkbox {...args} label="Disabled, unchecked" disabled />
      <Checkbox {...args} label="Disabled, checked" disabled defaultChecked />
      <Checkbox {...args} label="Disabled, mixed" disabled indeterminate />
    </div>
  ),
};

/**
 * Without a `label` the control still needs an accessible name — pass `aria-label`.
 * This is the shape you want inside a table's select-row column.
 */
export const WithoutLabel: Story = {
  args: { label: undefined },
  render: (args) => (
    <div className="flex items-center gap-4">
      <Checkbox {...args} aria-label="Select row" />
      <Checkbox {...args} aria-label="Select row" defaultChecked />
      <Checkbox {...args} aria-label="Select all rows" indeterminate />
      <Checkbox {...args} aria-label="Select row" disabled />
    </div>
  ),
};

/** The label wraps; the box stays pinned to the first line and the whole block is clickable. */
export const LongLabel: Story = {
  args: {
    label:
      'Send me the weekly VCP digest, including product changes, scheduled maintenance ' +
      'windows, and occasional research invitations. You can unsubscribe at any time.',
  },
  render: (args) => (
    <div className="max-w-sm">
      <Checkbox {...args} />
    </div>
  ),
};

/** `fullWidth` makes the whole row a target — use it for list and settings rows. */
export const FullWidth: Story = {
  args: { fullWidth: true, label: 'Make this workspace public' },
  render: (args) => (
    <div className="w-96 rounded-md border border-stroke-subtle bg-surface-elevated">
      <Checkbox {...args} />
    </div>
  ),
};

const REGIONS = ['North', 'South', 'East', 'West'];

function RegionGroup() {
  const [selected, setSelected] = React.useState<string[]>(['North']);
  const allChecked = selected.length === REGIONS.length;
  const someChecked = selected.length > 0 && !allChecked;

  return (
    <fieldset className="border-0 p-0">
      <legend className="px-3 font-sans text-label-sm-medium text-text-primary">Regions</legend>
      <Checkbox
        label="All regions"
        checked={allChecked}
        indeterminate={someChecked}
        onChange={(checked) => setSelected(checked ? [...REGIONS] : [])}
      />
      <div className="flex flex-col items-start ps-6">
        {REGIONS.map((region) => (
          <Checkbox
            key={region}
            label={region}
            checked={selected.includes(region)}
            onChange={(checked) =>
              setSelected((current) =>
                checked ? [...current, region] : current.filter((r) => r !== region),
              )
            }
          />
        ))}
      </div>
    </fieldset>
  );
}

/**
 * The reason `indeterminate` exists: the parent row of a partially selected group.
 * Tick one or two children and the parent goes mixed; tick all four and it goes checked.
 */
export const ParentChildGroup: Story = {
  args: { label: undefined },
  render: () => <RegionGroup />,
};

/** Light and dark, from the same semantic tokens — no per-theme classes in the component. */
export const Themes: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <div className="rounded-md bg-surface-canvas p-4">
        <div className="flex flex-col items-start">
          <Checkbox {...args} label="Unchecked" />
          <Checkbox {...args} label="Checked" defaultChecked />
          <Checkbox {...args} label="Mixed" indeterminate />
          <Checkbox {...args} label="Disabled" disabled defaultChecked />
        </div>
      </div>
      <div className="dark rounded-md bg-surface-canvas p-4">
        <div className="flex flex-col items-start">
          <Checkbox {...args} label="Unchecked" />
          <Checkbox {...args} label="Checked" defaultChecked />
          <Checkbox {...args} label="Mixed" indeterminate />
          <Checkbox {...args} label="Disabled" disabled defaultChecked />
        </div>
      </div>
    </div>
  ),
};

const MARK_STATES = [
  { name: 'unchecked', checked: false, disabled: false },
  { name: 'checked', checked: true, disabled: false },
  { name: 'disabled', checked: false, disabled: true },
  { name: 'disabled checked', checked: true, disabled: true },
] as const;

/**
 * `CheckboxMark`: the box and tick with no input, for a row that is itself the control
 * (`SearchSelect`'s options when `multiple`). Each row of marks sits over a row of real checkboxes
 * in the same states, in both themes and both sizes. The test checks every mark against its real
 * checkbox (border, fill and tick), so the two cannot drift apart.
 */
export const Mark: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {[false, true].map((isDark) => (
        <div
          key={String(isDark)}
          className={isDark ? 'dark' : undefined}
          data-theme-case={isDark ? 'dark' : 'light'}
        >
          <div className="flex flex-wrap gap-6 rounded-md bg-surface-canvas p-4">
            {(['sm', 'md'] as const).map((size) => (
              /* One grid, so each mark sits in the same column as its real checkbox, which
                 is wider for its 40 target. */
              <div key={size} className="grid grid-cols-4 place-items-center gap-y-1">
                {MARK_STATES.map((s) => (
                  <span key={s.name} data-mark={`${size} ${s.name}`}>
                    <CheckboxMark size={size} checked={s.checked} disabled={s.disabled} />
                  </span>
                ))}
                {MARK_STATES.map((s) => (
                  <Checkbox
                    key={s.name}
                    size={size}
                    defaultChecked={s.checked}
                    disabled={s.disabled}
                    aria-label={`Real checkbox, ${size}, ${s.name}`}
                    data-real={`${size} ${s.name}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const drift: string[] = [];
    for (const scope of Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-theme-case]'))) {
      const theme = scope.dataset.themeCase;
      for (const holder of Array.from(scope.querySelectorAll<HTMLElement>('[data-mark]'))) {
        const mark = holder.firstElementChild as HTMLElement;
        const input = scope.querySelector<HTMLInputElement>(`[data-real="${holder.dataset.mark}"]`)!;
        const box = input.nextElementSibling as HTMLElement;
        /* A real box under the pointer shows its hover border; the mark has no hover of its own. */
        if (input.closest('label')!.matches(':hover')) continue;
        for (const property of ['borderTopColor', 'backgroundColor', 'color'] as const) {
          const [a, b] = [getComputedStyle(mark)[property], getComputedStyle(box)[property]];
          if (a !== b) drift.push(`${theme} ${holder.dataset.mark} ${property}: mark ${a}, checkbox ${b}`);
        }
        const [tickA, tickB] = [mark.querySelector('svg'), box.querySelector('svg')].map(
          (svg) => svg !== null && getComputedStyle(svg).display !== 'none',
        );
        if (tickA !== tickB) drift.push(`${theme} ${holder.dataset.mark} tick: mark ${tickA}, checkbox ${tickB}`);
      }
    }
    await expect(drift).toEqual([]);
  },
};
