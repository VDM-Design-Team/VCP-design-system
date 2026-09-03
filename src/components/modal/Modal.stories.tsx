import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
          'A centred dialog over a dimmed backdrop, portalled to `document.body`. Every story ' +
          'below opens from a real trigger so the focus contract can be exercised: open it, Tab ' +
          'all the way round to see the trap wrap, Shift+Tab back, press Escape, and watch focus ' +
          'land on the trigger again. The page behind does not scroll while it is open and is ' +
          'inert to assistive tech.',
      },
    },
  },
  args: {
    open: false,
    onClose: () => {},
    title: 'Publish this claim?',
    children: 'Once published, the supplier is notified and the claim can no longer be edited.',
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg', 'xl'] },
    role: { control: 'radio', options: ['dialog', 'alertdialog'] },
    dismissible: { control: 'boolean' },
    showClose: { control: 'boolean' },
    open: { table: { disable: true } },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The trigger every story opens from. It is a real `Button` outside the portal,
 * which is the whole point: focus has to travel into the dialog and back out
 * to this exact element.
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

/** A little page furniture, so "the background is inert" is something you can try. */
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

/** Title, description, body and a footer of actions. The plainest useful dialog. */
export const Default: Story = {
  render: (args) => (
    <Background>
      <Trigger label="Publish claim">
        {({ open, onClose }) => (
          <Modal
            {...args}
            open={open}
            onClose={onClose}
            description="This cannot be undone from the supplier portal."
            footer={
              <>
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={onClose}>Publish</Button>
              </>
            }
          />
        )}
      </Trigger>
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
        <Background>
          <Trigger label="Invite a supplier">
            {({ open, onClose }) => (
              <Modal
                {...args}
                open={open}
                onClose={onClose}
                title="Invite a supplier"
                description="They receive an email with a link to the claim."
                initialFocusRef={nameRef}
                footer={
                  <>
                    <Button variant="secondary" type="button" onClick={onClose}>
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
                    onClose();
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
            )}
          </Trigger>
        </Background>
      );
    };
    return <FormDialog />;
  },
};

/**
 * A destructive confirmation. `dismissible={false}` so a stray click on the
 * backdrop cannot delete anything, `showClose={false}` so the only ways out are
 * the two explicit answers — and Escape, which always works, because a keyboard
 * user must never be sealed in. `role="alertdialog"` makes the description part
 * of the announcement.
 *
 * Focus deliberately starts on the panel, not on "Delete": the first Tab lands
 * on Cancel, so the dangerous button is never one keystroke away.
 */
export const DestructiveConfirmation: Story = {
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
            Deleting a claim does not notify the supplier. If you only want to stop work on it,
            move it back to draft instead.
          </Modal>
        )}
      </Trigger>
    </Background>
  ),
};

/**
 * Long content scrolls inside the body, not the page — the header and footer
 * stay put and the panel never grows past the viewport. The page behind is
 * scroll-locked, and the lock adds back the scrollbar's width so nothing on the
 * page shifts sideways when it engages. Scroll the story canvas first, then open
 * the dialog, to see that neither moves.
 */
export const LongContent: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <Trigger label="Open terms">
        {({ open, onClose }) => (
          <Modal
            {...args}
            open={open}
            onClose={onClose}
            size="lg"
            title="Supplier terms"
            description="Version 4.2 — effective 1 September"
            footer={
              <>
                <Button variant="secondary" onClick={onClose}>
                  Decline
                </Button>
                <Button onClick={onClose}>Accept</Button>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              {Array.from({ length: 14 }, (_, i) => (
                <p key={i} className="text-body-md">
                  <span className="text-text-primary">Clause {i + 1}. </span>
                  Added Value contributions are reconciled monthly against the agreed baseline.
                  Where a contribution cannot be evidenced within the reporting window it is
                  carried forward once, and once only, to the following period.
                </p>
              ))}
              <a href="#terms-end" className="text-body-md text-text-link-default underline">
                A link at the very bottom, to check the trap still wraps from here
              </a>
            </div>
          </Modal>
        )}
      </Trigger>
      <div className="h-screen w-96 rounded-md bg-surface-neutral-subtle p-4 text-body-sm text-text-tertiary">
        Tall page content — the canvas scrolls until the dialog opens.
      </div>
    </div>
  ),
};

/** Four widths on the spacing scale: 384, 512 (default), 640 and 800. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Trigger key={size} label={`Open ${size}`}>
          {({ open, onClose }) => (
            <Modal
              {...args}
              open={open}
              onClose={onClose}
              size={size}
              title={`Size ${size}`}
              footer={<Button onClick={onClose}>Close</Button>}
            >
              Widths ride Tailwind&apos;s numeric spacing scale, so a dialog is never a raw pixel
              number. This one is <code className="font-numeric">{size}</code>.
            </Modal>
          )}
        </Trigger>
      ))}
    </div>
  ),
};

/**
 * No visible title, so the name comes from `aria-label` — the type system will
 * not let you ship a dialog with neither. Inspect the panel and you will find
 * `aria-label="Preview attachment"` and no `aria-labelledby`.
 */
export const WithoutTitle: Story = {
  args: { title: undefined, 'aria-label': 'Preview attachment' },
  render: (args) => (
    <Background>
      <Trigger label="Preview attachment">
        {({ open, onClose }) => (
          <Modal {...args} open={open} onClose={onClose} aria-label="Preview attachment">
            <div className="grid h-64 place-items-center rounded-md bg-surface-neutral-subtle text-body-md text-text-tertiary">
              invoice-4471.pdf
            </div>
          </Modal>
        )}
      </Trigger>
    </Background>
  ),
};

/**
 * Every colour is a semantic token, so the dark theme comes for free. The one
 * thing to know: the dialog is portalled to `document.body`, so the `.dark`
 * class has to be on `<html>` or `<body>` — a wrapper `div` inside the page will
 * not reach it. That is what the second trigger does here.
 */
export const LightAndDark: Story = {
  render: (args) => {
    const ThemedDialog = ({ theme }: { theme: 'light' | 'dark' }) => {
      const [open, setOpen] = React.useState(false);

      React.useEffect(() => {
        if (!open || theme !== 'dark') return;
        const root = document.documentElement;
        root.classList.add('dark');
        return () => root.classList.remove('dark');
      }, [open, theme]);

      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open in {theme}
          </Button>
          <Modal
            {...args}
            open={open}
            onClose={() => setOpen(false)}
            title="Publish this claim?"
            description="This cannot be undone from the supplier portal."
            footer={
              <>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpen(false)}>Publish</Button>
              </>
            }
          >
            Once published, the supplier is notified and the claim can no longer be edited.
          </Modal>
        </>
      );
    };

    return (
      <div className="flex items-center gap-3">
        <ThemedDialog theme="light" />
        <ThemedDialog theme="dark" />
      </div>
    );
  },
};
