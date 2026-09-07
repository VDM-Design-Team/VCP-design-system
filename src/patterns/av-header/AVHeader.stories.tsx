import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AVHeader } from './AVHeader';
import { TopBar } from '../top-bar';
import { Button } from '../../atoms/button';

/* The Development domain's chain. It is data here for the same reason it is
   data in the product: the domain owns its middle and can rename it. */
const DEVELOPMENT = [
  { id: 'in-progress', label: 'In progress' },
  { id: 'for-review', label: 'For review' },
  { id: 'for-qa', label: 'For QA' },
  { id: 'in-qa', label: 'In QA' },
  { id: 'ready-for-deploy', label: 'Ready for deploy' },
  { id: 'confirmed-prod', label: 'Confirmed prod' },
];

const meta = {
  title: 'Patterns/AVHeader',
  component: AVHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The page-level header from the Figma `AV_Header` set: back arrow and title on the ' +
          'left, `StatusProgression` on the right. This is the header TopBar deliberately ' +
          'does not carry — the two stack, app chrome above, page identity below.',
      },
    },
  },
  args: {
    title: 'VCP-1234',
    onBack: () => {},
    backLabel: 'Back to my Added Values',
    role: 'assignee',
    step: 'for-review',
    chain: DEVELOPMENT,
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['default', 'new'] },
    role: {
      control: 'inline-radio',
      options: ['assignee', 'initiator', 'assignee-initiator', 'admin'],
    },
  },
} satisfies Meta<typeof AVHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `Type=Default` — an existing AV, titled by its id. */
export const Default: Story = {};

/** `Type=New` — a page being created, titled in words and set larger. */
export const New: Story = {
  args: { type: 'new', title: 'Added Value Creation', role: 'assignee-initiator', status: 'Draft' },
};

/** The design's `Show Move Status Buttons = false`. */
export const WithoutStatusActions: Story = {
  args: { showStatusActions: false },
};

/** Back as a link, for a router that wants an `href`. */
export const BackAsLink: Story = {
  args: { onBack: undefined, backHref: '#/added-values' },
};

/** A terminal AV: `StatusProgression` renders nothing, the header still does. */
export const NoMovesLeft: Story = {
  args: { status: 'Completed' },
};

/** A page action alongside the lifecycle buttons. */
export const WithExtraAction: Story = {
  args: {
    step: 'in-qa',
    actions: (
      <Button variant="secondary" size="sm">
        Report a problem
      </Button>
    ),
  },
};

/**
 * The two headers as a page actually wears them — `TopBar` is the app's
 * chrome, `AVHeader` is this page's identity. Only one `h1` between them.
 */
export const UnderTheTopBar: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="min-h-96 bg-surface-canvas">
      <TopBar
        homeHref="#"
        notifications={3}
        theme="light"
        user={{ name: 'Eve Kestrel' }}
        onUserMenu={() => {}}
      />
      <AVHeader {...args} />
    </div>
  ),
};
