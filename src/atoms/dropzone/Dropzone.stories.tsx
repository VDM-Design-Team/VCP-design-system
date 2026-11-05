import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Dropzone } from './Dropzone';
import { Field } from '../../components/field';

const meta = {
  title: 'Atoms/Dropzone',
  component: Dropzone,
  parameters: {
    docs: {
      description: {
        component:
          'The file target: click to browse or drag files on. Hands the caller `File[]` and ' +
          'nothing more — upload state and file lists live outside. The hidden input is real ' +
          '(`sr-only`), so Tab reaches it and Enter opens the browse dialog; drag-and-drop is ' +
          'the pointer bonus, never the only way in.',
      },
    },
  },
  args: {},
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    accept: { control: 'text' },
  },
} satisfies Meta<typeof Dropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live: drop files on it (or click, or Tab + Enter) and watch the list fill. */
export const Default: Story = {
  render: (args) => {
    const [names, setNames] = React.useState<string[]>([]);
    return (
      <div className="flex w-96 flex-col gap-3">
        <Dropzone {...args} onFiles={(files) => setNames((n) => [...n, ...files.map((f) => f.name)])} />
        {names.length > 0 && (
          <ul className="m-0 list-none p-0 font-sans text-caption-md-regular text-text-secondary">
            {names.map((n, i) => (
              <li key={`${n}-${i}`}>{n}</li>
            ))}
          </ul>
        )}
      </div>
    );
  },
};

/**
 * The drag-over state, held for review: `stroke.focused` over `surface.brand.subtle`.
 * A play function raises a file drag over the zone, the way a real one would — the
 * state otherwise only exists while a file is mid-drag. A drag within 16 of the zone
 * counts too.
 */
export const DragOver: Story = {
  render: (args) => (
    <div className="w-96">
      <Dropzone {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const zone = within(canvasElement).getByText('Upload a file').closest('label') as HTMLElement;
    const transfer = new DataTransfer();
    transfer.items.add(new File(['x'], 'evidence.pdf', { type: 'application/pdf' }));
    const fire = (target: EventTarget, type: string) =>
      target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: transfer }));
    fire(window, 'dragenter');
    fire(zone, 'dragover');
  },
};

/** `accept` filters the browse dialog — dropped files still arrive unfiltered; validate them. */
export const SingleImage: Story = {
  args: { label: 'Choose an image', hint: 'PNG or JPG', accept: 'image/*', multiple: false },
  render: (args) => (
    <div className="w-96">
      <Dropzone {...args} />
    </div>
  ),
};

/** Inside a Field, when the upload is one entry in a form. */
export const InAField: Story = {
  render: (args) => (
    <div className="w-96">
      <Field label="Evidence" helper="The audit needs at least one document.">
        <Dropzone {...args} />
      </Field>
    </div>
  ),
};

/**
 * The design's Error state: the default fill with a critical border, the
 * message in critical text, and the zone still usable so the next attempt
 * costs nothing. `error` replaces `hint` and is wired to the input with
 * `aria-describedby`.
 */
export const WithError: Story = {
  args: {
    error: 'That file is 24 MB — the limit is 10 MB.',
  },
  render: (args) => (
    <div className="w-96">
      <Dropzone {...args} />
    </div>
  ),
};

/**
 * Files are checked when they arrive — dropped ones too, which the browse dialog's filter never covered. A type we do not take, or a file over the size limit, is turned away and
 * the zone says why in its error state (`onReject` gets the same); the files that pass still go to `onFiles`. The next selection clears the message.
 */
export const RejectsWhatItDoesNotTake: Story = {
  args: { onFiles: fn(), onReject: fn() },
  render: (args) => (
    <div className="w-96">
      <Dropzone {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const big = new File([new Uint8Array(11 * 1024 * 1024)], 'huge.png', { type: 'image/png' });
    const good = new File(['x'], 'notes.pdf', { type: 'application/pdf' });
    const bad = new File(['x'], 'photo.heic', { type: 'image/heic' });
    /* Dropped and browsed files take the same road; the upload here skips the browser's own `accept` filter, as the "All files" option of a file dialog does. */
    const user = userEvent.setup({ applyAccept: false });
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, [good, bad, big]);
    await waitFor(() => expect(args.onFiles).toHaveBeenCalled());
    /* The browser hands the zone copies of the files, so they are told apart by name. */
    const names = (files: Array<{ name: string }>) => files.map((file) => file.name);
    await expect(names((args.onFiles as ReturnType<typeof fn>).mock.calls[0][0])).toEqual(['notes.pdf']);
    const rejections = (args.onReject as ReturnType<typeof fn>).mock.calls[0][0] as Array<{ file: File; reason: string }>;
    await expect(rejections.map((r) => [r.file.name, r.reason])).toEqual([
      ['photo.heic', 'type'],
      ['huge.png', 'size'],
    ]);
    await expect(within(canvasElement).getByText(/2 files were not added/)).toBeVisible();
    await user.upload(input, good);
    await waitFor(() => expect(within(canvasElement).queryByText(/were not added/)).toBeNull());
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="w-96">
      <Dropzone {...args} />
    </div>
  ),
};

/** Borders, fills and text are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-col gap-4 bg-surface-canvas p-8">
            <Dropzone {...args} />
            <Dropzone {...args} disabled />
          </div>
        </div>
      ))}
    </div>
  ),
};
