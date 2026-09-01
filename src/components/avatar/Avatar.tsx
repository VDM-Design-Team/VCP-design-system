import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Icon } from '../icon';

/**
 * The tones a name can hash onto. These are the four hue-named `accent.*`
 * families the system ships — deliberately the *hue* ramps and not the status
 * ramps (`accent.critical`, `accent.success`, …). A person is not an error, and
 * an avatar tinted `accent-critical-*` reads as one in every code review.
 */
export const AVATAR_TONES = ['blue', 'green', 'red', 'yellow'] as const;
export type AvatarTone = (typeof AVATAR_TONES)[number];

/**
 * Deterministic name → tone. The same string always lands on the same colour, so
 * a person keeps their tone across pages and reloads.
 *
 * This is the export's hash (`h * 31 + charCode`), remapped from its six raw
 * pastels onto the four accent families this system actually has. The pastels
 * are not portable: paired with the export's white initials they measure
 * 1.83:1 – 2.37:1, so every one of them failed 1.4.3. Each tone here is a
 * `faint` surface with `stronger` content from the same family, which is 8:1+
 * in light and 4.5:1+ in dark.
 */
export function toneForName(value: string): AvatarTone {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

/** First letter of the first two words, uppercased. `Array.from` so it is codepoint-safe. */
export function initialsForName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? '')
    .join('')
    .toLocaleUpperCase();
}

/**
 * Avatar — a person, as a photo or as their initials.
 *
 * Two deviations from the export, both deliberate:
 *
 * 1. **`size` is a variant, not a number.** The export took `size?: number` and
 *    derived the font size from it (`size * 0.38`), which cannot be tokenised —
 *    every value it produces is an off-ramp number. The three steps here sit on
 *    Tailwind's numeric scale and carry a type-ramp step each: `md` is the
 *    export's own default, `lg` is the 40 minimum target from CLAUDE.md rule 5
 *    for the one case where an avatar is a control, and `sm` is the dense-row
 *    size. The export's AvatarGroup default of 28 has no step here; that row
 *    uses `sm` or `md`.
 * 2. **No `title` tooltip.** The export set `title={name}`. A `title` is a
 *    hover-only, keyboard-unreachable, touch-invisible accessible name. If the
 *    avatar is the only identification, say so with `standalone` and it gets a
 *    real one; if the name matters visually, render it.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const avatar = cva(
  [
    'inline-grid shrink-0 place-items-center overflow-hidden align-middle',
    /* shape.radius.pill — a circle at every size. */
    'rounded-pill',
    'select-none font-sans',
  ],
  {
    variants: {
      size: {
        /* 24 — dense table rows and inline beside body text. */
        sm: 'size-6 text-label-sm',
        /* 32 — the default, and the export's own default. */
        md: 'size-8 text-label-md',
        /* 40 — meets the minimum target size, so this is the only size that may
           carry a control (a menu trigger, a link to a profile). */
        lg: 'size-10 text-label-lg',
      },
      tone: {
        blue: 'bg-accent-blue-faint text-accent-blue-stronger',
        green: 'bg-accent-green-faint text-accent-green-stronger',
        red: 'bg-accent-red-faint text-accent-red-stronger',
        yellow: 'bg-accent-yellow-faint text-accent-yellow-stronger',
      },
      /* Separates one avatar from the one it overlaps in a stack. Drawn outside
         the box as a ring so it never eats into the 24/32/40 the size promises,
         and coloured `surface.elevated` so it reads as the page showing through
         in both themes. */
      ring: { true: 'ring-2 ring-surface-elevated', false: '' },
    },
    defaultVariants: { size: 'md', tone: 'blue', ring: false },
  },
);

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    Omit<VariantProps<typeof avatar>, 'tone'> {
  /** The person's full name. Drives the initials and the tone. */
  name?: string;
  /** Override the derived initials — for mononyms, or a two-letter team code. */
  initials?: string;
  /** Photo URL. If it fails to load, the initials are drawn instead. */
  src?: string;
  /** Pin the tone instead of hashing the name. Rarely needed. */
  tone?: AvatarTone;
  /**
   * Set when the avatar is the **only** identification of the person on screen.
   * It then gets a real accessible name from `name`. Leave it off — the default —
   * whenever the person's name is already visible beside the avatar: repeating it
   * is noise, so the avatar is `aria-hidden` and the visible text carries it.
   */
  standalone?: boolean;
  /**
   * Override what is announced, and imply `standalone`. Use only when the name
   * alone is not enough — `"Ali Rahman, owner"`. Never a description of the
   * picture: "avatar", "profile photo" and "user image" are all noise.
   */
  label?: string;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    { className, name = '', initials, src, size, tone, ring, standalone, label, ...props },
    ref,
  ) => {
    /* Remembers which URL failed rather than a bare boolean, so a new `src` is
       retried instead of being permanently stuck on the fallback. */
    const [failedSrc, setFailedSrc] = React.useState<string | undefined>(undefined);
    const showImage = Boolean(src) && failedSrc !== src;

    const text = initials ?? initialsForName(name);
    const resolvedTone = tone ?? toneForName(name || text);

    /* Nothing to announce ⇒ decorative. An avatar with neither a name nor a
       label cannot identify anyone, so `standalone` on its own is not enough. */
    const announced = label ?? (standalone ? name.trim() || undefined : undefined);

    return (
      <span
        ref={ref}
        className={cn(avatar({ size, tone: resolvedTone, ring }), className)}
        /* With a photo the name lives on the `alt`; with initials there is no
           element to hang it on, so the container becomes the image. */
        role={!showImage && announced ? 'img' : undefined}
        aria-label={!showImage && announced ? announced : undefined}
        aria-hidden={announced ? undefined : true}
        {...props}
      >
        {showImage ? (
          <img
            src={src}
            /* Empty when decorative — the visible name beside it already said
               this. Never a description of the picture. */
            alt={announced ?? ''}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
            onError={() => setFailedSrc(src)}
          />
        ) : text ? (
          /* Presentational already under `role="img"`; explicit so the decorative
             case cannot leak two stray letters into the reading order either. */
          <span aria-hidden="true">{text}</span>
        ) : (
          /* No name, no initials, no photo — an unknown person, not an empty
             circle. `Icon` renders itself `aria-hidden` when given no label. */
          <Icon name="user" size={size} />
        )}
      </span>
    );
  },
);
Avatar.displayName = 'Avatar';
