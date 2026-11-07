import * as React from 'react';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { Input } from '../../atoms/input';
import { Select, type SelectOption } from '../../atoms/select';
import { Textarea } from '../../atoms/textarea';
import { Field } from '../../components/field';
import { Modal } from '../../components/modal';

/**
 * AnnouncementModal — writes an announcement, or edits one, from the Announcements tab. Built to Figma's "Create Announcement" dialog.
 *
 * One dialog, two modes (`mode`): **`new`** ("Create Announcement", **Create**) and **`edit`** ("Edit Announcement", **Save**, the fields
 * filled from `initial`). The body is the same: **Title** and **Version** (both required), **Description**, **Changelog Document URL**,
 * **Announcement Type** (required) and a **Features** list — one line each, with a remove beside it and **Add Features** beneath.
 *
 * - **Version** takes semantic versioning ("v1.0.0"; the "v" is optional). Under it, `latestVersion` reads "Latest version: v1.18.1", so
 *   the next one is easy to pick.
 * - **Announcement Type is a list the page passes in** (`typeOptions`): what the types are is the product's.
 * - **Features** start as one empty line; a blank line is dropped on submit. Removing a line moves focus to the next one (or the one
 *   before it, or **Add Features** when none is left).
 * - **It keeps its own draft**, reset each time it opens from `initial`. **Create** hands the whole draft to `onSubmit` — it saves nothing
 *   itself. A missing Title, Version or Type, a version that is not semantic, or a URL that is not `http(s)` is said under the field
 *   (Figma draws none of these; the words are ours), focus goes to the first, and nothing is submitted. `errors` adds what only the
 *   server knows ("That version already exists").
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export interface AnnouncementDraft {
  title: string;
  version: string;
  description: string;
  changelogUrl: string;
  type: string;
  /** One line each, blank lines dropped. */
  features: string[];
}

export type AnnouncementField = 'title' | 'version' | 'description' | 'changelogUrl' | 'type';

export interface AnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  /** `new` ("Create Announcement") or `edit` ("Edit Announcement"). */
  mode?: 'new' | 'edit';
  /** The starting values. The modal keeps its own draft, reset each time it opens. */
  initial?: Partial<AnnouncementDraft>;
  /** The newest version, shown under Version: "Latest version: v1.18.1". */
  latestVersion?: string;
  /** The announcement types. The page passes these in. */
  typeOptions: ReadonlyArray<string | SelectOption>;
  /** Create / Save, once the fields are valid. Gets the whole draft; saves nothing itself. */
  onSubmit: (draft: AnnouncementDraft) => void;
  /** Create / Save is in flight: the button spins and the fields lock. */
  submitting?: boolean;
  /** What only the server knows, per field — shown under it. */
  errors?: Partial<Record<AnnouncementField, string>>;
}

const SEMVER = /^v?\d+\.\d+\.\d+$/i;
const URL_HTTP = /^https?:\/\/\S+$/i;

let nextLine = 0;
const line = (text = '') => ({ id: ++nextLine, text });

const blank = (initial: AnnouncementModalProps['initial']) => ({
  title: initial?.title ?? '',
  version: initial?.version ?? '',
  description: initial?.description ?? '',
  changelogUrl: initial?.changelogUrl ?? '',
  type: initial?.type ?? '',
});


export function AnnouncementModal({
  open,
  onClose,
  mode = 'new',
  initial,
  latestVersion,
  typeOptions,
  onSubmit,
  submitting,
  errors,
}: AnnouncementModalProps) {
  const formId = React.useId();
  const [draft, setDraft] = React.useState(() => blank(initial));
  const [features, setFeatures] = React.useState(() => (initial?.features?.length ? initial.features.map(line) : [line()]));
  const [invalid, setInvalid] = React.useState<Partial<Record<AnnouncementField, string>>>({});
  const titleRef = React.useRef<HTMLInputElement>(null);
  const versionRef = React.useRef<HTMLInputElement>(null);
  const urlRef = React.useRef<HTMLInputElement>(null);
  const typeRef = React.useRef<HTMLSelectElement>(null);
  const addRef = React.useRef<HTMLButtonElement>(null);
  const lineRefs = React.useRef(new Map<number, HTMLInputElement>());

  /* Each time it opens, start again from what it was given. */
  React.useEffect(() => {
    if (!open) return;
    setDraft(blank(initial));
    setFeatures(initial?.features?.length ? initial.features.map(line) : [line()]);
    setInvalid({});
    /* On open only: a new `initial` object on every render must not wipe what is being typed. */
  }, [open]); // eslint-disable-line

  const set = <K extends keyof typeof draft>(key: K, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    /* Fixing a field clears what was said about it. */
    setInvalid((i) => ({ ...i, [key]: undefined }));
  };

  const removeLine = (index: number) => {
    const next = features.filter((_, i) => i !== index);
    setFeatures(next);
    /* The input that had focus is gone: the next line takes it, else the one before, else Add Features. */
    const target = next[index] ?? next[index - 1];
    requestAnimationFrame(() => (target ? lineRefs.current.get(target.id) : addRef.current)?.focus());
  };

  const addLine = () => {
    const added = line();
    setFeatures((f) => [...f, added]);
    requestAnimationFrame(() => lineRefs.current.get(added.id)?.focus());
  };

  const submit = () => {
    const next: typeof invalid = {};
    if (!draft.title.trim()) next.title = 'Enter a title.';
    if (!draft.version.trim()) next.version = 'Enter a version, like v1.0.0.';
    else if (!SEMVER.test(draft.version.trim())) next.version = 'Use semantic versioning, like v1.0.0.';
    if (draft.changelogUrl.trim() && !URL_HTTP.test(draft.changelogUrl.trim())) {
      next.changelogUrl = 'Enter a web address, like https://example.com/changelog.';
    }
    if (!draft.type) next.type = 'Choose a type.';
    setInvalid(next);
    /* Not through: hand focus to the first field that needs fixing. */
    if (next.title) return titleRef.current?.focus();
    if (next.version) return versionRef.current?.focus();
    if (next.changelogUrl) return urlRef.current?.focus();
    if (next.type) return typeRef.current?.focus();
    onSubmit({
      title: draft.title.trim(),
      version: draft.version.trim(),
      description: draft.description.trim(),
      changelogUrl: draft.changelogUrl.trim(),
      type: draft.type,
      features: features.map((f) => f.text.trim()).filter(Boolean),
    });
  };

  const message = (field: AnnouncementField) => errors?.[field] ?? invalid[field];
  const locked = Boolean(submitting);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Announcement' : 'Create Announcement'}
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" type="button" disabled={locked} onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form={formId} loading={submitting}>
            {mode === 'edit' ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Field label="Title" required error={message('title')}>
          <Input
            ref={titleRef}
            fullWidth
            autoComplete="off"
            value={draft.title}
            disabled={locked}
            onChange={(event) => set('title', event.target.value)}
          />
        </Field>
        <Field
          label="Version"
          required
          error={message('version')}
          helper={
            latestVersion ? <span className="text-text-link-default">Latest version: {latestVersion}</span> : undefined
          }
        >
          <Input
            ref={versionRef}
            fullWidth
            autoComplete="off"
            placeholder="Use semantic versioning, e.g., v1.0.0"
            value={draft.version}
            disabled={locked}
            onChange={(event) => set('version', event.target.value)}
          />
        </Field>
        <Field label="Description" error={message('description')}>
          <Textarea
            placeholder="Enter announcement description"
            value={draft.description}
            disabled={locked}
            onChange={(event) => set('description', event.target.value)}
          />
        </Field>
        <Field label="Changelog Document URL" error={message('changelogUrl')}>
          <Input
            ref={urlRef}
            fullWidth
            type="url"
            autoComplete="off"
            placeholder="https://example.com/changelog"
            value={draft.changelogUrl}
            disabled={locked}
            onChange={(event) => set('changelogUrl', event.target.value)}
          />
        </Field>
        <Field label="Announcement Type" required error={message('type')}>
          <Select
            ref={typeRef}
            fullWidth
            emphasis="regular"
            placeholder="Select type"
            options={typeOptions}
            value={draft.type}
            disabled={locked}
            onChange={(type) => set('type', type)}
          />
        </Field>

        <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
          <legend className="mb-1.5 p-0 text-label-sm-medium text-text-primary">Features</legend>
          {features.map((feature, index) => (
            <div key={feature.id} className="flex items-center gap-2">
              <Input
                ref={(el) => {
                  if (el) lineRefs.current.set(feature.id, el);
                  else lineRefs.current.delete(feature.id);
                }}
                fullWidth
                autoComplete="off"
                aria-label={`Feature ${index + 1}`}
                placeholder="Enter feature description"
                value={feature.text}
                disabled={locked}
                onChange={(event) =>
                  setFeatures((f) => f.map((x) => (x.id === feature.id ? { ...x, text: event.target.value } : x)))
                }
              />
              <IconButton
                /* A row in a form still being filled in, so the minus in a circle (as the assignee and demo-link rows) — not the trash of a saved thing (docs/icon.md). */
                icon="minus-circle"
                label={`Remove feature ${index + 1}`}
                disabled={locked}
                onClick={() => removeLine(index)}
              />
            </div>
          ))}
          <div>
            <Button
              ref={addRef}
              variant="secondary"
              size="sm"
              type="button"
              disabled={locked}
              iconLeft={<Icon name="plus" size="sm" />}
              onClick={addLine}
            >
              Add Features
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
AnnouncementModal.displayName = 'AnnouncementModal';
