import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';

/**
 * DeliverableLinkForm — the form that takes a link: its URL and its title, then Cancel and Add (or
 * Save, when changing a link already added). Read off Figma's `_Deliverables_Add_Link`,
 * `_Deliverables_Paste_Link` and `_Deliverables_Link_Title`.
 *
 * Adding can take several at once: "+ Add another link" puts another URL and title pair under the
 * first, and Add hands over all of them. Editing is one pair.
 *
 * **Checked when Add or Save is pressed**, not as you type, and each message sits under its field:
 * "Please enter a link title", and "Please enter a valid URL starting with https://" for a URL that
 * is empty or does not begin `https://`.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DeliverableLinkDraft {
  url: string;
  title: string;
}

export const LINK_TITLE_ERROR = 'Please enter a link title';
export const LINK_URL_ERROR = 'Please enter a valid URL starting with https://';

/** A URL that begins `https://` and parses. */
export const isValidLinkUrl = (url: string) => {
  if (!/^https:\/\/\S+$/i.test(url.trim())) return false;
  try {
    new URL(url.trim());
    return true;
  } catch {
    return false;
  }
};

export interface DeliverableLinkFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  /** `add` (default): can take several links, and its button reads "Add". `edit`: one link, "Save". */
  mode?: 'add' | 'edit';
  /** Edit: the link being changed. */
  initial?: DeliverableLinkDraft;
  /** Fires with every valid pair, once all of them pass. */
  onSubmit: (links: DeliverableLinkDraft[]) => void;
  onCancel: () => void;
}

const BLANK: DeliverableLinkDraft = { url: '', title: '' };

export const DeliverableLinkForm = React.forwardRef<HTMLFormElement, DeliverableLinkFormProps>(
  ({ className, mode = 'add', initial, onSubmit, onCancel, ...props }, ref) => {
    const [rows, setRows] = React.useState<DeliverableLinkDraft[]>([initial ?? BLANK]);
    const [errors, setErrors] = React.useState<Array<{ url?: string; title?: string }>>([]);
    const baseId = React.useId();

    const change = (index: number, patch: Partial<DeliverableLinkDraft>) =>
      setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

    const submit = (event: React.FormEvent) => {
      event.preventDefault();
      const next = rows.map((row) => ({
        url: isValidLinkUrl(row.url) ? undefined : LINK_URL_ERROR,
        title: row.title.trim() ? undefined : LINK_TITLE_ERROR,
      }));
      setErrors(next);
      if (next.some((e) => e.url || e.title)) return;
      onSubmit(rows.map((row) => ({ url: row.url.trim(), title: row.title.trim() })));
    };

    return (
      <form
        ref={ref}
        noValidate
        onSubmit={submit}
        className={cn('flex w-full flex-col gap-2 font-sans', className)}
        {...props}
      >
        {rows.map((row, index) => {
          const urlError = errors[index]?.url;
          const titleError = errors[index]?.title;
          return (
            <div key={index} className="flex flex-col gap-2">
              <div>
                <Input
                  fullWidth
                  aria-label={rows.length > 1 ? `Link URL ${index + 1}` : 'Link URL'}
                  placeholder="Paste Link Here"
                  leadingIcon={<Icon name="link" size="sm" />}
                  value={row.url}
                  onChange={(e) => change(index, { url: e.target.value })}
                  invalid={!!urlError}
                  aria-describedby={urlError ? `${baseId}-url-${index}` : undefined}
                />
                {urlError && (
                  <p id={`${baseId}-url-${index}`} role="alert" className="mt-1.5 text-caption-md-medium text-accent-critical-outline-content-default">
                    {urlError}
                  </p>
                )}
              </div>
              <div>
                <Input
                  fullWidth
                  aria-label={rows.length > 1 ? `Link title ${index + 1}` : 'Link title'}
                  placeholder="Link Title"
                  value={row.title}
                  onChange={(e) => change(index, { title: e.target.value })}
                  invalid={!!titleError}
                  aria-describedby={titleError ? `${baseId}-title-${index}` : undefined}
                />
                {titleError && (
                  <p id={`${baseId}-title-${index}`} role="alert" className="mt-1.5 text-caption-md-medium text-accent-critical-outline-content-default">
                    {titleError}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {mode === 'add' && (
          <div>
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              onClick={() => setRows((current) => [...current, BLANK])}
            >
              <Icon name="plus" size="sm" aria-hidden="true" />
              Add another link
            </Button>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="tertiary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" size="sm">
            {mode === 'edit' ? 'Save' : 'Add'}
          </Button>
        </div>
      </form>
    );
  },
);
DeliverableLinkForm.displayName = 'DeliverableLinkForm';
