import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from './Pagination';
import { SIDE_BY_SIDE } from '../../lib/story-a11y';

const meta = {
  title: 'Components/Navigation/Pagination',
  component: Pagination,
  parameters: {
    docs: {
      description: {
        component:
          'Page numbers for a data set with pages worth naming, built to Figma’s ' +
          '`VCP_Pagination`. `variant="default"` has First and Last either end; `compact` drops ' +
          'them. Long page counts collapse to an ellipsis, with the first and last page always ' +
          'shown. Give `itemCount` and `pageSize` for the "1-50 of 1,250" readout, and ' +
          '`onPageSizeChange` for the Items select. The active page carries ' +
          '`aria-current="page"`; every control has a spoken name. For positions rather than ' +
          'addresses (carousels, wizards), use `PaginationDots`.',
      },
    },
  },
  args: { page: 2, pageCount: 25, variant: 'default' },
  argTypes: {
    page: { control: 'number' },
    pageCount: { control: 'number' },
    variant: { control: 'radio', options: ['default', 'compact'] },
    itemCount: { control: 'number' },
    pageSize: { control: 'number' },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Figma's Mid size, live: First, Previous, the numbers, Next, Last, the Items
 * select and the range. Changing Items goes back to page 1 — that is this
 * story's choice; the component only reports the new size.
 */
export const Default: Story = {
  args: { itemCount: 1250, pageSize: 50 },
  render: function Render(args) {
    const [page, setPage] = React.useState(args.page);
    const [pageSize, setPageSize] = React.useState(args.pageSize ?? 50);
    const itemCount = args.itemCount ?? 1250;
    const pageCount = Math.max(1, Math.ceil(itemCount / pageSize));
    return (
      <Pagination
        {...args}
        page={Math.min(page, pageCount)}
        pageCount={pageCount}
        onChange={setPage}
        itemCount={itemCount}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    );
  },
};

/** Figma's three versions: Mid size, Tiny and Small. Three `<nav>`s on one page is the story's doing, so the landmark-uniqueness rule stands down here only. */
export const AllVersions: Story = {
  parameters: { controls: { disable: true }, ...SIDE_BY_SIDE },
  render: () => (
    <div className="flex flex-col gap-5">
      <Pagination page={2} pageCount={25} itemCount={1250} pageSize={50} onPageSizeChange={() => {}} />
      <Pagination variant="compact" page={2} pageCount={5} />
      <Pagination page={2} pageCount={25} />
    </div>
  ),
};

/** Live, without the Items select or readout — Figma's Small. Click through and watch the ellipses move. */
export const Interactive: Story = {
  render: function Render(args) {
    const [page, setPage] = React.useState(args.page);
    return <Pagination {...args} page={page} onChange={setPage} />;
  },
};

/** `compact`: no First or Last — Figma's Tiny, for tight spaces. */
export const Compact: Story = {
  args: { variant: 'compact', page: 2, pageCount: 5 },
};

/** Near the start: four numbers, then the ellipsis and the last page. First and Previous are disabled on page 1. */
export const AtTheStart: Story = {
  args: { page: 1 },
};

/** In the middle: an ellipsis either side of the current page and its neighbours. */
export const InTheMiddle: Story = {
  args: { page: 13 },
};

/** Near the end: the first page, the ellipsis, then four numbers. Next and Last are disabled on the last page. */
export const AtTheEnd: Story = {
  args: { page: 25 },
};

/** Seven pages or fewer — every number simply shows, no ellipsis. */
export const FewPages: Story = {
  args: { page: 2, pageCount: 3 },
};

/** One page: every control disabled. If this is the permanent state, render nothing instead. */
export const SinglePage: Story = {
  args: { page: 1, pageCount: 1 },
};

/** The range readout alone, without the Items select. */
export const RangeOnly: Story = {
  args: { page: 3, pageCount: 25, itemCount: 1250, pageSize: 50 },
};

/** Everything is tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen', ...SIDE_BY_SIDE },
  args: { itemCount: 1250, pageSize: 50 },
  render: (args) => (
    <div className="grid grid-cols-1">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <Pagination {...args} onPageSizeChange={() => {}} />
          </div>
        </div>
      ))}
    </div>
  ),
};
