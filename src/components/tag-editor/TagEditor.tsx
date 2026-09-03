import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../icon';
import { Input } from '../input';
import { Button } from '../button';

/**
 * TagEditor — free-form labels on a thing: a tag list, a tone swatch row, a
 * name field and an add button. `editable={false}` renders just the list.
 *
 * **Tones, not colours.** The export shipped `TAG_COLOURS` as raw rgb
 * strings — one of them the indigo that has no ramp — and tinted pills with
 * an alpha suffix. Tags now carry a `tone` from the hue families Avatar
 * already proved (`accent.{blue,green,red,yellow}` faint/stronger pairs, plus
 * a neutral), and the pill wears the same faint-surface/stronger-text pair.
 * If tags ever need VCP-specific meanings per colour, that mapping is a
 * pattern's business.
 *
 * The tag pill is Badge's geometry with a dot and a remove button — not a
 * `Badge` (which is deliberately non-interactive) and not a `Chip` (which is
 * brand-only). The dot rides `currentColor`, so it always matches the text.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type TagTone = 'blue' | 'green' | 'red' | 'yellow' | 'neutral';

export interface Tag {
  label: string;
  tone?: TagTone;
}

export interface TagEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  tags?: readonly Tag[];
  /** A new tag, with the currently selected tone. The caller owns the list. */
  onAdd?: (tag: Tag) => void;
  onRemove?: (tag: Tag) => void;
  /** The swatch selection changed — for callers that persist a preference. */
  onToneChange?: (tone: TagTone) => void;
  /** `false` renders the read-only list alone. */
  editable?: boolean;
}

export const TAG_TONES: readonly TagTone[] = ['blue', 'green', 'red', 'yellow', 'neutral'];

/* Avatar's proven faint/stronger pairs, plus the neutral composition. */
const PILL: Record<TagTone, string> = {
  blue: 'bg-accent-blue-faint text-accent-blue-stronger',
  green: 'bg-accent-green-faint text-accent-green-stronger',
  red: 'bg-accent-red-faint text-accent-red-stronger',
  yellow: 'bg-accent-yellow-faint text-accent-yellow-stronger',
  neutral: 'bg-surface-neutral-subtle text-text-secondary',
};

/* Swatch fills — the mid step, solid enough to read as the hue. */
const SWATCH: Record<TagTone, string> = {
  blue: 'bg-accent-blue-medium',
  green: 'bg-accent-green-medium',
  red: 'bg-accent-red-medium',
  yellow: 'bg-accent-yellow-medium',
  neutral: 'bg-surface-neutral-strong',
};

export const TagEditor = React.forwardRef<HTMLDivElement, TagEditorProps>(
  ({ className, tags = [], onAdd, onRemove, onToneChange, editable = true, ...props }, ref) => {
    const [draft, setDraft] = React.useState('');
    const [tone, setTone] = React.useState<TagTone>('blue');

    const submit = () => {
      const label = draft.trim();
      if (!label) return;
      onAdd?.({ label, tone });
      setDraft('');
    };

    return (
      <div ref={ref} className={cn('flex flex-col gap-3 font-sans', className)} {...props}>
        <div className="flex flex-wrap items-center gap-2">
          {tags.length === 0 && (
            <span className="text-body-sm text-text-subtle">No tags yet.</span>
          )}
          {tags.map((tag) => (
            <span
              key={tag.label}
              className={cn(
                'inline-flex h-6 items-center gap-1.5 rounded-sm px-2 text-label-md',
                PILL[tag.tone ?? 'blue'],
              )}
            >
              {/* The dot rides currentColor — always the pair's text colour. */}
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
              <span className="min-w-0 truncate">{tag.label}</span>
              {editable && onRemove && (
                <button
                  type="button"
                  aria-label={`Remove ${tag.label}`}
                  onClick={() => onRemove(tag)}
                  className={cn(
                    'grid size-4 shrink-0 place-items-center rounded-full text-current',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                  )}
                >
                  <Icon name="x" className="size-3" aria-hidden="true" />
                </button>
              )}
            </span>
          ))}
        </div>
        {editable && (
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Tag colour" className="flex gap-1">
              {TAG_TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-label={`Tag colour ${t}`}
                  aria-pressed={tone === t}
                  onClick={() => {
                    setTone(t);
                    onToneChange?.(t);
                  }}
                  className={cn(
                    'size-6 rounded-sm border transition-shadow',
                    SWATCH[t],
                    tone === t
                      ? 'border-stroke-stronger outline-2 outline-offset-2 outline-stroke-focused'
                      : 'border-stroke-subtle',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                  )}
                />
              ))}
            </div>
            <div className="min-w-40 flex-1">
              <Input
                size="sm"
                fullWidth
                aria-label="New tag name"
                placeholder="New tag name"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submit();
                  }
                }}
              />
            </div>
            <Button variant="secondary" size="sm" onClick={submit} disabled={!draft.trim()}>
              Add tag
            </Button>
          </div>
        )}
      </div>
    );
  },
);
TagEditor.displayName = 'TagEditor';
