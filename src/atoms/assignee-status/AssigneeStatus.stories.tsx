import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssigneeStatus } from './AssigneeStatus';

const meta = {
  title: 'Atoms/AssigneeStatus',
  component: AssigneeStatus,
  parameters: {
    docs: {
      description: {
        component:
          'The availability dot: green, amber or red. Decorative by default — the words sit beside ' +
          'it; give it a `label` where it is the only carrier.',
      },
    },
  },
  args: { status: 'available' },
  argTypes: {
    status: { control: 'radio', options: ['available', 'busy', 'unavailable'] },
    size: { control: 'radio', options: ['table', 'menu'] },
  },
} satisfies Meta<typeof AssigneeStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The six types of Figma's `_Assignee_Status_Dev`: three statuses at the table (10) and menu (12) sizes. */
export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['table', 'menu'] as const).map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-16 text-caption-md-regular text-text-tertiary">{size}</span>
          {(['available', 'busy', 'unavailable'] as const).map((status) => (
            <AssigneeStatus key={status} status={status} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const WithALabel: Story = { args: { status: 'busy', label: 'Busy' } };

export const DarkTheme: Story = { globals: { theme: 'dark' }, render: AllTypes.render };
