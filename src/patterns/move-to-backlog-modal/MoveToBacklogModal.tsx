import * as React from 'react';
import { Input } from '../../atoms/input';
import { Field } from '../../components/field';
import { Modal, ModalCancel, ModalConfirm } from '../../components/modal';

/**
 * MoveToBacklogModal — moving an Added Value to the Backlog, with the **Feedback** that says why. One field, **Cancel** and **Move to Backlog**. Built to Figma's `Move_Backlog_Modal` (`7771:93171`, AV Page
 * Details Card).
 *
 * - **Feedback is required** (decided 13 Nov 2026, as the live product does): parking an Added Value says why, the way rejecting one does. The field has the required marker and **Move to Backlog waits
 *   until something is typed**; the dialog says so by what it lets you press, like `RejectPendingAVModal`, rather than by an error afterwards. What is typed goes to `onMove`, trimmed. (Figma's
 *   `Move_Backlog_Modal` draws no marker: the design file is behind on this.)
 * - **It opens with the cursor in Feedback**: the one thing to type, so there is nothing to Tab to first.
 * - **It owns the draft** and reports it once; moving, and closing afterwards, is the page's. Everything resets each time it opens, so feedback abandoned half-typed is not there on the next one.
 * - **Title.** Figma writes "Move to backlog Added Value"; this reads "Move Added Value to Backlog", the order the bulk action's popup uses ("Move 2 Added Values to Backlog") and with Backlog capitalised as
 *   everywhere else (decided with design).
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface MoveToBacklogModalProps {
  open: boolean;
  onClose: () => void;
  /** Move to Backlog was pressed, with the feedback (trimmed, never blank). */
  onMove: (feedback: string) => void;
  /** Moving is in flight: the button spins and Cancel locks. */
  loading?: boolean;
}

export function MoveToBacklogModal({ open, onClose, onMove, loading }: MoveToBacklogModalProps) {
  const [feedback, setFeedback] = React.useState('');
  /* A unique id, so two dialogs on one page do not share a form. */
  const formId = React.useId();
  /* Feedback is the one thing to type here, so the dialog opens with the cursor in it (`docs/modal.md`: one obvious job). */
  const feedbackRef = React.useRef<HTMLInputElement>(null);
  /* Spaces alone say nothing. */
  const ready = feedback.trim() !== '';

  /* A fresh dialog every time it opens. */
  React.useEffect(() => {
    if (open) setFeedback('');
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Move Added Value to Backlog"
      size="md"
      showClose={false}
      initialFocusRef={feedbackRef}
      footer={
        <>
          <ModalCancel disabled={loading} />
          <ModalConfirm type="submit" form={formId} loading={loading} disabled={!ready}>
            Move to Backlog
          </ModalConfirm>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          /* Enter in the field submits too, so the rule is checked here as well as on the button. */
          if (ready) onMove(feedback.trim());
        }}
      >
        <Field label="Feedback" required>
          <Input ref={feedbackRef} fullWidth autoComplete="off" value={feedback} onChange={(event) => setFeedback(event.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
