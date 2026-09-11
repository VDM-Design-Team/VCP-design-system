import * as React from 'react';
import { Modal } from '../../components/modal';
import { Field } from '../../components/field';
import { Dropzone } from '../../components/dropzone';
import { Button } from '../../atoms/button';
import { Input } from '../../atoms/input';

/**
 * ReportProblemModal — the form behind "Report a problem", the row pinned to
 * the bottom of every `Sidebar`. Read off the Figma `Report_A_Problem_Modal`
 * (`7218:77431`, audit batch 4, 11 September 2026).
 *
 * Unlike the AV confirmations, this one uses `Modal`'s own header: a
 * left-aligned title and the close button, then three fields, then the actions.
 * It is an ordinary dismissible dialog — nothing is destroyed by closing it.
 *
 * **It is uncontrolled by design.** The three values live here and come out
 * once, through `onSubmit`, because a report is composed and sent in one go
 * rather than saved as it is typed. A caller that needs the values as they
 * change should not use this — it should compose `Modal` and the fields
 * itself.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface ProblemReport {
  problem: string;
  description: string;
  attachments: File[];
}

export interface ReportProblemModalProps {
  open: boolean;
  /** Asked to close: Escape, the close button, Cancel, or a backdrop click. */
  onClose: () => void;
  /** The report, once. The dialog does not close itself — you own `open`. */
  onSubmit: (report: ProblemReport) => void;
  /** Spins the submit button while the report is in flight. */
  loading?: boolean;
}

export function ReportProblemModal({
  open,
  onClose,
  onSubmit,
  loading,
}: ReportProblemModalProps) {
  const formId = React.useId();
  const [problem, setProblem] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [attachments, setAttachments] = React.useState<File[]>([]);

  /* A fresh dialog every time it opens: a report half-typed and abandoned
     should not come back on the next problem. */
  React.useEffect(() => {
    if (open) return;
    setProblem('');
    setDescription('');
    setAttachments([]);
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report a Problem"
      size="md"
      footer={
        <>
          <Button variant="tertiary" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form={formId} loading={loading}>
            Submit
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ problem, description, attachments });
        }}
      >
        <Field label="What’s the problem?">
          <Input
            fullWidth
            placeholder="Type in problem"
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
          />
        </Field>

        {/* The design draws this the same height as the field above it, so it
            is an `Input` and not a `Textarea`. Flagged in the doc: a field
            called Description that takes one line is a question for design. */}
        <Field label="Description">
          <Input
            fullWidth
            placeholder="Type in problem description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>

        <Field label="Attachments">
          <Dropzone
            label="Upload a file"
            hint="PNG, JPG, GIF, DOCX, CSV and PDF file up to 10MB"
            accept=".png,.jpg,.jpeg,.gif,.docx,.csv,.pdf"
            onFiles={(files) => setAttachments((current) => [...current, ...files])}
          />
        </Field>
      </form>
    </Modal>
  );
}
ReportProblemModal.displayName = 'ReportProblemModal';
