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
          'The card on an Added Value that offers to initiate it into another domain: a title and one choice, as radio ' +
          'buttons. The first option is “Don’t initiate to another domain”, chosen by default; then “Initiate to ' +
          'Development assignment” for each other domain. The domains are the caller’s and never include the current ' +
          'one. A `fieldset`, titled by its `legend`.',
      },
    },
  },
  args: { options: without('design'), onChange: fn() },
  decorators: [(Story) => <div className="max-w-2xl bg-surface-canvas p-4"><Story /></div>],
} satisfies Meta<typeof InitiateToOtherDomain>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Design variant: "Don't initiate" first and chosen, then the five other domains. Only one can be chosen. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Initiate to other Domains' })).toBeVisible();
    await expect(canvas.getAllByRole('radio')).toHaveLength(6);
    /* "Don't initiate" is first and chosen to begin with. */
    await expect(canvas.getAllByRole('radio')[0]).toHaveAccessibleName("Don't initiate to another domain");
    await expect(canvas.getByRole('radio', { name: "Don't initiate to another domain" })).toBeChecked();
    await userEvent.click(canvas.getByRole('radio', { name: 'Initiate to Content assignment' }));
    await expect(args.onChange).toHaveBeenLastCalledWith('content');
    await expect(canvas.getByRole('radio', { name: 'Initiate to Content assignment' })).toBeChecked();
    /* Choosing another replaces it: one at a time. */
    await userEvent.click(canvas.getByRole('radio', { name: 'Initiate to Partners assignment' }));
    await expect(canvas.getByRole('radio', { name: 'Initiate to Content assignment' })).not.toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith('partners');
    /* And back to none reports null. */
    await userEvent.click(canvas.getByRole('radio', { name: "Don't initiate to another domain" }));
    await expect(args.onChange).toHaveBeenLastCalledWith(null);
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

/** Controlled: the page keeps the chosen value (`null` is "don't initiate") and can reset it. */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>('development');
    return (
      <div className="flex flex-col gap-3">
        <InitiateToOtherDomain {...args} value={value} onChange={setValue} />
        <p className="m-0 text-body-sm-regular text-text-secondary">Chosen: {value ?? 'none'}</p>
      </div>
    );
  },
};

/** Choosing a domain opens a section for it; choosing "Don't initiate" closes it. The page reads the value. */
export const OpensASection: Story = {
  render: (args) => {
    const [domain, setDomain] = React.useState<string | null>(null);
    return (
      <div className="flex flex-col gap-3">
        <InitiateToOtherDomain {...args} value={domain} onChange={setDomain} />
        {domain && (
          <section aria-label={`${domain} assignment`} className="rounded-md bg-surface-elevated p-4 text-body-sm-regular text-text-secondary">
            Assignment details for {domain}
          </section>
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('region')).toBeNull();
    await userEvent.click(canvas.getByRole('radio', { name: 'Initiate to Governance assignment' }));
    await expect(canvas.getByRole('region', { name: 'governance assignment' })).toBeVisible();
    await userEvent.click(canvas.getByRole('radio', { name: "Don't initiate to another domain" }));
    await expect(canvas.queryByRole('region', { name: 'governance assignment' })).toBeNull();
  },
};

/** One domain it cannot be initiated to: only that option is dimmed, and the card says nothing more. */
export const OneOptionDisabled: Story = {
  args: { options: without('design').map((o) => (o.value === 'qa' ? { ...o, disabled: true } : o)) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: 'Initiate to Quality Assurance assignment' })).toBeDisabled();
    await expect(canvas.getByRole('radio', { name: 'Initiate to Content assignment' })).toBeEnabled();
    await expect(canvas.queryByText(/came from another domain/)).toBeNull();
  },
};

/** An Added Value that came from another domain, edited in the second: the card is there, "Don't initiate" is shown chosen, nothing can be changed, and a line says why. */
export const HandedOff: Story = {
  args: { disabled: true, value: 'development' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Initiate to other Domains' });
    /* The line is the group's description, so it is heard with the group, not only seen. */
    await expect(group).toHaveAccessibleDescription("This Added Value came from another domain, so it can't be initiated to others from here.");
    for (const radio of canvas.getAllByRole('radio')) await expect(radio).toBeDisabled();
    /* Whatever `value` says, "Don't initiate" is the one shown chosen. */
    await expect(canvas.getByRole('radio', { name: "Don't initiate to another domain" })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Initiate to Development assignment' })).not.toBeChecked();
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
