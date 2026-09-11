import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Modal } from './Modal';
import { Button } from '../../atoms/button';
import { Field } from '../field';
import { Input } from '../../atoms/input';

const meta = {
  title: 'Components/Overlays/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A centred dialog over a dimmed backdrop, portalled to `document.body`. ' +
          '**The stories come in two kinds.** The first are already open, so the dialog is what ' +
          'you see and what Chromatic diffs — Escape and backdrop clicks do nothing in those, ' +
          'because `open` is fixed. The second open from a real trigger and carry the ' +
          'interaction tests: the focus trap, Escape, focus returning to the trigger, and the ' +
          'inert background. Between them, every width is covered — `sm` by the destructive ' +
          'confirmation, `md` by Default, `lg` by Long Content, `xl` by Extra Wide.',
      },
    },
  },
  args: {
    /* Open by default: a story that shows a closed dialog shows nothing, and
       Chromatic snapshots nothing. The trigger stories below override this. */
    open: true,
    onClose: () => {},
    title: 'Publish this claim?',
    children: 'Once published, the supplier is notified and the claim can no longer be edited.',
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg', 'xl'] },
    role: { control: 'radio', options: ['dialog', 'alertdialog'] },
    dismissible: { control: 'boolean' },
    showClose: { control: 'boolean' },
    open: { control: 'boolean' },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The two actions the plain dialog ends with. */
const ConfirmFooter = ({ onClose }: { onClose: () => void }) => (
  <>
    <Button variant="secondary" onClick={onClose}>
      Cancel
    </Button>
    <Button onClick={onClose}>Publish</Button>
  </>
);

/**
 * A little page furniture behind the dialog. On an open story it shows the
 * backdrop doing its job; on a trigger story it is what the inertness tests
 * try, and fail, to reach.
 */
function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4">
      {children}
      <p className="max-w-96 text-body-md text-text-tertiary">
        While the dialog is open this text is inert: it cannot be clicked, it is not in the tab
        order, and screen readers skip it.{' '}
        <a href="#background-link" className="text-text-link-default underline">
          Try tabbing to this link
        </a>{' '}
        — you will not reach it.
      </p>
    </div>
  );
}

/**
 * The trigger the interaction stories open from. It is a real `Button` outside
 * the portal, which is the whole point: focus has to travel into the dialog and
 * back out to this exact element.
 */
function Trigger({
  label,
  children,
}: {
  label: string;
  children: (state: { open: boolean; onClose: () => void }) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {label}
      </Button>
      {children({ open, onClose: () => setOpen(false) })}
    </>
  );
}

/** The `<body>` child the story renders inside — what the dialog marks inert. */
function bodyChildOf(el: HTMLElement): HTMLElement {
  let node: HTMLElement = el;
  while (node.parentElement && node.parentElement !== document.body) node = node.parentElement;
  return node;
}

/* ---------------------------------------------------------------------------
 * Open by default. What the dialog looks like, and what Chromatic diffs.
 * ------------------------------------------------------------------------- */

/**
 * Title, description, body and a footer of actions — the plainest useful dialog,
 * at the default `md` width, over some page content so the backdrop's dim is
 * visible.
 */
export const Default: Story = {
  render: (args) => (
    <Background>
      <Modal
        {...args}
        description="This cannot be undone from the supplier portal."
        footer={<ConfirmFooter onClose={args.onClose} />}
      />
    </Background>
  ),
};

/**
 * A form inside a dialog. `initialFocusRef` overrides the default and puts focus
 * straight on the first input, because there is exactly one thing to do here and
 * the user should be able to start typing. The `<form>` owns submission; labels
 * come from `Field`, never from the dialog title.
 */
export const WithForm: Story = {
  render: (args) => {
    const FormDialog = () => {
      const nameRef = React.useRef<HTMLInputElement>(null);
      return (
        <Modal
          {...args}
          title="Invite a supplier"
          description="They receive an email with a link to the claim."
          initialFocusRef={nameRef}
          footer={
            <>
              <Button variant="secondary" type="button" onClick={args.onClose}>
                Cancel
              </Button>
              <Button type="submit" form="modal-invite-form">
                Send invite
              </Button>
            </>
          }
        >
          <form
            id="modal-invite-form"
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              args.onClose();
            }}
          >
            <Field label="Full name" required>
              <Input ref={nameRef} fullWidth placeholder="Ada Lovelace" />
            </Field>
            <Field label="Work email" helper="We only use this for claim notifications.">
              <Input fullWidth type="email" placeholder="ada@example.com" />
            </Field>
            <Field label="Reference">
              <Input fullWidth placeholder="CLM-4471" />
            </Field>
          </form>
        </Modal>
      );
    };
    return <FormDialog />;
  },
};

/**
 * A destructive confirmation, and the `sm` width. `dismissible={false}` so a
 * stray click on the backdrop cannot delete anything, `showClose={false}` so the
 * only ways out are the two explicit answers — and Escape, which always works,
 * because a keyboard user must never be sealed in. `role="alertdialog"` makes
 * the description part of the announcement.
 *
 * Focus deliberately starts on the panel, not on "Delete": the first Tab lands
 * on Cancel, so the dangerous button is never one keystroke away. The
 * `NotDismissible` story below proves both halves.
 */
export const DestructiveConfirmation: Story = {
  args: {
    size: 'sm',
    role: 'alertdialog',
    dismissible: false,
    showClose: false,
    title: 'Delete CLM-4471?',
    description: 'The claim, its 12 attachments and its audit trail are removed permanently.',
    children:
      'Deleting a claim does not notify the supplier. If you only want to stop work on it, move it back to draft instead.',
  },
  render: (args) => (
    <Modal
      {...args}
      footer={
        <>
          <Button variant="secondary" onClick={args.onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={args.onClose}>
            Delete claim
          </Button>
        </>
      }
    />
  ),
};

/**
 * Long content scrolls inside the body, not the page — the header and footer
 * stay put and the panel never grows past the viewport. This is also the `lg`
 * width. The body becomes a tab stop only because it overflows, so it can be
 * scrolled with the arrow keys.
 */
export const LongContent: Story = {
  args: { size: 'lg', title: 'Supplier terms' },
  render: (args) => (
    <Modal
      {...args}
      description="Version 4.2 — effective 1 September"
      footer={
        <>
          <Button variant="secondary" onClick={args.onClose}>
            Decline
          </Button>
          <Button onClick={args.onClose}>Accept</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {Array.from({ length: 14 }, (_, i) => (
          <p key={i} className="text-body-md">
            <span className="text-text-primary">Clause {i + 1}. </span>
            Added Value contributions are reconciled monthly against the agreed baseline. Where a
            contribution cannot be evidenced within the reporting window it is carried forward
            once, and once only, to the following period.
          </p>
        ))}
        <a href="#terms-end" className="text-body-md text-text-link-default underline">
          A link at the very bottom, to check the trap still wraps from here
        </a>
      </div>
    </Modal>
  ),
};

/**
 * The widest of the four: 800. The others appear across the stories above —
 * `sm` (384) on the destructive confirmation, `md` (512) on Default, `lg` (640)
 * on Long Content. Widths ride Tailwind's numeric spacing scale, so a dialog is
 * never a raw pixel number.
 */
export const ExtraWide: Story = {
  args: { size: 'xl', title: 'Reconciliation for September' },
  render: (args) => (
    <Modal {...args} footer={<Button onClick={args.onClose}>Close</Button>}>
      A dialog this wide is for content that needs the room — a table, a diff, a preview — not for
      a sentence like this one.
    </Modal>
  ),
};

/**
 * No visible title, so the name comes from `aria-label` — the type system will
 * not let you ship a dialog with neither. Inspect the panel and you will find
 * `aria-label="Preview attachment"` and no `aria-labelledby`.
 */
export const WithoutTitle: Story = {
  args: { title: undefined, 'aria-label': 'Preview attachment', children: undefined },
  render: (args) => (
    <Modal {...args} aria-label="Preview attachment">
      <div className="grid h-64 place-items-center rounded-md bg-surface-neutral-subtle text-body-md text-text-tertiary">
        invoice-4471.pdf
      </div>
    </Modal>
  ),
};

/**
 * Every colour is a semantic token, so the dark theme comes for free.
 *
 * **This one cannot be a side-by-side pair like every other component's.** The
 * dialog is portalled to `document.body`, so the `.dark` class has to be on
 * `<html>`; a wrapper `div` inside the page will not reach it. The story sets
 * the theme global instead, which is what the preview's decorator puts on
 * `<html>` — so this is the dark half alone, and Default is the light one.
 */
export const DarkTheme: Story = {
  globals: { theme: 'dark' },
  render: (args) => (
    <Background>
      <Modal
        {...args}
        description="This cannot be undone from the supplier portal."
        footer={<ConfirmFooter onClose={args.onClose} />}
      />
    </Background>
  ),
};

/* ---------------------------------------------------------------------------
 * Opened from a trigger. The focus contract, as tests.
 * Every claim below is from the "focus contract" section of docs/modal.md.
 * ------------------------------------------------------------------------- */

/**
 * The whole contract in one flow: open from the trigger, focus lands on the
 * panel rather than on a button, Tab wraps both ways inside the dialog, Escape
 * closes it, and focus goes back to the trigger that opened it.
 */
export const OpensTrapsAndCloses: Story = {
  args: { open: false },
  render: (args) => (
    <Background>
      <Trigger label="Publish claim">
        {({ open, onClose }) => (
          <Modal
            {...args}
            open={open}
            onClose={onClose}
            description="This cannot be undone from the supplier portal."
            footer={<ConfirmFooter onClose={onClose} />}
          />
        )}
      </Trigger>
    </Background>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Publish claim' });

    /* Nothing is portalled while closed. */
    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');

    /* It announces itself: modal, and named by its own visible heading. */
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    const heading = screen.getByRole('heading', { name: 'Publish this claim?' });
    await expect(dialog).toHaveAttribute('aria-labelledby', heading.id);

    /* Focus lands on the panel, not on the close button and not on Publish. */
    await expect(dialog).toHaveFocus();

    const close = screen.getByRole('button', { name: 'Close' });
    const publish = screen.getByRole('button', { name: 'Publish' });

    /* First Tab from the panel reaches the first control. */
    await userEvent.tab();
    await expect(close).toHaveFocus();

    /* Shift+Tab off the front wraps to the last, rather than escaping. */
    await userEvent.tab({ shift: true });
    await expect(publish).toHaveFocus();

    /* Tab off the end wraps back to the first. */
    await userEvent.tab();
    await expect(close).toHaveFocus();

    /* Escape always closes, and the trigger gets focus back. */
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

/**
 * While the dialog is open, every other child of `<body>` carries `inert`, so
 * the page behind is out of the focus order and out of the accessibility tree
 * at once. Closing it puts the page back exactly as it was.
 */
export const BackgroundIsInert: Story = {
  args: { open: false },
  render: (args) => (
    <Background>
      <Trigger label="Publish claim">
        {({ open, onClose }) => (
          <Modal {...args} open={open} onClose={onClose} footer={<ConfirmFooter onClose={onClose} />} />
        )}
      </Trigger>
    </Background>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = bodyChildOf(canvasElement);
    const link = canvas.getByRole('link', { name: /Try tabbing to this link/ });

    await expect(page).not.toHaveAttribute('inert');
    await expect(link).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Publish claim' }));
    await screen.findByRole('dialog');

    /* The page the trigger and the link live on is inert while it is open. */
    await expect(page).toHaveAttribute('inert');
    /* And the dialog's own portal is not. */
    await expect(bodyChildOf(screen.getByRole('dialog'))).not.toHaveAttribute('inert');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(page).not.toHaveAttribute('inert');
  },
};

/**
 * A click on the backdrop closes a dismissible dialog. It takes both the
 * pointer-down and the click: a selection that starts inside the panel and ends
 * outside it does not throw the dialog away.
 */
export const BackdropClickCloses: Story = {
  args: { open: false },
  render: (args) => (
    <Background>
      <Trigger label="Publish claim">
        {({ open, onClose }) => (
          <Modal {...args} open={open} onClose={onClose} footer={<ConfirmFooter onClose={onClose} />} />
        )}
      </Trigger>
    </Background>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Publish claim' }));
    const dialog = await screen.findByRole('dialog');
    const backdrop = dialog.parentElement as HTMLElement;

    /* A press that starts on the panel and ends on the backdrop keeps it open. */
    await userEvent.pointer([
      { target: dialog, keys: '[MouseLeft>]' },
      { target: backdrop },
      { target: backdrop, keys: '[/MouseLeft]' },
    ]);
    await expect(screen.getByRole('dialog')).toBeInTheDocument();

    /* A real click on the backdrop closes it. */
    await userEvent.click(backdrop);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

/**
 * `dismissible={false}` guards against the accidental gesture — a stray click on
 * the backdrop — and nothing else. Escape still closes it, because taking that
 * away is how a keyboard user gets sealed in. A backdrop click also puts focus
 * back on the panel rather than leaving it on `<body>`.
 */
export const NotDismissible: Story = {
  args: { open: false },
  render: (args) => (
    <Background>
      <Trigger label="Delete claim">
        {({ open, onClose }) => (
          <Modal
            {...args}
            open={open}
            onClose={onClose}
            size="sm"
            role="alertdialog"
            dismissible={false}
            showClose={false}
            title="Delete CLM-4471?"
            description="The claim, its 12 attachments and its audit trail are removed permanently."
            footer={
              <>
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={onClose}>
                  Delete claim
                </Button>
              </>
            }
          >
            Deleting a claim does not notify the supplier.
          </Modal>
        )}
      </Trigger>
    </Background>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Delete claim' });
    await userEvent.click(trigger);

    const dialog = await screen.findByRole('alertdialog');
    /* An alertdialog announces its consequence, so it must have one. */
    await expect(dialog).toHaveAttribute('aria-describedby');
    /* No close button: the two answers and Escape are the only ways out. */
    await expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();

    /* The dangerous button is two stops away, not one. */
    await userEvent.tab();
    await expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();

    /* A backdrop click does not delete anything, and focus goes back inside. */
    await userEvent.click(dialog.parentElement as HTMLElement);
    await expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await expect(dialog).toHaveFocus();

    /* Escape still works. */
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
