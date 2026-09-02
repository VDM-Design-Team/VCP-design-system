import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'Actions/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'The primary interactive control. Use `primary` for the single most important action ' +
          'on a screen, `secondary` for supporting actions, `ghost` inside dense toolbars, and ' +
          '`danger` only for destructive, irreversible actions.',
      },
    },
  },
  args: { children: 'Continue' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary', 'danger', 'link'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    loading: false
  }
};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Tertiary: Story = { args: { variant: 'tertiary' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Delete account' } };
export const Link: Story = { args: { variant: 'link', children: 'Learn more' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-sm">
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

export const States: Story = {
  args: {
    loading: false
  },

  render: (args) => (
    <div className="flex items-center gap-sm">
      <Button {...args}>Default</Button>
      <Button {...args} loading>Loading</Button>
      <Button {...args} disabled>Disabled</Button>
    </div>
  )
};
