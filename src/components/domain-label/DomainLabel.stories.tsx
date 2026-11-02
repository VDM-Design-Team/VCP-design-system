import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DOMAINS, DomainLabel, type DomainKey } from './DomainLabel';

const meta = {
  title: 'Components/Display/DomainLabel',
  component: DomainLabel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The small pill that says which domain something came from: a glyph and two letters. Six domains, abbreviated, ' +
          'with or without a tooltip that spells it out ("Added by Design"). The component owns the domain → glyph, code and name mapping.',
      },
    },
  },
  args: { domain: 'design' },
  argTypes: { domain: { control: 'select', options: Object.keys(DOMAINS) } },
} satisfies Meta<typeof DomainLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One domain. The words are there for a screen reader even without the tooltip. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Added by Design.')).toBeInTheDocument();
  },
};

/** The tooltip spells the domain out after a pause on hover. */
export const WithTooltip: Story = {
  args: { tooltip: true, domain: 'qa' },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByText('QA'));
    await expect(await within(document.body).findByText('Added by Quality Assurance', { selector: '[role="tooltip"]' })).toBeInTheDocument();
  },
};

/** All six, with their tooltips. */
export const AllDomains: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-3 bg-surface-elevated p-4">
      {(Object.keys(DOMAINS) as DomainKey[]).map((domain) => (
        <DomainLabel key={domain} domain={domain} tooltip />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText(/^Added by /)).toHaveLength(6);
  },
};
