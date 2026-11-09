import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DuplicateToOtherDomain } from './DuplicateToOtherDomain';

const DOMAINS = [
  { value: 'design', name: 'Design (BESA)' },
  { value: 'development', name: 'Development' },
  { value: 'content', name: 'Content' },
  { value: 'governance', name: 'Governance' },
  { value: 'partners', name: 'Partners' },
  { value: 'qa', name: 'Quality Assurance' },
];

/** The card for one domain: every other domain, as the Figma variant for it. */
const without = (current: string) => DOMAINS.filter((d) => d.value !== current);

const meta = {
  title: 'Components/Forms/DuplicateToOtherDomain',
  component: DuplicateToOtherDomain,
  parameters: {
    docs: {
      description: {
        component:
          'The card on an Added Value that offers to copy it into the other domains: a title and one ' +
          'checkbox per domain, “Initiate to Development assignment”. The domains are the caller’s ' +
          'and never include the current one. A `fieldset`, titled by its `legend`.',
      },
    },
  },
  args: { options: without('design'), onChange: fn() },
  decorators: [(Story) => <div className="max-w-2xl bg-surface-canvas p-4"><Story /></div>],
} satisfies Meta<typeof DuplicateToOtherDomain>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Design variant: the five other domains. Tick some. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Duplicate to other Domains' })).toBeVisible();
    await expect(canvas.getAllByRole('checkbox')).toHaveLength(5);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Initiate to Content assignment' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Initiate to Partners assignment' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['content', 'partners'], { value: 'partners', checked: true });
    await expect(canvas.getByRole('checkbox', { name: 'Initiate to Content assignment' })).toBeChecked();
  },
};

/** The six Figma variants: each domain's card leaves that domain out. */
export const ForEachDomain: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {DOMAINS.map((d) => (
        <DuplicateToOtherDomain key={d.value} {...args} options={without(d.value)} />
      ))}
    </div>
  ),
};

/** Controlled: the page keeps the chosen values and can reset them. */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<readonly string[]>(['development']);
    return (
      <div className="flex flex-col gap-3">
        <DuplicateToOtherDomain {...args} value={value} onChange={setValue} />
        <p className="m-0 text-body-sm-regular text-text-secondary">Chosen: {value.join(', ') || 'none'}</p>
      </div>
    );
  },
};

/** Ticking a domain opens a section for it: the page reads which one changed. */
export const OpensASection: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState<string[]>([]);
    return (
      <div className="flex flex-col gap-3">
        <DuplicateToOtherDomain
          {...args}
          onChange={(_, { value, checked }) =>
            setOpen((cur) => (checked ? [...cur, value] : cur.filter((v) => v !== value)))
          }
        />
        {open.map((v) => (
          <section key={v} aria-label={`${v} assignment`} className="rounded-md bg-surface-elevated p-4 text-body-sm-regular text-text-secondary">
            Assignment details for {v}
          </section>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Initiate to Governance assignment' }));
    await expect(canvas.getByRole('region', { name: 'governance assignment' })).toBeVisible();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Initiate to Governance assignment' }));
    await expect(canvas.queryByRole('region', { name: 'governance assignment' })).toBeNull();
  },
};

/** One domain it cannot be copied to, and a disabled card. */
export const Disabled: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <DuplicateToOtherDomain
        {...args}
        options={without('design').map((o) => (o.value === 'qa' ? { ...o, disabled: true } : o))}
      />
      <DuplicateToOtherDomain {...args} disabled />
    </div>
  ),
};

/** Card, text and boxes are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <DuplicateToOtherDomain {...args} defaultValue={['content']} />
          </div>
        </div>
      ))}
    </div>
  ),
};
