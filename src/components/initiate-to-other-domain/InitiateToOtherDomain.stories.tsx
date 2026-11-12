import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { InitiateToOtherDomain } from './InitiateToOtherDomain';

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
  title: 'Components/Forms/InitiateToOtherDomain',
  component: InitiateToOtherDomain,
  parameters: {
    docs: {
      description: {
        component:
          'The card on an Added Value that offers to initiate it into another domain: a title and a radio group, “Don’t initiate to another domain” (selected until a person picks otherwise) and one ' +
          'option per domain, “Initiate to Development assignment”. The domains are the caller’s and never include the current one. A `fieldset`, titled by its `legend`.',
      },
    },
  },
  args: { options: without('design'), onChange: fn() },
  decorators: [(Story) => <div className="max-w-2xl bg-surface-canvas p-4"><Story /></div>],
} satisfies Meta<typeof InitiateToOtherDomain>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Design variant: the five other domains, and "Don't initiate" selected until another is picked. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Initiate to other Domains' })).toBeVisible();
    await expect(canvas.getAllByRole('radio')).toHaveLength(6);
    await expect(canvas.getByRole('radio', { name: "Don't initiate to another domain" })).toBeChecked();
    await userEvent.click(canvas.getByRole('radio', { name: 'Initiate to Content assignment' }));
    await expect(args.onChange).toHaveBeenLastCalledWith('content');
    await expect(canvas.getByRole('radio', { name: 'Initiate to Content assignment' })).toBeChecked();
    /* One choice: the first is no longer selected. */
    await expect(canvas.getByRole('radio', { name: "Don't initiate to another domain" })).not.toBeChecked();
    /* And back. */
    await userEvent.click(canvas.getByRole('radio', { name: "Don't initiate to another domain" }));
    await expect(args.onChange).toHaveBeenLastCalledWith('');
  },
};

/** The six Figma variants: each domain's card leaves that domain out. */
export const ForEachDomain: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {DOMAINS.map((d) => (
        <InitiateToOtherDomain key={d.value} {...args} options={without(d.value)} />
      ))}
    </div>
  ),
};

/** Choosing a domain opens a section for it: the page derives it from `value`. */
export const OpensASection: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('');
    return (
      <div className="flex flex-col gap-3">
        <InitiateToOtherDomain {...args} value={value} onChange={setValue} />
        {value && (
          <section aria-label={`${value} assignment`} className="rounded-md bg-surface-elevated p-4 text-body-sm-regular text-text-secondary">
            Assignment details for {value}
          </section>
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Initiate to Governance assignment' }));
    await expect(canvas.getByRole('region', { name: 'governance assignment' })).toBeVisible();
    await userEvent.click(canvas.getByRole('radio', { name: "Don't initiate to another domain" }));
    await expect(canvas.queryByRole('region', { name: 'governance assignment' })).toBeNull();
  },
};

/** An Added Value handed off from another domain: the card is there with "Don't initiate" selected, and nothing can be changed. */
export const HandedOff: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: "Don't initiate to another domain" })).toBeChecked();
    for (const radio of canvas.getAllByRole('radio')) await expect(radio).toBeDisabled();
  },
};

/** Card, text and radios are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <InitiateToOtherDomain {...args} defaultValue="content" />
          </div>
        </div>
      ))}
    </div>
  ),
};
