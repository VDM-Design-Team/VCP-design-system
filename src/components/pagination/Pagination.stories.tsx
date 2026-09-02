import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from './Pagination';

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  parameters: {
    docs: {
      description: {
        component:
          'Page numbers for a data set with pages worth naming. The active page carries ' +
          '`aria-current="page"`; every control has a spoken name. At most five numbers show, ' +
          'centred on the current page and clamped at the ends. For positions rather than ' +
          'addresses (carousels, wizards), use `PaginationDots`.',
      },
    },
  },
  args: { page: 3, pageCount: 12 },
  argTypes: {
    page: { control: 'number' },
    pageCount: { control: 'number' },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live: click through and watch the window slide and clamp. */
export const Default: Story = {
  render: (args) => {
    const [page, setPage] = React.useState(args.page);
    return <Pagination {...args} page={page} onChange={setPage} />;
  },
};

/** First page: Previous is disabled, the window pins to the start. */
export const AtTheStart: Story = {
  args: { page: 1 },
};

/** Last page: Next is disabled, the window pins to the end. */
export const AtTheEnd: Story = {
  args: { page: 12 },
};

/** Fewer pages than the window — every number simply shows. */
export const FewPages: Story = {
  args: { page: 2, pageCount: 3 },
};

/** One page: both arrows disabled. If this is the permanent state, render nothing instead. */
export const SinglePage: Story = {
  args: { page: 1, pageCount: 1 },
};

/** Everything is tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <Pagination {...args} />
          </div>
        </div>
      ))}
    </div>
  ),
};
